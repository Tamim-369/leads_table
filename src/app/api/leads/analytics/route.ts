import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Lead from '@/lib/models/Lead';
import { LeadMetrics, StatusDistribution, ServiceTypeDistribution, ProbabilityDistribution } from '@/lib/types/lead';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get all leads for analytics (no pagination)
    const allLeads = await Lead.find({}).lean();

    // Calculate metrics on full dataset
    const totalLeads = allLeads.length;
    const newLeads = allLeads.filter(lead => lead.status === 'new').length;
    const contactedLeads = allLeads.filter(lead => lead.status === 'contacted').length;
    const qualifiedLeads = allLeads.filter(lead => lead.status === 'qualified').length;
    const closedWonLeads = allLeads.filter(lead => lead.status === 'closed_won').length;
    const closedLostLeads = allLeads.filter(lead => lead.status === 'closed_lost').length;
    const clientLeads = allLeads.filter(lead => lead.status === 'client').length;

    // Calculate average probability
    const totalProbability = allLeads.reduce((sum, lead) => sum + (lead.probability || 0), 0);
    const averageProbability = totalLeads > 0 ? Math.round(totalProbability / totalLeads) : 0;

    // Calculate total revenue potential
    const totalRevenuePotential = allLeads.reduce((sum, lead) => {
      const revenue = parseFloat(lead.estimated_monthly_revenue?.replace(/[^\d.]/g, '') || '0');
      const probability = (lead.probability || 0) / 100;
      return sum + (revenue * probability);
    }, 0);

    // Calculate conversion rate
    const conversionRate = contactedLeads > 0 ? (closedWonLeads / contactedLeads) * 100 : 0;

    const metrics: LeadMetrics = {
      totalLeads,
      newLeads,
      contactedLeads,
      qualifiedLeads,
      closedWonLeads,
      closedLostLeads,
      clientLeads,
      averageProbability,
      totalRevenuePotential,
      conversionRate,
    };

    // Calculate status distribution
    const statusCounts = allLeads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusDistribution: StatusDistribution[] = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0,
    }));

    // Calculate service type distribution
    const serviceCounts = allLeads.reduce((acc, lead) => {
      const service = lead.service || 'Unknown';
      acc[service] = (acc[service] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const serviceTypeDistribution: ServiceTypeDistribution[] = Object.entries(serviceCounts)
      .map(([service, count]) => ({
        service,
        count,
        percentage: totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Calculate probability distribution
    const probabilityRanges = {
      '0-25%': 0,
      '26-50%': 0,
      '51-75%': 0,
      '76-100%': 0,
    };

    allLeads.forEach(lead => {
      const prob = lead.probability || 0;
      if (prob <= 25) probabilityRanges['0-25%']++;
      else if (prob <= 50) probabilityRanges['26-50%']++;
      else if (prob <= 75) probabilityRanges['51-75%']++;
      else probabilityRanges['76-100%']++;
    });

    const probabilityDistribution: ProbabilityDistribution[] = Object.entries(probabilityRanges).map(([range, count]) => ({
      range,
      count,
      percentage: totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0,
    }));

    // Calculate additional analytics
    const monthlyData = allLeads.reduce((acc, lead) => {
      const month = new Date(lead.created_at).toISOString().slice(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = { month, leads: 0, revenue: 0 };
      }
      acc[month].leads++;
      const revenue = parseFloat(lead.estimated_monthly_revenue?.replace(/[^\d.]/g, '') || '0');
      acc[month].revenue += revenue;
      return acc;
    }, {} as Record<string, { month: string; leads: number; revenue: number }>);

    const monthlyTrends = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));

    // Calculate lead source distribution
    const sourceCounts = allLeads.reduce((acc, lead) => {
      const source = lead.facebook_link ? 'Facebook' : 'Other';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const leadSourceDistribution = Object.entries(sourceCounts).map(([source, count]) => ({
      source,
      count,
      percentage: totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0,
    }));

    return NextResponse.json({
      metrics,
      statusDistribution,
      serviceTypeDistribution,
      probabilityDistribution,
      monthlyTrends,
      leadSourceDistribution,
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}