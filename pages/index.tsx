import Head from 'next/head';
import Link from 'next/link';
import type { InferGetStaticPropsType } from 'next';
import Date from '../components/date';
import Layout, { siteTitle } from '../components/layout';
import { getSortedPostsData } from '../lib/posts';
import { getSortedWeeklyNotesData } from '../lib/weekly-notes';

export function getStaticProps() {
  const posts = getSortedPostsData().slice(0, 4);
  const notes = getSortedWeeklyNotesData().slice(0, 2);
  return { props: { posts, notes } };
}

export default function Home({ posts, notes }: InferGetStaticPropsType<typeof getStaticProps>) {
  const [latest, ...earlier] = posts;
  return (
    <Layout>
      <Head><title>{siteTitle}</title></Head>
      <div className="home-layout">
        <div className="home-writing">
          {latest && (
            <section className="lead-story">
              <p className="section-label">Latest writing <span>·</span> <Date dateString={latest.date} compact /></p>
              <h2><Link href={`/posts/${latest.id}`}>{latest.title}</Link></h2>
              {latest.summary && <p className="lead-summary">{latest.summary}</p>}
            </section>
          )}
          <section>
            <div className="section-heading">
              <h2 className="section-label">More writing</h2>
              <Link href="/blog">All writing</Link>
            </div>
            <ul className="entry-list home-entries">
              {earlier.map(({ id, title, date }) => (
                <li key={id} className="entry-row">
                  <Date className="entry-date" dateString={date} compact />
                  <Link className="entry-title" href={`/posts/${id}`}>{title}</Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
        <aside className="home-margin">
          <h2 className="section-label">About me</h2>
          <p className="bio-lead">Architect, developer, and technology tinkerer from the UK.</p>
          <p>I work on systems that need to stay useful when things get complicated.</p>
          <p>My interests include software development, cloud computing, reverse engineering, automation, DevOps, and security.</p>
          <section className="recent-notes">
            <div className="section-heading">
              <h2 className="section-label">Weekly notes</h2>
              <Link href="/weekly-notes">All notes</Link>
            </div>
            <ul>
              {notes.map(({ id, date }) => (
                <li key={id}>
                  <Link href={`/weekly-notes/${id}`}>Week of <Date dateString={date} /></Link>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </Layout>
  );
}
