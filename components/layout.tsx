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
    <div lang='en' className="flex flex-col min-h-screen">
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
      <header className="container mx-auto mt-4">
        <nav className='flex justify-between mt-4 lg:mt-16 px-4 lg:px-64 xl:px-64 mb-4 text-lg'>
          <Link href="/" id='title' className='font-bold group hover:text-sky-400'>WreckItRob<span className='text-sky-400 group-hover:text-white'>.</span>dev</Link>        <div className="flex flex-row items-center font-semibold">
            <Link className={`nav-item ${pathname === '/' ? 'nav-active' : ''}`} href="/">
              Home
            </Link>
            <Link className={`nav-item ${pathname === '/blog' ? 'nav-active' : ''}`} href="/blog">Blog</Link
          </div>
        </nav>      </header>
      <main className="container mx-auto mt-32 lg:mt-32 px-4 lg:px-64 xl:px-64 mb-4 flex-grow">{children}</main>
      <footer className="container mx-auto mt-16 px-4 lg:px-64 xl:px-64 py-8">
        <div className="flex items-center space-x-6">

          <div className="social-icons">            <a href="https://github.com/RobDearling" target="_blank" rel="noopener noreferrer me" title="Github">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                width="20"
                height="20"
              >
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
            </a>            <a href="/rss.xml" target="_blank" rel="noopener noreferrer" title="RSS Feed">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                width="10"
                height="10"
              >
                <path d="M4 11a9 9 0 0 1 9 9"></path>
                <path d="M4 4a16 16 0 0 1 16 16"></path>
                <circle cx="5" cy="19" r="1"></circle>
              </svg>
            </a>
          </div>
          </div>

      </footer>
    </div>
  );
}
