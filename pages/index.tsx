import Head from 'next/head';
import Layout, { siteTitle } from '../components/layout';

export default function Home() {
  return (
    <Layout>
      <Head><title>{siteTitle}</title></Head>
      <section>
        <h1 className="page-title">Rob Dearling</h1>
        <p className="page-intro">SRE, developer, and technology tinkerer from the UK.</p>
        <div className="home-copy">
          <p>I work on systems that need to stay useful when things get complicated.</p>
          <p>My interests include software development, cloud computing, reverse engineering, automation, DevOps, and security. I enjoy exploring new technologies and solving technical problems.</p>
          <p>This site is a collection of my writing, projects, and technical notes.</p>
          <p className="elsewhere">Elsewhere: <a href="https://github.com/RobDearling" target="_blank" rel="noopener noreferrer me">GitHub</a> · <a href="/rss.xml">RSS</a></p>
        </div>
      </section>
    </Layout>
  );
}
