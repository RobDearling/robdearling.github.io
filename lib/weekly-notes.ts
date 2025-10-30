import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import remarkPrism from 'remark-prism';
import remarkGfm from 'remark-gfm';

const weeklyNotesDirectory = path.join(process.cwd(), 'weekly-notes');

export function getSortedWeeklyNotesData() {
  const fileNames = fs.readdirSync(weeklyNotesDirectory);
  type WeeklyNoteData = {
    id: string;
    date: string;
    [key: string]: string;
  };

  const allWeeklyNotesData: WeeklyNoteData[] = fileNames.map((fileName) => {
    const id = fileName.replace(/\.md$/, '');
    const fullPath = path.join(weeklyNotesDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    const matterResult = matter(fileContents);
    return {
      id,
      date: matterResult.data.date,
      ...matterResult.data,
    };
  });
  return allWeeklyNotesData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getAllWeeklyNoteIds() {
  const fileNames = fs.readdirSync(weeklyNotesDirectory);
  return fileNames.map((fileName) => {
    return {
      params: {
        id: fileName.replace(/\.md$/, ''),
      },
    };
  });
}

export async function getWeeklyNoteData(id: string) {
  const fullPath = path.join(weeklyNotesDirectory, `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);

  const processedContent = await remark()
    .use(remarkGfm)
    .use(html)
    .use(remarkPrism as any)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  return {
    id,
    contentHtml,
    ...matterResult.data,
  };
}
