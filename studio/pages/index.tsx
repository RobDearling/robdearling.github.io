import Head from 'next/head';
import { useEffect, useState, type FormEvent } from 'react';
import ScenePlayer from '../../components/explainers/player';
import { slugPattern, type Explainer } from '../../lib/explainers/document';
import LayoutEditor from '../components/layout-editor';
import StoryEditor from '../components/story-editor';
import { blankDocument, initialScene, nextId, type Edit } from '../editing';

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const result = await fetch('/api/documents' + url, init);
  const data = await result.json();
  if (!result.ok) throw new Error(data.error || 'Studio request failed');
  return data;
}
type Mode = 'Layout' | 'Scenes' | 'Preview';

export default function Studio() {
  const [names, setNames] = useState<string[]>([]);
  const [slug, setSlug] = useState('');
  const [doc, setDoc] = useState<Explainer | null>(null);
  const [saved, setSaved] = useState<Explainer | null>(null);
  const [revision, setRevision] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('Layout');
  const [sceneIndex, setSceneIndex] = useState(0);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [filename, setFilename] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const dirty = doc !== saved;
  const scene = doc?.scenes[sceneIndex];
  const fence = '```explainer\n' + slug + '/' + scene?.id + '\n```';
  useEffect(() => { api<string[]>('').then(setNames).catch(e => setMessage(e.message)); }, []);
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  const replace = () => !dirty || window.confirm('Discard unsaved edits?');
  function show(name: string, document: Explainer, rev: string | null) {
    setSlug(name); setDoc(document); setSaved(rev ? document : null); setRevision(rev);
    setSceneIndex(0); setMode('Layout'); setCreating(false); setMessage('');
  }
  async function open(name: string) {
    if (!name || !replace()) return;
    setBusy(true);
    try {
      const data = await api<{ document: Explainer; revision: string }>('/' + name);
      show(name, data.document, data.revision);
    } catch (e) { setMessage((e as Error).message); } finally { setBusy(false); }
  }
  function create(event: FormEvent) {
    event.preventDefault();
    if (names.includes(filename)) { setMessage('That filename is already in use.'); return; }
    if (replace()) show(filename, blankDocument(title.trim()), null);
  }
  async function save() {
    if (!doc) return;
    setBusy(true);
    try {
      const data = await api<{ revision: string }>('/' + slug, { method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ revision, document: doc }) });
      setRevision(data.revision); setSaved(doc); setMessage('Saved to explainers/' + slug + '.json');
      setNames(current => current.includes(slug) ? current : [...current, slug].sort());
    } catch (e) { setMessage((e as Error).message); } finally { setBusy(false); }
  }
  const edit: Edit = change => {
    setDoc(current => {
      const next = structuredClone(current!);
      change(next);
      return next;
    });
    setMessage('');
  };
  function addScene(copy: boolean) {
    const id = nextId('scene', doc!.scenes);
    edit(d => { d.scenes.push(copy ? { ...structuredClone(d.scenes[sceneIndex]), id, title: scene!.title + ' copy' } : initialScene(id)); });
    setSceneIndex(doc!.scenes.length); setMode('Scenes');
  }
  return <main className="studio">
    <Head><title>Explainer studio</title></Head>
    <header><h1>Explainer studio</h1><div className="tools">
      <label className="inline">Open explainer<select value="" disabled={busy} onChange={e => open(e.target.value)}><option value="">Choose a file…</option>
        {names.map(name => <option key={name}>{name}</option>)}</select></label>
      <button disabled={busy} onClick={() => { setCreating(true); setTitle(''); setFilename(''); setMessage(''); }}>New explainer</button>
      {doc && <button className="primary" disabled={!dirty || busy} onClick={save}>Save</button>}
    </div></header>
    {message && <p className="status" role="status">{message}</p>}
    {creating && <form className="new-file" onSubmit={create}><h2>New explainer</h2>
      <label>Title<input autoFocus required value={title} onChange={e => { setTitle(e.target.value); setFilename(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')); }}/></label>
      <label>Filename<input required pattern={slugPattern.source} value={filename} onChange={e => setFilename(e.target.value)}/></label>
      <div className="tools"><button type="submit" className="primary" disabled={!title.trim()}>Create</button><button type="button" onClick={() => setCreating(false)}>Cancel</button></div></form>}
    {!doc && !creating && <section className="library"><h2>Your explainers</h2>{names.map(name => <button key={name} disabled={busy} onClick={() => open(name)}>{name}<span aria-hidden="true">→</span></button>)}
      {!names.length && <p>Create an explainer to start drawing.</p>}</section>}
    {doc && scene && <section key={slug} className="document">
      <div className="doc-heading"><label>Explainer title<input value={doc.title} onChange={e => edit(d => { d.title = e.target.value; })}/></label>
        <span>{slug}.json{dirty ? ' · Unsaved changes' : ''}</span></div>
      <nav aria-label="Editor mode">{(['Layout', 'Scenes', 'Preview'] as const).map(tab => <button key={tab} aria-pressed={mode === tab} onClick={() => setMode(tab)}>{tab}</button>)}</nav>
      {mode === 'Layout' ? <LayoutEditor doc={doc} edit={edit}/> : <>
        <div className="scene-bar"><label className="inline">Scene<select value={sceneIndex} onChange={e => setSceneIndex(+e.target.value)}>{doc.scenes.map((s, i) => <option key={i} value={i}>{s.title}</option>)}</select></label>
          {mode === 'Scenes' && <><button onClick={() => addScene(false)}>Add scene</button><button onClick={() => addScene(true)}>Duplicate scene</button>
            <button disabled={doc.scenes.length === 1} onClick={() => { edit(d => { d.scenes.splice(sceneIndex, 1); }); setSceneIndex(0); }}>Remove scene</button></>}</div>
        {mode === 'Scenes' ? <StoryEditor key={sceneIndex} doc={doc} sceneIndex={sceneIndex} edit={edit}/> :
          <div className="preview"><ScenePlayer key={sceneIndex} doc={doc} scene={scene}/>
          <label>Markdown embed<textarea readOnly value={fence} rows={3} onFocus={e => e.target.select()}/></label>
          <button onClick={async () => { try { await navigator.clipboard.writeText(fence); setMessage('Copied Markdown embed'); }
            catch { setMessage('Select and copy the Markdown embed below.'); } }}>Copy embed</button></div>}
      </>}
    </section>}
  </main>;
}
