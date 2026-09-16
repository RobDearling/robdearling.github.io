import Head from 'next/head';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import Logo from './logo';
import SignalHeader from './signal-header';

export const siteTitle = 'WreckItRob';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();

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

      <div className="site-signal-wrap"><SignalHeader /></div>
      <header className="site-header">
        <Link href="/" className="site-identity" aria-label="WreckItRob home">
          <Logo idPrefix="site-logo" className="site-logo" />
          <span>Rob Dearling’s notes on cloud, code, and making things work.</span>
        </Link>
        <nav aria-label="Primary navigation">
          <Link aria-current={pathname === '/' ? 'page' : undefined} href="/">Home</Link>
          <Link aria-current={pathname === '/blog' ? 'page' : undefined} href="/blog">Writing</Link>
          <Link aria-current={pathname === '/weekly-notes' ? 'page' : undefined} href="/weekly-notes">Weekly notes</Link>
          <a href="https://github.com/RobDearling" target="_blank" rel="noopener noreferrer me">GitHub</a>
          <a href="/rss.xml">RSS</a>
        </nav>
      </header>

      <main className="site-main">{children}</main>

      <footer className="site-footer">
        <p>© {new Date().getFullYear()} Rob Dearling.</p>
        <p>Built for useful notes, small experiments, and the occasional strong opinion.</p>
      </footer>
    </div>
  );
}
