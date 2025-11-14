# Architecture Overview

## System Design

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Browser                          │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐  │
│  │  Map Canvas  │  │  Form/Edit   │  │  Document Preview   │  │
│  │  (Mapbox GL) │  │   Panels     │  │  (PDF/DOCX/XLS)    │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬──────────┘  │
│         │                 │                      │              │
│         └─────────────────┴──────────────────────┘              │
│                           │                                     │
│                    React Application                            │
│                    (TypeScript + Vite)                          │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ HTTPS/WebSocket
                            │
┌───────────────────────────┴─────────────────────────────────────┐
│                      API Gateway / Load Balancer                │
└───────────────────────────┬─────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌──────▼──────┐  ┌────────▼─────────┐
│  Express API   │  │   GraphQL   │  │  WebSocket       │
│  (REST)        │  │   Server    │  │  (Real-time)     │
└───────┬────────┘  └──────┬──────┘  └────────┬─────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
┌───────▼────────┐                    ┌────────▼─────────┐
│  PostgreSQL    │                    │  Redis Cache     │
│  + PostGIS     │                    │  + Session Store │
└───────┬────────┘                    └──────────────────┘
        │
        │ Spatial queries
        │
┌───────▼────────────────────────────────────────────────┐
│              Data Processing Layer                     │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ GTFS Parser │  │  ML Engine   │  │  Doc Gen     │ │
│  │  (Node.js)  │  │  (Python)    │  │  (Node.js)   │ │
│  └─────────────┘  └──────────────┘  └──────────────┘ │
└────────────────────────────────────────────────────────┘
```

## Data Models

### Core Entities

#### 1. Projects
```typescript
interface Project {
  id: string;
  name: string;
  description: string;
  bounds: GeoJSONPolygon; // Geographic extent
  createdAt: Date;
  updatedAt: Date;
  owner: User;
  collaborators: User[];
  layers: Layer[];
  gtfsFeeds: GTFSFeed[];
}
```

#### 2. Layers
```typescript
interface Layer {
  id: string;
  projectId: string;
  name: string;
  type: 'vector' | 'raster' | 'gtfs' | 'analysis';
  source: DataSource;
  style: MapboxStyle;
  visible: boolean;
  opacity: number;
  features: Feature[];
}
```

#### 3. GTFS Feed
```typescript
interface GTFSFeed {
  id: string;
  projectId: string;
  agencyName: string;
  feedUrl: string;
  importedAt: Date;
  validFrom: Date;
  validUntil: Date;
  routes: Route[];
  stops: Stop[];
  trips: Trip[];
  stopTimes: StopTime[];
  shapes: Shape[];
}
```

#### 4. Planning Documents
```typescript
interface PlanningDocument {
  id: string;
  projectId: string;
  type: 'comprehensive-plan' | 'zoning-report' | 'impact-assessment' | 'custom';
  template: DocumentTemplate;
  data: Record<string, any>;
  generatedAt: Date;
  format: 'pdf' | 'docx' | 'xlsx';
  status: 'draft' | 'final' | 'archived';
}
```

## Feature Modules

### 1. Mapping Module (`apps/web/src/features/mapping`)

**Responsibilities:**
- Base map rendering (Mapbox GL)
- Layer management and styling
- Drawing/editing tools
- Geocoding and search
- 3D visualization (Deck.gl)

**Key Components:**
```typescript
// MapCanvas.tsx - Main map component
// LayerControl.tsx - Layer visibility and styling
// DrawingTools.tsx - Polygon, line, point tools
// FeatureInfo.tsx - Click/hover information panels
```

### 2. GTFS Module (`apps/web/src/features/gtfs`)

**Responsibilities:**
- GTFS feed import and validation
- Route/stop visualization
- Service pattern analysis
- Schedule visualization
- Network connectivity metrics

**Key Components:**
```typescript
// GTFSImporter.tsx - Upload and import UI
// RouteViewer.tsx - Display routes on map
// StopBrowser.tsx - Browse and filter stops
// ScheduleGrid.tsx - Timetable display
// NetworkAnalysis.tsx - Coverage and connectivity
```

**GTFS Data Flow:**
```
1. User uploads GTFS.zip
2. Backend extracts and validates files
3. Parse CSV files (routes, stops, trips, etc.)
4. Store in PostgreSQL with PostGIS geometry
5. Generate spatial indices
6. Expose via API endpoints
7. Frontend fetches and renders on map
```

### 3. Document Generation Module (`apps/web/src/features/documents`)

**Responsibilities:**
- Template management
- Data binding and population
- PDF/DOCX/XLSX generation
- Map snapshot embedding
- Chart and table generation

**Key Components:**
```typescript
// TemplateSelector.tsx - Choose document type
// DocumentEditor.tsx - Configure template data
// MapSnapshot.tsx - Export current map view
// ChartBuilder.tsx - Create embedded charts
// DocumentPreview.tsx - Preview before export
```

**Document Generation Flow:**
```
1. User selects template
2. Fill in required data fields
3. Select maps/charts to include
4. Backend renders template with data
5. Generate map snapshots
6. Create charts from analysis data
7. Assemble final document
8. Return download link
```

### 4. Forecasting Module (`apps/web/src/features/forecasting`)

**Responsibilities:**
- Ridership prediction models
- Demographic data integration
- Land use analysis
- Scenario comparison
- Sensitivity analysis

**Models:**
```typescript
// Direct Demand Model
ridership = f(population, employment, density, transit_access)

// Four-Step Model (simplified)
1. Trip Generation
2. Trip Distribution
3. Mode Choice
4. Route Assignment

// Machine Learning Model
- Features: demographics, land use, existing transit, walk scores
- Target: boardings per stop/route
- Algorithm: Random Forest / Gradient Boosting
```

## Database Schema (Prisma)

```prisma
// prisma/schema.prisma

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  projects  Project[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Project {
  id          String   @id @default(cuid())
  name        String
  description String?
  bounds      Json     // GeoJSON polygon
  ownerId     String
  owner       User     @relation(fields: [ownerId], references: [id])
  layers      Layer[]
  gtfsFeeds   GTFSFeed[]
  documents   Document[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Layer {
  id        String   @id @default(cuid())
  projectId String
  project   Project  @relation(fields: [projectId], references: [id])
  name      String
  type      String
  source    Json
  style     Json
  visible   Boolean  @default(true)
  opacity   Float    @default(1.0)
  features  Feature[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Feature {
  id         String   @id @default(cuid())
  layerId    String
  layer      Layer    @relation(fields: [layerId], references: [id])
  geometry   Json     // GeoJSON geometry
  properties Json     // Feature properties
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

model GTFSFeed {
  id          String   @id @default(cuid())
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id])
  agencyName  String
  feedUrl     String?
  validFrom   DateTime
  validUntil  DateTime
  routes      GTFSRoute[]
  stops       GTFSStop[]
  importedAt  DateTime @default(now())
}

model GTFSRoute {
  id            String   @id @default(cuid())
  feedId        String
  feed          GTFSFeed @relation(fields: [feedId], references: [id])
  routeId       String   // GTFS route_id
  routeShortName String?
  routeLongName  String?
  routeType      Int
  routeColor     String?
  geometry       Json?    // LineString from shapes.txt
}

model GTFSStop {
  id           String   @id @default(cuid())
  feedId       String
  feed         GTFSFeed @relation(fields: [feedId], references: [id])
  stopId       String   // GTFS stop_id
  stopName     String
  stopLat      Float
  stopLon      Float
  locationType Int?
  parentStation String?

  @@index([stopLat, stopLon]) // Spatial queries
}

model Document {
  id          String   @id @default(cuid())
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id])
  type        String
  templateId  String
  data        Json
  fileUrl     String?
  status      String   @default("draft")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## API Endpoints

### REST API

```typescript
// Projects
GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PUT    /api/projects/:id
DELETE /api/projects/:id

// Layers
GET    /api/projects/:id/layers
POST   /api/projects/:id/layers
PUT    /api/layers/:id
DELETE /api/layers/:id

// Features
GET    /api/layers/:id/features
POST   /api/layers/:id/features
PUT    /api/features/:id
DELETE /api/features/:id

// GTFS
POST   /api/projects/:id/gtfs/import
GET    /api/projects/:id/gtfs/feeds
GET    /api/gtfs/:feedId/routes
GET    /api/gtfs/:feedId/stops
GET    /api/gtfs/:feedId/stops/nearby?lat=X&lon=Y&radius=500
POST   /api/gtfs/:feedId/analyze

// Documents
GET    /api/projects/:id/documents
POST   /api/projects/:id/documents/generate
GET    /api/documents/:id/download

// Forecasting
POST   /api/forecasting/ridership
POST   /api/forecasting/scenarios/compare
```

### GraphQL Schema

```graphql
type Query {
  project(id: ID!): Project
  projects: [Project!]!
  gtfsFeed(id: ID!): GTFSFeed
  route(id: ID!): Route
  stopsNearby(lat: Float!, lon: Float!, radius: Int!): [Stop!]!
}

type Mutation {
  createProject(input: CreateProjectInput!): Project!
  importGTFS(projectId: ID!, url: String!): GTFSFeed!
  generateDocument(projectId: ID!, template: String!): Document!
  forecastRidership(input: ForecastInput!): ForecastResult!
}

type Subscription {
  gtfsImportProgress(feedId: ID!): ImportProgress!
  documentGenerationProgress(docId: ID!): GenerationProgress!
}
```

## Technology Deep Dives

### GTFS Processing Pipeline

**Libraries:**
- `gtfs-via-postgres`: Import GTFS into PostgreSQL
- `node-gtfs`: Query and analyze GTFS data
- `gtfs-realtime-bindings`: Handle real-time transit updates

**Process:**
```typescript
// packages/gtfs-parser/src/importer.ts

import { parseGTFS } from './parser';
import { validateGTFS } from './validator';
import { storeGTFS } from './storage';

export async function importGTFSFeed(zipUrl: string, projectId: string) {
  // 1. Download and extract GTFS ZIP
  const files = await downloadAndExtract(zipUrl);

  // 2. Validate required files
  const validation = await validateGTFS(files);
  if (!validation.valid) {
    throw new Error(`Invalid GTFS: ${validation.errors.join(', ')}`);
  }

  // 3. Parse CSV files
  const data = await parseGTFS(files);

  // 4. Build spatial geometries
  const enriched = await buildGeometries(data);

  // 5. Store in database
  const feedId = await storeGTFS(enriched, projectId);

  // 6. Generate indices and statistics
  await generateIndices(feedId);

  return feedId;
}
```

### Document Generation

**Templates:**
```typescript
// packages/doc-generator/templates/comprehensive-plan.ts

export const comprehensivePlanTemplate = {
  name: 'Comprehensive Plan',
  sections: [
    {
      title: 'Executive Summary',
      content: '{{executiveSummary}}',
    },
    {
      title: 'Demographics',
      charts: ['populationTrend', 'ageDist'],
      tables: ['demographicTable'],
    },
    {
      title: 'Land Use',
      maps: ['existingLandUse', 'proposedLandUse'],
      content: '{{landUseNarrative}}',
    },
    {
      title: 'Transportation',
      maps: ['transitNetwork', 'roadNetwork'],
      charts: ['modeShare', 'trafficVolumes'],
      content: '{{transportationNarrative}}',
    },
    {
      title: 'Recommendations',
      content: '{{recommendations}}',
    },
  ],
};
```

### Ridership Forecasting

**Direct Demand Model:**
```typescript
// packages/forecasting/src/models/direct-demand.ts

export function calculateRidership(params: {
  population: number;
  employment: number;
  density: number; // people per sq km
  transitAccess: number; // % within 400m of stop
  frequency: number; // vehicles per hour
  landUseMix: number; // 0-1 diversity index
}) {
  const baseRate = 0.15; // trips per capita per day

  const populationFactor = params.population * baseRate;
  const densityMultiplier = 1 + (params.density / 10000) * 0.5;
  const accessMultiplier = 1 + (params.transitAccess / 100) * 0.8;
  const frequencyMultiplier = 1 + Math.log(params.frequency) * 0.3;
  const mixedUseBonus = params.landUseMix * 0.2;

  const dailyRidership = populationFactor
    * densityMultiplier
    * accessMultiplier
    * frequencyMultiplier
    * (1 + mixedUseBonus);

  return {
    daily: Math.round(dailyRidership),
    annual: Math.round(dailyRidership * 300), // 300 service days
    confidence: calculateConfidence(params),
  };
}
```

## Performance Considerations

### Frontend Optimization
- **Large datasets**: Use deck.gl for rendering 100k+ features
- **Map tiles**: Cache Mapbox vector tiles
- **State management**: Virtualize large lists, lazy load layers
- **Bundle size**: Code split by route, lazy load heavy deps

### Backend Optimization
- **Spatial queries**: Use PostGIS spatial indices
- **GTFS queries**: Materialize common views (routes with shapes)
- **Caching**: Redis for frequently accessed data
- **Document generation**: Queue system for long-running tasks

### Database Optimization
```sql
-- Create spatial index on stops
CREATE INDEX idx_gtfs_stops_geom
ON gtfs_stops USING GIST (ST_SetSRID(ST_MakePoint(stop_lon, stop_lat), 4326));

-- Create index on route lookup
CREATE INDEX idx_gtfs_routes_feed_route
ON gtfs_routes (feed_id, route_id);

-- Materialized view for route geometries
CREATE MATERIALIZED VIEW route_geometries AS
SELECT
  r.id,
  r.route_id,
  ST_MakeLine(
    ST_SetSRID(ST_MakePoint(s.shape_pt_lon, s.shape_pt_lat), 4326)
    ORDER BY s.shape_pt_sequence
  ) as geometry
FROM gtfs_routes r
JOIN gtfs_shapes s ON r.route_id = s.route_id
GROUP BY r.id, r.route_id;
```

## Deployment Architecture

### Development
```yaml
# docker-compose.yml
version: '3.8'
services:
  db:
    image: postgis/postgis:15-3.3
    environment:
      POSTGRES_DB: urbanplanner
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  api:
    build: ./apps/api
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://dev:dev@db:5432/urbanplanner
      REDIS_URL: redis://redis:6379
    depends_on:
      - db
      - redis

  web:
    build: ./apps/web
    ports:
      - "5173:5173"
    environment:
      VITE_API_URL: http://localhost:3000

volumes:
  pgdata:
```

### Production
- **Frontend**: Vercel or Cloudflare Pages
- **Backend API**: Railway, Render, or AWS ECS
- **Database**: AWS RDS PostgreSQL with PostGIS or Supabase
- **Cache**: AWS ElastiCache Redis or Upstash
- **Storage**: AWS S3 or Cloudflare R2
- **CDN**: Cloudflare for map tiles and assets

## Next Steps

1. **Set up development environment** (Docker Compose)
2. **Initialize database** with Prisma migrations
3. **Build basic map interface** with Mapbox GL
4. **Implement GTFS importer** with validation
5. **Create first document template** (PDF report)
6. **Develop simple ridership model** (direct demand)
