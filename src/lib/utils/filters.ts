import { LeadFilters, SortOptions } from '../types/lead';
import { LeadStatusType, AdSpendIntensityType, RiskLevelType } from '../models/Lead';

/**
 * Build MongoDB query from filters
 */
export function buildFilterQuery(filters: LeadFilters) {
  const query: any = {};

  // Text search across multiple fields
  if (filters.search && filters.search.trim()) {
    query.$or = [
      { advertiser: { $regex: filters.search, $options: 'i' } },
      { service: { $regex: filters.search, $options: 'i' } },
      { reasoning: { $regex: filters.search, $options: 'i' } },
      { contact: { $regex: filters.search, $options: 'i' } },
    ];
  }

  // Status filter
  if (filters.status && filters.status.length > 0) {
    query.status = { $in: filters.status };
  }

  // Probability range filter
  if (filters.probabilityRange) {
    const [min, max] = filters.probabilityRange;
    query.probability = { $gte: min, $lte: max };
  }

  // Service types filter
  if (filters.serviceTypes && filters.serviceTypes.length > 0) {
    query.service = { $in: filters.serviceTypes };
  }

  // Ad spend intensity filter
  if (filters.adSpendIntensity && filters.adSpendIntensity.length > 0) {
    query.ad_spend_intensity = { $in: filters.adSpendIntensity };
  }

  // Cart abandon risk filter
  if (filters.cartAbandonRisk && filters.cartAbandonRisk.length > 0) {
    query.cart_abandon_risk = { $in: filters.cartAbandonRisk };
  }

  // Date range filter
  if (filters.dateRange) {
    const dateQuery: any = {};
    if (filters.dateRange.start) {
      dateQuery.$gte = filters.dateRange.start;
    }
    if (filters.dateRange.end) {
      dateQuery.$lte = filters.dateRange.end;
    }
    if (Object.keys(dateQuery).length > 0) {
      query.created_at = dateQuery;
    }
  }

  return query;
}

/**
 * Build MongoDB sort object from sort options
 */
export function buildSortQuery(sort?: SortOptions | SortOptions[]) {
  if (!sort) {
    return { created_at: -1 }; // Default sort by newest first
  }

  if (Array.isArray(sort)) {
    // Multi-column sort
    const sortObj: any = {};
    sort.forEach((s) => {
      sortObj[s.field] = s.direction === 'asc' ? 1 : -1;
    });
    return sortObj;
  }

  // Single column sort
  return { [sort.field]: sort.direction === 'asc' ? 1 : -1 };
}

/**
 * Parse query parameters from URL search params
 */
export function parseQueryParams(searchParams: URLSearchParams): {
  filters: LeadFilters;
  sort?: SortOptions;
  page: number;
  limit: number;
} {
  const filters: LeadFilters = {};

  // Parse search
  const search = searchParams.get('search');
  if (search) {
    filters.search = search;
  }

  // Parse status filter
  const status = searchParams.get('status');
  if (status) {
    filters.status = status.split(',') as LeadStatusType[];
  }

  // Parse probability range
  const probMin = searchParams.get('probMin');
  const probMax = searchParams.get('probMax');
  if (probMin || probMax) {
    filters.probabilityRange = [
      probMin ? parseInt(probMin) : 0,
      probMax ? parseInt(probMax) : 100,
    ];
  }

  // Parse service types
  const serviceTypes = searchParams.get('serviceTypes');
  if (serviceTypes) {
    filters.serviceTypes = serviceTypes.split(',');
  }

  // Parse ad spend intensity
  const adSpendIntensity = searchParams.get('adSpendIntensity');
  if (adSpendIntensity) {
    filters.adSpendIntensity = adSpendIntensity.split(',') as AdSpendIntensityType[];
  }

  // Parse cart abandon risk
  const cartAbandonRisk = searchParams.get('cartAbandonRisk');
  if (cartAbandonRisk) {
    filters.cartAbandonRisk = cartAbandonRisk.split(',') as RiskLevelType[];
  }

  // Parse date range
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  if (startDate || endDate) {
    filters.dateRange = {};
    if (startDate) {
      filters.dateRange.start = new Date(startDate);
    }
    if (endDate) {
      filters.dateRange.end = new Date(endDate);
    }
  }

  // Parse sort
  let sort: SortOptions | undefined;
  const sortField = searchParams.get('sortField');
  const sortDirection = searchParams.get('sortDirection');
  if (sortField && sortDirection) {
    // Validate sort field is a valid Lead property
    const validSortFields = [
      '_id', 'advertiser', 'facebook_link', 'website_link', 'contact',
      'library_id', 'probability', 'service', 'reasoning', 'issues',
      'estimated_daily_orders', 'ad_spend_intensity', 'cart_abandon_risk',
      'estimated_monthly_revenue', 'dm_open_rate_prediction', 'status',
      'tags', 'pitch', 'whatsapp_link', 'notes', 'created_at', 'updated_at'
    ];
    
    if (validSortFields.includes(sortField)) {
      sort = {
        field: sortField as keyof import('../types/lead').Lead,
        direction: sortDirection as 'asc' | 'desc',
      };
    }
  }

  // Parse pagination
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(10, parseInt(searchParams.get('limit') || '50')));

  return { filters, sort, page, limit };
}

/**
 * Validate filter parameters
 */
export function validateFilters(filters: LeadFilters): string[] {
  const errors: string[] = [];

  // Validate probability range
  if (filters.probabilityRange) {
    const [min, max] = filters.probabilityRange;
    if (min < 0 || min > 100) {
      errors.push('Minimum probability must be between 0 and 100');
    }
    if (max < 0 || max > 100) {
      errors.push('Maximum probability must be between 0 and 100');
    }
    if (min > max) {
      errors.push('Minimum probability cannot be greater than maximum');
    }
  }

  // Validate date range
  if (filters.dateRange) {
    if (filters.dateRange.start && filters.dateRange.end) {
      if (filters.dateRange.start > filters.dateRange.end) {
        errors.push('Start date cannot be after end date');
      }
    }
  }

  return errors;
}

/**
 * Get unique service types for filter options
 */
export async function getUniqueServiceTypes() {
  const Lead = (await import('../models/Lead')).default;
  return Lead.distinct('service');
}

/**
 * Get filter statistics for UI
 */
export async function getFilterStats() {
  const Lead = (await import('../models/Lead')).default;
  
  const [
    totalLeads,
    statusCounts,
    serviceTypes,
    probabilityStats,
  ] = await Promise.all([
    Lead.countDocuments(),
    Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Lead.distinct('service'),
    Lead.aggregate([
      {
        $group: {
          _id: null,
          minProbability: { $min: '$probability' },
          maxProbability: { $max: '$probability' },
          avgProbability: { $avg: '$probability' },
        },
      },
    ]),
  ]);

  return {
    totalLeads,
    statusCounts,
    serviceTypes,
    probabilityStats: probabilityStats[0] || {
      minProbability: 0,
      maxProbability: 100,
      avgProbability: 0,
    },
  };
}