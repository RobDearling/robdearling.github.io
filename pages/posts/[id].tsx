import Head from 'next/head';
import Prism from 'prismjs';
import React, { useEffect } from 'react';
import 'prismjs/components/prism-hcl';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-shell-session';
import 'prismjs/components/prism-typescript';
import Layout from '../../components/layout';
import Date from '../../components/date';
import { getAllPostIds, getPostData } from '../../lib/posts';

interface PostData {
  title: string;
  date: string;
  contentHtml: string;
}

export default function Post({ postData }: { postData: PostData }) {
  useEffect(() => { Prism.highlightAll(); }, []);

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
        <div id="blog-content" className="article-content" dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
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
