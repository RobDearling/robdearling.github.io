import Layout from '../../components/layout';
import Head from 'next/head';
import { getAllPostIds, getPostData } from '../../lib/posts';
import Date from '../../components/date';
import Prism from "prismjs";
import 'prismjs/components/prism-hcl';
import "prismjs/components/prism-bash"
import "prismjs/components/prism-shell-session"
import "prismjs/components/prism-typescript"
import "prismjs/components/prism-bash"

import React, { useEffect } from "react";
interface PostData {
  title: string;
  date: string;
  contentHtml: string;
}

export default function Post({ postData }: { postData: PostData }) {
  useEffect(() => {
    Prism.highlightAll();
  }, []);
  return (
    <Layout>
      <Head>
        <title>{postData.title}</title>
      </Head>
      <article>
        <h1 className='text-4xl font-bold'>{postData.title}</h1>
        <div className='text-sky-400 mt-1'>
          Posted on <Date dateString={postData.date} />
        </div>
        <div id='blog-content' className='mt-8' dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
      </article>
    </Layout>
  );
}

export async function getStaticPaths() {
  const paths = getAllPostIds();
  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }: { params: { id: string } }) {
  const postData = await getPostData(params.id);

  return {
    props: {
      postData,
    },
  };
}
