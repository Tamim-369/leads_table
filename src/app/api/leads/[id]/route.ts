import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Lead, { LeadStatus } from '@/lib/models/Lead';
import { UpdateLeadInput } from '@/lib/types/lead';
import mongoose from 'mongoose';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Connect to database
    await connectDB();

    const { id } = await params;

    // Find by library_id (your unique identifier) or _id
    let lead;
    if (mongoose.Types.ObjectId.isValid(id)) {
      lead = await Lead.findById(id).lean();
    } else {
      // Try to find by library_id (your Python system's unique identifier)
      lead = await Lead.findOne({ library_id: id }).lean();
    }

    if (!lead) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Lead not found',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        lead: {
          ...(lead as any),
          _id: String((lead as any)._id),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching lead:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to fetch lead',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Connect to database
    await connectDB();

    const { id } = await params;

    // Parse request body
    const body: Partial<UpdateLeadInput> = await request.json();

    // Remove _id from update data if present
    delete body._id;

    // Validate status if provided
    if (body.status && !Object.values(LeadStatus).includes(body.status)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Invalid status value',
            details: `Status must be one of: ${Object.values(LeadStatus).join(', ')}`,
          },
        },
        { status: 400 }
      );
    }

    // Validate probability if provided
    if (body.probability !== undefined) {
      if (body.probability < 0 || body.probability > 100) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'Invalid probability value',
              details: 'Probability must be between 0 and 100',
            },
          },
          { status: 400 }
        );
      }
    }

    // Find by library_id (your unique identifier) or _id
    const query = mongoose.Types.ObjectId.isValid(id) 
      ? { _id: id } 
      : { library_id: id };

    // Update lead with optimistic concurrency control
    const updatedLead = await Lead.findOneAndUpdate(
      query,
      { 
        ...body,
        updated_at: new Date(),
      },
      {
        new: true, // Return updated document
        runValidators: true, // Run schema validators
        lean: true, // Return plain object for better performance
      }
    );

    if (!updatedLead) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Lead not found',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        lead: {
          ...(updatedLead as any),
          _id: String((updatedLead as any)._id),
        },
      },
      message: 'Lead updated successfully',
    });
  } catch (error) {
    console.error('Error updating lead:', error);

    // Handle validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Validation error',
            details: error.message,
          },
        },
        { status: 400 }
      );
    }

    // Handle cast errors (invalid ObjectId, etc.)
    if (error instanceof Error && error.name === 'CastError') {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Invalid data format',
            details: error.message,
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to update lead',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Connect to database
    await connectDB();

    const { id } = await params;

    // Find by library_id (your unique identifier) or _id
    const query = mongoose.Types.ObjectId.isValid(id) 
      ? { _id: id } 
      : { library_id: id };

    // Delete lead
    const deletedLead = await Lead.findOneAndDelete(query);

    if (!deletedLead) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Lead not found',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Lead deleted successfully',
      data: {
        deletedId: id,
        library_id: deletedLead.library_id,
      },
    });
  } catch (error) {
    console.error('Error deleting lead:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to delete lead',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}