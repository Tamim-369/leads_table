'use client';

import React from 'react';
import { LeadFilters } from '@/lib/types/lead';
import { cn } from '@/lib/utils/cn';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface FilterChipsProps {
  filters: LeadFilters;
  onRemoveFilter: (key: keyof LeadFilters, value?: any) => void;
  onClearAll: () => void;
  className?: string;
}

export default function FilterChips({
  filters,
  onRemoveFilter,
  onClearAll,
  className,
}: FilterChipsProps) {
  const getFilterChips = () => {
    const chips: Array<{
      key: keyof LeadFilters;
      label: string;
      value?: any;
      removable: boolean;
    }> = [];

    // Search filter
    if (filters.search) {
      chips.push({
        key: 'search',
        label: `Search: "${filters.search}"`,
        removable: true,
      });
    }

    // Status filters
    if (filters.status && filters.status.length > 0) {
      filters.status.forEach(status => {
        chips.push({
          key: 'status',
          label: `Status: ${status.replace('_', ' ')}`,
          value: status,
          removable: true,
        });
      });
    }

    // Probability range
    if (filters.probabilityRange) {
      const [min, max] = filters.probabilityRange;
      chips.push({
        key: 'probabilityRange',
        label: `Probability: ${min}% - ${max}%`,
        removable: true,
      });
    }

    // Service types
    if (filters.serviceTypes && filters.serviceTypes.length > 0) {
      filters.serviceTypes.forEach(service => {
        chips.push({
          key: 'serviceTypes',
          label: `Service: ${service}`,
          value: service,
          removable: true,
        });
      });
    }

    // Ad spend intensity
    if (filters.adSpendIntensity && filters.adSpendIntensity.length > 0) {
      filters.adSpendIntensity.forEach(intensity => {
        chips.push({
          key: 'adSpendIntensity',
          label: `Ad Spend: ${intensity}`,
          value: intensity,
          removable: true,
        });
      });
    }

    // Cart abandon risk
    if (filters.cartAbandonRisk && filters.cartAbandonRisk.length > 0) {
      filters.cartAbandonRisk.forEach(risk => {
        chips.push({
          key: 'cartAbandonRisk',
          label: `Cart Risk: ${risk}`,
          value: risk,
          removable: true,
        });
      });
    }

    // Date range
    if (filters.dateRange) {
      const { start, end } = filters.dateRange;
      let dateLabel = 'Date: ';
      
      if (start && end) {
        dateLabel += `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
      } else if (start) {
        dateLabel += `From ${start.toLocaleDateString()}`;
      } else if (end) {
        dateLabel += `Until ${end.toLocaleDateString()}`;
      }

      if (start || end) {
        chips.push({
          key: 'dateRange',
          label: dateLabel,
          removable: true,
        });
      }
    }

    return chips;
  };

  const chips = getFilterChips();

  if (chips.length === 0) {
    return null;
  }

  const handleRemoveFilter = (chip: typeof chips[0]) => {
    if (chip.value !== undefined) {
      // Remove specific value from array filter
      const currentValues = filters[chip.key] as any[];
      if (Array.isArray(currentValues)) {
        const newValues = currentValues.filter(v => v !== chip.value);
        if (newValues.length === 0) {
          onRemoveFilter(chip.key);
        } else {
          onRemoveFilter(chip.key, newValues);
        }
      }
    } else {
      // Remove entire filter
      onRemoveFilter(chip.key);
    }
  };

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {/* Filter Chips */}
      {chips.map((chip, index) => (
        <div
          key={`${chip.key}-${chip.value || index}`}
          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
        >
          <span className="truncate max-w-xs">{chip.label}</span>
          {chip.removable && (
            <button
              onClick={() => handleRemoveFilter(chip)}
              className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-600 hover:bg-blue-200 hover:text-blue-800 transition-colors"
              aria-label={`Remove ${chip.label} filter`}
            >
              <XMarkIcon className="w-3 h-3" />
            </button>
          )}
        </div>
      ))}

      {/* Clear All Button */}
      {chips.length > 1 && (
        <button
          onClick={onClearAll}
          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
        >
          Clear all
          <XMarkIcon className="ml-1 w-3 h-3" />
        </button>
      )}
    </div>
  );
}

// Hook for managing filter chips
export function useFilterChips(
  filters: LeadFilters,
  onFiltersChange: (filters: LeadFilters) => void
) {
  const removeFilter = (key: keyof LeadFilters, newValue?: any) => {
    const newFilters = { ...filters };
    
    if (newValue !== undefined) {
      // Update with new value (for array filters)
      newFilters[key] = newValue;
    } else {
      // Remove entire filter
      delete newFilters[key];
    }
    
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const getActiveFilterCount = () => {
    return Object.keys(filters).filter(key => {
      const value = filters[key as keyof LeadFilters];
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some(v => v !== undefined && v !== null);
      }
      return value !== undefined && value !== null && value !== '';
    }).length;
  };

  return {
    removeFilter,
    clearAllFilters,
    activeFilterCount: getActiveFilterCount(),
  };
}