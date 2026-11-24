import type { Explainer, Scene, Scenario, Step } from './document';

type Choice = { id: string; label: string; options: { value: string; label: string }[]; initial: string };
type Range = { id: string; label: string; min: number; max: number; initial: number };
export type ModelInput = Choice | Range;
export type Values = Record<string, string | number>;
export interface Frame extends Step {
  nodes?: Record<string, { label?: string; detail?: string; emphasized?: boolean }>;
}
export interface SceneModel {
  inputs: ModelInput[];
  requires?: string[];
  derive(context: { doc: Explainer; scene: Scene; scenario: Scenario; step: Step; index: number; values: Values }): Frame;
}

const blobDns: SceneModel = {
  requires: ['vm', 'laptop', 'dns', 'zone', 'dns-zone', 'nic', 'public', 'blob', 'vm-dns', 'laptop-dns', 'dns-vm', 'dns-laptop',
    'vm-nic', 'vm-public', 'laptop-public', 'nic-blob', 'public-blob'],
  inputs: [
    { id: 'client', label: 'Send from', initial: 'vm', options: [
      { value: 'vm', label: 'Azure VM' }, { value: 'laptop', label: 'External laptop' },
    ] },
    { id: 'zone', label: 'Private DNS zone', initial: 'linked', options: [
      { value: 'linked', label: 'Linked to VNet' }, { value: 'unlinked', label: 'Unlinked' },
    ] },
  ],
  derive({ step, values }) {
    const inside = values.client === 'vm';
    const privateAnswer = inside && values.zone === 'linked';
    const source = inside ? 'vm' : 'laptop';
    const target = privateAnswer ? 'nic' : 'public';
    const subject = inside ? 'The VM' : 'The laptop';
    const answer = privateAnswer ? '10.42.1.5' : 'a public IP';
    const frame: Frame = {
      ...step, hidden: [...step.hidden, inside ? 'laptop' : 'vm', ...(!privateAnswer ? ['dns-zone'] : [])],
      nodes: { dns: { detail: step.cue === 'query' ? 'Looking up name' : answer },
        zone: { detail: values.zone === 'linked' ? 'A → 10.42.1.5' : 'VNet unlinked' },
        [target]: { emphasized: step.cue === 'answer' || step.cue === 'connect' } },
    };
    if (step.cue === 'query') return { ...frame, active: [source + '-dns'], caption: step.caption + ' ' + subject + ' asks for the ordinary Blob hostname.' };
    if (step.cue === 'answer') return { ...frame, active: ['dns-' + source], caption: step.caption + ' DNS returns ' + answer + '.' };
    if (step.cue === 'connect') {
      let route = 'The laptop reaches the public endpoint over the internet.';
      if (inside) route = 'The VM reaches the public endpoint over the Azure backbone.';
      if (privateAnswer) route = 'The VM connects to 10.42.1.5. Private Link carries the request to Blob Storage.';
      return { ...frame, active: [source + '-' + target, target + '-blob'], caption: step.caption + ' ' + route };
    }
    return frame;
  },
};

export const models: Record<string, SceneModel> = { 'azure-blob-dns': blobDns };
