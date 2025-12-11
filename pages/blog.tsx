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
  headerImage?: string;
  summary?: string;
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
          {allPostsData.map(({ id, date, title, headerImage, summary }) => (
            <li key={id} className="blog-post-item pb-3 md:pb-4">
              <div className="flex justify-between items-baseline mb-4">
                <Link href={`/posts/${id}`} className="text-lg md:text-xl underline hover:underline">
                  {title}
                </Link>
                <span className="text-xs text-gray-400 ml-4">
                  <Date dateString={date} />
                </span>
              </div>
              {headerImage && (
                <Link href={`/posts/${id}`} className="block mb-3">
                  <img
                    src={headerImage}
                    alt={title}
                    className='blog-header-image w-full'
                  />
                </Link>
              )}
              {summary && (
                <p className="text-xs text-gray-400 mt-3">
                  {summary}
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  );
}
