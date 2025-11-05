'use client';

import React from 'react';
import { Pagination as PaginationType } from '@/lib/types/lead';
import { cn } from '@/lib/utils';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from '@heroicons/react/24/outline';

interface PaginationProps {
  pagination: PaginationType;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  className?: string;
  showPageSizeSelector?: boolean;
  pageSizeOptions?: number[];
}

export default function Pagination({
  pagination,
  onPageChange,
  onPageSizeChange,
  className,
  showPageSizeSelector = true,
  pageSizeOptions = [10, 25, 50, 100],
}: PaginationProps) {
  const { page, limit, total, totalPages, hasNextPage, hasPrevPage } = pagination;

  // Generate page numbers to show
  const getPageNumbers = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, page - delta);
      i <= Math.min(totalPages - 1, page + delta);
      i++
    ) {
      range.push(i);
    }

    if (page - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (page + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const pageNumbers = getPageNumbers();

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      onPageChange(newPage);
    }
  };

  // Always show pagination if there are results
  if (total === 0) {
    return null;
  }

  return (
    <div className={cn('flex items-center justify-between p-4 bg-card border border-border rounded-lg', className)}>
      {/* Results Info */}
      <div className="flex items-center text-sm text-muted-foreground">
        <span>
          Showing {((page - 1) * limit) + 1} to{' '}
          {Math.min(page * limit, total)} of {total} results
        </span>
        
        {/* Page Size Selector */}
        {showPageSizeSelector && (
          <div className="ml-6 flex items-center">
            <label htmlFor="pageSize" className="mr-2 text-sm text-muted-foreground">
              Show:
            </label>
            <select
              id="pageSize"
              value={limit}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="border border-border rounded-md px-2 py-1 text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center space-x-2">
        {/* First Page */}
        <button
          onClick={() => handlePageChange(1)}
          disabled={!hasPrevPage}
          className={cn(
            'px-3 py-2 border rounded-md text-sm font-medium transition-colors',
            !hasPrevPage
              ? 'text-muted-foreground cursor-not-allowed border-border bg-muted/50'
              : 'text-foreground hover:bg-muted border-border bg-card'
          )}
          aria-label="First page"
        >
          <ChevronDoubleLeftIcon className="w-4 h-4" />
        </button>

        {/* Previous Page */}
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={!hasPrevPage}
          className={cn(
            'px-3 py-2 border rounded-md text-sm font-medium transition-colors',
            !hasPrevPage
              ? 'text-muted-foreground cursor-not-allowed border-border bg-muted/50'
              : 'text-foreground hover:bg-muted border-border bg-card'
          )}
          aria-label="Previous page"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </button>

        {/* Page Numbers */}
        {pageNumbers.map((pageNum, index) => (
          <React.Fragment key={index}>
            {pageNum === '...' ? (
              <span className="px-3 py-2 text-sm text-muted-foreground">...</span>
            ) : (
              <button
                onClick={() => handlePageChange(pageNum as number)}
                className={cn(
                  'px-3 py-2 border rounded-md text-sm font-medium transition-colors min-w-[40px]',
                  pageNum === page
                    ? 'bg-foreground text-background border-foreground'
                    : 'text-foreground hover:bg-muted border-border bg-card'
                )}
              >
                {pageNum}
              </button>
            )}
          </React.Fragment>
        ))}

        {/* Next Page */}
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={!hasNextPage}
          className={cn(
            'px-3 py-2 border rounded-md text-sm font-medium transition-colors',
            !hasNextPage
              ? 'text-muted-foreground cursor-not-allowed border-border bg-muted/50'
              : 'text-foreground hover:bg-muted border-border bg-card'
          )}
          aria-label="Next page"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </button>

        {/* Last Page */}
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={!hasNextPage}
          className={cn(
            'px-3 py-2 border rounded-md text-sm font-medium transition-colors',
            !hasNextPage
              ? 'text-muted-foreground cursor-not-allowed border-border bg-muted/50'
              : 'text-foreground hover:bg-muted border-border bg-card'
          )}
          aria-label="Last page"
        >
          <ChevronDoubleRightIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Compact pagination for mobile
interface CompactPaginationProps {
  pagination: PaginationType;
  onPageChange: (page: number) => void;
  className?: string;
}

export function CompactPagination({
  pagination,
  onPageChange,
  className,
}: CompactPaginationProps) {
  const { page, total, totalPages, hasNextPage, hasPrevPage } = pagination;

  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div className="text-sm text-gray-700">
        Page {page} of {totalPages}
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrevPage}
          className={cn(
            'px-3 py-1 border border-gray-300 rounded-md text-sm transition-colors',
            !hasPrevPage
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-50'
          )}
        >
          Previous
        </button>
        
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage}
          className={cn(
            'px-3 py-1 border border-gray-300 rounded-md text-sm transition-colors',
            !hasNextPage
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-50'
          )}
        >
          Next
        </button>
      </div>
    </div>
  );
}