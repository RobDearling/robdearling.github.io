import { useState } from 'react';
import Diagram from '../../components/explainers/diagram';
import type { Explainer, DiagramNode, Connection } from '../../lib/explainers/document';
import { canvas, symbols } from '../../lib/explainers/layout';
import { elementList, moveElement, nextId, removeElement, type Edit } from '../editing';

export default function LayoutEditor({ doc, edit }: { doc: Explainer; edit: Edit }) {
  const [selected, select] = useState('');
  const [source, setSource] = useState<string | null>(null);
  const node = doc.nodes.find(n => n.id === selected);
  const boundary = doc.boundaries.find(b => b.id === selected);
  const edge = doc.connections.find(e => e.id === selected);
  const element = node ?? boundary ?? edge;
  function add(kind: 'node' | 'boundary') {
    const id = nextId(kind, elementList(doc));
    edit(draft => {
      if (kind === 'node') {
        const n = draft.nodes.length;
        draft.nodes.push({ id, label: 'New node', detail: '', symbol: 'service', x: 106 + n % 3 * 234, y: 96 + Math.floor(n / 3) % 3 * 110 });
      } else draft.boundaries.push({ id, label: 'System boundary', x: 18, y: 28, width: 352, height: 174 });
    });
    select(id); setSource(null);
  }
  function pick(id: string) {
    if (source === null) { select(id); return; }
    if (!doc.nodes.some(n => n.id === id)) return;
    if (!source) { setSource(id); select(id); return; }
    if (id === source) return;
    const key = nextId('edge', elementList(doc));
    edit(d => { d.connections.push({ id: key, from: source, to: id, label: 'Request', kind: 'flow' }); });
    select(key); setSource(null);
  }
  const label = (value: string) => edit(d => { elementList(d).find(item => item.id === selected)!.label = value; });
  const move = (x: number, y: number) => edit(d => moveElement(d, selected, { x, y }));
  const pos = node ?? boundary;
  return <div className="workspace-grid">
    <section className="work-panel">
      <div className="tools"><button onClick={() => add('node')}>Add node</button><button onClick={() => add('boundary')}>Add boundary</button>
        <button disabled={doc.nodes.length < 2} aria-pressed={source !== null} onClick={() => setSource(source === null ? '' : null)}>{source === null ? 'Connect nodes' : 'Cancel connection'}</button></div>
      {source !== null && <p role="status">{source ? 'Choose the destination node.' : 'Choose the source node.'}</p>}
      <Diagram doc={doc} frame={{ caption: '', active: [], hidden: [] }} editor={{ selected, select: pick, connecting: source !== null, move: (id, point) => edit(d => moveElement(d, id, point)) }}/>
      {!doc.nodes.length && <p className="hint">Add a node to begin drawing. Drag nodes on the canvas or set their coordinates in the inspector.</p>}
    </section>
    <aside className="inspector"><h2>Layout inspector</h2>
      <label>Diagram element<select value={selected} onChange={e => { if (e.target.value) pick(e.target.value); else select(''); }}>
        <option value="">Select an element</option>{elementList(doc).map(e => <option key={e.id} value={e.id}>{e.label} · {e.id}</option>)}</select></label>
      {element && <>
        <label>Label<input value={element.label} onChange={e => label(e.target.value)}/></label>
        {node && <>
          <label>Detail<input value={node.detail} onChange={e => edit(d => { d.nodes.find(n => n.id === selected)!.detail = e.target.value; })}/></label>
          <label>Symbol<select value={node.symbol} onChange={e => edit(d => { d.nodes.find(n => n.id === selected)!.symbol = e.target.value as DiagramNode['symbol']; })}>
            {symbols.map(s => <option key={s}>{s}</option>)}</select></label>
        </>}
        {pos && <div className="pair"><label>X<input type="number" value={pos.x} onChange={e => move(+e.target.value, pos.y)}/></label>
          <label>Y<input type="number" value={pos.y} onChange={e => move(pos.x, +e.target.value)}/></label></div>}
        {boundary && <div className="pair">{(['width', 'height'] as const).map(key => <label key={key}>{key}<input type="number" value={boundary[key]}
          onChange={e => edit(d => { d.boundaries.find(b => b.id === selected)![key] = Math.min(canvas[key] - (key === 'width' ? boundary.x : boundary.y), Math.max(30, +e.target.value)); })}/></label>)}</div>}
        {edge && <>
          {(['from', 'to'] as const).map(key => <label key={key}>{key}<select value={edge[key]} onChange={e => edit(d => { d.connections.find(c => c.id === selected)![key] = e.target.value; })}>
            {doc.nodes.filter(n => n.id !== edge[key === 'from' ? 'to' : 'from']).map(n => <option key={n.id} value={n.id}>{n.label}</option>)}</select></label>)}
          <label>Line style<select value={edge.kind} onChange={e => edit(d => { d.connections.find(c => c.id === selected)!.kind = e.target.value as Connection['kind']; })}>
            <option value="flow">Flow · solid</option><option value="lookup">Lookup · dashed</option></select></label>
          {(edge.via ?? []).map((p, i) => <div key={i} className="pair">{(['x', 'y'] as const).map(axis => <label key={axis}>Bend {i + 1} {axis}<input type="number" value={p[axis]}
            onChange={e => edit(d => { d.connections.find(c => c.id === selected)!.via![i][axis] = +e.target.value; })}/></label>)}
            <button aria-label={'Remove bend ' + (i + 1)} onClick={() => edit(d => { d.connections.find(c => c.id === selected)!.via!.splice(i, 1); })}>Remove</button></div>)}
          <button onClick={() => edit(d => { (d.connections.find(c => c.id === selected)!.via ??= []).push({ x: 360, y: 206 }); })}>Add bend</button>
        </>}
        <button className="danger" onClick={() => { edit(d => removeElement(d, selected)); select(''); }}>Remove element</button>
      </>}
    </aside>
  </div>;
}
