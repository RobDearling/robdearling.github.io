import fs from 'node:fs';
import path from 'node:path';
import { parseExplainer, slugPattern } from './document';

export function documentPath(directory: string, slug: string) {
  if (!slugPattern.test(slug)) throw new Error('Invalid explainer slug');
  return path.join(directory, slug + '.json');
}

export function loadExplainer(directory: string, slug: string) {
  return parseExplainer(JSON.parse(fs.readFileSync(documentPath(directory, slug), 'utf8')));
}
