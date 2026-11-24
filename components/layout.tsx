import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';
import SignalHeader from './signal-header';

export const siteTitle = 'WreckItRob';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { pathname, query } = useRouter();
  const pagePath = typeof query.id === 'string' ? pathname.replace('[id]', query.id) : pathname;
  const Name = pathname === '/' ? 'h1' : 'p';

  return (
    <div lang="en" className="site-shell">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="alternate" type="application/rss+xml" title="WreckItRob RSS Feed" href="/rss.xml" />
        <meta name="description" content="Rob Dearling's personal site" />
        <meta name="og:title" content={siteTitle} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <header className="site-header">
        <Name className="site-name"><Link href="/" tabIndex={0} aria-label="Rob Dearling home">Rob Dearling</Link></Name>
        <nav aria-label="Primary navigation">
          <Link aria-current={pathname === '/' ? 'page' : undefined} href="/" tabIndex={0}>Home</Link>
          <Link aria-current={pathname === '/blog' ? 'page' : undefined} href="/blog" tabIndex={0}>Writing</Link>
          <Link aria-current={pathname === '/weekly-notes' ? 'page' : undefined} href="/weekly-notes" tabIndex={0}>Weekly notes</Link>
        </nav>
        <SignalHeader pagePath={pagePath} />
      </header>

      <main className="site-main">{children}</main>

      <footer className="site-footer">
        <p>© {new Date().getFullYear()} Rob Dearling.</p>
        <div className="footer-links">
          <a href="https://github.com/RobDearling" rel="me">GitHub</a>
          <a href="/rss.xml">RSS</a>
        </div>
      </footer>
    </div>
  );
}
