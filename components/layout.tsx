import Head from 'next/head';
import Image from 'next/image';
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
      <header  className="container mx-auto mt-4">
          <nav>
            <div className="mt-4 lg:mt-16 px-4 lg:px-64 xl:px-64 mb-4 flex flex-row items-center gap-1">
              <Link className={`text-sm ${pathname === '/' ? 'text-sky-400' : ''}`} href="/">
                Home
              </Link>
              <Link className={`text-sm ml-2 ${pathname === '/blog' ? 'text-sky-400' : ''}`} href="/blog">Blog</Link>
              <Link className={`text-sm ml-2 ${pathname === '/riddles' ? 'text-sky-400' : ''}`} href={`/riddles`}>Riddles</Link> 
            </div>
          </nav>
        </header>
      <main className="container mx-auto mt-4 lg:mt-12 px-4 lg:px-64 xl:px-64 mb-4">{children}</main>
    </div>
  );
}
