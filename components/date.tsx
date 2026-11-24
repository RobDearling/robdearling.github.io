import { parseISO, format } from 'date-fns';

interface DateProps {
  dateString: string;
  className?: string;
  compact?: boolean;
}

export default function Date({ dateString, className, compact = false }: DateProps) {
  const date = parseISO(dateString);
  return <time className={className} dateTime={dateString}>{format(date, compact ? 'dd MMM yyyy' : 'd MMMM yyyy')}</time>;
}
