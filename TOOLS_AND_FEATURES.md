# Urban Planning Platform - Tools & Features Overview

This document provides a comprehensive overview of the tools, libraries, and features available in the urban planning platform.

## 🗺️ GIS and Mapping Tools

### Base Mapping Libraries

#### Mapbox GL JS (Primary)
- **What it is**: Modern vector-based web mapping library
- **Why we use it**: High-performance rendering, beautiful default styles, excellent 3D support
- **Features**:
  - Vector tile rendering
  - Custom map styles
  - 3D terrain and buildings
  - Real-time data visualization
  - Mobile-friendly
- **Docs**: https://docs.mapbox.com/mapbox-gl-js/

#### React Map GL
- **What it is**: React wrapper for Mapbox GL JS
- **Why we use it**: React-friendly API, hooks-based state management
- **Features**:
  - React component architecture
  - Easy event handling
  - Control components (navigation, geocoder, etc.)
  - Integration with React ecosystem
- **Docs**: https://visgl.github.io/react-map-gl/

#### Deck.gl
- **What it is**: WebGL-powered visualization framework for large datasets
- **Why we use it**: Render millions of data points with high performance
- **Use cases**:
  - Census data visualization (population density heatmaps)
  - Traffic flow visualization
  - Large transit networks
  - 3D building footprints
  - Hexagon binning for density analysis
- **Docs**: https://deck.gl/

### Geospatial Processing

#### Turf.js
- **What it is**: Advanced geospatial analysis library
- **Why we use it**: Client-side spatial operations without a backend
- **Common operations**:
  - Buffer zones around features
  - Point-in-polygon tests
  - Distance calculations
  - Union, intersection, difference
  - Centroid and convex hull
  - Line splitting and slicing
- **Example**:
  ```javascript
  import * as turf from '@turf/turf';

  // Create 400m buffer around transit stops
  const stop = turf.point([-122.4, 37.8]);
  const buffered = turf.buffer(stop, 0.4, {units: 'kilometers'});

  // Find all parcels within buffer
  const parcelsWithinRange = turf.pointsWithinPolygon(parcels, buffered);
  ```
- **Docs**: https://turfjs.org/

### Data Formats

- **GeoJSON**: Primary format for vector data
- **Shapefiles**: Import via shp.js or GDAL
- **KML/KMZ**: Google Earth format support
- **TopoJSON**: Topology-preserving GeoJSON alternative
- **MVT (Mapbox Vector Tiles)**: For efficient large-scale rendering

## 🚇 GTFS Transit Tools

### What is GTFS?

**General Transit Feed Specification (GTFS)** is a standardized format for public transportation schedules and geographic information. Created by Google, it's used by transit agencies worldwide.

### GTFS Structure

A GTFS feed is a ZIP file containing these text files:

**Required Files:**
- `agency.txt` - Transit agencies
- `routes.txt` - Transit routes (bus lines, train lines, etc.)
- `stops.txt` - Stop/station locations
- `trips.txt` - Individual trips on routes
- `stop_times.txt` - Arrival/departure times at each stop
- `calendar.txt` or `calendar_dates.txt` - Service schedules

**Optional Files:**
- `shapes.txt` - Route path geometries
- `frequencies.txt` - Headway-based schedules
- `transfers.txt` - Transfer rules between stops
- `fare_attributes.txt` & `fare_rules.txt` - Pricing information
- `pathways.txt` - Station navigation (stairs, elevators, etc.)

### GTFS Libraries

#### gtfs-via-postgres
- **What it does**: Import GTFS into PostgreSQL
- **Why we use it**: Fast, scalable, supports spatial queries
- **Features**:
  - Automatic schema creation
  - Foreign key constraints
  - PostGIS geometry generation
  - Query helpers

#### node-gtfs
- **What it does**: GTFS parsing and querying in Node.js
- **Why we use it**: API for common GTFS operations
- **Features**:
  - Import/export GTFS
  - Query routes, stops, trips
  - Generate timetables
  - Export to GeoJSON

### GTFS Use Cases in Urban Planning

#### 1. Transit Network Analysis
```typescript
// Calculate service frequency by route
const analysis = {
  routeId: '101',
  peakFrequency: 12, // trips per hour during peak
  offPeakFrequency: 6,
  serviceSpan: '5:00 AM - 11:00 PM',
  coverage: '95% of service area',
};
```

#### 2. Stop Coverage Analysis
```typescript
// Find areas not served by transit (gaps in coverage)
const coverage = analyzeStopCoverage({
  stops: gtfsStops,
  walkDistance: 400, // meters (5 min walk)
  population: censusData,
});

// Returns: % population within walking distance of transit
```

#### 3. Service Equity Analysis
```typescript
// Compare transit service levels across neighborhoods
const equity = analyzeServiceEquity({
  routes: gtfsRoutes,
  demographics: censusData,
  metrics: ['frequency', 'span', 'accessibility'],
});
```

#### 4. Future Route Planning
```typescript
// Model impact of new transit route
const impact = modelNewRoute({
  proposedRoute: newRouteGeometry,
  existingGTFS: currentFeed,
  landUse: zoningData,
  demographics: censusData,
});

// Returns: projected ridership, coverage improvement, equity impact
```

### GTFS Real-time

For live transit updates:
- **GTFS-RT**: Protocol buffer format for real-time updates
- **Use cases**: Vehicle positions, arrival predictions, service alerts
- **Integration**: Combine static GTFS with real-time feeds

## 📊 Census Data Tools

The platform includes comprehensive tools for gathering and analyzing US Census Bureau data, essential for understanding demographic patterns, economic conditions, and transportation needs in urban planning.

### Census Data Package

**Location**: `/packages/census-data/`

A TypeScript library for fetching demographic, economic, and housing data from the US Census Bureau API with geographic query capabilities.

#### Features
- 📍 Spatial queries by point, bounding box, or polygon
- 🔄 Automatic data parsing and structuring
- 💾 Built-in caching for performance
- 📝 Full TypeScript support with comprehensive types
- 🎯 Multiple geographic levels (state, county, tract, block group)
- 📤 Export to JSON, CSV, and GeoJSON formats

#### Census API Client

```typescript
import { CensusClient, CENSUS_VARIABLES } from '@urban-planner/census-data';

// Initialize the client
const client = new CensusClient({
  apiKey: process.env.CENSUS_API_KEY,
  cache: true,
  cacheTTL: 3600000, // 1 hour
});

// Fetch census data for a census tract
const response = await client.getCensusData({
  variables: [
    CENSUS_VARIABLES.TOTAL_POPULATION,
    CENSUS_VARIABLES.MEDIAN_HOUSEHOLD_INCOME,
    CENSUS_VARIABLES.PUBLIC_TRANSIT,
  ],
  geography: {
    type: 'tract',
    state: '06',      // California
    county: '075',    // San Francisco
    tract: '612000',
  },
  year: 2021,
  dataset: 'acs5',
});

console.log(response.data.population.total);
console.log(response.data.income.medianHouseholdIncome);
console.log(response.data.transportation.publicTransit);
```

#### Available Data Categories

**Population & Demographics**
- Total population (by gender, age groups)
- Median age
- Race and ethnicity distribution

**Housing**
- Total housing units
- Vacancy rates
- Homeownership rates
- Owner vs. renter occupied

**Economic**
- Median household income
- Per capita income
- Poverty rates
- Employment statistics

**Transportation**
- Commute mode share (car, transit, bike, walk, work-from-home)
- Total workers
- Transportation mode breakdown

**Education**
- Educational attainment levels
- High school graduation rates
- College degrees

#### Spatial Query Examples

**Query by Point** (Click on Map)
```typescript
import { SpatialCensusQuery } from '@urban-planner/census-data';

const spatialQuery = new SpatialCensusQuery(client);

// Get census data for a specific lat/lon
const result = await spatialQuery.query({
  type: 'point',
  coordinates: {
    latitude: 37.7749,
    longitude: -122.4194,
  },
  level: 'tract',
  year: 2021,
});

// Returns census data for the tract containing these coordinates
console.log(result.features[0].properties.population.total);
```

**Query by Bounding Box** (Draw Area)
```typescript
const result = await spatialQuery.query({
  type: 'bbox',
  boundingBox: {
    north: 37.8,
    south: 37.7,
    east: -122.3,
    west: -122.5,
  },
  level: 'tract',
  year: 2021,
});

// Returns census data for all tracts within the area
console.log(`Found ${result.count} census tracts`);
result.features.forEach(feature => {
  const data = feature.properties;
  console.log(`Population: ${data.population.total}`);
  console.log(`Median Income: $${data.income.medianHouseholdIncome}`);
});
```

**Batch Queries** (Multiple Locations)
```typescript
const batchResult = await client.getBatchCensusData({
  geographies: [
    { type: 'county', state: '06', county: '075' }, // San Francisco
    { type: 'county', state: '06', county: '001' }, // Alameda
    { type: 'county', state: '06', county: '081' }, // San Mateo
  ],
  variables: [
    CENSUS_VARIABLES.TOTAL_POPULATION,
    CENSUS_VARIABLES.MEDIAN_HOUSEHOLD_INCOME,
    CENSUS_VARIABLES.PUBLIC_TRANSIT,
  ],
  year: 2021,
});
```

### Census Data Tool (Web UI)

**Location**: `/apps/web/src/components/CensusDataTool.tsx`

Interactive map-based interface for gathering census data within geographic areas.

#### Features
- 🗺️ Interactive map with Mapbox GL
- 📍 Point-and-click census data queries
- ⬜ Draw bounding boxes for area queries
- 📊 Real-time data visualization
- 💾 Export to JSON, CSV, or GeoJSON
- 🎯 Multiple geography levels (county, tract, block group)

#### Usage

1. **Access the Tool**: Navigate to "Census Data" in the application menu
2. **Select Query Mode**:
   - **Point**: Click anywhere on the map to get census data for that location
   - **Bounding Box**: Click and drag to draw a rectangular area
3. **Choose Geography Level**:
   - **County**: Larger areas, less detailed
   - **Census Tract**: Neighborhood-level detail (recommended)
   - **Block Group**: Most detailed, smaller areas
4. **View Results**: Demographics, housing, income, transportation, and employment data
5. **Export Data**: Download as JSON, CSV, or GeoJSON for further analysis

### API Endpoints

The backend provides RESTful endpoints for census data:

```
POST   /api/census/query          # Query by geographic area
POST   /api/census/batch          # Batch queries for multiple areas
POST   /api/census/spatial        # Spatial queries (point, bbox, polygon)
GET    /api/census/variables      # List available census variables
GET    /api/census/variable-list  # Get commonly used variables
POST   /api/census/export         # Export data to various formats
DELETE /api/census/cache          # Clear census data cache
```

### Census Data Use Cases in Urban Planning

#### 1. Transit Equity Analysis
```typescript
// Compare transit service levels with demographic data
const transitEquity = {
  lowIncomeAreas: {
    medianIncome: 45000,
    transitAccess: 85%, // within 400m of transit
    serviceFrequency: 8, // trips/hour
  },
  highIncomeAreas: {
    medianIncome: 120000,
    transitAccess: 95%,
    serviceFrequency: 12,
  },
};
```

#### 2. Ridership Forecasting
```typescript
// Use census data to predict transit ridership
const forecast = calculateRidership({
  population: censusData.population.total,
  employment: censusData.employment.employed,
  density: censusData.population.total / areaKm2,
  medianIncome: censusData.income.medianHouseholdIncome,
  existingTransitMode: censusData.transportation.publicTransit,
});
```

#### 3. Service Gap Analysis
```typescript
// Identify underserved areas
const gaps = analyzeServiceGaps({
  census: censusTracts,
  transitStops: gtfsStops,
  walkDistance: 400, // meters
  minimumFrequency: 6, // trips/hour
});

// Returns areas with:
// - High population density
// - Low transit access
// - High transit dependency (low car ownership)
```

#### 4. Development Impact Assessment
```typescript
// Assess impact of new transit on area
const impact = {
  beforeDevelopment: {
    population: 15000,
    medianIncome: 65000,
    transitCommuters: 1200,
  },
  afterDevelopment: {
    projectedPopulation: 22000,
    projectedIncome: 75000,
    projectedTransitCommuters: 3500,
  },
  percentIncrease: 192%, // transit ridership
};
```

### Data Sources

**US Census Bureau API**
- **American Community Survey (ACS)**: 5-year and 1-year estimates
- **Decennial Census**: Complete population count
- **Datasets**: Demographics, economics, housing, transportation
- **API Key**: Free, required for access (https://api.census.gov/data/key_signup.html)

**Geographic Coverage**
- All 50 US states + DC, Puerto Rico, territories
- Multiple geographic levels from state to block group
- TIGER/Line shapefiles for boundaries

**Update Frequency**
- ACS 5-year: Updated annually
- ACS 1-year: Updated annually (larger geographies only)
- Decennial Census: Every 10 years (2020, 2030, etc.)

### Configuration

Add to `.env`:
```bash
CENSUS_API_KEY=your_census_api_key_here
```

Get a free API key: https://api.census.gov/data/key_signup.html

### Best Practices

1. **Use ACS 5-year estimates** for most analyses (more reliable, all geographies)
2. **Cache queries** to reduce API calls and improve performance
3. **Choose appropriate geography level**:
   - County: Regional analysis
   - Tract: Neighborhood analysis (most common)
   - Block Group: Detailed micro-analysis
4. **Consider margins of error** in ACS estimates
5. **Combine with GTFS data** for comprehensive transit planning

### Integration with Other Tools

**Document Generation**
```typescript
// Include census data in planning reports
const report = generateDocument({
  demographics: censusData,
  transitData: gtfsData,
  template: 'comprehensive-plan',
});
```

**Ridership Forecasting**
```typescript
// Use census data as input for forecasting models
const forecast = forecastRidership({
  demographicData: censusData,
  transitNetwork: gtfsData,
  landUse: gisData,
});
```

**GIS Visualization**
```typescript
// Visualize census data on maps
const layer = {
  type: 'fill',
  paint: {
    'fill-color': [
      'interpolate',
      ['linear'],
      ['get', 'population_density'],
      0, '#ffffff',
      1000, '#ff0000',
    ],
  },
};
```

## 📄 Document Generation Tools

### PDF Generation

#### jsPDF
- **Use case**: Simple reports, certificates, forms
- **Pros**: Lightweight, client-side generation
- **Example**:
  ```typescript
  import jsPDF from 'jspdf';

  const doc = new jsPDF();
  doc.text('Comprehensive Plan 2025', 20, 20);
  doc.addImage(mapSnapshot, 'PNG', 20, 40, 170, 100);
  doc.save('plan.pdf');
  ```

#### PDFKit (Backend)
- **Use case**: Complex layouts, large documents
- **Pros**: Streaming, better typography control
- **Example**:
  ```typescript
  import PDFDocument from 'pdfkit';

  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream('output.pdf'));
  doc.fontSize(24).text('Urban Plan Analysis');
  doc.image('chart.png', { fit: [500, 300] });
  doc.end();
  ```

### Word Documents

#### docxtemplater
- **Use case**: Template-based document generation
- **Workflow**:
  1. Create .docx template with placeholders
  2. Load template in code
  3. Fill with data
  4. Export as .docx
- **Example**:
  ```typescript
  import Docxtemplater from 'docxtemplater';

  const doc = new Docxtemplater(templateZip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  doc.render({
    projectName: 'Downtown Redevelopment',
    population: 45000,
    zones: [
      { name: 'Residential', area: 120 },
      { name: 'Commercial', area: 45 },
    ],
  });
  ```

### Excel Spreadsheets

#### exceljs
- **Use case**: Data tables, financial models, analytics
- **Features**:
  - Formulas
  - Charts
  - Conditional formatting
  - Multiple sheets
- **Example**:
  ```typescript
  import ExcelJS from 'exceljs';

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Ridership Forecast');

  sheet.columns = [
    { header: 'Route', key: 'route', width: 20 },
    { header: 'Current', key: 'current', width: 15 },
    { header: 'Projected', key: 'projected', width: 15 },
  ];

  sheet.addRow({ route: '101', current: 12000, projected: 15000 });

  await workbook.xlsx.writeFile('forecast.xlsx');
  ```

### Advanced Layouts (Puppeteer)

For complex, print-ready documents:
```typescript
import puppeteer from 'puppeteer';

// Render HTML/CSS to PDF with full control
const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setContent(htmlContent);
await page.pdf({
  path: 'plan.pdf',
  format: 'A4',
  printBackground: true,
});
```

### Document Templates

We provide pre-built templates for common planning documents:

1. **Comprehensive Plan**
   - Executive summary
   - Demographics analysis
   - Land use maps
   - Transportation network
   - Recommendations

2. **Zoning Report**
   - Parcel information
   - Zoning compliance
   - Variances and exceptions
   - Impact analysis

3. **Environmental Impact Assessment**
   - Project description
   - Environmental baseline
   - Impact analysis
   - Mitigation measures

4. **Public Meeting Materials**
   - Presentation slides
   - Handouts
   - Comment forms
   - FAQ documents

## 📊 Ridership Forecasting Models

### Model Types

#### 1. Direct Demand Model (Simple)
**Best for**: Quick estimates, corridor studies, preliminary analysis

**Inputs**:
- Population within catchment area (typically 400m-800m)
- Employment density
- Land use mix
- Existing transit service
- Walk scores

**Formula**:
```typescript
ridership = baseRate
  × population
  × densityMultiplier
  × transitAccessMultiplier
  × frequencyMultiplier
  × (1 + landUseMixBonus)
```

**Example**:
```typescript
const forecast = directDemandModel({
  population: 25000,
  density: 8000, // people per sq km
  transitAccess: 75, // % within 400m of stop
  frequency: 6, // vehicles per hour
  landUseMix: 0.7, // 0-1 diversity index
});

// Output: { daily: 3750, annual: 1125000, confidence: 0.75 }
```

#### 2. Four-Step Model (Traditional)
**Best for**: Regional planning, comprehensive analysis

**Steps**:
1. **Trip Generation**: How many trips are produced/attracted?
2. **Trip Distribution**: Where do trips go?
3. **Mode Choice**: What mode is used (car, bus, rail, bike)?
4. **Route Assignment**: Which specific route is taken?

**Implementation**:
```typescript
const fourStepModel = {
  tripGeneration: calculateTrips(landUse, demographics),
  tripDistribution: gravityModel(origins, destinations, impedance),
  modeChoice: logitModel(alternatives, utilities),
  routeAssignment: shortestPath(network, trips),
};
```

#### 3. Machine Learning Model (Advanced)
**Best for**: Data-rich environments, pattern recognition

**Algorithm**: Random Forest, Gradient Boosting, or Neural Networks

**Features**:
- Demographics (age, income, car ownership)
- Built environment (density, land use mix, walk score)
- Transit service (frequency, span, reliability)
- Accessibility (jobs/services reachable)
- Weather and temporal patterns

**Implementation**:
```typescript
// Using TensorFlow.js
import * as tf from '@tensorflow/tfjs';

const model = tf.sequential({
  layers: [
    tf.layers.dense({ units: 64, activation: 'relu', inputShape: [12] }),
    tf.layers.dropout({ rate: 0.2 }),
    tf.layers.dense({ units: 32, activation: 'relu' }),
    tf.layers.dense({ units: 1, activation: 'linear' }),
  ],
});

model.compile({
  optimizer: 'adam',
  loss: 'meanSquaredError',
});

// Train on historical data
await model.fit(trainingData, labels, { epochs: 50 });

// Predict ridership for new route
const prediction = model.predict(newRouteFeatures);
```

### Forecasting Workflow

```typescript
// Complete ridership forecasting workflow
export async function forecastRidership(params: {
  proposedRoute: GeoJSON;
  demographics: CensusData;
  landUse: ZoningData;
  existingTransit: GTFSFeed;
}) {
  // 1. Define catchment area (buffer around route)
  const catchment = turf.buffer(params.proposedRoute, 0.4, {
    units: 'kilometers',
  });

  // 2. Extract population and employment
  const population = extractDemographics(catchment, params.demographics);
  const employment = extractEmployment(catchment, params.landUse);

  // 3. Calculate accessibility metrics
  const accessibility = calculateAccessibility({
    route: params.proposedRoute,
    destinations: employment,
    existing: params.existingTransit,
  });

  // 4. Run forecast models
  const directDemand = directDemandModel({ population, accessibility });
  const mlForecast = await mlModel.predict({ population, accessibility });

  // 5. Combine estimates
  const forecast = {
    conservative: Math.min(directDemand.daily, mlForecast.daily),
    moderate: (directDemand.daily + mlForecast.daily) / 2,
    optimistic: Math.max(directDemand.daily, mlForecast.daily),
  };

  return {
    daily: forecast,
    annual: {
      conservative: forecast.conservative * 300,
      moderate: forecast.moderate * 300,
      optimistic: forecast.optimistic * 300,
    },
    methodology: 'Combined direct demand and ML ensemble',
    confidence: calculateConfidenceInterval(directDemand, mlForecast),
  };
}
```

## 🎨 Data Visualization

### Chart Libraries

#### Chart.js
- **Use case**: Standard charts (bar, line, pie)
- **Pros**: Simple API, responsive, good defaults
- **Example**:
  ```typescript
  import { Chart } from 'react-chartjs-2';

  <Chart
    type="bar"
    data={{
      labels: routes.map(r => r.name),
      datasets: [{
        label: 'Daily Ridership',
        data: routes.map(r => r.ridership),
      }],
    }}
  />
  ```

#### D3.js
- **Use case**: Custom, interactive visualizations
- **Pros**: Ultimate flexibility, community support
- **Examples**: Chord diagrams, sankey flows, custom maps

#### Apache ECharts
- **Use case**: Complex interactive charts
- **Pros**: Rich built-in chart types, 3D support
- **Examples**: Heatmaps, relationship graphs, geographic viz

## 🔍 Analysis Tools

### Census Data Integration
- **Source**: US Census Bureau API
- **Data**: Demographics, income, housing, employment
- **Format**: GeoJSON with census geometries

### Walk Score API
- **Use**: Walkability, bike scores, transit scores
- **Application**: Site suitability analysis

### OpenStreetMap
- **Use**: Building footprints, road networks, POIs
- **Tools**: Overpass API, osm2pgsql

### Environmental Data
- **Elevation**: USGS, NASA SRTM
- **Flood zones**: FEMA
- **Air quality**: EPA

## 🚀 Next Steps

1. **Start with mapping**: Get Mapbox token, create first map
2. **Import GTFS**: Download sample feed, test import
3. **Try forecasting**: Run direct demand model
4. **Generate document**: Create a PDF report

See [GETTING_STARTED.md](./GETTING_STARTED.md) for setup instructions!
