# Census Data Package

A TypeScript library for fetching and analyzing US Census Bureau data with geographic queries.

## Features

- 📊 Fetch demographic, economic, and housing data from US Census Bureau
- 🗺️ Spatial queries by point, bounding box, or polygon
- 🔄 Automatic data parsing and structuring
- 💾 Built-in caching for performance
- 📝 Full TypeScript support with comprehensive types
- 🎯 Support for multiple geographic levels (state, county, tract, block group)

## Installation

This package is part of the Urban Planner monorepo. To install dependencies:

```bash
pnpm install
```

## Usage

### Basic Census Data Query

```typescript
import { CensusClient, CENSUS_VARIABLES } from '@urban-planner/census-data';

// Initialize the client
const client = new CensusClient({
  apiKey: 'YOUR_CENSUS_API_KEY',
  cache: true,
  cacheTTL: 3600000, // 1 hour
});

// Fetch census data for a specific geographic area
const response = await client.getCensusData({
  variables: [
    CENSUS_VARIABLES.TOTAL_POPULATION,
    CENSUS_VARIABLES.MEDIAN_HOUSEHOLD_INCOME,
    CENSUS_VARIABLES.TOTAL_HOUSING_UNITS,
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
```

### Spatial Queries

#### Query by Point (Latitude/Longitude)

```typescript
import { SpatialCensusQuery } from '@urban-planner/census-data';

const spatialQuery = new SpatialCensusQuery(client);

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
result.features.forEach(feature => {
  console.log(feature.properties.population.total);
});
```

#### Query by Bounding Box

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

// Returns census data for all tracts within the bounding box
console.log(`Found ${result.count} census tracts in area`);
```

#### Query by Polygon

```typescript
const result = await spatialQuery.query({
  type: 'polygon',
  polygon: {
    type: 'Polygon',
    coordinates: [
      [
        [-122.5, 37.7],
        [-122.3, 37.7],
        [-122.3, 37.8],
        [-122.5, 37.8],
        [-122.5, 37.7],
      ],
    ],
  },
  level: 'tract',
  year: 2021,
});
```

### Batch Queries

```typescript
const batchResult = await client.getBatchCensusData({
  geographies: [
    {
      type: 'county',
      state: '06',
      county: '075', // San Francisco
    },
    {
      type: 'county',
      state: '06',
      county: '001', // Alameda
    },
  ],
  variables: [CENSUS_VARIABLES.TOTAL_POPULATION],
  year: 2021,
});

batchResult.data.forEach(censusData => {
  console.log(censusData.geography.name, censusData.population.total);
});
```

## Available Census Variables

The package includes pre-defined variable mappings for common census data:

### Population
- `TOTAL_POPULATION`
- `MALE_POPULATION`
- `FEMALE_POPULATION`

### Age Distribution
- `AGE_UNDER_5`, `AGE_5_TO_9`, `AGE_10_TO_14`, etc.
- `MEDIAN_AGE`

### Race and Ethnicity
- `WHITE_ALONE`
- `BLACK_ALONE`
- `ASIAN_ALONE`
- `HISPANIC`

### Housing
- `TOTAL_HOUSING_UNITS`
- `OCCUPIED_HOUSING`
- `VACANT_HOUSING`
- `OWNER_OCCUPIED`
- `RENTER_OCCUPIED`

### Income
- `MEDIAN_HOUSEHOLD_INCOME`
- `PER_CAPITA_INCOME`
- `POVERTY_POPULATION`

### Employment
- `IN_LABOR_FORCE`
- `EMPLOYED`
- `UNEMPLOYED`

### Transportation
- `TOTAL_WORKERS`
- `DROVE_ALONE`
- `CARPOOLED`
- `PUBLIC_TRANSIT`
- `WALKED`
- `BICYCLE`
- `WORKED_FROM_HOME`

### Education
- `LESS_THAN_HS`
- `HS_GRADUATE`
- `BACHELORS`
- `GRADUATE_DEGREE`

## Data Structure

The library returns structured census data:

```typescript
interface CensusData {
  geography: GeographicArea;
  year: number;
  dataset: string;
  population: PopulationData;
  ageDistribution: AgeDistribution;
  raceEthnicity: RaceEthnicityData;
  housing: HousingData;
  households: HouseholdData;
  income: IncomeData;
  employment: EmploymentData;
  transportation: TransportationData;
  education: EducationData;
  metadata: {
    fetchedAt: Date;
    source: string;
    reliability: 'high' | 'medium' | 'low';
  };
}
```

## Configuration

### API Key

Get a free API key from the US Census Bureau: https://api.census.gov/data/key_signup.html

### Environment Variables

```bash
CENSUS_API_KEY=your_api_key_here
```

### Client Configuration

```typescript
const client = new CensusClient({
  apiKey: process.env.CENSUS_API_KEY || '',
  baseUrl: 'https://api.census.gov/data',  // Optional, uses default
  timeout: 30000,                           // Request timeout in ms
  retries: 3,                               // Number of retries on failure
  cache: true,                              // Enable caching
  cacheTTL: 3600000,                        // Cache TTL in ms (1 hour)
});
```

## Datasets

### American Community Survey (ACS)

- **acs5**: 5-year estimates (most reliable, available for all geographies)
- **acs1**: 1-year estimates (more current, only available for larger geographies)

### Decennial Census

- **dec**: 10-year census (complete count, limited variables)

## Geographic Levels

Supported geographic hierarchy:

- **State**: 2-digit FIPS code (e.g., '06' for California)
- **County**: 3-digit FIPS code within state
- **Tract**: 6-digit code within county
- **Block Group**: 1-digit code within tract
- **Place**: Cities and towns
- **ZCTA**: ZIP Code Tabulation Areas

## Error Handling

```typescript
try {
  const response = await client.getCensusData({
    variables: [CENSUS_VARIABLES.TOTAL_POPULATION],
    geography: { type: 'tract', state: '06', county: '075', tract: '612000' },
  });

  if (response.errors) {
    console.error('Errors:', response.errors);
  }
} catch (error) {
  console.error('Census API error:', error.message);
}
```

## Performance

- Automatic caching reduces redundant API calls
- Batch queries minimize network requests
- Configurable timeout and retry logic
- Optimized for handling large geographic areas

## Links

- [US Census Bureau API Documentation](https://www.census.gov/data/developers/guidance/api-user-guide.html)
- [Available Variables](https://api.census.gov/data.html)
- [Geographic Entities](https://www.census.gov/programs-surveys/geography/guidance/geo-identifiers.html)

## License

MIT
