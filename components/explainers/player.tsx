import { useEffect, useId, useState } from 'react';
import type { Explainer, Scene } from '../../lib/explainers/document';
import { models, type Frame, type Values } from '../../lib/explainers/models';
import Diagram from './diagram';
import styles from './player.module.css';

export default function ScenePlayer({ doc, scene }: { doc: Explainer; scene: Scene }) {
  const titleId = useId();
  const model = scene.model ? models[scene.model] : undefined;
  const [values, setValues] = useState<Values>(() => Object.fromEntries((model?.inputs ?? []).map(i => [i.id, i.initial])));
  const [choice, setChoice] = useState(0);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [zoom, setZoom] = useState(false);
  const scenario = scene.scenarios[choice] ?? scene.scenarios[0];
  const last = scenario.steps.length - 1;
  const at = Math.min(index, last);
  const step = scenario.steps[at];
  const frame: Frame = model ? model.derive({ doc, scene, scenario, step, index: at, values }) : step;
  const routes = frame.active.map(id => doc.connections.find(edge => edge.id === id)).filter(edge => !!edge);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => {
      if (at < last) setIndex(at + 1);
      else setPlaying(false);
    }, 2300);
    return () => window.clearTimeout(timer);
  }, [playing, at, last]);

  function seek(next: number) {
    setPlaying(false);
    setIndex(next);
  }

  return <figure aria-labelledby={titleId} className={styles.player}>
    <figcaption><h3 id={titleId}>{scene.title}</h3><p>{scene.description}</p></figcaption>
    {scene.scenarios.length > 1 && <fieldset className={styles.choices}><legend>Scenario</legend>
      {scene.scenarios.map((item, i) => <button type="button" key={item.id} aria-pressed={choice === i}
        onClick={() => { setChoice(i); seek(0); }}>{item.label}</button>)}
    </fieldset>}
    {model?.inputs.map(input => <fieldset key={input.id} className={styles.choices}><legend>{input.label}</legend>
      {'options' in input ? input.options.map(option =>
        <button type="button" key={option.value} aria-pressed={values[input.id] === option.value}
          onClick={() => { setValues({ ...values, [input.id]: option.value }); seek(0); }}>{option.label}</button>)
        : <label>{values[input.id]} <input type="range" aria-label={input.label} min={input.min} max={input.max} value={values[input.id]}
            onChange={e => { setValues({ ...values, [input.id]: Number(e.target.value) }); seek(0); }}/></label>}
    </fieldset>)}
    <div className={styles.viewport} data-zoom={zoom} tabIndex={zoom ? 0 : undefined} aria-label={zoom ? 'Scrollable diagram' : undefined}>
      <Diagram doc={doc} frame={frame} playing={playing}/>
    </div>
    <div className={styles.readout} aria-live={playing ? 'off' : 'polite'} aria-atomic="true">
      <span className={styles.counter}>Step {at + 1} of {last + 1}</span>
      <p>{frame.caption}</p>
      {routes.length > 0 && <div className={styles.routes}>{routes.map(edge =>
        <span key={edge.id} data-kind={edge.kind}>{edge.label}</span>)}</div>}
    </div>
    <div className={styles.transport}>
      <button type="button" className={styles.primary} onClick={() => {
        if (playing) setPlaying(false);
        else { if (at === last) setIndex(0); setPlaying(true); }
      }}>{playing ? 'Pause' : at === last ? 'Replay' : 'Play'}</button>
      <button type="button" disabled={at === 0} onClick={() => seek(at - 1)}>Back</button>
      <button type="button" disabled={at === last} onClick={() => seek(at + 1)}>Next</button>
      <button type="button" className={styles.zoom} aria-pressed={zoom} onClick={() => setZoom(!zoom)}>{zoom ? 'Fit diagram' : 'Enlarge'}</button>
    </div>
  </figure>;
}
