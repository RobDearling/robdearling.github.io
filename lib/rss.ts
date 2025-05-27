import RSS from 'rss';
import { getSortedPostsData } from './posts';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

function extractDescription(content: string): string {
  // Remove markdown headers and links, then take first paragraph
  const cleanContent = content
    .replace(/^#.*$/gm, '') // Remove headers
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
    .replace(/`([^`]+)`/g, '$1') // Remove code backticks
    .replace(/\n\s*\n/g, '\n') // Remove empty lines
    .trim();
  
  const firstParagraph = cleanContent.split('\n')[0] || '';
  return firstParagraph.length > 160 
    ? firstParagraph.substring(0, 157) + '...'
    : firstParagraph;
}

export function generateRSSFeed() {
  const posts = getSortedPostsData();
  const siteURL = 'https://robdearling.github.io'; // Update this to your actual domain
  
  const feed = new RSS({
    title: 'Rob Dearling\'s Blog',
    description: 'A blog about technology, development, and other interesting topics',
    feed_url: `${siteURL}/rss.xml`,
    site_url: siteURL,
    image_url: `${siteURL}/favicon.ico`,
    managingEditor: 'Rob Dearling',
    webMaster: 'Rob Dearling',
    copyright: `Copyright ${new Date().getFullYear()}, Rob Dearling`,
    language: 'en-US',
    categories: ['Technology', 'Development', 'Programming'],
    pubDate: new Date().toISOString(),
    ttl: 1440, // 24 hours
  });

  posts.forEach((post) => {
    // Get the full post content to extract description
    const postsDirectory = path.join(process.cwd(), 'posts');
    const fullPath = path.join(postsDirectory, `${post.id}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);
    
    const description = post.description || extractDescription(matterResult.content);
    
    feed.item({
      title: post.title,
      description: description,
      url: `${siteURL}/posts/${post.id}`,
      guid: `${siteURL}/posts/${post.id}`,
      date: post.date,
      author: 'Rob Dearling',
    });
  });

  return feed.xml({ indent: true });
}
