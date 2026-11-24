import { useId, useRef, type PointerEvent } from 'react';
import type { DiagramNode, Explainer, Point } from '../../lib/explainers/document';
import { canvas } from '../../lib/explainers/layout';
import type { Frame } from '../../lib/explainers/models';
import styles from './player.module.css';

const icons: Record<DiagramNode['symbol'], React.ReactNode> = {
  client: <><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M1 20h22"/></>,
  server: <><rect x="3" y="3" width="18" height="8" rx="2"/><rect x="3" y="14" width="18" height="7" rx="2"/><path d="M6 7h2m-2 10h2"/></>,
  database: <><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v13c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/></>,
  dns: <><circle cx="10" cy="10" r="7"/><path d="m15 15 6 6M6 10h8m-4-4v8"/></>,
  network: <><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/></>,
  queue: <><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M7 8v8m5-8v8m5-8v8"/></>,
  worker: <><path d="m13 2-9 12h7l-1 8 10-13h-7z"/></>,
  service: <><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M1 9h3m-3 6h3m16-6h3m-3 6h3M9 1v3m6-3v3m-6 16v3m6-3v3"/></>,
};

function port(node: Point, toward: Point): Point {
  const dx = toward.x - node.x, dy = toward.y - node.y;
  const ratio = Math.min(canvas.nodeWidth / 2 / Math.abs(dx), canvas.nodeHeight / 2 / Math.abs(dy));
  return Number.isFinite(ratio) ? { x: node.x + dx * ratio, y: node.y + dy * ratio } : node;
}

export interface DiagramEditor {
  selected: string;
  select(id: string): void;
  move(id: string, point: Point): void;
  connecting: boolean;
}

export default function Diagram({ doc, frame, editor, playing = false }: {
  doc: Explainer; frame: Frame; editor?: DiagramEditor; playing?: boolean;
}) {
  const marker = 'arrow' + useId().replace(/:/g, '');
  const svg = useRef<SVGSVGElement>(null);
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null);
  const hidden = new Set(frame.hidden);
  const nodes = new Map(doc.nodes.map(node => [node.id, node]));
  const position = (event: PointerEvent) => {
    const root = svg.current!;
    const point = root.createSVGPoint();
    point.x = event.clientX; point.y = event.clientY;
    return point.matrixTransform(root.getScreenCTM()!.inverse());
  };
  function grab(event: PointerEvent, id: string, origin?: Point) {
    if (!editor || event.button !== 0) return;
    event.stopPropagation();
    editor.select(id);
    if (!origin || editor.connecting) return;
    const point = position(event);
    drag.current = { id, dx: origin.x - point.x, dy: origin.y - point.y };
    svg.current!.setPointerCapture(event.pointerId);
  }
  const selected = (id: string) => editor?.selected === id;

  return <svg ref={svg} className={styles.diagram} viewBox={`0 0 ${canvas.width} ${canvas.height}`}
    role="img" aria-label={editor ? 'Diagram layout' : frame.caption} data-editing={!!editor}
    onPointerMove={event => {
      if (!editor || !drag.current) return;
      const point = position(event);
      editor.move(drag.current.id, { x: Math.round(point.x + drag.current.dx), y: Math.round(point.y + drag.current.dy) });
    }}
    onPointerUp={() => { drag.current = null; }} onLostPointerCapture={() => { drag.current = null; }}>
    <defs>{['idle', 'flow', 'lookup'].map(tone =>
      <marker key={tone} id={marker + tone} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
        <path d="M0 0 10 5 0 10z" fill={tone === 'idle' ? '#a0aba7' : tone === 'flow' ? '#aa4529' : '#216960'}/>
      </marker>)}</defs>
    {doc.boundaries.filter(b => !hidden.has(b.id)).map(b =>
      <g key={b.id} data-selected={selected(b.id)} className={styles.boundary} onPointerDown={e => grab(e, b.id, b)}>
        <rect x={b.x} y={b.y} width={b.width} height={b.height} rx="12"/>
        <text x={b.x + 13} y={b.y + b.height - 13}>{b.label}</text>
      </g>)}
    {doc.connections.filter(e => !hidden.has(e.id) && !hidden.has(e.from) && !hidden.has(e.to))
      .sort((a, b) => Number(frame.active.includes(a.id)) - Number(frame.active.includes(b.id))).map(edge => {
      const from = nodes.get(edge.from), to = nodes.get(edge.to);
      if (!from || !to) return null;
      const via = edge.via ?? [];
      const points = [port(from, via[0] ?? to), ...via, port(to, via[via.length - 1] ?? from)];
      const d = points.map((p, i) => (i ? 'L' : 'M') + p.x + ' ' + p.y).join(' ');
      const active = frame.active.includes(edge.id) || selected(edge.id);
      return <g key={edge.id} className={styles.edge} data-kind={edge.kind} data-active={active} onPointerDown={e => grab(e, edge.id)}>
        <title>{edge.label}</title>
        {editor && <path d={d} fill="none" stroke="transparent" strokeWidth="18"/>}
        <path className={styles.line} d={d} markerEnd={`url(#${marker}${active ? edge.kind : 'idle'})`}/>
        {active && playing && <path className={styles.packet} d={d} pathLength="100"/>}
      </g>;
    })}
    {doc.nodes.filter(n => !hidden.has(n.id)).map(node => {
      const current = { ...node, ...frame.nodes?.[node.id] };
      return <g key={node.id} className={styles.node} data-id={node.id} data-selected={selected(node.id) || current.emphasized}
        transform={`translate(${node.x - canvas.nodeWidth / 2} ${node.y - canvas.nodeHeight / 2})`} onPointerDown={e => grab(e, node.id, node)}>
        <title>{current.label}{current.detail && ' · ' + current.detail}</title>
        <rect width={canvas.nodeWidth} height={canvas.nodeHeight} rx="8"/>
        <svg x="10" y="11" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{icons[node.symbol]}</svg>
        <text x="36" y="26" textLength={current.label.length > 13 ? 98 : undefined} lengthAdjust="spacingAndGlyphs">{current.label}</text>
        <text className={styles.detail} x="11" y="50" textLength={current.detail.length > 18 ? 120 : undefined} lengthAdjust="spacingAndGlyphs">{current.detail}</text>
      </g>;
    })}
  </svg>;
}
