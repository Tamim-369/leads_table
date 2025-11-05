import { useState, useEffect, useCallback } from 'react';
import { Lead, LeadFilters, SortOptions, LeadsResponse, APIResponse } from '@/lib/types/lead';

interface UseLeadsOptions {
  initialFilters?: LeadFilters;
  initialSort?: SortOptions;
  initialPage?: number;
  initialPageSize?: number;
}

interface UseLeadsReturn {
  leads: Lead[];
  pagination: LeadsResponse['pagination'] | null;
  loading: boolean;
  error: string | null;
  filters: LeadFilters;
  sort: SortOptions | undefined;
  page: number;
  pageSize: number;
  selectedLeads: string[];
  isSelectAll: boolean;

  // Actions
  fetchLeads: () => Promise<void>;
  setFilters: (filters: LeadFilters) => void;
  setSort: (sort: SortOptions | undefined) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  selectLead: (leadId: string) => void;
  selectAllLeads: () => void;
  clearSelection: () => void;
  updateLeadStatus: (leadId: string, status: string) => Promise<void>;
  bulkUpdateStatus: (leadIds: string[], status: string) => Promise<void>;
  bulkDelete: (leadIds: string[]) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useLeads(options: UseLeadsOptions = {}): UseLeadsReturn {
  const {
    initialFilters = {},
    initialSort,
    initialPage = 1,
    initialPageSize = 50,
  } = options;

  // State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [pagination, setPagination] = useState<LeadsResponse['pagination'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<LeadFilters>(initialFilters);
  const [sort, setSortState] = useState<SortOptions | undefined>(initialSort);
  const [page, setPageState] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);

  // Build query parameters
  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams();

    // Add pagination
    params.set('page', page.toString());
    params.set('limit', pageSize.toString());

    // Add filters
    if (filters.search) params.set('search', filters.search);
    if (filters.status?.length) params.set('status', filters.status.join(','));
    if (filters.probabilityRange) {
      params.set('probMin', filters.probabilityRange[0].toString());
      params.set('probMax', filters.probabilityRange[1].toString());
    }
    if (filters.serviceTypes?.length) params.set('serviceTypes', filters.serviceTypes.join(','));
    if (filters.adSpendIntensity?.length) params.set('adSpendIntensity', filters.adSpendIntensity.join(','));
    if (filters.cartAbandonRisk?.length) params.set('cartAbandonRisk', filters.cartAbandonRisk.join(','));
    if (filters.dateRange?.start) params.set('startDate', filters.dateRange.start.toISOString());
    if (filters.dateRange?.end) params.set('endDate', filters.dateRange.end.toISOString());

    // Add sort
    if (sort) {
      params.set('sortField', String(sort.field));
      params.set('sortDirection', sort.direction);
    }

    return params.toString();
  }, [filters, sort, page, pageSize]);

  // Fetch leads
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = buildQueryParams();
      const url = `/api/leads?${queryParams}`;

      const response = await fetch(url);
      const result: APIResponse<LeadsResponse> = await response.json();

      if (result.success && result.data) {
        setLeads(result.data.leads);
        setPagination(result.data.pagination);
      } else {
        setError(result.error?.message || 'Failed to fetch leads');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }, [buildQueryParams]);

  // Update lead status
  const updateLeadStatus = useCallback(async (leadId: string, status: string) => {
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      const result: APIResponse = await response.json();

      if (result.success) {
        // Optimistically update the lead in the local state
        setLeads(prev => prev.map(lead =>
          lead._id === leadId ? { ...lead, status: status as any } : lead
        ));
      } else {
        throw new Error(result.error?.message || 'Failed to update lead status');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update lead status');
      throw err;
    }
  }, []);

  // Bulk update status
  const bulkUpdateStatus = useCallback(async (leadIds: string[], status: string) => {
    try {
      const response = await fetch('/api/leads/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateStatus',
          leadIds,
          newStatus: status,
        }),
      });

      const result: APIResponse = await response.json();

      if (result.success) {
        // Optimistically update leads in local state
        setLeads(prev => prev.map(lead =>
          leadIds.includes(lead._id) ? { ...lead, status: status as any } : lead
        ));
        setSelectedLeads([]);
      } else {
        throw new Error(result.error?.message || 'Failed to bulk update leads');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to bulk update leads');
      throw err;
    }
  }, []);

  // Bulk delete
  const bulkDelete = useCallback(async (leadIds: string[]) => {
    try {
      const response = await fetch('/api/leads/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          leadIds,
        }),
      });

      const result: APIResponse = await response.json();

      if (result.success) {
        // Remove deleted leads from local state
        setLeads(prev => prev.filter(lead => !leadIds.includes(lead._id)));
        setSelectedLeads([]);
      } else {
        throw new Error(result.error?.message || 'Failed to bulk delete leads');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to bulk delete leads');
      throw err;
    }
  }, []);

  // Selection management
  const selectLead = useCallback((leadId: string) => {
    setSelectedLeads(prev =>
      prev.includes(leadId)
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  }, []);

  const selectAllLeads = useCallback(() => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map(lead => lead._id));
    }
  }, [leads, selectedLeads.length]);

  const clearSelection = useCallback(() => {
    setSelectedLeads([]);
  }, []);

  // Wrapper functions for state updates that trigger refetch
  const setFilters = useCallback((newFilters: LeadFilters) => {
    setFiltersState(newFilters);
    setPageState(1); // Reset to first page when filters change
    setSelectedLeads([]); // Clear selection when filters change
  }, []);

  const setSort = useCallback((newSort: SortOptions | undefined) => {
    setSortState(newSort);
    setSelectedLeads([]); // Clear selection when sort changes
  }, []);

  const setPage = useCallback((newPage: number) => {
    setPageState(newPage);
    setSelectedLeads([]); // Clear selection when page changes
  }, []);

  const setPageSize = useCallback((newPageSize: number) => {
    setPageSizeState(newPageSize);
    setPageState(1); // Reset to first page when page size changes
    setSelectedLeads([]); // Clear selection when page size changes
  }, []);

  const refresh = useCallback(async () => {
    await fetchLeads();
    setSelectedLeads([]);
  }, [fetchLeads]);

  // Computed values
  const isSelectAll = selectedLeads.length > 0 && selectedLeads.length === leads.length;

  // Fetch leads when dependencies change
  useEffect(() => {
    fetchLeads();
  }, [filters, sort, page, pageSize]);

  return {
    leads,
    pagination,
    loading,
    error,
    filters,
    sort,
    page,
    pageSize,
    selectedLeads,
    isSelectAll,

    fetchLeads,
    setFilters,
    setSort,
    setPage,
    setPageSize,
    selectLead,
    selectAllLeads,
    clearSelection,
    updateLeadStatus,
    bulkUpdateStatus,
    bulkDelete,
    refresh,
  };
}