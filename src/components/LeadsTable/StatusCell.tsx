'use client';

import { useState, useRef, useEffect } from 'react';
import { LeadStatus, LeadStatusType } from '@/lib/models/Lead';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';

interface StatusCellProps {
  status: string;
  onStatusChange: (status: string) => void;
  disabled?: boolean;
}

const STATUS_CONFIG: Record<LeadStatusType, {
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  color: string;
  bgColor: string;
  label: string;
}> = {
  [LeadStatus.NEW]: {
    variant: 'secondary',
    color: 'text-gray-800',
    bgColor: 'bg-gray-100 hover:bg-gray-200',
    label: 'New'
  },
  [LeadStatus.CONTACTED]: {
    variant: 'default',
    color: 'text-cyan-500',
    bgColor: 'bg-blue-100 hover:bg-blue-200',
    label: 'Contacted'
  },
  [LeadStatus.QUALIFIED]: {
    variant: 'outline',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100 hover:bg-yellow-200',
    label: 'Qualified'
  },
  [LeadStatus.PROPOSAL_SENT]: {
    variant: 'outline',
    color: 'text-purple-500',
    bgColor: 'bg-purple-100 hover:bg-purple-200',
    label: 'Proposal Sent'
  },
  [LeadStatus.CLOSED_WON]: {
    variant: 'default',
    color: 'text-emerald-500',
    bgColor: 'bg-green-100 hover:bg-green-200',
    label: 'Closed Won'
  },
  [LeadStatus.CLOSED_LOST]: {
    variant: 'destructive',
    color: 'text-red-700',
    bgColor: 'bg-red-100 hover:bg-red-200',
    label: 'Closed Lost'
  },
  [LeadStatus.CLIENT]: {
    variant: 'default',
    color: 'text-cyan-500',
    bgColor: 'bg-emerald-100 hover:bg-emerald-200',
    label: 'Client'
  },
};

export default function StatusCell({ status, onStatusChange, disabled = false }: StatusCellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const currentStatus = status as LeadStatusType;
  const statusOptions = Object.values(LeadStatus);
  const currentConfig = STATUS_CONFIG[currentStatus];

  const handleStatusChange = async (newStatus: LeadStatusType) => {
    if (newStatus === currentStatus || disabled || isUpdating) return;

    setIsUpdating(true);
    try {
      await onStatusChange(newStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsUpdating(false);
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        variant="ghost"
        size="sm"
        onClick={() => !disabled && !isUpdating && setIsOpen(!isOpen)}
        disabled={disabled || isUpdating}
        className={cn(
          'h-auto p-1 hover:bg-transparent group',
          disabled && 'opacity-50 cursor-not-allowed',
          isUpdating && 'opacity-50 cursor-wait'
        )}
        onKeyDown={handleKeyDown}
      >
        <div className={cn(
          'flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200',
          currentConfig.color,
          currentConfig.bgColor,
          !disabled && !isUpdating && 'group-hover:shadow-sm',
          isOpen && 'ring-2 ring-primary/20'
        )}>
          <span>{currentConfig.label}</span>
          {!disabled && !isUpdating && (
            <ChevronDownIcon className={cn(
              "ml-2 w-3 h-3 transition-transform duration-200",
              isOpen && "rotate-180"
            )} />
          )}
          {isUpdating && (
            <div className="ml-2 w-3 h-3 animate-spin rounded-full border border-current border-t-transparent" />
          )}
        </div>
      </Button>

      {/* Dropdown Menu */}
      {isOpen && !disabled && !isUpdating && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-48 status-dropdown z-50 py-2 bg-gray-900"
        >
          {statusOptions.map((statusOption) => {
            const config = STATUS_CONFIG[statusOption];
            const isSelected = statusOption === currentStatus;

            return (
              <button
                key={statusOption}
                onClick={() => handleStatusChange(statusOption)}
                className={cn(
                  'w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors duration-150 ',
                  'bg-transparent border-b border-gray-600 hover:bg-gray-800',
                  isSelected && 'bg-gray-800 '
                )}
              >
                <div className="flex items-center">
                  <div className={cn(
                    'flex items-center px-2.5 py-1 rounded-full text-xs mr-3 font-bold',
                    config.color,
                    config.bgColor.replace('hover:', '')
                  )}>
                    {config.label}
                  </div>
                </div>
                {isSelected && (
                  <CheckIcon className="w-4 h-4 text-primary" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}