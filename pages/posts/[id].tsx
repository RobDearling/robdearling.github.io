import Head from 'next/head';
import Prism from 'prismjs';
import React, { useEffect } from 'react';
import 'prismjs/components/prism-hcl';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-shell-session';
import 'prismjs/components/prism-typescript';
import Layout from '../../components/layout';
import Date from '../../components/date';
import { getAllPostIds, getPostData, type PostBlock } from '../../lib/posts';
import type { Explainer } from '../../lib/explainers/document';
import ScenePlayer from '../../components/explainers/player';

interface PostData {
  title: string;
  date: string;
  blocks: PostBlock[];
  documents: Record<string, Explainer>;
}

export default function Post({ postData }: { postData: PostData }) {
  useEffect(() => { Prism.highlightAll(); }, []);
  const onlyBlock = postData.blocks.length === 1 ? postData.blocks[0] : undefined;

  return (
    <Layout>
      <Head>
        <title>{postData.title}</title>
        <meta name="description" content={postData.title} />
        <meta property="og:description" content={postData.title} />
      </Head>
      <article>
        <h1 className="page-title">{postData.title}</h1>
        <p className="article-meta">Published <Date dateString={postData.date} /></p>
        {onlyBlock?.kind === 'html' ? <div id="blog-content" className="article-content" dangerouslySetInnerHTML={{ __html: onlyBlock.html }}/> :
          <div id="blog-content" className="article-content">{postData.blocks.map((block, i) => {
          if (block.kind === 'html') return <div key={i} dangerouslySetInnerHTML={{ __html: block.html }} />;
          const doc = postData.documents[block.slug];
          const scene = doc.scenes.find(item => item.id === block.sceneId)!;
          return <ScenePlayer key={block.slug + '/' + block.sceneId + '/' + i} doc={doc} scene={scene}/>;
          })}</div>}
      </article>
    </Layout>
  );
}

export async function getStaticPaths() {
  return { paths: getAllPostIds(), fallback: false };
}

export async function getStaticProps({ params }: { params: { id: string } }) {
  return { props: { postData: await getPostData(params.id) } };
}
