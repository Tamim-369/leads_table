'use client';

import { useState } from 'react';
import { Lead } from '@/lib/types/lead';
import { cn } from '@/lib/utils';
import { TableRow, TableCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import StatusCell from './StatusCell';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  PhoneIcon,
  GlobeAltIcon,
  ClipboardDocumentIcon,
} from '@heroicons/react/24/outline';
import { IoOpenOutline } from 'react-icons/io5';
import Link from 'next/link';

interface ColumnConfig {
  key: keyof Lead;
  label: string;
  sortable: boolean;
  width?: number;
}

interface TableRowComponentProps {
  lead: Lead;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: () => void;
  onToggleExpansion: () => void;
  onStatusUpdate: (status: string) => void;
  columns: ColumnConfig[];
}

export default function TableRowComponent({
  lead,
  isSelected,
  isExpanded,
  onSelect,
  onToggleExpansion,
  onStatusUpdate,
  columns,
}: TableRowComponentProps) {
  const [copying, setCopying] = useState<string | null>(null);

  // Format date for display
  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Format probability with color coding
  const formatProbability = (probability: number) => {
    const variant = probability >= 70 ? 'default' :
      probability >= 40 ? 'secondary' : 'destructive';
    return (
      <Badge variant={variant} className="font-medium">
        {probability}%
      </Badge>
    );
  };

  // Handle contact actions
  const handlePhoneCall = (contact: string) => {
    if (contact) {
      window.open(`tel:${contact}`, '_self');
    }
  };

  const handleWhatsApp = (whatsappLink: string) => {
    if (whatsappLink) {
      window.open(whatsappLink, '_blank');
    }
  };

  const handleWebsite = (websiteLink: string) => {
    if (websiteLink && websiteLink !== 'FB Only') {
      window.open(websiteLink, '_blank');
    }
  };

  const handleFacebook = (facebookLink: string) => {
    if (facebookLink) {
      window.open(facebookLink, '_blank');
    }
  };

  const handleCopyContact = async (contact: string) => {
    if (!contact) return;

    setCopying('contact');
    try {
      await navigator.clipboard.writeText(contact);
      setTimeout(() => setCopying(null), 1000);
    } catch (err) {
      setCopying(null);
    }
  };

  // Render cell content based on column type
  const renderCellContent = (column: ColumnConfig) => {
    const value = lead[column.key];

    switch (column.key) {
      case 'advertiser':
        return (
          <div className="flex items-center">
            <div>
              <div className="text-sm font-medium text-foreground truncate max-w-[180px]">
                {value as string}
              </div>
              {lead.facebook_link && (
                <Link
                  href={lead.facebook_link}
                  className=" p-0 text-xs   truncate max-w-[180px] cursor-pointer text-cyan-500 uppercase font-medium mt-1 flex items-center gap-2"
                  target='_blank'
                >
                  <span className='border-b border-cyan-500'>VISIT PAGE</span>

                  <IoOpenOutline className='h-4 w-4' />

                </Link>
              )}
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="flex items-center space-x-2">
            <div className="text-sm text-foreground">
              {value ? (
                <div className="flex items-center space-x-1">
                  <span className="truncate max-w-[100px]">{value as string}</span>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePhoneCall(value as string)}
                      className="h-6 w-6 p-0 text-primary hover:text-primary/80"
                      title="Call"
                    >
                      <PhoneIcon className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyContact(value as string)}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                      title="Copy"
                    >
                      <ClipboardDocumentIcon className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <span className="text-muted-foreground">No contact</span>
              )}
            </div>
          </div>
        );

      case 'probability':
        return formatProbability(value as number);

      case 'status':
        return (
          <StatusCell
            status={value as string}
            onStatusChange={onStatusUpdate}
          />
        );

      case 'service':
        return (
          <div className="text-sm text-foreground truncate max-w-[180px]" title={value as string}>
            {value as string}
          </div>
        );

      case 'estimated_monthly_revenue':
        return (
          <div className="text-sm text-foreground">
            {(value as string) || lead['Est. Monthly Revenue'] || '< ৳150K'}
          </div>
        );

      case 'dm_open_rate_prediction':
        return (
          <div className="text-sm text-foreground">
            {(value as string) || lead['DM Open Rate Prediction'] || 'Low (<30%)'}
          </div>
        );

      case 'created_at':
        return (
          <div className="text-sm text-foreground">
            {formatDate(value as Date)}
          </div>
        );

      default:
        return (
          <div className="text-sm text-foreground truncate">
            {String(value)}
          </div>
        );
    }
  };

  return (
    <>
      {/* Main Row */}
      <TableRow className={cn(
        'hover:bg-muted/50 transition-colors border-b border-border',
        isSelected && 'bg-muted/70'
      )}>
        {/* Selection Checkbox */}
        <TableCell className="w-12 px-4">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
          />
        </TableCell>

        {/* Data Columns */}
        {columns.map((column) => (
          <TableCell key={column.key} className="px-4 whitespace-nowrap">
            {renderCellContent(column)}
          </TableCell>
        ))}

        {/* Actions Column */}
        <TableCell className="w-20 px-4 whitespace-nowrap">
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleExpansion}
              className={cn(
                "h-8 w-8 p-0 transition-colors",
                isExpanded
                  ? "text-primary bg-primary/10 hover:bg-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <ChevronDownIcon className="w-4 h-4" />
              ) : (
                <ChevronRightIcon className="w-4 h-4" />
              )}
            </Button>

            {lead.website_link && lead.website_link !== 'FB Only' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleWebsite(lead.website_link)}
                className="h-8 w-8 p-0 text-primary hover:text-primary/80 hover:bg-primary/10"
                title="Visit Website"
              >
                <GlobeAltIcon className="w-4 h-4" />
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>

      {/* Expanded Row Details */}
      {isExpanded && (
        <TableRow className="bg-muted/30 border-b border-border">
          <TableCell colSpan={columns.length + 2} className="px-6 py-6">
            <div className="bg-card rounded-lg p-6 border border-border">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-sm">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <span className="font-semibold text-foreground text-sm uppercase tracking-wide">Reasoning:</span>
                    <p className="mt-2 text-muted-foreground leading-relaxed">{lead.reasoning || 'No reasoning provided'}</p>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4">
                    <span className="font-semibold text-foreground text-sm uppercase tracking-wide">Issues:</span>
                    <p className="mt-2 text-muted-foreground leading-relaxed">{lead.issues || 'No issues noted'}</p>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4">
                    <span className="font-semibold text-foreground text-sm uppercase tracking-wide">Pitch:</span>
                    <p className="mt-2 text-muted-foreground leading-relaxed">{lead.pitch || 'No pitch available'}</p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
                      <span className="font-semibold text-primary text-xs uppercase tracking-wide">Est. Daily Orders:</span>
                      <p className="text-foreground font-medium mt-1">{lead.estimated_daily_orders || (lead as any)['Est. Daily Orders'] || 'Unknown'}</p>
                    </div>
                    <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                      <span className="font-semibold text-green-600 dark:text-green-400 text-xs uppercase tracking-wide">Ad Spend:</span>
                      <p className="text-foreground font-medium mt-1">{lead.ad_spend_intensity || (lead as any)['Ad Spend Intensity'] || 'Low'}</p>
                    </div>
                  </div>

                  <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20">
                    <span className="font-semibold text-yellow-600 dark:text-yellow-400 text-sm uppercase tracking-wide">Cart Abandon Risk:</span>
                    <p className="text-foreground font-medium mt-1">{lead.cart_abandon_risk || (lead as any)['Cart Abandon Risk'] || 'Low'}</p>
                  </div>

                  <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
                    <span className="font-semibold text-purple-600 dark:text-purple-400 text-sm uppercase tracking-wide">Tags:</span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {lead.tags && lead.tags.length > 0 ? (
                        lead.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground italic">No tags</span>
                      )}
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4">
                    <span className="font-semibold text-foreground text-sm uppercase tracking-wide">Notes:</span>
                    <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                      {lead.notes && lead.notes.length > 0 ? (
                        lead.notes.map((note, index) => (
                          <div key={index} className="bg-card p-3 rounded-md border border-border">
                            <p className="text-foreground text-sm">{typeof note === 'string' ? note : note.text}</p>
                            {typeof note === 'object' && note.at && (
                              <p className="text-muted-foreground text-xs mt-2">
                                {new Date(note.at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        ))
                      ) : (
                        <span className="text-muted-foreground italic">No notes</span>
                      )}
                    </div>
                  </div>

                  {lead.whatsapp_link && (
                    <div className="pt-2">
                      <Button
                        onClick={() => handleWhatsApp(lead.whatsapp_link)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                        </svg>
                        WhatsApp
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}