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
    <div lang='en'>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="description"
          content="Robs personal site"
        />
        <meta name="og:title" content={siteTitle} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <header className="container mx-auto mt-4">
          <nav className='flex justify-between mt-4 lg:mt-16 px-4 lg:px-64 xl:px-64 mb-4 text-lg'>
            <Link href="/" id='title' className='font-bold'>WreckItRob<span className='text-sky-400'>.</span>dev</Link>
            <div className="flex flex-row items-center font-semibold">
              <Link className={`nav-item ${pathname === '/' ? 'nav-active' : ''}`} href="/">
                Home
              </Link>
              <Link className={`nav-item ${pathname === '/blog' ? 'nav-active' : ''}`} href="/blog">Blog</Link>
              <Link className={`nav-item ${pathname === '/riddles' ? 'nav-active' : ''}`} href={`/riddles`}>Riddles</Link> 
            </div>
          </nav>
        </header>
      <main className="container mx-auto mt-32 lg:mt-32 px-4 lg:px-64 xl:px-64 mb-4">{children}</main>
    </div>
  );
}