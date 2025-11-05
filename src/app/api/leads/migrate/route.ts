import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Lead from '@/lib/models/Lead';

export async function POST() {
  try {
    // Connect to database
    await connectDB();

    // Get all leads
    const leads = await Lead.find({});
    
    let updatedCount = 0;

    // Update each lead to normalize field names
    for (const lead of leads) {
      let needsUpdate = false;
      const updates: any = {};

      // Normalize field names
      if (lead['Est. Daily Orders'] && !lead.estimated_daily_orders) {
        updates.estimated_daily_orders = lead['Est. Daily Orders'];
        needsUpdate = true;
      }

      if (lead['Ad Spend Intensity'] && !lead.ad_spend_intensity) {
        updates.ad_spend_intensity = lead['Ad Spend Intensity'];
        needsUpdate = true;
      }

      if (lead['Cart Abandon Risk'] && !lead.cart_abandon_risk) {
        updates.cart_abandon_risk = lead['Cart Abandon Risk'];
        needsUpdate = true;
      }

      if (lead['Est. Monthly Revenue'] && !lead.estimated_monthly_revenue) {
        updates.estimated_monthly_revenue = lead['Est. Monthly Revenue'];
        needsUpdate = true;
      }

      if (lead['DM Open Rate Prediction'] && !lead.dm_open_rate_prediction) {
        updates.dm_open_rate_prediction = lead['DM Open Rate Prediction'];
        needsUpdate = true;
      }

      // Ensure required fields have defaults
      if (!lead.status) {
        updates.status = 'new';
        needsUpdate = true;
      }

      if (!lead.probability) {
        updates.probability = 0;
        needsUpdate = true;
      }

      if (!lead.tags) {
        updates.tags = [];
        needsUpdate = true;
      }

      if (!lead.notes) {
        updates.notes = [];
        needsUpdate = true;
      }

      if (needsUpdate) {
        await Lead.findByIdAndUpdate(lead._id, updates);
        updatedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Migration completed. Updated ${updatedCount} leads.`,
      data: {
        totalLeads: leads.length,
        updatedLeads: updatedCount,
      },
    });
  } catch (error) {
    console.error('Migration error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Migration failed',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Connect to database
    await connectDB();

    // Get sample of leads to show current state
    const sampleLeads = await Lead.find({}).limit(5);
    const totalCount = await Lead.countDocuments();

    return NextResponse.json({
      success: true,
      data: {
        totalLeads: totalCount,
        sampleLeads: sampleLeads.map(lead => ({
          _id: lead._id,
          advertiser: lead.advertiser,
          status: lead.status,
          probability: lead.probability,
          hasOldFields: !!(lead['Est. Daily Orders'] || lead['Ad Spend Intensity']),
          hasNewFields: !!(lead.estimated_daily_orders || lead.ad_spend_intensity),
        })),
      },
      message: `Found ${totalCount} leads in database`,
    });
  } catch (error) {
    console.error('Migration check error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to check migration status',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}