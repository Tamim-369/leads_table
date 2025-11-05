'use client';

import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  className,
  text 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="flex flex-col items-center space-y-2">
        <div
          className={cn(
            'animate-spin rounded-full border-2 border-primary border-t-transparent',
            sizeClasses[size]
          )}
        />
        {text && (
          <p className="text-sm text-muted-foreground">{text}</p>
        )}
      </div>
    </div>
  );
}

// Skeleton loader for table rows
export function TableRowSkeleton({ columns = 8 }: { columns?: number }) {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="w-4 h-4 bg-muted rounded"></div>
      </td>
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="px-6 py-4">
          <div className="h-4 bg-muted rounded w-full"></div>
        </td>
      ))}
    </tr>
  );
}

// Skeleton loader for metric cards
export function MetricCardSkeleton() {
  return (
    <div className="bg-card rounded-lg border border-border p-6 animate-pulse">
      <div className="flex items-center">
        <div className="w-8 h-8 bg-muted rounded"></div>
        <div className="ml-3 h-4 bg-muted rounded w-24"></div>
      </div>
      <div className="mt-4 h-8 bg-muted rounded w-16"></div>
      <div className="mt-2 h-3 bg-muted rounded w-20"></div>
    </div>
  );
}

// Full page loading overlay
interface LoadingOverlayProps {
  text?: string;
  className?: string;
}

export function LoadingOverlay({ text = 'Loading...', className }: LoadingOverlayProps) {
  return (
    <div className={cn(
      'fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50',
      className
    )}>
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}