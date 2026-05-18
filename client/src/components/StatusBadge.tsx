import type { LeadStatus } from '@/types';

const classes: Record<LeadStatus, string> = {
  New: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-200',
  Contacted: 'bg-gold/15 text-yellow-800 dark:bg-yellow-400/15 dark:text-yellow-100',
  Qualified: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-100',
  Lost: 'bg-rose-100 text-rose-700 dark:bg-rose-400/15 dark:text-rose-100',
};

export const StatusBadge = ({ status }: { status: LeadStatus }) => (
  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${classes[status]}`}>
    {status}
  </span>
);
