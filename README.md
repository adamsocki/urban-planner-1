# Urban Planning Platform

A comprehensive web-based urban planning tool with GIS mapping, GTFS transit analysis, automated document generation, and ridership forecasting.

## Overview

This platform combines powerful geospatial visualization with transit planning and automated reporting capabilities, designed specifically for urban planners and municipal development teams.

## Key Features

### 🗺️ GIS Mapping & Visualization
- Interactive map interface with multiple base layer options
- Support for various geospatial formats (GeoJSON, Shapefiles, KML)
- Drawing and editing tools for zoning, parcels, and infrastructure
- 3D building visualization
- Layer management and styling

### 🚇 GTFS Transit Integration
- Import and visualize GTFS (General Transit Feed Specification) feeds
- Route and stop analysis
- Service pattern visualization
- Transit network connectivity analysis
- Multi-modal transit planning

### 📊 Ridership Forecasting
- Demographic-based ridership estimation
- Land use impact modeling
- Service frequency optimization
- Scenario comparison tools

### 📄 Document Generation
- Automated planning report templates
- Zoning compliance documents
- Public meeting materials
- Environmental impact assessments
- Custom template builder

### 🏙️ Urban Planning Tools
- Comprehensive plan development
- Zoning and land use management
- Infrastructure planning (utilities, roads, parks)
- Population density analysis
- Mixed-use development planning

## Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Mapping**: Mapbox GL JS / Leaflet
- **GIS Processing**: Turf.js
- **3D Visualization**: Deck.gl / CesiumJS
- **State Management**: Zustand / Redux Toolkit
- **UI Components**: shadcn/ui, Tailwind CSS

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express / Fastify
- **Database**: PostgreSQL 15+ with PostGIS extension
- **ORM**: Prisma / TypeORM
- **API**: REST + GraphQL (Apollo Server)

### GTFS & Transit
- **GTFS Parser**: gtfs-via-postgres / node-gtfs
- **Routing**: OpenTripPlanner integration
- **Transit Visualization**: Transitland API integration

### Document Generation
- **PDF**: jsPDF / PDFKit
- **Word/Excel**: docxtemplater / exceljs
- **Templates**: Handlebars / EJS
- **Reports**: Puppeteer for advanced layouts

### Forecasting & Analysis
- **ML/Statistics**: TensorFlow.js / ml.js
- **Data Analysis**: D3.js, Apache ECharts
- **Python Integration**: FastAPI microservice for complex models

### Infrastructure
- **Package Manager**: pnpm
- **Containerization**: Docker + Docker Compose
- **Deployment**: Vercel (frontend) + Railway/Render (backend)
- **Cache**: Redis
- **File Storage**: S3-compatible storage

## Project Structure

```
urban-planner/
├── apps/
│   ├── web/                 # Frontend React application
│   │   ├── src/
│   │   │   ├── components/  # React components
│   │   │   ├── features/    # Feature modules
│   │   │   │   ├── mapping/
│   │   │   │   ├── gtfs/
│   │   │   │   ├── documents/
│   │   │   │   ├── forecasting/
│   │   │   │   └── plans/
│   │   │   ├── hooks/       # Custom React hooks
│   │   │   ├── lib/         # Utilities
│   │   │   └── types/       # TypeScript types
│   │   └── public/
│   └── api/                 # Backend API server
│       ├── src/
│       │   ├── routes/
│       │   ├── services/
│       │   ├── models/
│       │   └── utils/
│       └── prisma/
├── packages/
│   ├── gtfs-parser/        # GTFS processing library
│   ├── doc-generator/      # Document generation templates
│   ├── forecasting/        # Ridership models
│   └── shared/             # Shared types and utilities
├── scripts/                # Build and deployment scripts
└── docker/                 # Docker configurations
```

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 15+ with PostGIS
- pnpm 8+
- Docker (optional)

### Installation

```bash
# Clone repository
git clone <repo-url>
cd urban-planner

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env

# Set up database
pnpm db:setup

# Start development servers
pnpm dev
```

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/urbanplanner
POSTGIS_VERSION=3.3

# Mapping
MAPBOX_TOKEN=your_mapbox_token
MAPTILER_KEY=your_maptiler_key

# APIs
GEOCODING_API_KEY=your_geocoding_key
TRANSITLAND_API_KEY=your_transitland_key

# Services
REDIS_URL=redis://localhost:6379
S3_BUCKET=your_bucket_name
```

## Core Workflows

### 1. Transit Planning with GTFS
```typescript
// Import GTFS feed
import { GTFSImporter } from '@/features/gtfs';

const importer = new GTFSImporter();
await importer.importFeed('https://example.com/gtfs.zip');

// Analyze routes
const analysis = await analyzeRoutes({
  feedId: 'agency-1',
  metrics: ['frequency', 'coverage', 'connectivity']
});
```

### 2. Document Generation
```typescript
// Generate planning report
import { ReportGenerator } from '@/features/documents';

const report = await ReportGenerator.create({
  template: 'comprehensive-plan',
  data: {
    project: projectData,
    maps: selectedMaps,
    gtfs: transitAnalysis
  },
  format: 'pdf'
});
```

### 3. Ridership Forecasting
```typescript
// Forecast ridership for new route
import { RidershipForecaster } from '@/features/forecasting';

const forecast = await RidershipForecaster.predict({
  route: newRouteGeometry,
  demographics: censusData,
  landUse: zoningData,
  existingService: gtfsData
});
```

## Development Roadmap

### Phase 1: Foundation (Months 1-2)
- [x] Project setup and architecture
- [ ] Basic GIS mapping interface
- [ ] User authentication and projects
- [ ] Database schema and API foundation

### Phase 2: Core Features (Months 3-4)
- [ ] GTFS import and visualization
- [ ] Drawing and editing tools
- [ ] Basic document templates
- [ ] Layer management system

### Phase 3: Advanced Features (Months 5-6)
- [ ] Ridership forecasting models
- [ ] 3D visualization
- [ ] Collaborative editing
- [ ] Advanced analytics dashboard

### Phase 4: Production Ready (Months 7-8)
- [ ] Performance optimization
- [ ] Mobile responsiveness
- [ ] API documentation
- [ ] Deployment and monitoring

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## License

MIT License - see [LICENSE](./LICENSE)

## Acknowledgments

- Inspired by [Placemark](https://github.com/placemark/placemark)
- Transit data standards from [Google GTFS](https://gtfs.org/)
- GIS capabilities powered by PostGIS and Mapbox
