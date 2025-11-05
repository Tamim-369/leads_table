import { Lead, LeadMetrics, StatusDistribution, ServiceTypeDistribution, ProbabilityDistribution } from '@/lib/types/lead';
import { LeadStatus } from '@/lib/models/Lead';

/**
 * Calculate key metrics from leads data
 */
export function calculateLeadMetrics(leads: Lead[]): LeadMetrics {
  const totalLeads = leads.length;
  
  if (totalLeads === 0) {
    return {
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
  }

  // Count leads by status
  const statusCounts = leads.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const newLeads = statusCounts[LeadStatus.NEW] || 0;
  const contactedLeads = statusCounts[LeadStatus.CONTACTED] || 0;
  const qualifiedLeads = statusCounts[LeadStatus.QUALIFIED] || 0;
  const closedWonLeads = statusCounts[LeadStatus.CLOSED_WON] || 0;
  const closedLostLeads = statusCounts[LeadStatus.CLOSED_LOST] || 0;
  const clientLeads = statusCounts[LeadStatus.CLIENT] || 0;

  // Calculate average probability
  const totalProbability = leads.reduce((sum, lead) => sum + (lead.probability || 0), 0);
  const averageProbability = Math.round(totalProbability / totalLeads);

  // Calculate revenue potential (simplified calculation)
  const totalRevenuePotential = leads.reduce((sum, lead) => {
    // Extract numeric value from estimated monthly revenue
    const revenueMatch = lead.estimated_monthly_revenue.match(/(\d+)/);
    const baseRevenue = revenueMatch ? parseInt(revenueMatch[1]) * 1000 : 150000; // Default to 150K
    return sum + (baseRevenue * lead.probability / 100);
  }, 0);

  // Calculate conversion rate (closed won / total leads that have been contacted)
  const contactedOrBeyond = contactedLeads + qualifiedLeads + closedWonLeads + closedLostLeads;
  const conversionRate = contactedOrBeyond > 0 ? Math.round((closedWonLeads / contactedOrBeyond) * 100) : 0;

  return {
    totalLeads,
    newLeads,
    contactedLeads,
    qualifiedLeads,
    closedWonLeads,
    closedLostLeads,
    clientLeads,
    averageProbability,
    totalRevenuePotential: Math.round(totalRevenuePotential),
    conversionRate,
  };
}

/**
 * Calculate status distribution
 */
export function calculateStatusDistribution(leads: Lead[]): StatusDistribution[] {
  const totalLeads = leads.length;
  
  if (totalLeads === 0) {
    return Object.values(LeadStatus).map(status => ({
      status,
      count: 0,
      percentage: 0,
    }));
  }

  const statusCounts = leads.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.values(LeadStatus).map(status => ({
    status,
    count: statusCounts[status] || 0,
    percentage: Math.round(((statusCounts[status] || 0) / totalLeads) * 100),
  }));
}

/**
 * Calculate service type distribution
 */
export function calculateServiceTypeDistribution(leads: Lead[]): ServiceTypeDistribution[] {
  const totalLeads = leads.length;
  
  if (totalLeads === 0) {
    return [];
  }

  const serviceCounts = leads.reduce((acc, lead) => {
    acc[lead.service] = (acc[lead.service] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(serviceCounts)
    .map(([service, count]) => ({
      service,
      count,
      percentage: Math.round((count / totalLeads) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Calculate probability distribution
 */
export function calculateProbabilityDistribution(leads: Lead[]): ProbabilityDistribution[] {
  const totalLeads = leads.length;
  
  if (totalLeads === 0) {
    return [
      { range: '0-25%', count: 0, percentage: 0 },
      { range: '26-50%', count: 0, percentage: 0 },
      { range: '51-75%', count: 0, percentage: 0 },
      { range: '76-100%', count: 0, percentage: 0 },
    ];
  }

  const ranges = {
    '0-25%': 0,
    '26-50%': 0,
    '51-75%': 0,
    '76-100%': 0,
  };

  leads.forEach(lead => {
    if (lead.probability <= 25) {
      ranges['0-25%']++;
    } else if (lead.probability <= 50) {
      ranges['26-50%']++;
    } else if (lead.probability <= 75) {
      ranges['51-75%']++;
    } else {
      ranges['76-100%']++;
    }
  });

  return Object.entries(ranges).map(([range, count]) => ({
    range,
    count,
    percentage: Math.round((count / totalLeads) * 100),
  }));
}

/**
 * Format currency values
 */
export function formatCurrency(value: number, currency = '৳'): string {
  if (value >= 1000000) {
    return `${currency}${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${currency}${(value / 1000).toFixed(0)}K`;
  } else {
    return `${currency}${value.toLocaleString()}`;
  }
}

/**
 * Format percentage values
 */
export function formatPercentage(value: number): string {
  return `${value}%`;
}

/**
 * Get trend indicator
 */
export function getTrendIndicator(current: number, previous: number): {
  direction: 'up' | 'down' | 'neutral';
  percentage: number;
  isPositive: boolean;
} {
  if (previous === 0) {
    return {
      direction: current > 0 ? 'up' : 'neutral',
      percentage: 0,
      isPositive: current >= 0,
    };
  }

  const change = ((current - previous) / previous) * 100;
  const direction = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
  
  return {
    direction,
    percentage: Math.abs(Math.round(change)),
    isPositive: change >= 0,
  };
}

/**
 * Calculate time-based metrics
 */
export function calculateTimeBasedMetrics(leads: Lead[], days = 30) {
  const now = new Date();
  const cutoffDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));

  const recentLeads = leads.filter(lead => new Date(lead.created_at) >= cutoffDate);
  const olderLeads = leads.filter(lead => new Date(lead.created_at) < cutoffDate);

  return {
    recent: calculateLeadMetrics(recentLeads),
    older: calculateLeadMetrics(olderLeads),
    recentCount: recentLeads.length,
    olderCount: olderLeads.length,
  };
}

/**
 * Get color for status
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    [LeadStatus.NEW]: '#6B7280', // gray
    [LeadStatus.CONTACTED]: '#3B82F6', // blue
    [LeadStatus.QUALIFIED]: '#F59E0B', // yellow
    [LeadStatus.PROPOSAL_SENT]: '#8B5CF6', // purple
    [LeadStatus.CLOSED_WON]: '#10B981', // green
    [LeadStatus.CLOSED_LOST]: '#EF4444', // red
  };
  
  return colors[status] || '#6B7280';
}

/**
 * Get priority level based on probability and other factors
 */
export function getLeadPriority(lead: Lead): 'high' | 'medium' | 'low' {
  if (lead.probability >= 70) return 'high';
  if (lead.probability >= 40) return 'medium';
  return 'low';
}

/**
 * Calculate lead score (0-100) based on multiple factors
 */
export function calculateLeadScore(lead: Lead): number {
  let score = lead.probability; // Base score from probability

  // Adjust based on status
  const statusBonus: Record<string, number> = {
    [LeadStatus.NEW]: 0,
    [LeadStatus.CONTACTED]: 5,
    [LeadStatus.QUALIFIED]: 10,
    [LeadStatus.PROPOSAL_SENT]: 15,
    [LeadStatus.CLOSED_WON]: 20,
    [LeadStatus.CLOSED_LOST]: -20,
  };

  score += statusBonus[lead.status] || 0;

  // Adjust based on contact availability
  if (lead.contact) score += 5;
  if (lead.whatsapp_link) score += 3;

  // Adjust based on revenue potential
  if (lead.estimated_monthly_revenue.includes('৳500K') || lead.estimated_monthly_revenue.includes('৳1M')) {
    score += 10;
  }

  // Ensure score is within bounds
  return Math.max(0, Math.min(100, Math.round(score)));
}