import Head from "next/head";
import Layout, { siteTitle } from "../components/layout";

export default function Home() {
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <div>
        <div>
          <p className="text-5xl font-bold">Hi, I&apos;m Rob 👋</p>
          <p className="text-2xl font-semibold">
            welcome to my{" "}
            <span className="text-sky-400 inline">personal website</span>
          </p>
        </div>
        <div className="mt-8 text-xl">
          <p>
            I'm a 29 year old SRE, Developer & Tech tinkerer from the UK.
          </p>
          <p className="mt-4">
            Some of my interests include software development, cloud computing,
            reverse engineering, automation, devops and security. I enjoy mostly
            anything tech and I&apos;m always looking to explore new things.
          </p>
        </div>
      </div>
    </Layout>
  );
}
