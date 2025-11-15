# Download & Setup Instructions

## What's Included

This archive contains a complete urban planning web platform with:

- **Frontend**: React + TypeScript + Vite
- **Backend**: Express API with document generation
- **Packages**:
  - `doc-generator` - PDF/DOCX generation for planning documents
  - `gtfs-parser` - GTFS transit data processing
- **Documentation**: 6 comprehensive guides
- **Examples**: 2 working document generation examples
- **Docker setup**: PostgreSQL + PostGIS + Redis

## Quick Start After Download

### 1. Extract the archive
```bash
tar -xzf urban-planner.tar.gz
cd urban-planner
```

### 2. Install dependencies
```bash
# Install pnpm if you don't have it
npm install -g pnpm

# Install all dependencies
pnpm install
```

### 3. Set up environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your Mapbox token
# Get one free at: https://account.mapbox.com/
nano .env
```

### 4. Start infrastructure (Docker)
```bash
# Start PostgreSQL, Redis, MinIO
docker-compose up -d
```

### 5. Run the app
```bash
# Start both frontend and backend
pnpm dev

# Or start separately:
cd apps/api && pnpm dev    # Backend on :3000
cd apps/web && pnpm dev    # Frontend on :5173
```

### 6. Try the examples
```bash
# Generate a transit analysis report
npx tsx examples/generate-transit-report.ts

# Generate a ridership forecast
npx tsx examples/generate-ridership-forecast.ts
```

## What You Can Do

### 1. Generate Planning Documents
- Open http://localhost:5173
- Select a template (Transit Analysis, Ridership Forecast, etc.)
- Fill in the form
- Download PDF or DOCX

### 2. Import GTFS Transit Data
```typescript
import { GTFSImporter } from '@urban-planner/gtfs-parser';

const importer = new GTFSImporter();
const { feed } = await importer.importFeed('https://example.com/gtfs.zip');
```

### 3. Create Custom Documents
```typescript
import { generateDocument } from '@urban-planner/doc-generator';

const result = await generateDocument(myData, {
  format: 'pdf',
  template: 'transit-analysis'
});
```

## Documentation

- **README.md** - Project overview
- **GETTING_STARTED.md** - Detailed setup guide
- **ARCHITECTURE.md** - Technical architecture
- **DOCUMENT_GENERATION_GUIDE.md** - How to generate documents
- **GTFS_RESOURCES.md** - Transit data resources
- **TOOLS_AND_FEATURES.md** - Complete feature guide

## File Structure

```
urban-planner/
├── apps/
│   ├── api/              # Express backend
│   └── web/              # React frontend
├── packages/
│   ├── doc-generator/    # PDF/DOCX generation
│   └── gtfs-parser/      # GTFS processing
├── examples/             # Working examples
├── docker-compose.yml    # Infrastructure setup
└── *.md                  # Documentation
```

## Requirements

- Node.js 20+
- pnpm 8+
- Docker (optional, for database)
- Mapbox account (free tier is fine)

## Support

Check the documentation files for detailed guides on:
- Document generation
- GTFS data processing
- API usage
- Frontend components
- Database setup

## Next Steps

1. Read **GETTING_STARTED.md** for detailed setup
2. Run the examples to see it in action
3. Check **DOCUMENT_GENERATION_GUIDE.md** to create your own reports
4. Explore **GTFS_RESOURCES.md** for transit data sources

Happy planning! 🏙️
