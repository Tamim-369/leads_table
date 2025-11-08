'use client';

import { useState, useEffect, useCallback } from 'react';
import LeadsTable from '@/components/LeadsTable/LeadsTable';
import SearchBar from '@/components/Search/SearchBar';
import FilterSidebar from '@/components/Filters/FilterSidebar';
import { FilterToggle } from '@/components/Filters/FilterPanel';
import FilterChips, { useFilterChips } from '@/components/Filters/FilterChips';
import MetricsCards, { MetricsSummary } from '@/components/Analytics/MetricsCards';
import Charts from '@/components/Analytics/Charts';
import Pagination from '@/components/UI/Pagination';
import { useLeads } from '@/hooks/useLeads';

import { useAnalytics } from '@/hooks/useAnalytics';
import { cn } from '@/lib/utils';
import {
  ChartBarIcon,
  TableCellsIcon,
} from '@heroicons/react/24/outline';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'table' | 'analytics'>('table');
  const [showFilters, setShowFilters] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize leads hook
  const leadsHook = useLeads();
  const {
    leads,
    loading: leadsLoading,
    error: leadsError,
    filters,
    setFilters,
    pagination,
  } = leadsHook;



  // Initialize analytics hook
  const { analyticsData, loading: analyticsLoading, error: analyticsError } = useAnalytics();

  // Search is handled internally by SearchBar component

  // Initialize filter chips hook
  const { removeFilter, clearAllFilters, activeFilterCount } = useFilterChips(filters, setFilters);

  // Handle search changes (only when search button is clicked or Enter is pressed)
  const handleSearchChange = useCallback((query: string) => {
    if (query.trim() === '') {
      // Remove search from filters if empty
      const newFilters = { ...filters };
      delete newFilters.search;
      setFilters(newFilters);
    } else {
      setFilters({ ...filters, search: query });
    }
  }, [filters, setFilters]);

  // Get analytics data with fallbacks
  const metrics = analyticsData?.metrics || {
    totalLeads: 0,
    newLeads: 0,
    contactedLeads: 0,
    qualifiedLeads: 0,
    closedWonLeads: 0,
    closedLostLeads: 0,
    clientLeads: 0,
    averageProbability: 0,
    totalRevenuePotential: 0,
    conversionRate: 0,
  };

  const statusDistribution = analyticsData?.statusDistribution || [];
  const serviceTypeDistribution = analyticsData?.serviceTypeDistribution || [];
  const probabilityDistribution = analyticsData?.probabilityDistribution || [];
  const monthlyTrends = analyticsData?.monthlyTrends || [];
  const leadSourceDistribution = analyticsData?.leadSourceDistribution || [];

  // Get unique service types for filters
  const serviceTypes = Array.from(new Set(leads.map(lead => lead.service)));

  // Show loading until client-side hydration is complete
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background custom-scrollbar">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                    <TableCellsIcon className="w-6 h-6 text-black" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Leads Management
                  </h1>
                  <p className="text-sm text-muted-foreground">Manage and track your sales leads</p>
                </div>
              </div>
              <div className="ml-12 hidden lg:block">
                <MetricsSummary metrics={metrics} loading={analyticsLoading} />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Tab Navigation */}
              <div className="flex bg-muted rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('table')}
                  className={cn(
                    'flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors',
                    activeTab === 'table'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <TableCellsIcon className="w-4 h-4 mr-2" />
                  Table
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={cn(
                    'flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors',
                    activeTab === 'analytics'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <ChartBarIcon className="w-4 h-4 mr-2" />
                  Analytics
                </button>
              </div>


            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'table' && (
          <div className="space-y-8">
            {/* Mobile Metrics Summary */}
            <div className="lg:hidden">
              <div className="bg-card border border-border rounded-lg p-4">
                <MetricsSummary metrics={metrics} loading={analyticsLoading} />
              </div>
            </div>

            {/* Search and Filters */}
            <div className="glass rounded-xl overflow-hidden hover-lift">
              <div className="p-6 border-b border-white/10">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex-1 max-w-2xl">
                    <div className="relative">
                      <SearchBar
                        onSearch={handleSearchChange}
                        placeholder="Type to search leads, then click Search or press Enter..."
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <FilterToggle
                      activeFilterCount={activeFilterCount}
                      onClick={() => setShowFilters(!showFilters)}
                    />

                    <button
                      onClick={() => leadsHook.refresh()}
                      className=" cursor-pointer inline-flex items-center px-4 py-2.5 bg-muted/20 hover:bg-muted border border-muted/30 hover:border-muted/50 text-sm font-medium rounded-lg text-white transition-all duration-200 backdrop-blur-sm "
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Filters */}
              {activeFilterCount > 0 && (
                <div className="p-6 bg-muted/5">
                  <FilterChips
                    filters={filters}
                    onRemoveFilter={removeFilter}
                    onClearAll={clearAllFilters}
                  />
                </div>
              )}
            </div>

            {/* Filter Sidebar */}
            <FilterSidebar
              filters={filters}
              onFiltersChange={setFilters}
              serviceTypes={serviceTypes}
              isOpen={showFilters}
              onClose={() => setShowFilters(false)}
            />



            {/* Error State */}
            {(leadsError || analyticsError) && (
              <div className="bg-card border border-red-500 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-red-400">Error loading data</h3>
                    <div className="mt-1 text-sm text-red-300/80">
                      {leadsError && <div>Leads: {leadsError}</div>}
                      {analyticsError && <div>Analytics: {analyticsError}</div>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Leads Table */}
            <div className="glass rounded-xl overflow-hidden hover-lift">
              <LeadsTable
                leads={leads}
                loading={leadsLoading}
                error={leadsError}
                sort={leadsHook.sort}
                selectedLeads={leadsHook.selectedLeads}
                isSelectAll={leadsHook.isSelectAll}
                selectLead={leadsHook.selectLead}
                selectAllLeads={leadsHook.selectAllLeads}
                clearSelection={leadsHook.clearSelection}
                setSort={leadsHook.setSort}
                updateLeadStatus={leadsHook.updateLeadStatus}
                bulkUpdateStatus={leadsHook.bulkUpdateStatus}
                bulkDelete={leadsHook.bulkDelete}
              />
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="glass rounded-xl px-8 py-6">
                <Pagination
                  pagination={pagination}
                  onPageChange={leadsHook.setPage}
                  onPageSizeChange={leadsHook.setPageSize}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h2>
              <p className="text-muted-foreground">Comprehensive insights into your leads performance</p>
            </div>
            <MetricsCards metrics={metrics} loading={analyticsLoading} />
            <Charts
              statusDistribution={statusDistribution}
              serviceTypeDistribution={serviceTypeDistribution}
              probabilityDistribution={probabilityDistribution}
              monthlyTrends={monthlyTrends}
              leadSourceDistribution={leadSourceDistribution}
              loading={analyticsLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
}