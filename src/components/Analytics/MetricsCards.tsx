'use client';

import { LeadMetrics } from '@/lib/types/lead';
import { formatCurrency, formatPercentage, getTrendIndicator } from '@/lib/utils/analytics';
import { cn } from '@/lib/utils';
import {
  UsersIcon,
  PhoneIcon,
  CheckBadgeIcon,
  TrophyIcon,
  XCircleIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';

interface MetricsCardsProps {
  metrics: LeadMetrics;
  previousMetrics?: LeadMetrics;
  loading?: boolean;
  className?: string;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    percentage: number;
    isPositive: boolean;
  };
  subtitle?: string;
  loading?: boolean;
}

function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  trend, 
  subtitle, 
  loading = false 
}: MetricCardProps) {
  if (loading) {
    return (
      <div className="glass rounded-xl p-6 hover-lift">
        <div className="animate-pulse">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-white/10 rounded-xl"></div>
            <div className="ml-4 h-4 bg-white/10 rounded w-24"></div>
          </div>
          <div className="mt-6 h-8 bg-white/10 rounded w-16"></div>
          <div className="mt-2 h-3 bg-white/10 rounded w-20"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-6 hover-lift group">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={cn('p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200', color)}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-white/70">{title}</p>
          </div>
        </div>
        {trend && trend.direction !== 'neutral' && (
          <div className={cn(
            'flex items-center text-sm px-2 py-1 rounded-lg',
            trend.isPositive ? 'text-green-400 bg-green-500/20' : 'text-red-400 bg-red-500/20'
          )}>
            {trend.direction === 'up' ? (
              <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
            ) : (
              <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
            )}
            {trend.percentage}%
          </div>
        )}
      </div>
      
      <div className="mt-6">
        <p className="text-3xl font-bold text-white group-hover:text-blue-400 transition-colors duration-200">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {subtitle && (
          <p className="text-sm text-white/60 mt-2">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

export default function MetricsCards({ 
  metrics, 
  previousMetrics, 
  loading = false, 
  className 
}: MetricsCardsProps) {
  const getTrend = (current: number, previous?: number) => {
    if (!previous) return undefined;
    return getTrendIndicator(current, previous);
  };

  const metricCards = [
    {
      title: 'Total Leads',
      value: metrics.totalLeads,
      icon: UsersIcon,
      color: 'bg-blue-500',
      trend: getTrend(metrics.totalLeads, previousMetrics?.totalLeads),
      subtitle: 'All leads in system',
    },
    {
      title: 'New Leads',
      value: metrics.newLeads,
      icon: UsersIcon,
      color: 'bg-gray-500',
      trend: getTrend(metrics.newLeads, previousMetrics?.newLeads),
      subtitle: 'Awaiting contact',
    },
    {
      title: 'Contacted',
      value: metrics.contactedLeads,
      icon: PhoneIcon,
      color: 'bg-blue-500',
      trend: getTrend(metrics.contactedLeads, previousMetrics?.contactedLeads),
      subtitle: 'Initial contact made',
    },
    {
      title: 'Qualified',
      value: metrics.qualifiedLeads,
      icon: CheckBadgeIcon,
      color: 'bg-yellow-500',
      trend: getTrend(metrics.qualifiedLeads, previousMetrics?.qualifiedLeads),
      subtitle: 'Meeting criteria',
    },
    {
      title: 'Closed Won',
      value: metrics.closedWonLeads,
      icon: TrophyIcon,
      color: 'bg-green-500',
      trend: getTrend(metrics.closedWonLeads, previousMetrics?.closedWonLeads),
      subtitle: 'Successfully converted',
    },
    {
      title: 'Closed Lost',
      value: metrics.closedLostLeads,
      icon: XCircleIcon,
      color: 'bg-red-500',
      trend: getTrend(metrics.closedLostLeads, previousMetrics?.closedLostLeads),
      subtitle: 'Did not convert',
    },
    {
      title: 'Avg Probability',
      value: formatPercentage(metrics.averageProbability),
      icon: ChartBarIcon,
      color: 'bg-purple-500',
      trend: getTrend(metrics.averageProbability, previousMetrics?.averageProbability),
      subtitle: 'Success likelihood',
    },
    {
      title: 'Revenue Potential',
      value: formatCurrency(metrics.totalRevenuePotential),
      icon: CurrencyDollarIcon,
      color: 'bg-green-600',
      trend: getTrend(metrics.totalRevenuePotential, previousMetrics?.totalRevenuePotential),
      subtitle: 'Weighted by probability',
    },
    {
      title: 'Conversion Rate',
      value: formatPercentage(metrics.conversionRate),
      icon: ArrowTrendingUpIcon,
      color: 'bg-indigo-500',
      trend: getTrend(metrics.conversionRate, previousMetrics?.conversionRate),
      subtitle: 'Won / Contacted',
    },
  ];

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6', className)}>
      {metricCards.map((card, index) => (
        <MetricCard
          key={card.title}
          title={card.title}
          value={card.value}
          icon={card.icon}
          color={card.color}
          trend={card.trend}
          subtitle={card.subtitle}
          loading={loading}
        />
      ))}
    </div>
  );
}

// Summary metrics component for dashboard header
interface MetricsSummaryProps {
  metrics: LeadMetrics;
  loading?: boolean;
  className?: string;
}

export function MetricsSummary({ metrics, loading = false, className }: MetricsSummaryProps) {
  if (loading) {
    return (
      <div className={cn('flex items-center space-x-8', className)}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-muted rounded w-16 mb-1"></div>
            <div className="h-6 bg-muted rounded w-12"></div>
          </div>
        ))}
      </div>
    );
  }

  const summaryItems = [
    {
      label: 'Total Leads',
      value: metrics.totalLeads.toLocaleString(),
      color: 'text-primary',
    },
    {
      label: 'Avg Probability',
      value: formatPercentage(metrics.averageProbability),
      color: 'text-purple-400',
    },
    {
      label: 'Revenue Potential',
      value: formatCurrency(metrics.totalRevenuePotential),
      color: 'text-green-400',
    },
    {
      label: 'Conversion Rate',
      value: formatPercentage(metrics.conversionRate),
      color: 'text-blue-400',
    },
  ];

  return (
    <div className={cn('flex items-center space-x-8', className)}>
      {summaryItems.map((item) => (
        <div key={item.label} className="text-center">
          <p className="text-sm text-muted-foreground">{item.label}</p>
          <p className={cn('text-lg font-semibold', item.color)}>
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}

// Compact metrics for mobile
interface CompactMetricsProps {
  metrics: LeadMetrics;
  loading?: boolean;
  className?: string;
}

export function CompactMetrics({ metrics, loading = false, className }: CompactMetricsProps) {
  if (loading) {
    return (
      <div className={cn('bg-card rounded-lg border border-border p-4', className)}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded w-24"></div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <div className="h-3 bg-muted rounded w-16 mb-1"></div>
                <div className="h-5 bg-muted rounded w-12"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-card rounded-lg border border-border p-4', className)}>
      <h3 className="text-lg font-medium text-foreground mb-3">Key Metrics</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-lg font-semibold text-primary">{metrics.totalLeads}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Won</p>
          <p className="text-lg font-semibold text-green-400">{metrics.closedWonLeads}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Avg Prob</p>
          <p className="text-lg font-semibold text-purple-400">
            {formatPercentage(metrics.averageProbability)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Revenue</p>
          <p className="text-lg font-semibold text-green-400">
            {formatCurrency(metrics.totalRevenuePotential)}
          </p>
        </div>
      </div>
    </div>
  );
}