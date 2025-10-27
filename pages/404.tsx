import Head from "next/head";
import Layout, { siteTitle } from "../components/layout";
import Link from "next/link";

export default function Custom404() {
  return (
    <Layout>
      <Head>
        <title>404 - Not Found | {siteTitle}</title>
      </Head>
      <div className="flex flex-col items-start space-y-4 md:space-y-6">
        <pre className="text-xs md:text-base leading-tight whitespace-pre overflow-x-auto">
{`
  _  _    ___  _  _
 | || |  / _ \\| || |
 | || |_| | | | || |_
 |__   _| | | |__   _|
    | | | |_| |  | |
    |_|  \\___/   |_|
`}
        </pre>

        <div className="space-y-3 md:space-y-4">
          <h1 className="text-lg md:text-xl font-bold">ERROR: PAGE NOT FOUND</h1>
          <p className="text-sm md:text-base">
            The requested resource could not be located on this server.
          </p>
          <div className="mt-6 md:mt-8">
            <p className="mb-2 text-sm md:text-base">Available options:</p>
            <ul className="space-y-1 ml-4 text-sm md:text-base">
              <li>
                <Link href="/" className="underline hover:no-underline">
                  [Return to home]
                </Link>
              </li>
              <li>
                <Link href="/blog" className="underline hover:no-underline">
                  [View blog posts]
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}
