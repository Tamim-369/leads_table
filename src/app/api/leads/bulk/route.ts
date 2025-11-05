import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Lead, { LeadStatus } from '@/lib/models/Lead';
import { BulkStatusUpdate, BulkDelete } from '@/lib/types/lead';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    // Parse request body
    const body = await request.json();
    const { action, ...data } = body;

    if (!action) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Action is required',
            details: 'Specify action: "updateStatus" or "delete"',
          },
        },
        { status: 400 }
      );
    }

    switch (action) {
      case 'updateStatus':
        return await handleBulkStatusUpdate(data);
      case 'delete':
        return await handleBulkDelete(data);
      default:
        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'Invalid action',
              details: 'Action must be "updateStatus" or "delete"',
            },
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in bulk operation:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Bulk operation failed',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}

async function handleBulkStatusUpdate(data: BulkStatusUpdate) {
  const { leadIds, newStatus } = data;

  // Validate input
  if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Invalid lead IDs',
          details: 'leadIds must be a non-empty array',
        },
      },
      { status: 400 }
    );
  }

  if (!newStatus || !Object.values(LeadStatus).includes(newStatus)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Invalid status',
          details: `Status must be one of: ${Object.values(LeadStatus).join(', ')}`,
        },
      },
      { status: 400 }
    );
  }

  // Validate all IDs are valid ObjectIds
  const invalidIds = leadIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
  if (invalidIds.length > 0) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Invalid lead ID format',
          details: `Invalid IDs: ${invalidIds.join(', ')}`,
        },
      },
      { status: 400 }
    );
  }

  try {
    // Use session for transaction to ensure data consistency
    const session = await mongoose.startSession();
    
    let result: any = null;
    await session.withTransaction(async () => {
      result = await Lead.updateMany(
        { _id: { $in: leadIds } },
        { 
          status: newStatus,
          updated_at: new Date(),
        },
        { session }
      );
    });

    await session.endSession();

    return NextResponse.json({
      success: true,
      data: {
        modifiedCount: result?.modifiedCount || 0,
        matchedCount: result?.matchedCount || 0,
      },
      message: `Successfully updated ${result?.modifiedCount || 0} lead(s) to ${newStatus}`,
    });
  } catch (error) {
    console.error('Error in bulk status update:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to update lead statuses',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}

async function handleBulkDelete(data: BulkDelete) {
  const { leadIds } = data;

  // Validate input
  if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Invalid lead IDs',
          details: 'leadIds must be a non-empty array',
        },
      },
      { status: 400 }
    );
  }

  // Validate all IDs are valid ObjectIds
  const invalidIds = leadIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
  if (invalidIds.length > 0) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Invalid lead ID format',
          details: `Invalid IDs: ${invalidIds.join(', ')}`,
        },
      },
      { status: 400 }
    );
  }

  // Safety check: limit bulk delete to prevent accidental mass deletion
  if (leadIds.length > 100) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Too many leads selected',
          details: 'Bulk delete is limited to 100 leads at a time for safety',
        },
      },
      { status: 400 }
    );
  }

  try {
    // Use session for transaction
    const session = await mongoose.startSession();
    
    let result: any = null;
    await session.withTransaction(async () => {
      result = await Lead.deleteMany(
        { _id: { $in: leadIds } },
        { session }
      );
    });

    await session.endSession();

    return NextResponse.json({
      success: true,
      data: {
        deletedCount: result?.deletedCount || 0,
      },
      message: `Successfully deleted ${result?.deletedCount || 0} lead(s)`,
    });
  } catch (error) {
    console.error('Error in bulk delete:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to delete leads',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve bulk operation status or history
export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'stats') {
      // Return statistics for bulk operations
      const stats = await Lead.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: null,
            totalLeads: { $sum: '$count' },
            statusBreakdown: {
              $push: {
                status: '$_id',
                count: '$count',
              },
            },
          },
        },
      ]);

      return NextResponse.json({
        success: true,
        data: stats[0] || { totalLeads: 0, statusBreakdown: [] },
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Invalid action',
          details: 'Supported actions: stats',
        },
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in bulk GET operation:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to retrieve bulk operation data',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}