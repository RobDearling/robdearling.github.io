import Head from 'next/head';
import Link from 'next/link';
import Layout, { siteTitle } from '../components/layout';
import Date from '../components/date';
import { getSortedWeeklyNotesData } from '../lib/weekly-notes';

export async function getStaticProps() {
  return { props: { allWeeklyNotesData: getSortedWeeklyNotesData() } };
}

interface WeeklyNoteData {
  id: string;
  date: string;
  title: string;
}

interface WeeklyNotesProps {
  allWeeklyNotesData: WeeklyNoteData[];
}

export default function WeeklyNotes({ allWeeklyNotesData }: WeeklyNotesProps) {
  return (
    <Layout>
      <Head><title>Weekly notes — {siteTitle}</title></Head>
      <section>
        <h1 className="page-title">Weekly notes</h1>
        <p className="page-intro">A short record of what I have been working on, reading, and figuring out.</p>
        <ul className="entry-list">
          {allWeeklyNotesData.map(({ id, date, title }) => (
            <li key={id}>
              <div className="entry-row">
                <Date className="entry-date" dateString={date} />
                <h2 className="entry-title"><Link href={`/weekly-notes/${id}`}>{title}</Link></h2>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  );
}
