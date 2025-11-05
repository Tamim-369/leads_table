import mongoose, { Schema, Document } from 'mongoose';

// Status enum matching your Python LeadStatus
export const LeadStatus = {
    NEW: 'new',
    CONTACTED: 'contacted',
    QUALIFIED: 'qualified',
    PROPOSAL_SENT: 'proposal_sent',
    CLOSED_WON: 'closed_won',
    CLOSED_LOST: 'closed_lost',
    CLIENT: 'client', // Added CLIENT status from your Python enum
} as const;

export type LeadStatusType = (typeof LeadStatus)[keyof typeof LeadStatus];

// Ad Spend Intensity enum
export const AdSpendIntensity = {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
} as const;

export type AdSpendIntensityType =
    (typeof AdSpendIntensity)[keyof typeof AdSpendIntensity];

// Risk Level enum
export const RiskLevel = {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
} as const;

export type RiskLevelType = (typeof RiskLevel)[keyof typeof RiskLevel];

// Note structure matching your Python schema
export interface LeadNote {
    text: string;
    at: Date;
}

// Lead interface matching your Python schema exactly
export interface ILead extends Document {
    _id: string;
    advertiser: string;
    facebook_link: string;
    website_link: string;
    contact: string;
    library_id: string; // This is your unique identifier
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
    __v: number; // Version key for optimistic concurrency
    // Support legacy field names from existing data
    'Est. Daily Orders'?: string;
    'Ad Spend Intensity'?: AdSpendIntensityType;
    'Cart Abandon Risk'?: RiskLevelType;
    'Est. Monthly Revenue'?: string;
    'DM Open Rate Prediction'?: string;
    [key: string]: any; // Allow additional fields
}

// Schema matching your Python validation exactly
const leadSchema = new Schema(
    {
        // Required fields (matching your Python required list)
        advertiser: { type: String, required: true, trim: true },
        library_id: { type: String, required: true, unique: true }, // Your unique identifier
        service: { type: String, required: true, trim: true },
        probability: { type: Number, required: true, min: 0, max: 100, default: 0 },

        // Optional string fields
        facebook_link: { type: String, trim: true },
        website_link: { type: String, trim: true },
        contact: { type: String, trim: true },
        reasoning: { type: String, trim: true },
        issues: { type: String, trim: true },
        pitch: { type: String, trim: true },
        whatsapp_link: { type: String, trim: true },

        // Enum fields with defaults
        status: {
            type: String,
            enum: Object.values(LeadStatus),
            default: LeadStatus.NEW
        },
        ad_spend_intensity: {
            type: String,
            enum: Object.values(AdSpendIntensity),
            default: AdSpendIntensity.LOW
        },
        cart_abandon_risk: {
            type: String,
            enum: Object.values(RiskLevel),
            default: RiskLevel.LOW
        },

        // String fields with defaults
        estimated_daily_orders: { type: String, default: 'Unknown' },
        estimated_monthly_revenue: { type: String, default: '< ৳150K' },
        dm_open_rate_prediction: { type: String, default: 'Low (<30%)' },

        // Array fields
        tags: { type: [String], default: [] },
        notes: [{
            text: { type: String, required: true },
            at: { type: Date, required: true }
        }],

        // Support legacy field names from existing data
        'Est. Daily Orders': String,
        'Ad Spend Intensity': String,
        'Cart Abandon Risk': String,
        'Est. Monthly Revenue': String,
        'DM Open Rate Prediction': String,
    },
    {
        collection: 'leads', // Use the same collection name as your Python script
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
        strict: false, // Allow additional fields from your existing data
        versionKey: '__v',
    }
);

// Indexes for performance optimization
leadSchema.index({ advertiser: 'text', service: 'text', reasoning: 'text' });
leadSchema.index({ status: 1, probability: -1 });
leadSchema.index({ created_at: -1 });
leadSchema.index({ updated_at: -1 });
leadSchema.index({ probability: -1 });

// Compound indexes for common query patterns
leadSchema.index({ status: 1, created_at: -1 });
leadSchema.index({ service: 1, probability: -1 });

// Virtual for formatted probability
leadSchema.virtual('probabilityFormatted').get(function () {
    return `${this.probability}%`;
});

// Virtual for contact display
leadSchema.virtual('contactDisplay').get(function () {
    if (!this.contact) return 'No contact';
    return this.contact;
});

// Instance method to check if lead is high priority
leadSchema.methods.isHighPriority = function () {
    return this.probability >= 70;
};

// Static method to find leads by status
leadSchema.statics.findByStatus = function (status: LeadStatusType) {
    return this.find({ status });
};

// Static method to find high probability leads
leadSchema.statics.findHighProbability = function (threshold = 70) {
    return this.find({ probability: { $gte: threshold } });
};

// Pre-save middleware to ensure data consistency
leadSchema.pre('save', function (next) {
    // Ensure probability is within valid range
    if (this.probability < 0) this.probability = 0;
    if (this.probability > 100) this.probability = 100;

    // Clean up empty strings in arrays
    if (this.tags) {
        this.tags = this.tags.filter((tag: string) => tag && tag.trim() !== '');
    }
    if (this.notes) {
        // Filter out invalid notes (notes should be objects with text and at fields)
        (this.notes as any) = this.notes.filter((note: any) =>
            note && (typeof note === 'object' ? note.text && note.text.trim() !== '' : false)
        );
    }

    next();
});

// Export the model with proper error handling
let Lead: mongoose.Model<ILead>;

try {
    // Try to get existing model first
    Lead = mongoose.model<ILead>('Lead');
} catch (error) {
    // Model doesn't exist, create it
    Lead = mongoose.model<ILead>('Lead', leadSchema);
}

export default Lead;