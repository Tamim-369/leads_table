import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Lead from '@/lib/models/Lead';
import { sampleLeads } from '@/lib/utils/seedData';

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    // Clear existing leads (optional - remove in production)
    await Lead.deleteMany({});

    // Insert sample leads
    const leads = await Lead.insertMany(sampleLeads);

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${leads.length} leads`,
      data: {
        count: leads.length,
      },
    });
  } catch (error) {
    console.error('Error seeding database:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to seed database',
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

    // Get current lead count
    const count = await Lead.countDocuments();

    return NextResponse.json({
      success: true,
      data: {
        currentCount: count,
        sampleDataAvailable: sampleLeads.length,
      },
      message: `Database currently has ${count} leads`,
    });
  } catch (error) {
    console.error('Error checking database:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to check database',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}