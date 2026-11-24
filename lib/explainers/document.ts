import { z } from 'zod';
import { models } from './models';
import { symbols } from './layout';

export const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const id = z.string().regex(slugPattern, 'Use lowercase words separated by hyphens');
const title = z.string().trim().min(1);
const point = z.object({ x: z.number().finite(), y: z.number().finite() });
const node = point.extend({ id, label: title, detail: z.string(), symbol: z.enum(symbols) });
const boundary = point.extend({ id, label: title, width: z.number().positive(), height: z.number().positive() });
const connection = z.object({
  id, from: id, to: id, label: title, kind: z.enum(['flow', 'lookup']), via: z.array(point).optional(),
});
const step = z.object({
  caption: title, active: z.array(id), hidden: z.array(id), cue: id.optional(),
});
const scenario = z.object({ id, label: title, steps: z.array(step).min(1) });
const scene = z.object({
  id, title, description: title, model: id.optional(), scenarios: z.array(scenario).min(1),
});
const documentSchema = z.object({
  version: z.literal(1), title, nodes: z.array(node), boundaries: z.array(boundary),
  connections: z.array(connection), scenes: z.array(scene).min(1),
});

export type DiagramNode = z.infer<typeof node>;
export type Boundary = z.infer<typeof boundary>;
export type Connection = z.infer<typeof connection>;
export type Step = z.infer<typeof step>;
export type Scenario = z.infer<typeof scenario>;
export type Scene = z.infer<typeof scene>;
export type Explainer = z.infer<typeof documentSchema>;
export type Point = z.infer<typeof point>;

function uniqueIds(items: { id: string }[], group: string) {
  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item.id)) throw new Error(`Duplicate ${group} id "${item.id}"`);
    seen.add(item.id);
  }
  return seen;
}

export function parseExplainer(raw: unknown): Explainer {
  const doc = documentSchema.parse(raw);
  const elements = uniqueIds([...doc.nodes, ...doc.boundaries, ...doc.connections], 'diagram element');
  const nodes = new Set(doc.nodes.map(item => item.id));
  const edges = new Set(doc.connections.map(item => item.id));
  for (const edge of doc.connections) {
    if (!nodes.has(edge.from) || !nodes.has(edge.to) || edge.from === edge.to) {
      throw new Error(`Connection "${edge.id}" needs two distinct existing nodes`);
    }
  }
  uniqueIds(doc.scenes, 'scene');
  for (const scene of doc.scenes) {
    if (scene.model && !Object.hasOwn(models, scene.model)) throw new Error(`Unknown model "${scene.model}" in ${scene.id}`);
    const required = scene.model ? models[scene.model].requires : undefined;
    const missing = required?.find(id => !elements.has(id));
    if (missing) throw new Error(`Model "${scene.model}" in ${scene.id} requires diagram element "${missing}"`);
    uniqueIds(scene.scenarios, 'scenario');
    for (const scenario of scene.scenarios) {
      scenario.steps.forEach((step, index) => {
        const invalid = step.active.find(key => !edges.has(key)) ?? step.hidden.find(key => !elements.has(key));
        if (invalid) throw new Error(`${scene.id}/${scenario.id}, step ${index + 1} refers to missing element "${invalid}"`);
      });
    }
  }
  return doc;
}
