import { parseISO, format } from 'date-fns';

export default function Date({ dateString }: { dateString: string }) {
  const date = parseISO(dateString);
  return <time className='text-[var(--text-muted)]' dateTime={dateString}>{format(date, 'LLLL d, yyyy')}</time>;
}
