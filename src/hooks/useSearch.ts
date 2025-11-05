import React, { useState, useEffect, useCallback, useMemo } from 'react';

interface UseSearchOptions {
  debounceMs?: number;
  minLength?: number;
  caseSensitive?: boolean;
}

interface UseSearchReturn {
  query: string;
  debouncedQuery: string;
  isSearching: boolean;
  setQuery: (query: string) => void;
  clearQuery: () => void;
  highlightText: (text: string, className?: string) => React.ReactNode;
}

export function useSearch(
  initialQuery = '',
  options: UseSearchOptions = {}
): UseSearchReturn {
  const {
    debounceMs = 300,
    minLength = 1,
    caseSensitive = false,
  } = options;

  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce the search query
  useEffect(() => {
    if (query.length < minLength && query.length > 0) {
      setDebouncedQuery('');
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setIsSearching(false);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs, minLength]);

  const clearQuery = useCallback(() => {
    setQuery('');
  }, []);

  // Function to highlight search terms in text
  const highlightText = useCallback(
    (text: string, className = 'bg-yellow-200 font-medium'): React.ReactNode => {
      if (!debouncedQuery || !text) return text;

      const searchTerms = debouncedQuery
        .split(' ')
        .filter(term => term.length > 0)
        .map(term => term.trim());

      if (searchTerms.length === 0) return text;

      // Create regex pattern for all search terms
      const pattern = searchTerms
        .map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('|');
      
      const regex = new RegExp(`(${pattern})`, caseSensitive ? 'g' : 'gi');
      
      const parts = text.split(regex);
      
      return parts.map((part, index) => {
        const isMatch = searchTerms.some(term => 
          caseSensitive 
            ? part === term 
            : part.toLowerCase() === term.toLowerCase()
        );
        
        if (isMatch) {
          return React.createElement('span', {
            key: index,
            className: className
          }, part);
        }
        return part;
      });
    },
    [debouncedQuery, caseSensitive]
  );

  return {
    query,
    debouncedQuery,
    isSearching,
    setQuery,
    clearQuery,
    highlightText,
  };
}

// Hook for search with results
interface UseSearchWithResultsOptions<T> extends UseSearchOptions {
  searchFields: (keyof T)[];
  data: T[];
}

interface UseSearchWithResultsReturn<T> extends UseSearchReturn {
  results: T[];
  resultCount: number;
  hasResults: boolean;
}

export function useSearchWithResults<T extends Record<string, any>>(
  initialQuery = '',
  options: UseSearchWithResultsOptions<T>
): UseSearchWithResultsReturn<T> {
  const { searchFields, data, ...searchOptions } = options;
  
  const searchHook = useSearch(initialQuery, searchOptions);
  const { debouncedQuery } = searchHook;

  // Filter results based on search query
  const results = useMemo(() => {
    if (!debouncedQuery || debouncedQuery.length === 0) {
      return data;
    }

    const searchTerms = debouncedQuery
      .toLowerCase()
      .split(' ')
      .filter(term => term.length > 0);

    return data.filter(item => {
      return searchTerms.every(term =>
        searchFields.some(field => {
          const fieldValue = item[field];
          if (fieldValue == null) return false;
          
          return String(fieldValue)
            .toLowerCase()
            .includes(term);
        })
      );
    });
  }, [data, debouncedQuery, searchFields]);

  return {
    ...searchHook,
    results,
    resultCount: results.length,
    hasResults: results.length > 0,
  };
}

// Hook for search history
interface UseSearchHistoryOptions {
  maxHistory?: number;
  storageKey?: string;
}

interface UseSearchHistoryReturn {
  history: string[];
  addToHistory: (query: string) => void;
  removeFromHistory: (query: string) => void;
  clearHistory: () => void;
}

export function useSearchHistory(
  options: UseSearchHistoryOptions = {}
): UseSearchHistoryReturn {
  const { maxHistory = 10, storageKey = 'search-history' } = options;
  
  const [history, setHistory] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Save to localStorage whenever history changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(storageKey, JSON.stringify(history));
    } catch {
      // Ignore localStorage errors
    }
  }, [history, storageKey]);

  const addToHistory = useCallback((query: string) => {
    if (!query.trim()) return;
    
    setHistory(prev => {
      const filtered = prev.filter(item => item !== query);
      const newHistory = [query, ...filtered];
      return newHistory.slice(0, maxHistory);
    });
  }, [maxHistory]);

  const removeFromHistory = useCallback((query: string) => {
    setHistory(prev => prev.filter(item => item !== query));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
  };
}

// Utility function for search term highlighting
export function highlightSearchTerms(
  text: string,
  searchQuery: string,
  className = 'bg-yellow-200 font-medium'
): React.ReactNode {
  if (!searchQuery || !text) return text;

  const searchTerms = searchQuery
    .split(' ')
    .filter(term => term.length > 0)
    .map(term => term.trim());

  if (searchTerms.length === 0) return text;

  const pattern = searchTerms
    .map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  
  const regex = new RegExp(`(${pattern})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, index) => {
    const isMatch = searchTerms.some(term => 
      part.toLowerCase() === term.toLowerCase()
    );
    
    if (isMatch) {
      return React.createElement('span', {
        key: index,
        className: className
      }, part);
    }
    return part;
  });
}