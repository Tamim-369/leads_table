'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  onSearch: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  showClearButton?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

export default function SearchBar({
  onSearch,
  placeholder = 'Search leads by name, service, contact...',
  className,
  disabled = false,
  showClearButton = true,
  onFocus,
  onBlur,
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  }, []);

  const handleSearch = useCallback(() => {
    setIsSearching(true);
    onSearch(localValue);
    setTimeout(() => setIsSearching(false), 1000);
  }, [localValue, onSearch]);

  const handleClear = useCallback(() => {
    setLocalValue('');
    onSearch('');
    inputRef.current?.focus();
  }, [onSearch]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    } else if (e.key === 'Escape') {
      handleClear();
    }
  }, [handleSearch, handleClear]);

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
            'pl-10 pr-24',
            disabled && 'cursor-not-allowed'
          )}
        />

        {/* Search and Clear Buttons */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 space-x-1">
          {/* Clear Button */}
          {showClearButton && localValue && !disabled && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
              type="button"
              aria-label="Clear search"
            >
              <XMarkIcon className="h-3 w-3" />
            </Button>
          )}

          {/* Search Button */}
          <Button
            onClick={handleSearch}
            disabled={disabled || isSearching || !localValue.trim()}
            size="sm"
            className="h-7 px-3 text-xs"
            type="button"
          >
            {isSearching ? (
              <div className="animate-spin rounded-full h-3 w-3 border-2 border-current border-t-transparent" />
            ) : (
              'Search'
            )}
          </Button>
        </div>
      </div>


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
interface AdvancedSearchBarProps extends Omit<SearchBarProps, 'onSearch'> {
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
  const handleSearch = useCallback((query: string) => {
    onSearch(query, filters);
  }, [onSearch, filters]);

  return (
    <div className="space-y-4">
      <SearchBar
        onSearch={handleSearch}
        {...props}
      />
      
      {showFilters && (
        <div className="text-sm text-muted-foreground">
          {/* Filter chips or advanced filter UI can be added here */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => (
              <span
                key={key}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
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