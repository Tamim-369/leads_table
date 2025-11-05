import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Lead, { LeadStatus } from '@/lib/models/Lead';

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    const { searchParams } = new URL(request.url);
    const minProb = parseInt(searchParams.get('min_prob') || '65');
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '50'));

    // Query matching your Python get_high_priority method
    const leads = await Lead.find({
      probability: { $gte: minProb },
      contact: { $nin: ['', null] }, // Has contact info
      status: { $ne: LeadStatus.CLIENT }, // Not already a client
    })
    .sort({ probability: -1 }) // Sort by probability descending
    .limit(limit)
    .lean();

    // Format response to match your data structure
    const formattedLeads = leads.map((lead: any) => ({
      _id: String(lead._id),
      advertiser: lead.advertiser || '',
      facebook_link: lead.facebook_link || '',
      website_link: lead.website_link || '',
      contact: lead.contact || '',
      library_id: lead.library_id || '',
      probability: lead.probability || 0,
      service: lead.service || '',
      reasoning: lead.reasoning || '',
      issues: lead.issues || '',
      estimated_daily_orders: lead.estimated_daily_orders || lead['Est. Daily Orders'] || 'Unknown',
      ad_spend_intensity: lead.ad_spend_intensity || lead['Ad Spend Intensity'] || 'Low',
      cart_abandon_risk: lead.cart_abandon_risk || lead['Cart Abandon Risk'] || 'Low',
      estimated_monthly_revenue: lead.estimated_monthly_revenue || lead['Est. Monthly Revenue'] || '< ৳150K',
      dm_open_rate_prediction: lead.dm_open_rate_prediction || lead['DM Open Rate Prediction'] || 'Low (<30%)',
      status: lead.status || 'new',
      tags: lead.tags || [],
      pitch: lead.pitch || '',
      whatsapp_link: lead.whatsapp_link || '',
      notes: lead.notes || [],
      created_at: lead.created_at || new Date(),
      updated_at: lead.updated_at || new Date(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        leads: formattedLeads,
        count: formattedLeads.length,
        criteria: {
          minProbability: minProb,
          hasContact: true,
          excludeClients: true,
        },
      },
      message: `Found ${formattedLeads.length} high-priority leads`,
    });
  } catch (error) {
    console.error('Error getting high priority leads:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to get high priority leads',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}