import Head from "next/head";
import Layout, { siteTitle } from "../components/layout";
import utilStyles from "../styles/utils.module.css";
import { useState, useEffect } from "react";

interface Feed {
  title: string;
  text: string;
  xmlUrl: string;
  htmlUrl: string;
}

interface FeedGroup {
  title: string;
  feeds: Feed[];
}

export default function Feeds() {
  const [feedData, setFeedData] = useState<{ groups: FeedGroup[]; totalFeeds: number }>({
    groups: [],
    totalFeeds: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeedData();
  }, []);
  const fetchFeedData = async () => {
    try {
      const response = await fetch('/feeds.xml');
      const text = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, 'text/xml');
      
      const outlines = xmlDoc.querySelectorAll('outline');
      const allFeeds: Feed[] = [];

      const processOutline = (outline: Element) => {
        const type = outline.getAttribute('type');
        const title = outline.getAttribute('title') || outline.getAttribute('text') || '';
        
        if (type === 'rss') {
          const feed: Feed = {
            title,
            text: outline.getAttribute('text') || title,
            xmlUrl: outline.getAttribute('xmlUrl') || '',
            htmlUrl: outline.getAttribute('htmlUrl') || ''
          };
          allFeeds.push(feed);
        } else if (outline.children.length > 0) {
          // Process child outlines recursively
          Array.from(outline.children).forEach(processOutline);
        }
      };

      outlines.forEach(processOutline);

      // Sort feeds alphabetically by title
      allFeeds.sort((a, b) => a.title.localeCompare(b.title));

      setFeedData({ 
        groups: [{ title: 'RSS Feeds', feeds: allFeeds }], 
        totalFeeds: allFeeds.length 
      });
      setLoading(false);
    } catch (err) {
      setError('Failed to load feed data');
      setLoading(false);
    }
  };

  const downloadFeedsXml = () => {
    const element = document.createElement('a');
    element.setAttribute('href', '/feeds.xml');
    element.setAttribute('download', 'feeds.xml');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading) {
    return (
      <Layout>
        <Head>
          <title>RSS Feeds - {siteTitle}</title>
        </Head>
        <div className="flex justify-center items-center min-h-64">
          <div className="text-lg">Loading feeds...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Head>
          <title>RSS Feeds - {siteTitle}</title>
        </Head>
        <div className="flex justify-center items-center min-h-64">
          <div className="text-lg text-red-400">{error}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>RSS Feeds - {siteTitle}</title>
        <meta name="description" content="My RSS feed subscriptions" />
      </Head>
      
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-bold text-5xl">RSS Feeds</h2>
          <button
            onClick={downloadFeedsXml}
            className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Download OPML
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-300 text-lg">
            I follow {feedData.totalFeeds} RSS feeds across various topics. 
            You can download the OPML file to import these feeds into your own RSS reader.
          </p>
        </div>        {feedData.groups[0] && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {feedData.groups[0].feeds.map((feed, feedIndex) => (
              <div
                key={feedIndex}
                className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors"
              >
                <div className="mb-2">
                  <h4 className="font-semibold text-white truncate" title={feed.title}>
                    {feed.title}
                  </h4>
                </div>
                <div className="flex flex-col space-y-2 text-sm">
                  {feed.htmlUrl && (
                    <a
                      href={feed.htmlUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400 hover:text-sky-300 truncate transition-colors"
                      title={feed.htmlUrl}
                    >
                      🌐 Visit Website
                    </a>
                  )}
                  {feed.xmlUrl && (
                    <a
                      href={feed.xmlUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-400 hover:text-orange-300 truncate transition-colors"
                      title={feed.xmlUrl}
                    >
                      📡 RSS Feed
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}
