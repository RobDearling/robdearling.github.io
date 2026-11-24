import { useState } from 'react';
import Diagram from '../../components/explainers/diagram';
import type { Explainer, Scene, Step } from '../../lib/explainers/document';
import { models } from '../../lib/explainers/models';
import { elementList, initialStep, nextId, type Edit } from '../editing';

export default function StoryEditor({ doc, sceneIndex, edit }: { doc: Explainer; sceneIndex: number; edit: Edit }) {
  const scene = doc.scenes[sceneIndex];
  const [choice, setChoice] = useState(0);
  const [at, setAt] = useState(0);
  const scenario = scene.scenarios[choice];
  const step = scenario.steps[at];
  const change = (fn: (scene: Scene) => void) => edit(d => fn(d.scenes[sceneIndex]));
  const changeStep = (fn: (step: Step) => void) => change(s => fn(s.scenarios[choice].steps[at]));
  function reorder(offset: number) {
    change(s => {
      const steps = s.scenarios[choice].steps;
      steps.splice(at + offset, 0, steps.splice(at, 1)[0]);
    });
    setAt(at + offset);
  }
  function toggle(key: 'active' | 'hidden', id: string) {
    changeStep(s => { s[key] = s[key].includes(id) ? s[key].filter(value => value !== id) : [...s[key], id]; });
  }
  return <div className="workspace-grid">
    <section className="work-panel">
      <Diagram doc={doc} frame={step}/>
      <div className="story-list"><h2>Steps</h2>
        <ol>{scenario.steps.map((item, i) => <li key={i}><button aria-current={i === at ? 'step' : undefined} onClick={() => setAt(i)}>{i + 1}. {item.caption || 'Untitled step'}</button></li>)}</ol>
        <div className="tools"><button onClick={() => { change(s => { s.scenarios[choice].steps.push(initialStep()); }); setAt(scenario.steps.length); }}>Add step</button>
          <button disabled={at === 0} onClick={() => reorder(-1)}>Move earlier</button><button disabled={at + 1 === scenario.steps.length} onClick={() => reorder(1)}>Move later</button>
          <button disabled={scenario.steps.length === 1} onClick={() => { change(s => { s.scenarios[choice].steps.splice(at, 1); }); setAt(Math.max(0, at - 1)); }}>Remove step</button></div>
      </div>
    </section>
    <aside className="inspector"><h2>Scene inspector</h2>
      <label>Scene title<input value={scene.title} onChange={e => change(s => { s.title = e.target.value; })}/></label>
      <label>Scene ID<input value={scene.id} onChange={e => change(s => { s.id = e.target.value; })}/></label>
      <label>Description<textarea value={scene.description} onChange={e => change(s => { s.description = e.target.value; })}/></label>
      <label>Scenario<select value={choice} onChange={e => { setChoice(+e.target.value); setAt(0); }}>
        {scene.scenarios.map((s, i) => <option key={s.id} value={i}>{s.label}</option>)}</select></label>
      <label>Scenario label<input value={scenario.label} onChange={e => change(s => { s.scenarios[choice].label = e.target.value; })}/></label>
      <div className="tools"><button onClick={() => {
        change(s => { s.scenarios.push({ ...structuredClone(scenario), id: nextId('variant', s.scenarios), label: scenario.label + ' variant' }); });
        setChoice(scene.scenarios.length); setAt(0);
      }}>Add scenario</button><button disabled={scene.scenarios.length === 1} onClick={() => {
        change(s => { s.scenarios.splice(choice, 1); }); setChoice(0); setAt(0);
      }}>Remove scenario</button></div>
      <label>Step caption<textarea value={step.caption} onChange={e => changeStep(s => { s.caption = e.target.value; })}/></label>
      <fieldset><legend>Active connections</legend>{doc.connections.length === 0 && <small>Add a connection in Layout to trace it here.</small>}
        {doc.connections.map(e => <label className="check" key={e.id}><input type="checkbox" checked={step.active.includes(e.id)} onChange={() => toggle('active', e.id)}/>{e.label} <small>{e.id}</small></label>)}</fieldset>
      <details><summary>Hide elements in this step</summary>{elementList(doc).map(e => <label className="check" key={e.id}><input type="checkbox" checked={step.hidden.includes(e.id)} onChange={() => toggle('hidden', e.id)}/>{e.label}</label>)}</details>
      <details><summary>Computed behavior</summary>
        <label>Model<select value={scene.model ?? ''} onChange={e => change(s => { if (e.target.value) s.model = e.target.value; else delete s.model; })}>
          <option value="">Authored steps</option>{Object.keys(models).map(key => <option key={key}>{key}</option>)}</select></label>
        {scene.model && <label>Model cue<input value={step.cue ?? ''} onChange={e => changeStep(s => { if (e.target.value) s.cue = e.target.value; else delete s.cue; })}/></label>}
      </details>
    </aside>
  </div>;
}
