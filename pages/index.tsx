import Head from 'next/head';
import Layout, { siteTitle } from '../components/layout';

export default function Home() {
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <div>
      <div>
        <p className="text-4xl font-bold">Hi, I&apos;m Rob 👋</p>
        <p className="text-2xl font-bold">
          welcome to my <span className="text-sky-400 inline">personal website</span>
        </p>
      </div>
      <div className="mt-4">
        <p className="text-lg">
          I am a 29 year old SRE, Developer & Tech tinkerer from the UK.
        </p>
        <p className="text-lg mt-2">
          Some of my interests include software development, cloud computing,
          reverse engineering, automation, devops and security. I enjoy mostly
          anything tech and I&apos;m always looking to explore new things.
        </p>
      </div>

      <div className="mt-8">
        <p className="text-2xl font-bold">projects</p>
        <p className="text-lg mt-2">
          some of my side projects are personal projects and as a result are not
          public or open-source.
        </p>
        <div className="mt-4">
          <div className="mt-4">
            <p className="text-lg text-sky-400">wreckitrob.dev</p>
            <p className="text-lg">my personal site (this one!).</p>
            <div className="mt-2 flex flex-wrap gap-y-2">
              <span className="bg-sky-300 rounded-full px-3 py-1 text-sm font-semibold text-gray-800 mr-2">
                Next.js
              </span>
              <span className="bg-sky-300 rounded-full px-3 py-1 text-sm font-semibold text-gray-800 mr-2">
                Node.js
              </span>
              <span className="bg-sky-300 rounded-full px-3 py-1 text-sm font-semibold text-gray-800 mr-2">
                React
              </span>
              <span className="bg-sky-300 rounded-full px-3 py-1 text-sm font-semibold text-gray-800 mr-2">
                TailwindCSS
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </Layout>
  );
}
