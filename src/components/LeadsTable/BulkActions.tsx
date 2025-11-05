'use client';

import { useState } from 'react';
import { LeadStatus, LeadStatusType } from '@/lib/models/Lead';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  XMarkIcon, 
  TrashIcon, 
  PencilSquareIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

interface BulkActionsProps {
  selectedCount: number;
  selectedLeads: string[];
  onBulkStatusUpdate: (leadIds: string[], status: string) => Promise<void>;
  onBulkDelete: (leadIds: string[]) => Promise<void>;
  onClearSelection: () => void;
}

const STATUS_LABELS: Record<LeadStatusType, string> = {
  [LeadStatus.NEW]: 'New',
  [LeadStatus.CONTACTED]: 'Contacted',
  [LeadStatus.QUALIFIED]: 'Qualified',
  [LeadStatus.PROPOSAL_SENT]: 'Proposal Sent',
  [LeadStatus.CLOSED_WON]: 'Closed Won',
  [LeadStatus.CLOSED_LOST]: 'Closed Lost',
  [LeadStatus.CLIENT]: 'Client',
};

export default function BulkActions({
  selectedCount,
  selectedLeads,
  onBulkStatusUpdate,
  onBulkDelete,
  onClearSelection,
}: BulkActionsProps) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleStatusUpdate = async (status: LeadStatusType) => {
    setIsUpdating(true);
    try {
      await onBulkStatusUpdate(selectedLeads, status);
      setShowStatusMenu(false);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onBulkDelete(selectedLeads);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Failed to delete leads:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-primary/10 border-b border-border px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <CheckIcon className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-foreground">
              {selectedCount} lead{selectedCount !== 1 ? 's' : ''} selected
            </span>
          </div>

          {/* Bulk Actions */}
          <div className="flex items-center space-x-2">
            {/* Status Update */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                disabled={isUpdating || isDeleting}
                className={cn(
                  (isUpdating || isDeleting) && 'opacity-50 cursor-not-allowed'
                )}
              >
                <PencilSquareIcon className="w-4 h-4 mr-1" />
                Update Status
                {isUpdating && (
                  <div className="ml-2 w-3 h-3 animate-spin rounded-full border border-current border-t-transparent" />
                )}
              </Button>

              {/* Status Menu */}
              {showStatusMenu && !isUpdating && !isDeleting && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowStatusMenu(false)}
                  />
                  <div className="absolute left-0 mt-1 w-48 bg-card rounded-md shadow-lg border border-border z-20">
                    <div className="py-1">
                      {(Object.values(LeadStatus) as LeadStatusType[]).map((status) => (
                        <Button
                          key={status}
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusUpdate(status)}
                          className="w-full justify-start px-3 py-2 h-auto text-sm"
                        >
                          {STATUS_LABELS[status]}
                        </Button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Delete */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isUpdating || isDeleting}
              className={cn(
                'border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground',
                (isUpdating || isDeleting) && 'opacity-50 cursor-not-allowed'
              )}
            >
              <TrashIcon className="w-4 h-4 mr-1" />
              Delete
              {isDeleting && (
                <div className="ml-2 w-3 h-3 animate-spin rounded-full border border-current border-t-transparent" />
              )}
            </Button>
          </div>
        </div>

        {/* Clear Selection */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          disabled={isUpdating || isDeleting}
          className={cn(
            'h-8 w-8 p-0',
            (isUpdating || isDeleting) && 'opacity-50 cursor-not-allowed'
          )}
        >
          <XMarkIcon className="w-4 h-4" />
        </Button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4 border border-border">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <TrashIcon className="w-6 h-6 text-destructive" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-foreground">
                  Delete Selected Leads
                </h3>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete {selectedCount} lead{selectedCount !== 1 ? 's' : ''}? 
                This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
                className={cn(
                  isDeleting && 'opacity-50 cursor-not-allowed'
                )}
              >
                {isDeleting ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 animate-spin rounded-full border border-white border-t-transparent mr-2" />
                    Deleting...
                  </div>
                ) : (
                  'Delete'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}