import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import remarkPrism from 'remark-prism';
import remarkGfm from 'remark-gfm';
import { randomUUID } from 'node:crypto';
import { loadExplainer } from './explainers/files';
import { slugPattern, type Explainer } from './explainers/document';

const postsDirectory = path.join(process.cwd(), 'posts');

export function getSortedPostsData() {
  const fileNames = fs.readdirSync(postsDirectory);
  type PostData = {
    id: string;
    date: string;
    title: string;
    headerImage?: string;
    summary?: string;
    [key: string]: string | undefined;
  };

  const allPostsData: PostData[] = fileNames.map((fileName) => {
    const id = fileName.replace(/\.md$/, '');
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    const matterResult = matter(fileContents);
    return {
      id,
      date: matterResult.data.date,
      ...matterResult.data,
    } as PostData;
  });
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getAllPostIds() {
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames.map((fileName) => {
    return {
      params: {
        id: fileName.replace(/\.md$/, ''),
      },
    };
  });
}

export async function getPostData(id: string) {
  const fullPath = path.join(postsDirectory, `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);

  const processor = remark()
    .use(remarkGfm)
    .use(html)
    .use(remarkPrism as any);
  const tree = processor.parse(matterResult.content);
  const documents = new Map<string, Explainer>();
  const embeds: SceneBlock[] = [];
  // Replace only standalone Markdown fences. Render the whole tree together so
  // reference links and footnotes can still cross an embedded figure.
  const marker = 'explainer-' + randomUUID();
  tree.children = tree.children.map(node => {
    if (node.type !== 'code' || node.lang !== 'explainer') return node;
    const reference = node.value.trim();
    try {
      const parts = reference.split('/');
      if (parts.length !== 2 || !parts.every(part => slugPattern.test(part))) throw new Error('Expected explainer-slug/scene-id');
      const [slug, sceneId] = parts;
      const doc = documents.get(slug) ?? loadExplainer(path.join(process.cwd(), 'explainers'), slug);
      if (!doc.scenes.some(scene => scene.id === sceneId)) throw new Error('Scene does not exist');
      documents.set(slug, doc);
      embeds.push({ kind: 'scene', slug, sceneId });
      return { type: 'paragraph', children: [{ type: 'text', value: marker }] };
    } catch (error) {
      throw new Error(`Post "${id}", explainer "${reference}": ${(error as Error).message}`);
    }
  });
  const rendered = processor.stringify(await processor.run(tree) as typeof tree);
  const blocks: PostBlock[] = [];
  rendered.split('<p>' + marker + '</p>').forEach((fragment, i) => {
    if (i) blocks.push(embeds[i - 1]);
    if (fragment.trim()) blocks.push({ kind: 'html', html: fragment });
  });

  return {
    id,
    blocks,
    documents: Object.fromEntries(documents),
    ...matterResult.data,
  };
}

type SceneBlock = { kind: 'scene'; slug: string; sceneId: string };
export type PostBlock = SceneBlock | { kind: 'html'; html: string };
