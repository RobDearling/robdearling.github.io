import Layout from '../../components/layout';
import Head from 'next/head';
import { getAllWeeklyNoteIds, getWeeklyNoteData } from '../../lib/weekly-notes';
import Date from '../../components/date';
import Prism from "prismjs";
import 'prismjs/components/prism-hcl';
import "prismjs/components/prism-bash"
import "prismjs/components/prism-shell-session"
import "prismjs/components/prism-typescript"

import React, { useEffect } from "react";

interface WeeklyNoteData {
  title: string;
  date: string;
  contentHtml: string;
}

export default function WeeklyNote({ weeklyNoteData }: { weeklyNoteData: WeeklyNoteData }) {
  useEffect(() => {
    Prism.highlightAll();
  }, []);
  return (
    <Layout>
      <Head>
        <title>{weeklyNoteData.title}</title>
        <meta name="description" content={weeklyNoteData.title}></meta>
        <meta property="og:description" content={weeklyNoteData.title}></meta>
      </Head>
      <article>
        <h1 className="page-title">{weeklyNoteData.title}</h1>
        <p className="article-meta">
          Week of <Date dateString={weeklyNoteData.date} />
        </p>
        <div id="blog-content" className="article-content" dangerouslySetInnerHTML={{ __html: weeklyNoteData.contentHtml }} />
      </article>
    </Layout>
  );
}

export async function getStaticPaths() {
  const paths = getAllWeeklyNoteIds();
  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }: { params: { id: string } }) {
  const weeklyNoteData = await getWeeklyNoteData(params.id);

  return {
    props: {
      weeklyNoteData,
    },
  };
}
