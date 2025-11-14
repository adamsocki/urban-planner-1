# Getting Started with Urban Planning Platform

This guide will help you set up and run the urban planning platform locally.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20 or higher ([Download](https://nodejs.org/))
- **pnpm** 8 or higher: `npm install -g pnpm`
- **Docker** and **Docker Compose** ([Download](https://www.docker.com/))
- **Git**

### Optional but Recommended
- **PostgreSQL** with PostGIS (if not using Docker)
- **Redis** (if not using Docker)

## Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd urban-planner
```

## Step 2: Install Dependencies

```bash
pnpm install
```

This will install all dependencies for all workspaces (apps/web, apps/api, and all packages).

## Step 3: Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```bash
# Essential keys to get started:
MAPBOX_TOKEN=pk.your_mapbox_token_here

# Get a free Mapbox token at: https://account.mapbox.com/
```

### Getting API Keys

#### Mapbox (Required for maps)
1. Sign up at https://account.mapbox.com/
2. Create a new token or use the default public token
3. Copy and paste into `.env`

#### Other Services (Optional)
- **MapTiler**: https://maptiler.com/ (alternative to Mapbox)
- **Transitland**: https://transit.land/documentation (for transit data)

## Step 4: Start Infrastructure Services

Using Docker Compose, start PostgreSQL, Redis, and MinIO:

```bash
docker-compose up -d
```

This will start:
- PostgreSQL with PostGIS on port 5432
- Redis on port 6379
- MinIO (S3-compatible storage) on ports 9000 and 9001

Verify services are running:

```bash
docker-compose ps
```

## Step 5: Set Up the Database

```bash
# Navigate to API directory
cd apps/api

# Generate Prisma client
pnpm prisma generate

# Run database migrations
pnpm prisma migrate dev

# (Optional) Seed with sample data
pnpm prisma db seed

# Go back to root
cd ../..
```

## Step 6: Start Development Servers

In the root directory, start all development servers:

```bash
pnpm dev
```

This will start:
- **Frontend (Vite)**: http://localhost:5173
- **Backend API**: http://localhost:3000

### Or start individually:

```bash
# Terminal 1 - Frontend
cd apps/web
pnpm dev

# Terminal 2 - Backend
cd apps/api
pnpm dev
```

## Step 7: Access the Application

Open your browser and navigate to:

```
http://localhost:5173
```

You should see the urban planning platform interface!

## Step 8: Try Importing a GTFS Feed

To test the GTFS functionality, you can use sample transit data:

### Download Sample GTFS Data

Free sample GTFS feeds:
- **San Francisco (SFMTA)**: https://gtfs.sfmta.com/transitdata/google_transit.zip
- **Portland (TriMet)**: https://developer.trimet.org/schedule/gtfs.zip
- **More feeds**: https://transitfeeds.com/ or https://transit.land/

### Import via UI

1. Create a new project
2. Navigate to "Transit" → "Import GTFS"
3. Enter the GTFS feed URL or upload a ZIP file
4. Click "Import"
5. Wait for processing (may take a few minutes)
6. View routes and stops on the map!

### Import via API

```bash
curl -X POST http://localhost:3000/api/projects/YOUR_PROJECT_ID/gtfs/import \
  -H "Content-Type: application/json" \
  -d '{"url": "https://gtfs.sfmta.com/transitdata/google_transit.zip"}'
```

## Project Structure

```
urban-planner/
├── apps/
│   ├── web/          # React frontend application
│   └── api/          # Express backend API
├── packages/
│   ├── gtfs-parser/  # GTFS processing library
│   └── shared/       # Shared types and utilities
├── docker-compose.yml
└── package.json
```

## Common Tasks

### View Database

```bash
cd apps/api
pnpm prisma studio
```

This opens Prisma Studio at http://localhost:5555

### View MinIO Storage

Navigate to http://localhost:9001

- Username: `minioadmin`
- Password: `minioadmin123`

### Run Tests

```bash
# All tests
pnpm test

# Specific workspace
cd apps/web
pnpm test
```

### Build for Production

```bash
pnpm build
```

### Lint and Format

```bash
# Lint all workspaces
pnpm lint

# Format all files
pnpm format
```

## Development Tips

### Hot Reload

Both frontend and backend support hot reload:
- Frontend: Vite HMR
- Backend: tsx watch mode

Changes should reflect immediately!

### Database Changes

When you modify the Prisma schema:

```bash
cd apps/api

# Create a new migration
pnpm prisma migrate dev --name your_migration_name

# Reset database (WARNING: deletes all data)
pnpm prisma migrate reset
```

### Adding New Dependencies

```bash
# Add to specific workspace
pnpm --filter @urban-planner/web add package-name

# Add to root
pnpm add -w package-name

# Add dev dependency
pnpm add -D package-name
```

## Troubleshooting

### Port Already in Use

If you see "port already in use" errors:

```bash
# Check what's using the port
lsof -i :5173  # Frontend
lsof -i :3000  # Backend
lsof -i :5432  # PostgreSQL

# Kill the process
kill -9 <PID>
```

### Docker Issues

```bash
# Stop all containers
docker-compose down

# Remove volumes (WARNING: deletes data)
docker-compose down -v

# Rebuild containers
docker-compose up -d --build
```

### Database Connection Errors

Ensure PostgreSQL is running:

```bash
docker-compose ps

# Check logs
docker-compose logs db
```

### Frontend Build Errors

Clear node_modules and reinstall:

```bash
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules
pnpm install
```

## Next Steps

Now that you have the platform running:

1. **Explore the Interface**: Create a project, draw some features
2. **Import GTFS Data**: Try importing a transit feed
3. **Generate a Document**: Create a planning report
4. **Read the Docs**: Check out [ARCHITECTURE.md](./ARCHITECTURE.md)
5. **Start Contributing**: See [CONTRIBUTING.md](./CONTRIBUTING.md)

## Getting Help

- **Issues**: Report bugs on GitHub Issues
- **Discussions**: Ask questions in GitHub Discussions
- **Documentation**: Check the `/docs` folder

## Resources

### GTFS Resources
- **GTFS Reference**: https://gtfs.org/schedule/reference/
- **GTFS Best Practices**: https://gtfs.org/schedule/best-practices/
- **Sample Feeds**: https://transitfeeds.com/

### Mapping Resources
- **Mapbox GL JS Docs**: https://docs.mapbox.com/mapbox-gl-js/
- **Turf.js Docs**: https://turfjs.org/
- **GeoJSON Spec**: https://geojson.org/

### Urban Planning
- **APA Resources**: https://www.planning.org/
- **Urban Design Tools**: https://www.planetizen.com/

Happy Planning! 🏙️
