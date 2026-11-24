import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'node:fs';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { documentPath } from '../../../../lib/explainers/files';
import { parseExplainer, slugPattern } from '../../../../lib/explainers/document';

const revision = (text: string) => createHash('sha256').update(text).digest('hex');

export default function documents(req: NextApiRequest, res: NextApiResponse) {
  const directory = process.env.EXPLAINER_DIRECTORY!;
  const parts = req.query.slug ?? [];
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (parts.length === 0 && req.method === 'GET') {
      const names = fs.existsSync(directory) ? fs.readdirSync(directory) : [];
      return res.json(names.filter(n => n.endsWith('.json') && slugPattern.test(n.slice(0, -5))).map(n => n.slice(0, -5)).sort());
    }
    if (!Array.isArray(parts) || parts.length !== 1 || !slugPattern.test(parts[0])) return res.status(400).json({ error: 'Invalid document name' });
    const file = documentPath(directory, parts[0]);
    if (req.method === 'GET') {
      if (!fs.existsSync(file)) return res.status(404).json({ error: 'Document not found' });
      const raw = fs.readFileSync(file, 'utf8');
      return res.json({ document: parseExplainer(JSON.parse(raw)), revision: revision(raw) });
    }
    if (req.method !== 'PUT') return res.status(405).end();
    if (!req.headers.origin || new URL(req.headers.origin).host !== req.headers.host ||
        !['127.0.0.1', 'localhost', '[::1]'].includes(new URL(req.headers.origin).hostname)) {
      return res.status(403).json({ error: 'Open the local studio to save' });
    }
    const doc = parseExplainer(req.body.document);
    const before = fs.existsSync(file) ? revision(fs.readFileSync(file, 'utf8')) : null;
    if (before !== req.body.revision) return res.status(409).json({ error: 'This file changed on disk. Reopen it before saving.' });
    fs.mkdirSync(directory, { recursive: true });
    const raw = JSON.stringify(doc, null, 2) + '\n';
    const temporary = path.join(directory, '.' + randomUUID() + '.tmp');
    try {
      fs.writeFileSync(temporary, raw, { flag: 'wx' });
      fs.renameSync(temporary, file);
    } finally {
      if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
    }
    return res.json({ revision: revision(raw) });
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message });
  }
}
