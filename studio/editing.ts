import type { Explainer, Scene, Scenario, Point, Step } from '../lib/explainers/document';
import { canvas } from '../lib/explainers/layout';

export const initialStep = (): Step => ({ caption: 'Follow the request through the system.', active: [], hidden: [] });
export const initialScenario = (id: string): Scenario => ({ id, label: 'Default', steps: [initialStep()] });
export const initialScene = (id: string): Scene => ({
  id, title: 'Follow the request', description: 'Step through the connections in this system.', scenarios: [initialScenario('default')],
});
export function blankDocument(title: string): Explainer {
  return { version: 1, title, nodes: [], boundaries: [], connections: [], scenes: [initialScene('overview')] };
}
export function nextId(prefix: string, items: { id: string }[]) {
  let number = 1;
  while (items.some(item => item.id === prefix + '-' + number)) number++;
  return prefix + '-' + number;
}
export type Edit = (change: (doc: Explainer) => void) => void;
export function elementList(doc: Explainer) { return [...doc.nodes, ...doc.boundaries, ...doc.connections]; }

export function removeElement(doc: Explainer, id: string) {
  const removed = new Set([id, ...doc.connections.filter(e => e.from === id || e.to === id).map(e => e.id)]);
  doc.nodes = doc.nodes.filter(n => !removed.has(n.id));
  doc.boundaries = doc.boundaries.filter(b => !removed.has(b.id));
  doc.connections = doc.connections.filter(e => !removed.has(e.id));
  for (const scene of doc.scenes) for (const scenario of scene.scenarios) for (const step of scenario.steps) {
    step.active = step.active.filter(key => !removed.has(key));
    step.hidden = step.hidden.filter(key => !removed.has(key));
  }
}

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(n, max));
export function moveElement(doc: Explainer, id: string, point: Point) {
  const node = doc.nodes.find(n => n.id === id);
  if (node) {
    node.x = clamp(point.x, canvas.nodeWidth / 2, canvas.width - canvas.nodeWidth / 2);
    node.y = clamp(point.y, canvas.nodeHeight / 2, canvas.height - canvas.nodeHeight / 2);
    return;
  }
  const box = doc.boundaries.find(b => b.id === id);
  if (!box) return;
  const dx = clamp(point.x, 0, canvas.width - box.width) - box.x;
  const dy = clamp(point.y, 0, canvas.height - box.height) - box.y;
  for (const item of doc.nodes) {
    if (item.x >= box.x && item.x <= box.x + box.width && item.y >= box.y && item.y <= box.y + box.height) {
      moveElement(doc, item.id, { x: item.x + dx, y: item.y + dy });
    }
  }
  box.x += dx; box.y += dy;
}
