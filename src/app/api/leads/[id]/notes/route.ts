import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Lead from '@/lib/models/Lead';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Connect to database
    await connectDB();

    const { id } = await params;
    const body = await request.json();
    const { text, status } = body;

    if (!text || !text.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Note text is required',
          },
        },
        { status: 400 }
      );
    }

    // Create the note object matching your Python structure
    const note = {
      text: text.trim(),
      at: new Date(),
    };

    // Build update object
    const updateObj: any = {
      updated_at: new Date(),
      $push: { notes: note },
    };

    // If status is provided, update it too (matching your Python update_status method)
    if (status) {
      updateObj.status = status;
    }

    // Find by library_id (your unique identifier) or _id
    const query = id.match(/^[0-9a-fA-F]{24}$/) 
      ? { _id: id } 
      : { library_id: id };

    const updatedLead = await Lead.findOneAndUpdate(
      query,
      updateObj,
      { new: true, lean: true }
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
        addedNote: note,
      },
      message: 'Note added successfully',
    });
  } catch (error) {
    console.error('Error adding note:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to add note',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}