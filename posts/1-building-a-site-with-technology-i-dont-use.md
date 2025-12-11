---
title: 'Building a site with technology I dont use'
date: '2024-12-08'
headerImage: '/images/tech.jpg'
summary: 'Building this website as an opportunity to learn new technologies outside my usual stack. Using TailwindCSS, NextJS, and Cloudflare infrastructure, with all blog posts written in Markdown for portability and converted to HTML using Remark.'
---

When building this site I decided I was going to use it as a way to learn and play with technology that I typically wouldn't use within my daily work tech stack.

Based on that below are the different components that make up the website you are viewing.

## TailwindCSS

I typically don't work with frontend technology however I have used [TailwindCSS](https://tailwindcss.com/) in a previous life when I worked with Laravel and PHP. TailwindCSS allows you to get started very quickly without constantly having to go back and forth writing new CSS so you can build something relatively decent quickly.

## NextJS

If there was a language I liked the least it would almost certainly be Javascript. If I had it my way we would go back to the good ol' days JQuery and make the web simpler but we are where we are 🦕

I've worked with VueJS before so I decided to avoid VueJS and React seems to be all the hype nowadays although Svelte looks like a solid contender. I decided I didn't want to spend too much time in the Javascript space and NextJS seems to offer mostly everything I need out of the box so here we are.

## Cloudflare

I really like Cloudflare as a provider and what they stand for. I plan to move more and more of my technology over to Cloudflare where possible. Currently this sites DNS is controlled by Cloudflare and the Terraform that creates the infrastructures state file is stored in a Cloudflare R2 bucket.

## Typescript

When deciding upon a way of blogging I wanted to use something that was framework/platform/language agnostic. I didn't want to be locked into a Vendors modelling of a blog post should I want to migrate in the future. I eventually decided upon writing all my blog posts in Markdown this allows it to be easily ported to a platform should I want to in the future.

I needed a way of converting Markdown to the HTML you are reading/seeing currently to do this I use [Remark](https://github.com/gnab/remark) which transforms markdown into readable HTML.

```ts
const postsDirectory = path.join(process.cwd(), 'posts');

export function getSortedPostsData() {
  const fileNames = fs.readdirSync(postsDirectory);
  type PostData = {
    id: string;
    date: string;
    [key: string]: string;
  };

  const allPostsData: PostData[] = fileNames.map((fileName) => {
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

export function getAllPostIds() {
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames.map((fileName) => {
    return {
      params: {
        id: fileName.replace(/\.md$/, ''),
      },
    };
  });
}

export async function getPostData(id: string) {
  const fullPath = path.join(postsDirectory, `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);

  const processedContent = await remark()
    .use(html)
    .use(prism)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  return {
    id,
    contentHtml,
    ...matterResult.data,
  };
}
```