'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
  disabled?: boolean;
  showClearButton?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search leads by name, service, contact...',
  debounceMs = 300,
  className,
  disabled = false,
  showClearButton = true,
  onFocus,
  onBlur,
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search effect
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (localValue !== value) {
      setIsSearching(true);
      debounceRef.current = setTimeout(() => {
        onChange(localValue);
        setIsSearching(false);
      }, debounceMs);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [localValue, onChange, debounceMs, value]);

  // Update local value when external value changes
  useEffect(() => {
    if (value !== localValue) {
      setLocalValue(value);
    }
  }, [value, localValue]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  }, []);

  const handleClear = useCallback(() => {
    setLocalValue('');
    onChange('');
    inputRef.current?.focus();
  }, [onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  }, [handleClear]);

  const handleFocus = useCallback(() => {
    onFocus?.();
  }, [onFocus]);

  const handleBlur = useCallback(() => {
    onBlur?.();
  }, [onBlur]);

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon 
            className={cn(
              'h-4 w-4 transition-colors',
              isSearching ? 'text-primary animate-pulse' : 'text-muted-foreground'
            )} 
          />
        </div>

        {/* Input Field */}
        <Input
          ref={inputRef}
          type="text"
          value={localValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            'pl-10 pr-10',
            disabled && 'cursor-not-allowed'
          )}
        />

        {/* Clear Button */}
        {showClearButton && localValue && !disabled && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              type="button"
              aria-label="Clear search"
            >
              <XMarkIcon className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Loading Indicator */}
        {isSearching && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
          </div>
        )}
      </div>

      {/* Search Suggestions/Results Count (Optional) */}
      {localValue && !isSearching && (
        <div className="absolute top-full left-0 right-0 mt-1 text-xs text-muted-foreground px-3">
          Searching for "{localValue}"
        </div>
      )}
    </div>
  );
}

// Hook for managing search state
export function useSearch(initialValue = '', debounceMs = 300) {
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const [debouncedQuery, setDebouncedQuery] = useState(initialValue);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setIsSearching(false);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchQuery, debounceMs]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  return {
    searchQuery,
    debouncedQuery,
    isSearching,
    setSearchQuery,
    clearSearch,
  };
}

// Advanced search component with filters
interface AdvancedSearchBarProps extends Omit<SearchBarProps, 'value' | 'onChange'> {
  onSearch: (query: string, filters?: Record<string, any>) => void;
  filters?: Record<string, any>;
  showFilters?: boolean;
}

export function AdvancedSearchBar({
  onSearch,
  filters = {},
  showFilters = false,
  ...props
}: AdvancedSearchBarProps) {
  const { searchQuery, debouncedQuery, setSearchQuery } = useSearch('', props.debounceMs);

  useEffect(() => {
    onSearch(debouncedQuery, filters);
  }, [debouncedQuery, filters, onSearch]);

  return (
    <div className="space-y-4">
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        {...props}
      />
      
      {showFilters && (
        <div className="text-sm text-gray-600">
          {/* Filter chips or advanced filter UI can be added here */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => (
              <span
                key={key}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {key}: {String(value)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}