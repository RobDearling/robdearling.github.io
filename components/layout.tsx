import Head from 'next/head';
import Link from 'next/link';
import { usePathname } from 'next/navigation'
import Logo from './logo';
export const siteTitle = 'WreckItRob';


import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  home?: boolean;
}

export default function Layout({ children, home }: LayoutProps) {
  const pathname = usePathname()
  return (
    <div lang='en' className="flex min-h-screen">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="alternate" type="application/rss+xml" title="WreckItRob RSS Feed" href="/rss.xml" />
        <meta
          name="description"
          content="Robs personal site"
        />
        <meta name="og:title" content={siteTitle} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      {/* Left sidebar navigation */}
      <aside className="w-44 p-4 border-r border-[var(--text-color)] hidden md:block">
        <div className="mb-6">
          <Link href="/" className="logo-link block cursor-pointer" aria-label="WreckItRob home">
            <Logo idPrefix="desktop-logo" className="w-36 h-auto" />
          </Link>
        </div>

        <nav className="flex flex-col space-y-1">
          <Link className={`nav-item ${pathname === '/' ? 'nav-active' : ''}`} href="/">
            HOME
          </Link>
          <Link className={`nav-item ${pathname === '/blog' ? 'nav-active' : ''}`} href="/blog">
            BLOG
          </Link>
          <Link className={`nav-item ${pathname === '/weekly-notes' ? 'nav-active' : ''}`} href="/weekly-notes">
            WEEKLY NOTES
          </Link>
        </nav>

        <div className="mt-6 pt-6 border-t border-[var(--text-color)]">
          <div className="social-icons flex-col">
            <a href="https://github.com/RobDearling" target="_blank" rel="noopener noreferrer me" title="Github">
              [GitHub]
            </a>
            <a href="/rss.xml" target="_blank" rel="noopener noreferrer" title="RSS Feed">
              [RSS]
            </a>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden w-full flex flex-col">
        <header className="p-4 border-b border-[var(--text-color)]">
          <div className="mb-4">
            <Link href="/" className="logo-link inline-block" aria-label="WreckItRob home">
              <Logo idPrefix="mobile-logo" className="w-32 h-auto" />
            </Link>
          </div>
          <nav className="flex space-x-4 text-sm">
            <Link className={`${pathname === '/' ? 'nav-active' : ''} hover:underline`} href="/">
              HOME
            </Link>
            <Link className={`${pathname === '/blog' ? 'nav-active' : ''} hover:underline`} href="/blog">
              BLOG
            </Link>
            <Link className={`${pathname === '/weekly-notes' ? 'nav-active' : ''} hover:underline`} href="/weekly-notes">
              WEEKLY NOTES
            </Link>
          </nav>
        </header>

        <main className="flex-grow p-4 sm:p-6">{children}</main>

        <footer className="p-3 sm:p-4 border-t border-[var(--text-color)] text-sm">
          <div className="flex flex-col space-y-2">
            <div className="text-xs italic border-l-2 border-[var(--text-color)] pl-3 py-1">
              "If sharing is theft, then libraries are criminal enterprises."
            </div>
            <div className="text-xs">
              © {new Date().getFullYear()} Rob Dearling
            </div>
            <div className="social-icons flex-row">
              <a href="https://github.com/RobDearling" target="_blank" rel="noopener noreferrer me" title="Github">
                [GitHub]
              </a>
              <a href="/rss.xml" target="_blank" rel="noopener noreferrer" title="RSS Feed">
                [RSS]
              </a>
            </div>
          </div>
        </footer>
      </div>

      {/* Desktop layout */}
      <div className="hidden md:flex md:flex-col md:flex-1">
        <main className="flex-grow p-8 md:p-16 max-w-4xl">{children}</main>

        <footer className="p-4 border-t border-[var(--text-color)]">
          <div className="flex flex-col space-y-2">
            <div className="text-sm italic border-l-2 border-[var(--text-color)] pl-3 py-1">
              "If sharing is theft, then libraries are criminal enterprises."
            </div>
            <div className="text-sm">
              © {new Date().getFullYear()} Rob Dearling
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
