import { NextApiRequest, NextApiResponse } from 'next';
import { generateRSSFeed } from '../../lib/rss';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const rss = generateRSSFeed();
    
    res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=1200, stale-while-revalidate=600');
    res.status(200).send(rss);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
