'use client';

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  StatusDistribution,
  ServiceTypeDistribution,
  ProbabilityDistribution,
  MonthlyTrend,
  LeadSourceDistribution
} from '@/lib/types/lead';
import { cn } from '@/lib/utils';

interface ChartsProps {
  statusDistribution: StatusDistribution[];
  serviceTypeDistribution: ServiceTypeDistribution[];
  probabilityDistribution: ProbabilityDistribution[];
  monthlyTrends?: MonthlyTrend[];
  leadSourceDistribution?: LeadSourceDistribution[];
  loading?: boolean;
  className?: string;
}

// Gray theme colors only
const GRAY_COLORS = {
  primary: '#f5f5f5',
  secondary: '#d4d4d4',
  accent: '#a3a3a3',
  light: '#e5e5e5',
  medium: '#9ca3af',
  dark: '#6b7280',
  darker: '#4b5563',
  muted: '#9ca3af',
  background: 'rgba(15, 15, 15, 0.95)',
  card: 'rgba(30, 30, 30, 0.8)',
  border: 'rgba(60, 60, 60, 0.5)',
};
// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card p-3 border border-border rounded-lg shadow-lg">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value} {entry.payload.percentage && `(${entry.payload.percentage}%)`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Status Distribution Pie Chart
function StatusChart({ data, loading }: { data: StatusDistribution[]; loading?: boolean }) {
  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  const chartData = data.filter(item => item.count > 0).map((item, index) => ({
    name: item.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: item.count,
    percentage: item.percentage,
    color: [GRAY_COLORS.primary, GRAY_COLORS.accent, GRAY_COLORS.medium, GRAY_COLORS.dark, GRAY_COLORS.secondary][index % 5],
  }));

  if (chartData.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percentage }) => `${name} (${percentage}%)`}
          outerRadius={80}
          fill={GRAY_COLORS.accent}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}

// Service Type Distribution Bar Chart
function ServiceChart({ data, loading }: { data: ServiceTypeDistribution[]; loading?: boolean }) {
  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  const chartData = data.slice(0, 10).map(item => ({
    name: item.service.length > 30 ? `${item.service.substring(0, 30)}...` : item.service,
    fullName: item.service,
    count: item.count,
    percentage: item.percentage,
  }));

  if (chartData.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={GRAY_COLORS.border} />
        <XAxis
          dataKey="name"
          angle={-45}
          textAnchor="end"
          height={80}
          fontSize={12}
          stroke={GRAY_COLORS.secondary}
        />
        <YAxis stroke={GRAY_COLORS.secondary} />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload;
              return (
                <div className="bg-card p-3 border border-border rounded-lg shadow-lg">
                  <p className="text-sm font-medium text-foreground">{data.fullName}</p>
                  <p className="text-sm text-white">
                    Count: {data.count} ({data.percentage}%)
                  </p>
                </div>
              );
            }
            return null;
          }}
        />
        <Bar dataKey="count" fill={GRAY_COLORS.accent} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Probability Distribution Chart
function ProbabilityChart({ data, loading }: { data: ProbabilityDistribution[]; loading?: boolean }) {
  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  const chartData = data.map(item => ({
    range: item.range,
    count: item.count,
    percentage: item.percentage,
  }));

  const getBarColor = (range: string) => {
    switch (range) {
      case '0-25%': return GRAY_COLORS.dark;
      case '26-50%': return GRAY_COLORS.medium;
      case '51-75%': return GRAY_COLORS.accent;
      case '76-100%': return GRAY_COLORS.primary;
      default: return GRAY_COLORS.muted;
    }
  };

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRAY_COLORS.border} />
        <XAxis dataKey="range" stroke={GRAY_COLORS.secondary} />
        <YAxis stroke={GRAY_COLORS.secondary} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="count">
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getBarColor(entry.range)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// Monthly Trends Chart
function MonthlyTrendsChart({ data, loading }: { data: MonthlyTrend[]; loading?: boolean }) {
  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  const chartData = data.map(item => ({
    month: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    leads: item.leads,
    revenue: item.revenue,
  }));

  if (chartData.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRAY_COLORS.border} />
        <XAxis dataKey="month" stroke={GRAY_COLORS.secondary} />
        <YAxis stroke={GRAY_COLORS.secondary} />
        <Tooltip
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-card p-3 border border-border rounded-lg shadow-lg">
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="text-sm text-white">Leads: {payload[0]?.value}</p>
                  <p className="text-sm text-muted-foreground">Revenue: ${payload[1]?.value?.toLocaleString()}</p>
                </div>
              );
            }
            return null;
          }}
        />
        <Area type="monotone" dataKey="leads" stackId="1" stroke={GRAY_COLORS.accent} fill={GRAY_COLORS.accent} fillOpacity={0.3} />
        <Area type="monotone" dataKey="revenue" stackId="2" stroke={GRAY_COLORS.primary} fill={GRAY_COLORS.primary} fillOpacity={0.3} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// Lead Source Distribution Chart
function LeadSourceChart({ data, loading }: { data: LeadSourceDistribution[]; loading?: boolean }) {
  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  const chartData = data.map(item => ({
    name: item.source,
    value: item.count,
    percentage: item.percentage,
  }));

  const colors = [GRAY_COLORS.primary, GRAY_COLORS.accent, GRAY_COLORS.medium, GRAY_COLORS.dark];

  if (chartData.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percentage }) => `${name} (${percentage}%)`}
          outerRadius={80}
          fill={GRAY_COLORS.accent}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}

// Main Charts Component
export default function Charts({
  statusDistribution,
  serviceTypeDistribution,
  probabilityDistribution,
  monthlyTrends = [],
  leadSourceDistribution = [],
  loading = false,
  className,
}: ChartsProps) {
  return (
    <div className={cn('space-y-8', className)}>
      {/* First Row - Status and Probability */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass rounded-xl p-6 hover-lift">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Lead Status Distribution</h3>
            <div className="text-sm text-muted-foreground">
              Total: {statusDistribution.reduce((sum, item) => sum + item.count, 0)} leads
            </div>
          </div>
          <StatusChart data={statusDistribution} loading={loading} />
        </div>

        <div className="glass rounded-xl p-6 hover-lift">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Probability Distribution</h3>
            <div className="text-sm text-muted-foreground">Success likelihood ranges</div>
          </div>
          <ProbabilityChart data={probabilityDistribution} loading={loading} />
        </div>
      </div>

      {/* Second Row - Service Types */}
      <div className="glass rounded-xl p-6 hover-lift">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Service Type Distribution</h3>
          <div className="text-sm text-muted-foreground">
            Top {Math.min(10, serviceTypeDistribution.length)} services
          </div>
        </div>
        <ServiceChart data={serviceTypeDistribution} loading={loading} />
      </div>

      {/* Third Row - Monthly Trends and Lead Sources */}
      {(monthlyTrends.length > 0 || leadSourceDistribution.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {monthlyTrends.length > 0 && (
            <div className="glass rounded-xl p-6 hover-lift">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Monthly Trends</h3>
                <div className="text-sm text-muted-foreground">Leads and revenue over time</div>
              </div>
              <MonthlyTrendsChart data={monthlyTrends} loading={loading} />
            </div>
          )}

          {leadSourceDistribution.length > 0 && (
            <div className="glass rounded-xl p-6 hover-lift">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Lead Sources</h3>
                <div className="text-sm text-muted-foreground">Where leads come from</div>
              </div>
              <LeadSourceChart data={leadSourceDistribution} loading={loading} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Compact charts for dashboard
interface CompactChartsProps {
  statusDistribution: StatusDistribution[];
  probabilityDistribution: ProbabilityDistribution[];
  loading?: boolean;
  className?: string;
}

export function CompactCharts({
  statusDistribution,
  probabilityDistribution,
  loading = false,
  className,
}: CompactChartsProps) {
  return (
    <div className={cn('grid grid-cols-1 lg:grid-cols-2 gap-6', className)}>
      {/* Compact Status Chart */}
      <div className="bg-card rounded-lg border border-border p-4">
        <h4 className="text-md font-medium text-foreground mb-3">Status Distribution</h4>
        <div className="h-48">
          <StatusChart data={statusDistribution} loading={loading} />
        </div>
      </div>

      {/* Compact Probability Chart */}
      <div className="bg-card rounded-lg border border-border p-4">
        <h4 className="text-md font-medium text-foreground mb-3">Probability Ranges</h4>
        <div className="h-48">
          <ProbabilityChart data={probabilityDistribution} loading={loading} />
        </div>
      </div>
    </div>
  );
}