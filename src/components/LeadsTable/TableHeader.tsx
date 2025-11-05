'use client';

import React from 'react';
import { Lead, SortOptions } from '@/lib/types/lead';
import { cn } from '@/lib/utils/cn';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface ColumnConfig {
  key: keyof Lead;
  label: string;
  sortable: boolean;
  width?: number;
}

interface TableHeaderProps {
  columns: ColumnConfig[];
  sort?: SortOptions;
  isSelectAll: boolean;
  onSort: (field: keyof Lead) => void;
  onSelectAll: () => void;
}

export default function TableHeader({
  columns,
  sort,
  isSelectAll,
  onSort,
  onSelectAll,
}: TableHeaderProps) {
  const renderSortIcon = (field: keyof Lead) => {
    if (sort?.field !== field) return null;
    
    return sort.direction === 'asc' ? (
      <ChevronUpIcon className="w-4 h-4" />
    ) : (
      <ChevronDownIcon className="w-4 h-4" />
    );
  };

  return (
    <thead className="bg-gray-50 sticky top-0 z-10">
      <tr>
        {/* Select All Checkbox */}
        <th className="w-12 px-6 py-3 text-left">
          <input
            type="checkbox"
            checked={isSelectAll}
            onChange={onSelectAll}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            aria-label="Select all leads"
          />
        </th>

        {/* Column Headers */}
        {columns.map((column) => (
          <th
            key={column.key}
            className={cn(
              'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
              column.sortable && 'cursor-pointer hover:bg-gray-100 select-none transition-colors'
            )}
            style={{ width: column.width }}
            onClick={column.sortable ? () => onSort(column.key) : undefined}
            role={column.sortable ? 'button' : undefined}
            tabIndex={column.sortable ? 0 : undefined}
            onKeyDown={
              column.sortable
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSort(column.key);
                    }
                  }
                : undefined
            }
          >
            <div className="flex items-center space-x-1">
              <span>{column.label}</span>
              {column.sortable && (
                <div className="flex-shrink-0">
                  {renderSortIcon(column.key)}
                </div>
              )}
            </div>
          </th>
        ))}

        {/* Actions Column */}
        <th className="w-20 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Actions
        </th>
      </tr>
    </thead>
  );
}