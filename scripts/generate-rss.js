const fs = require('fs');
const path = require('path');
const RSS = require('rss');
const matter = require('gray-matter');

const postsDirectory = path.join(process.cwd(), 'posts');

function getSortedPostsData() {
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames.map((fileName) => {
    const id = fileName.replace(/\.md$/, '');
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    const matterResult = matter(fileContents);
    return {
      id,
      date: matterResult.data.date,
      ...matterResult.data,
    };
  });
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

function extractDescription(content) {
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

function generateRSSFeed() {
  const posts = getSortedPostsData();
  const siteURL = 'https://wreckitrob.dev';
  
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

function generateStaticRSS() {
  const rss = generateRSSFeed();
  const publicDir = path.join(process.cwd(), 'public');
  
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(publicDir, 'rss.xml'), rss);
  console.log('RSS feed generated successfully at public/rss.xml');
}

generateStaticRSS();
