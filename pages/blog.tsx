import Head from "next/head";
import Layout, { siteTitle } from "../components/layout";
import { getSortedPostsData } from "../lib/posts";
import Link from "next/link";
import Date from "../components/date";

export async function getStaticProps() {
  const allPostsData = getSortedPostsData();
  return {
    props: {
      allPostsData,
    },
  };
}

interface PostData {
  id: string;
  date: string;
  title: string;
}

interface HomeProps {
  allPostsData: PostData[];
}

export default function Home({ allPostsData }: HomeProps) {
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section>
        <h1 className="font-bold text-xl md:text-2xl mb-6 md:mb-8">BLOG POSTS</h1>
        <ul className="space-y-4 md:space-y-6">
          {allPostsData.map(({ id, date, title }) => (
            <li key={id} className="border-b border-white pb-3 md:pb-4">
              <Link href={`/posts/${id}`} className="text-base md:text-lg hover:underline block">
                {title}
              </Link>
              <div className="mt-1">
                <span className="text-xs md:text-sm text-gray-400">
                  <Date dateString={date} />
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  );
}
