import Head from "next/head";
import Layout, { siteTitle } from "../components/layout";

export default function Home() {
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-4">ROB DEARLING</h1>
          <p className="text-base">
            SRE / Developer / Tech Tinkerer
          </p>
        </div>
        <div className="space-y-4 text-base leading-relaxed">
          <p>
            I'm a 30 year old site reliability engineer, developer, and technology enthusiast from the UK.
          </p>
          <p>
            My interests include software development, cloud computing, reverse engineering,
            automation, devops, and security. I enjoy exploring new technologies and solving
            technical problems.
          </p>
          <p>
            This site is a collection of my writings, projects, and technical notes.
          </p>
        </div>
        <div className="mt-12 space-y-2">
          <p className="font-bold">LINKS:</p>
          <p>
            <a href="https://github.com/RobDearling" target="_blank" rel="noopener noreferrer me" className="underline hover:no-underline">
              [GitHub]
            </a>
          </p>
          <p>
            <a href="/rss.xml" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">
              [RSS Feed]
            </a>
          </p>
        </div>
      </div>
    </Layout>
  );
}
