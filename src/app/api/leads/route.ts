import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Lead from '@/lib/models/Lead';
import { LeadsResponse, Pagination } from '@/lib/types/lead';
import {
  parseQueryParams,
  buildFilterQuery,
  buildSortQuery,
  validateFilters,
} from '@/lib/utils/filters';

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const { filters, sort, page, limit } = parseQueryParams(searchParams);

    // Validate filters
    const validationErrors = validateFilters(filters);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Invalid filter parameters',
            details: validationErrors,
          },
        },
        { status: 400 }
      );
    }

    // Build MongoDB query
    const query = buildFilterQuery(filters);
    const sortQuery = buildSortQuery(sort);

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute queries in parallel for better performance
    const [leads, totalCount] = await Promise.all([
      Lead.find(query)
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .lean(), // Use lean() for better performance when we don't need Mongoose document methods
      Lead.countDocuments(query),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const pagination: Pagination = {
      page,
      limit,
      total: totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };

    // Prepare response - handle both field name formats
    const response: LeadsResponse = {
      leads: leads.map((lead: any) => ({
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
      })),
      pagination,
      filters,
      sort,
    };

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to fetch leads',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    // Parse request body
    const body = await request.json();

    // Validate required fields
    if (!body.advertiser || !body.library_id || !body.service) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Missing required fields',
            details: 'advertiser, library_id, and service are required',
          },
        },
        { status: 400 }
      );
    }

    // Create new lead
    const lead = new Lead(body);
    await lead.save();

    return NextResponse.json({
      success: true,
      data: {
        lead: {
          ...lead.toObject(),
          _id: lead._id.toString(),
        },
      },
      message: 'Lead created successfully',
    });
  } catch (error) {
    console.error('Error creating lead:', error);

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

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to create lead',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}