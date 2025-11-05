import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Lead from '@/lib/models/Lead';

export async function GET() {
  try {
    // Test database connection
    await connectDB();
    
    // Get basic stats
    const leadCount = await Lead.countDocuments();
    
    return NextResponse.json({
      success: true,
      message: 'API is healthy',
      data: {
        database: 'connected',
        leadCount,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}