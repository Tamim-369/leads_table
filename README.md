# Leads Management System

A comprehensive leads management system built with Next.js 14, featuring advanced filtering, search, analytics, and bulk operations.

## Features

- 📊 **Advanced Analytics** - Visual charts and key metrics
- 🔍 **Real-time Search** - Debounced search with highlighting
- 🎯 **Advanced Filtering** - Multiple filter types with visual chips
- 📱 **Responsive Design** - Works on desktop and mobile
- ⚡ **High Performance** - Virtual scrolling for large datasets
- 🔄 **Bulk Operations** - Update or delete multiple leads
- 📈 **Data Visualization** - Interactive charts with Recharts
- 🎨 **Modern UI** - Clean design with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB, Mongoose
- **UI Components**: Headless UI, Heroicons
- **Charts**: Recharts
- **Database**: MongoDB

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB Atlas (or local MongoDB)
- Python script for data ingestion (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd leads-table-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your MongoDB connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=Cluster0
   ```
   
   **Note**: The app connects to the `fb_leads` database and `leads` collection to work with your Python data pipeline.

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Working with Your Python Data Pipeline

This Next.js app is designed to work seamlessly with your Python lead generation system:

1. **Your Python script** populates the `fb_leads.leads` collection
2. **This Next.js app** provides the UI to view and manage those leads
3. **Both systems** use the same data structure and `library_id` as the unique identifier

#### API Endpoints Matching Your Python Methods

- `GET /api/leads/high-priority` - Get high-priority leads (matches `get_high_priority()`)
- `GET /api/leads/search?q=query` - Search leads (matches `search()`)
- `GET /api/leads/stats` - Get lead statistics (matches `get_stats()`)
- `POST /api/leads/[id]/notes` - Add notes to leads (matches `update_status()`)

#### Optional: Seed Sample Data

If you want to test with sample data:

```bash
curl -X POST http://localhost:3000/api/leads/seed
```

## API Endpoints

### Leads Management
- `GET /api/leads` - Get leads with pagination, filtering, and search
- `POST /api/leads` - Create a new lead
- `GET /api/leads/[id]` - Get a specific lead
- `PUT /api/leads/[id]` - Update a lead
- `DELETE /api/leads/[id]` - Delete a lead

### Bulk Operations
- `POST /api/leads/bulk` - Bulk update or delete leads

### Utilities
- `GET /api/health` - Health check and database status
- `POST /api/leads/seed` - Seed database with sample data

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── Analytics/         # Charts and metrics
│   ├── Filters/           # Filter components
│   ├── LeadsTable/        # Table components
│   ├── Search/            # Search components
│   └── UI/                # Reusable UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and configurations
│   ├── models/            # Database models
│   ├── types/             # TypeScript types
│   └── utils/             # Utility functions
```

## Key Features Explained

### Advanced Filtering
- Status-based filtering
- Probability range sliders
- Service type selection
- Date range filtering
- Visual filter chips

### Search Functionality
- Real-time search with 300ms debouncing
- Search across multiple fields
- Search term highlighting
- Search history

### Analytics Dashboard
- Key performance metrics
- Status distribution charts
- Service type analysis
- Probability distribution
- Revenue potential calculations

### Performance Optimizations
- Virtual scrolling for large datasets
- Debounced search and filters
- Optimistic UI updates
- Efficient database queries with indexes
- React.memo and useMemo optimizations

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

### Database Schema

The Lead model includes:
- Basic info (advertiser, contact, links)
- Business metrics (probability, revenue estimates)
- Status tracking
- Tags and notes
- Timestamps

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.# leads_table
