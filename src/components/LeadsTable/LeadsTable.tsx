'use client';

import { useMemo, useState } from 'react';
import { useLeads } from '@/hooks/useLeads';
import { Lead, SortOptions } from '@/lib/types/lead';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import TableRowComponent from './TableRow';
import BulkActions from './BulkActions';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface LeadsTableProps {
  leads?: Lead[];
  loading?: boolean;
  error?: string | null;
  sort?: SortOptions | undefined;
  selectedLeads?: string[];
  isSelectAll?: boolean;
  selectLead?: (leadId: string) => void;
  selectAllLeads?: () => void;
  clearSelection?: () => void;
  setSort?: (sort: SortOptions | undefined) => void;
  updateLeadStatus?: (leadId: string, status: string) => Promise<void>;
  bulkUpdateStatus?: (leadIds: string[], status: string) => Promise<void>;
  bulkDelete?: (leadIds: string[]) => Promise<void>;
  className?: string;
}

const COLUMN_CONFIGS = [
  { key: 'advertiser' as keyof Lead, label: 'Advertiser', sortable: true, width: 200 },
  { key: 'contact' as keyof Lead, label: 'Contact', sortable: false, width: 150 },
  { key: 'probability' as keyof Lead, label: 'Probability', sortable: true, width: 120 },
  { key: 'status' as keyof Lead, label: 'Status', sortable: true, width: 120 },
  { key: 'service' as keyof Lead, label: 'Service', sortable: true, width: 200 },
  { key: 'estimated_monthly_revenue' as keyof Lead, label: 'Est. Revenue', sortable: false, width: 140 },
  { key: 'dm_open_rate_prediction' as keyof Lead, label: 'DM Open Rate', sortable: false, width: 130 },
  { key: 'created_at' as keyof Lead, label: 'Created', sortable: true, width: 120 },
];

export default function LeadsTable({ 
  leads: propsLeads,
  loading: propsLoading,
  error: propsError,
  sort: propsSort,
  selectedLeads: propsSelectedLeads,
  isSelectAll: propsIsSelectAll,
  selectLead: propsSelectLead,
  selectAllLeads: propsSelectAllLeads,
  clearSelection: propsClearSelection,
  setSort: propsSetSort,
  updateLeadStatus: propsUpdateLeadStatus,
  bulkUpdateStatus: propsBulkUpdateStatus,
  bulkDelete: propsBulkDelete,
  className 
}: LeadsTableProps) {
  // Use props if provided, otherwise use internal hook
  const hookData = useLeads();
  
  const leads = propsLeads ?? hookData.leads;
  const loading = propsLoading ?? hookData.loading;
  const error = propsError ?? hookData.error;
  const sort = propsSort ?? hookData.sort;
  const selectedLeads = propsSelectedLeads ?? hookData.selectedLeads;
  const isSelectAll = propsIsSelectAll ?? hookData.isSelectAll;
  const selectLead = propsSelectLead ?? hookData.selectLead;
  const selectAllLeads = propsSelectAllLeads ?? hookData.selectAllLeads;
  const clearSelection = propsClearSelection ?? hookData.clearSelection;
  const setSort = propsSetSort ?? hookData.setSort;
  const updateLeadStatus = propsUpdateLeadStatus ?? hookData.updateLeadStatus;
  const bulkUpdateStatus = propsBulkUpdateStatus ?? hookData.bulkUpdateStatus;
  const bulkDelete = propsBulkDelete ?? hookData.bulkDelete;

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Handle column sorting
  const handleSort = (field: keyof Lead) => {
    const newSort: SortOptions = {
      field,
      direction: sort?.field === field && sort.direction === 'asc' ? 'desc' : 'asc',
    };
    setSort(newSort);
  };

  // Handle row expansion for mobile/detailed view
  const toggleRowExpansion = (leadId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(leadId)) {
        newSet.delete(leadId);
      } else {
        newSet.add(leadId);
      }
      return newSet;
    });
  };

  // Render sort icon
  const renderSortIcon = (field: keyof Lead) => {
    if (sort?.field !== field) return null;
    
    return sort.direction === 'asc' ? (
      <ChevronUpIcon className="w-4 h-4" />
    ) : (
      <ChevronDownIcon className="w-4 h-4" />
    );
  };

  // Memoized table content for performance
  const tableContent = useMemo(() => {
    const colSpan = COLUMN_CONFIGS.length + 2; // +2 for checkbox and actions columns

    if (loading) {
      return (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={colSpan} className="px-6 py-12">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-muted-foreground font-medium">Loading leads...</span>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (error) {
      return (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={colSpan} className="px-6 py-12">
            <div className="text-center">
              <div className="text-destructive font-medium mb-2">Error loading leads</div>
              <div className="text-sm text-muted-foreground">{error}</div>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (leads.length === 0) {
      return (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={colSpan} className="px-6 py-12">
            <div className="text-center">
              <div className="text-muted-foreground font-medium mb-2">No leads found</div>
              <div className="text-sm text-muted-foreground/70">Try adjusting your filters or search criteria</div>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    return leads.map((lead) => (
      <TableRowComponent
        key={lead._id}
        lead={lead}
        isSelected={selectedLeads.includes(lead._id)}
        isExpanded={expandedRows.has(lead._id)}
        onSelect={() => selectLead(lead._id)}
        onToggleExpansion={() => toggleRowExpansion(lead._id)}
        onStatusUpdate={(status: string) => updateLeadStatus(lead._id, status)}
        columns={COLUMN_CONFIGS}
      />
    ));
  }, [
    leads,
    loading,
    error,
    selectedLeads,
    expandedRows,
    selectLead,
    updateLeadStatus,
  ]);

  return (
    <div className={cn('overflow-hidden', className)}>
      {/* Bulk Actions Bar */}
      {selectedLeads.length > 0 && (
        <div className="mb-4">
          <BulkActions
            selectedCount={selectedLeads.length}
            onBulkStatusUpdate={bulkUpdateStatus}
            onBulkDelete={bulkDelete}
            onClearSelection={clearSelection}
            selectedLeads={selectedLeads}
          />
        </div>
      )}

      {/* Table Container with Horizontal Scroll */}
      <div className="overflow-x-auto custom-scrollbar">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-white/10 bg-black/20">
              {/* Select All Checkbox */}
              <TableHead className="w-12 px-6 py-4">
                <Checkbox
                  checked={isSelectAll}
                  onCheckedChange={selectAllLeads}
                  className="border-white/20"
                />
              </TableHead>

              {/* Column Headers */}
              {COLUMN_CONFIGS.map((column) => (
                <TableHead
                  key={column.key}
                  className={cn(
                    'px-6 py-4 text-xs font-semibold text-white/80 uppercase tracking-wider',
                    column.sortable && 'cursor-pointer hover:bg-white/5 select-none transition-all duration-200'
                  )}
                  style={{ width: column.width }}
                  onClick={column.sortable ? () => handleSort(column.key) : undefined}
                >
                  <div className="flex items-center space-x-2">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <div className="ml-1 opacity-60 text-blue-400">
                        {renderSortIcon(column.key)}
                      </div>
                    )}
                  </div>
                </TableHead>
              ))}

              {/* Actions Column */}
              <TableHead className="w-20 px-6 py-4 text-xs font-semibold text-white/80 uppercase tracking-wider">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {tableContent}
          </TableBody>
        </Table>
      </div>


    </div>
  );
}