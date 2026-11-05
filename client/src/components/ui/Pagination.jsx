import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button.jsx';
import { cn } from '../../lib/utils.js';

export function Pagination({ page, pageSize, total, onChange }) {
  const pageCount = Math.ceil(total / pageSize);
  if (pageCount <= 1) return null;
  return (
    <div className="flex items-center justify-between gap-2">
      <Button
        variant="ghost"
        size="sm"
        disabled={page === 1}
        onClick={() => onChange(Math.max(1, page - 1))}
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Prev
      </Button>
      <span className="text-xs text-slate-500 dark:text-slate-400">
        Page {page} of {pageCount} &middot; {total} items
      </span>
      <Button
        variant="ghost"
        size="sm"
        disabled={page === pageCount}
        onClick={() => onChange(Math.min(pageCount, page + 1))}
      >
        Next <ChevronRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}
