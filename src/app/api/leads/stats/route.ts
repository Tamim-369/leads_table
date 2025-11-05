import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Lead from '@/lib/models/Lead';

export async function GET() {
  try {
    // Connect to database
    await connectDB();

    // Stats matching your Python get_stats method
    const pipeline = [
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ];

    const statusStats = await Lead.aggregate(pipeline);
    
    // Convert to object format like your Python method
    const stats: Record<string, number> = {};
    let total = 0;
    
    for (const item of statusStats) {
      stats[item._id] = item.count;
      total += item.count;
    }
    
    stats.total = total;

    // Additional useful stats
    const [
      highPriorityCount,
      withContactCount,
      avgProbability,
    ] = await Promise.all([
      Lead.countDocuments({ probability: { $gte: 70 } }),
      Lead.countDocuments({ contact: { $nin: ['', null] } }),
      Lead.aggregate([
        { $group: { _id: null, avg: { $avg: '$probability' } } }
      ]).then(result => result[0]?.avg || 0),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        statusBreakdown: stats,
        summary: {
          total,
          highPriority: highPriorityCount,
          withContact: withContactCount,
          averageProbability: Math.round(avgProbability),
        },
      },
      message: `Statistics for ${total} leads`,
    });
  } catch (error) {
    console.error('Error getting stats:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to get statistics',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}