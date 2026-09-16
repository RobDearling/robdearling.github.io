import Head from 'next/head';
import Link from 'next/link';
import Layout, { siteTitle } from '../components/layout';
import Date from '../components/date';
import { getSortedPostsData } from '../lib/posts';

export async function getStaticProps() {
  return { props: { allPostsData: getSortedPostsData() } };
}

interface PostData {
  id: string;
  date: string;
  title: string;
  summary?: string;
}

interface BlogProps {
  allPostsData: PostData[];
}

export default function Blog({ allPostsData }: BlogProps) {
  return (
    <Layout>
      <Head><title>Writing — {siteTitle}</title></Head>
      <section>
        <h1 className="page-title">Writing</h1>
        <p className="page-intro">Notes on reliability, cloud platforms, automation, security, and whatever I am learning in public.</p>
        <ul className="entry-list">
          {allPostsData.map(({ id, date, title, summary }) => (
            <li key={id}>
              <div className="entry-row">
                <Date className="entry-date" dateString={date} />
                <div>
                  <h2 className="entry-title"><Link href={`/posts/${id}`}>{title}</Link></h2>
                  {summary ? <p className="entry-summary">{summary}</p> : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  );
}
