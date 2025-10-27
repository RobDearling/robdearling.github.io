import Head from 'next/head';
import Link from 'next/link';
import { usePathname } from 'next/navigation'
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
      <aside className="w-64 p-8 border-r border-white hidden md:block">
        <div className="mb-8">
          <Link href="/" className="block hover:text-gray-400 transition-colors cursor-pointer">
            <pre className="text-xs leading-tight whitespace-pre">
{`
██╗    ██╗██████╗
██║    ██║██╔══██╗
██║ █╗ ██║██████╔╝
██║███╗██║██╔══██╗
╚███╔███╔╝██║  ██║
 ╚══╝╚══╝ ╚═╝  ╚═╝
`}
            </pre>
          </Link>
        </div>

        <nav className="flex flex-col space-y-1">
          <Link className={`nav-item ${pathname === '/' ? 'nav-active' : ''}`} href="/">
            HOME
          </Link>
          <Link className={`nav-item ${pathname === '/blog' ? 'nav-active' : ''}`} href="/blog">
            BLOG
          </Link>
        </nav>

        <div className="mt-8 pt-8 border-t border-white">
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
      <div className="md:hidden w-full">
        <header className="p-4 border-b border-white">
          <div className="mb-4">
            <Link href="/" className="font-bold">WR</Link>
          </div>
          <nav className="flex space-x-4">
            <Link className={`nav-item ${pathname === '/' ? 'nav-active' : ''}`} href="/">
              HOME
            </Link>
            <Link className={`nav-item ${pathname === '/blog' ? 'nav-active' : ''}`} href="/blog">
              BLOG
            </Link>
          </nav>
        </header>
      </div>

      <div className="flex flex-col flex-1">
        <main className="flex-grow p-8 md:p-16 max-w-4xl">{children}</main>

        <footer className="p-8 border-t border-white">
          <div className="flex flex-col space-y-4">
            <div className="text-sm italic border-l-2 border-white pl-4 py-2">
              "Information wants to be free, bandwidth wants to be cheap."
            </div>
            <div className="text-sm">
              © 2025 Rob Dearling
            </div>
            <div className="social-icons md:hidden">
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
    </div>
  );
}
