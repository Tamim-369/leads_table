'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { LeadFilters } from '@/lib/types/lead';
import { LeadStatus, AdSpendIntensity, RiskLevel } from '@/lib/models/Lead';
import { cn } from '@/lib/utils';
import {
  XMarkIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';

interface FilterSidebarProps {
  filters: LeadFilters;
  onFiltersChange: (filters: LeadFilters) => void;
  serviceTypes?: string[];
  isOpen: boolean;
  onClose: () => void;
}

export default function FilterSidebar({
  filters,
  onFiltersChange,
  serviceTypes = [],
  isOpen,
  onClose,
}: FilterSidebarProps) {
  const [localFilters, setLocalFilters] = useState<LeadFilters>(filters);

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const updateFilter = useCallback((key: keyof LeadFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  }, [localFilters, onFiltersChange]);

  const clearFilter = useCallback((key: keyof LeadFilters) => {
    const newFilters = { ...localFilters };
    delete newFilters[key];
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  }, [localFilters, onFiltersChange]);

  const clearAllFilters = useCallback(() => {
    setLocalFilters({});
    onFiltersChange({});
  }, [onFiltersChange]);

  const getActiveFilterCount = useCallback(() => {
    return Object.keys(localFilters).filter(key => {
      const value = localFilters[key as keyof LeadFilters];
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some(v => v !== undefined && v !== null);
      }
      return value !== undefined && value !== null && value !== '';
    }).length;
  }, [localFilters]);

  const activeFilterCount = getActiveFilterCount();

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-96 bg-gray-900/95 backdrop-blur-xl border-l border-white/10 z-50 transform transition-transform duration-300 ease-in-out flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <AdjustmentsHorizontalIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Filters</h2>
              <p className="text-sm text-muted-foreground">
                {activeFilterCount > 0 ? `${activeFilterCount} active filters` : 'No active filters'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="px-3 py-1.5 text-sm text-muted-foreground hover:text-white bg-muted/20 hover:bg-muted/40 rounded-lg transition-all duration-200"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-white hover:bg-muted/20 rounded-lg transition-all duration-200"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          {/* Scroll indicator gradient at top */}
          <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-gray-900/95 to-transparent pointer-events-none z-10"></div>
          
          {/* Scroll indicator gradient at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-gray-900/95 to-transparent pointer-events-none z-10"></div>
          
          <div className="p-6 space-y-8 pb-12">
          {/* Status Filter */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                Lead Status
              </h3>
              {(localFilters.status?.length ?? 0) > 0 && (
                <button
                  onClick={() => clearFilter('status')}
                  className="text-xs text-muted-foreground hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="space-y-2">
              {Object.values(LeadStatus).map((status) => {
                const isSelected = localFilters.status?.includes(status) || false;
                return (
                  <label key={status} className={cn(
                    "flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 border",
                    isSelected 
                      ? "bg-primary/20 border-primary/40 text-white" 
                      : "bg-muted/10 border-muted/20 hover:bg-muted/20 hover:border-muted/40 text-muted-foreground hover:text-white"
                  )}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        const currentStatuses = localFilters.status || [];
                        if (e.target.checked) {
                          updateFilter('status', [...currentStatuses, status]);
                        } else {
                          updateFilter('status', currentStatuses.filter(s => s !== status));
                        }
                      }}
                      className="sr-only"
                    />
                    <div className={cn(
                      "w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200",
                      isSelected ? "bg-primary border-primary" : "border-muted-foreground"
                    )}>
                      {isSelected && (
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className="ml-3 text-sm font-medium capitalize">
                      {status.replace('_', ' ')}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Probability Range */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                Probability Range
              </h3>
              {(localFilters.probabilityRange?.[0] !== 0 || localFilters.probabilityRange?.[1] !== 100) && (
                <button
                  onClick={() => clearFilter('probabilityRange')}
                  className="text-xs text-muted-foreground hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
            
            <div className="bg-muted/10 rounded-lg p-4 border border-muted/20">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">Range:</span>
                <span className="text-sm font-medium text-white">
                  {localFilters.probabilityRange?.[0] || 0}% - {localFilters.probabilityRange?.[1] || 100}%
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs text-muted-foreground mb-2">Min %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={localFilters.probabilityRange?.[0] || 0}
                    onChange={(e) => {
                      const min = parseInt(e.target.value) || 0;
                      const max = localFilters.probabilityRange?.[1] || 100;
                      updateFilter('probabilityRange', [min, max]);
                    }}
                    className="w-full px-3 py-2 bg-muted/20 border border-muted/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-2">Max %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={localFilters.probabilityRange?.[1] || 100}
                    onChange={(e) => {
                      const max = parseInt(e.target.value) || 100;
                      const min = localFilters.probabilityRange?.[0] || 0;
                      updateFilter('probabilityRange', [min, max]);
                    }}
                    className="w-full px-3 py-2 bg-muted/20 border border-muted/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Ad Spend Intensity */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center">
                <div className="w-2 h-2 bg-orange-400 rounded-full mr-2"></div>
                Ad Spend Intensity
              </h3>
              {(localFilters.adSpendIntensity?.length ?? 0) > 0 && (
                <button
                  onClick={() => clearFilter('adSpendIntensity')}
                  className="text-xs text-muted-foreground hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.values(AdSpendIntensity).map((intensity) => {
                const isSelected = localFilters.adSpendIntensity?.includes(intensity) || false;
                return (
                  <button
                    key={intensity}
                    onClick={() => {
                      const currentIntensities = localFilters.adSpendIntensity || [];
                      if (isSelected) {
                        updateFilter('adSpendIntensity', currentIntensities.filter(i => i !== intensity));
                      } else {
                        updateFilter('adSpendIntensity', [...currentIntensities, intensity]);
                      }
                    }}
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border",
                      isSelected 
                        ? "bg-orange-500/20 border-orange-500/40 text-orange-300" 
                        : "bg-muted/10 border-muted/20 hover:bg-muted/20 hover:border-muted/40 text-muted-foreground hover:text-white"
                    )}
                  >
                    {intensity}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cart Abandon Risk */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center">
                <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
                Cart Abandon Risk
              </h3>
              {(localFilters.cartAbandonRisk?.length ?? 0) > 0 && (
                <button
                  onClick={() => clearFilter('cartAbandonRisk')}
                  className="text-xs text-muted-foreground hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.values(RiskLevel).map((risk) => {
                const isSelected = localFilters.cartAbandonRisk?.includes(risk) || false;
                const riskColors = {
                  'Low': 'bg-green-500/20 border-green-500/40 text-green-300',
                  'Medium': 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300',
                  'High': 'bg-red-500/20 border-red-500/40 text-red-300'
                };
                return (
                  <button
                    key={risk}
                    onClick={() => {
                      const currentRisks = localFilters.cartAbandonRisk || [];
                      if (isSelected) {
                        updateFilter('cartAbandonRisk', currentRisks.filter(r => r !== risk));
                      } else {
                        updateFilter('cartAbandonRisk', [...currentRisks, risk]);
                      }
                    }}
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border",
                      isSelected 
                        ? riskColors[risk as keyof typeof riskColors]
                        : "bg-muted/10 border-muted/20 hover:bg-muted/20 hover:border-muted/40 text-muted-foreground hover:text-white"
                    )}
                  >
                    {risk}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center">
                <div className="w-2 h-2 bg-cyan-400 rounded-full mr-2"></div>
                Date Range
              </h3>
              {(localFilters.dateRange?.start || localFilters.dateRange?.end) && (
                <button
                  onClick={() => clearFilter('dateRange')}
                  className="text-xs text-muted-foreground hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="bg-muted/10 rounded-lg p-4 border border-muted/20 space-y-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-2">From Date</label>
                <input
                  type="date"
                  value={localFilters.dateRange?.start?.toISOString().split('T')[0] || ''}
                  onChange={(e) => {
                    const startDate = e.target.value ? new Date(e.target.value) : undefined;
                    updateFilter('dateRange', {
                      ...localFilters.dateRange,
                      start: startDate,
                    });
                  }}
                  className="w-full px-3 py-2 bg-muted/20 border border-muted/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-2">To Date</label>
                <input
                  type="date"
                  value={localFilters.dateRange?.end?.toISOString().split('T')[0] || ''}
                  onChange={(e) => {
                    const endDate = e.target.value ? new Date(e.target.value) : undefined;
                    updateFilter('dateRange', {
                      ...localFilters.dateRange,
                      end: endDate,
                    });
                  }}
                  className="w-full px-3 py-2 bg-muted/20 border border-muted/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Service Types */}
          {serviceTypes.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white flex items-center">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                  Service Types
                </h3>
                {(localFilters.serviceTypes?.length ?? 0) > 0 && (
                  <button
                    onClick={() => clearFilter('serviceTypes')}
                    className="text-xs text-muted-foreground hover:text-white"
                  >
                    Clear ({localFilters.serviceTypes?.length})
                  </button>
                )}
              </div>
              <div className="bg-muted/10 rounded-lg border border-muted/20 max-h-48 overflow-y-auto custom-scrollbar">
                <div className="p-3 space-y-2">
                  {serviceTypes.map((service) => {
                    const isSelected = localFilters.serviceTypes?.includes(service) || false;
                    return (
                      <label key={service} className={cn(
                        "flex items-center p-2 rounded-md cursor-pointer transition-all duration-200 text-sm",
                        isSelected 
                          ? "bg-primary/20 text-white" 
                          : "hover:bg-muted/20 text-muted-foreground hover:text-white"
                      )}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const currentServices = localFilters.serviceTypes || [];
                            if (e.target.checked) {
                              updateFilter('serviceTypes', [...currentServices, service]);
                            } else {
                              updateFilter('serviceTypes', currentServices.filter(s => s !== service));
                            }
                          }}
                          className="sr-only"
                        />
                        <div className={cn(
                          "w-3 h-3 rounded border flex items-center justify-center transition-all duration-200 flex-shrink-0",
                          isSelected ? "bg-primary border-primary" : "border-muted-foreground"
                        )}>
                          {isSelected && (
                            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <span className="ml-2 font-medium truncate" title={service}>
                          {service}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </>
  );
}