import { LeadStatusType, AdSpendIntensityType, RiskLevelType, LeadNote } from '../models/Lead';

// Core Lead interface (without Mongoose Document properties)
export interface Lead {
  _id: string;
  advertiser: string;
  facebook_link: string;
  website_link: string;
  contact: string;
  library_id: string;
  probability: number;
  service: string;
  reasoning: string;
  issues: string;
  estimated_daily_orders: string;
  ad_spend_intensity: AdSpendIntensityType;
  cart_abandon_risk: RiskLevelType;
  estimated_monthly_revenue: string;
  dm_open_rate_prediction: string;
  status: LeadStatusType;
  tags: string[];
  pitch: string;
  whatsapp_link: string;
  notes: LeadNote[]; // Changed to match your Python structure
  created_at: Date;
  updated_at: Date;
  // Support legacy field names
  'Est. Daily Orders'?: string;
  'Ad Spend Intensity'?: AdSpendIntensityType;
  'Cart Abandon Risk'?: RiskLevelType;
  'Est. Monthly Revenue'?: string;
  'DM Open Rate Prediction'?: string;
  [key: string]: any; // Allow additional fields
}

// Lead creation interface (without auto-generated fields)
export interface CreateLeadInput {
  advertiser: string;
  facebook_link?: string;
  website_link?: string;
  contact?: string;
  library_id: string;
  probability?: number;
  service: string;
  reasoning?: string;
  issues?: string;
  estimated_daily_orders?: string;
  ad_spend_intensity?: AdSpendIntensityType;
  cart_abandon_risk?: RiskLevelType;
  estimated_monthly_revenue?: string;
  dm_open_rate_prediction?: string;
  status?: LeadStatusType;
  tags?: string[];
  pitch?: string;
  whatsapp_link?: string;
  notes?: string[];
}

// Lead update interface (all fields optional except id)
export interface UpdateLeadInput {
  _id: string;
  advertiser?: string;
  facebook_link?: string;
  website_link?: string;
  contact?: string;
  library_id?: string;
  probability?: number;
  service?: string;
  reasoning?: string;
  issues?: string;
  estimated_daily_orders?: string;
  ad_spend_intensity?: AdSpendIntensityType;
  cart_abandon_risk?: RiskLevelType;
  estimated_monthly_revenue?: string;
  dm_open_rate_prediction?: string;
  status?: LeadStatusType;
  tags?: string[];
  pitch?: string;
  whatsapp_link?: string;
  notes?: string[];
}

// Pagination interface
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Filter interfaces
export interface LeadFilters {
  search?: string;
  status?: LeadStatusType[];
  probabilityRange?: [number, number];
  serviceTypes?: string[];
  adSpendIntensity?: AdSpendIntensityType[];
  cartAbandonRisk?: RiskLevelType[];
  dateRange?: {
    start?: Date;
    end?: Date;
  };
}

// Sort interface
export interface SortOptions {
  field: keyof Lead;
  direction: 'asc' | 'desc';
}

// Multi-sort interface
export interface MultiSortOptions {
  sorts: SortOptions[];
}

// API Response interfaces
export interface LeadsResponse {
  leads: Lead[];
  pagination: Pagination;
  filters?: LeadFilters;
  sort?: SortOptions | MultiSortOptions;
}

export interface LeadResponse {
  lead: Lead;
  success: boolean;
  message?: string;
}

export interface BulkUpdateResponse {
  modifiedCount: number;
  success: boolean;
  message: string;
}

export interface BulkDeleteResponse {
  deletedCount: number;
  success: boolean;
  message: string;
}

// Analytics interfaces
export interface LeadMetrics {
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  qualifiedLeads: number;
  closedWonLeads: number;
  closedLostLeads: number;
  clientLeads: number;
  averageProbability: number;
  totalRevenuePotential: number;
  conversionRate: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

export interface ServiceTypeDistribution {
  service: string;
  count: number;
  percentage: number;
}

export interface ProbabilityDistribution {
  range: string;
  count: number;
  percentage: number;
}

export interface MonthlyTrend {
  month: string;
  leads: number;
  revenue: number;
}

export interface LeadSourceDistribution {
  source: string;
  count: number;
  percentage: number;
}

export interface AnalyticsData {
  metrics: LeadMetrics;
  statusDistribution: StatusDistribution[];
  serviceTypeDistribution: ServiceTypeDistribution[];
  probabilityDistribution: ProbabilityDistribution[];
  monthlyTrends: MonthlyTrend[];
  leadSourceDistribution: LeadSourceDistribution[];
}

// Export functionality interfaces
export interface ExportOptions {
  format: 'csv' | 'excel';
  fields?: (keyof Lead)[];
  filters?: LeadFilters;
  selectedIds?: string[];
}

export interface ExportResponse {
  success: boolean;
  downloadUrl?: string;
  filename?: string;
  message?: string;
}

// Bulk operations interfaces
export interface BulkStatusUpdate {
  leadIds: string[];
  newStatus: LeadStatusType;
}

export interface BulkDelete {
  leadIds: string[];
}

// Table configuration interfaces
export interface ColumnConfig {
  key: keyof Lead;
  label: string;
  visible: boolean;
  sortable: boolean;
  width?: number;
  order: number;
}

export interface TablePreferences {
  columns: ColumnConfig[];
  pageSize: number;
  defaultSort?: SortOptions;
}

// Search and filter state interfaces
export interface SearchState {
  query: string;
  isSearching: boolean;
  results: Lead[];
}

export interface FilterState {
  activeFilters: LeadFilters;
  isFiltering: boolean;
  filterCount: number;
}

// UI State interfaces
export interface UIState {
  selectedLeads: string[];
  isSelectAll: boolean;
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  pageSize: number;
}

// API Error interface
export interface APIError {
  message: string;
  code?: string;
  details?: any;
}

// Generic API Response wrapper
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: APIError;
  message?: string;
}