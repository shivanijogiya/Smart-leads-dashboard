import { SearchX } from 'lucide-react';

export const EmptyState = () => (
  <div className="grid min-h-64 place-items-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
    <div>
      <SearchX className="mx-auto mb-3 h-10 w-10 text-slate-400" />
      <h3 className="text-base font-semibold text-slate-900 dark:text-white">No leads found</h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Adjust the search or filters, or create a fresh lead.
      </p>
    </div>
  </div>
);
