import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CatalogPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const CatalogPagination: React.FC<CatalogPaginationProps> = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).slice(0, 5);

  return (
    <div className="flex justify-center py-8">
      <nav className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <ChevronLeft size={18} />
        </button>
        {pages.map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            onClick={() => onPageChange(pageNumber)}
            className={`flex h-10 w-10 items-center justify-center rounded-lg font-medium transition ${
              pageNumber === page
                ? 'bg-primary-900 text-white'
                : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {pageNumber}
          </button>
        ))}
        {totalPages > 5 ? <span className="px-2 text-slate-400">...</span> : null}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <ChevronRight size={18} />
        </button>
      </nav>
    </div>
  );
};

export default CatalogPagination;
