/**
 * Census Data API Routes
 * Endpoints for fetching US Census Bureau data
 */

import express from 'express';
import {
  CensusClient,
  SpatialCensusQuery,
  CENSUS_VARIABLES,
  CensusAPIRequest,
  CensusBatchRequest,
  SpatialCensusQuery as SpatialQueryType,
  CensusAPIRequestSchema,
  SpatialCensusQuerySchema,
} from '@urban-planner/census-data';

const router = express.Router();

// Initialize Census Client (singleton)
let censusClient: CensusClient | null = null;
let spatialQuery: SpatialCensusQuery | null = null;

function getCensusClient(): CensusClient {
  if (!censusClient) {
    const apiKey = process.env.CENSUS_API_KEY || '';
    if (!apiKey) {
      throw new Error('CENSUS_API_KEY environment variable is required');
    }
    censusClient = new CensusClient({
      apiKey,
      cache: true,
      cacheTTL: 3600000, // 1 hour
    });
    spatialQuery = new SpatialCensusQuery(censusClient);
  }
  return censusClient;
}

function getSpatialQuery(): SpatialCensusQuery {
  getCensusClient(); // Ensures both are initialized
  return spatialQuery!;
}

/**
 * POST /api/census/query
 * Fetch census data for a specific geographic area
 *
 * Request body:
 * {
 *   variables: string[],
 *   geography: {
 *     type: 'state' | 'county' | 'tract' | 'block-group' | 'place' | 'zcta',
 *     state?: string,
 *     county?: string,
 *     tract?: string,
 *     blockGroup?: string
 *   },
 *   year?: number,
 *   dataset?: 'acs5' | 'acs1' | 'dec'
 * }
 */
router.post('/query', async (req, res) => {
  try {
    const client = getCensusClient();

    // Validate request
    const validation = CensusAPIRequestSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid request',
        details: validation.error.errors,
      });
    }

    const request: CensusAPIRequest = validation.data;

    // Fetch census data
    const response = await client.getCensusData(request);

    if (response.errors && response.errors.length > 0) {
      return res.status(500).json({
        success: false,
        error: 'Census data fetch failed',
        details: response.errors,
        data: response.data,
      });
    }

    res.json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.error('Census query error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/census/batch
 * Fetch census data for multiple geographic areas
 *
 * Request body:
 * {
 *   geographies: GeographicArea[],
 *   variables: string[],
 *   year?: number,
 *   dataset?: 'acs5' | 'acs1' | 'dec'
 * }
 */
router.post('/batch', async (req, res) => {
  try {
    const client = getCensusClient();
    const request: CensusBatchRequest = req.body;

    // Validate required fields
    if (!request.geographies || !Array.isArray(request.geographies)) {
      return res.status(400).json({
        error: 'Missing required field: geographies (array)',
      });
    }

    if (!request.variables || !Array.isArray(request.variables)) {
      return res.status(400).json({
        error: 'Missing required field: variables (array)',
      });
    }

    // Fetch batch census data
    const response = await client.getBatchCensusData(request);

    res.json({
      success: true,
      count: response.data.length,
      data: response.data,
      errors: response.errors,
    });
  } catch (error) {
    console.error('Batch census query error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/census/spatial
 * Query census data by spatial criteria (point, bbox, or polygon)
 *
 * Request body:
 * {
 *   type: 'point' | 'bbox' | 'polygon',
 *   coordinates?: { latitude: number, longitude: number },
 *   boundingBox?: { north, south, east, west },
 *   polygon?: GeoJSON geometry,
 *   level: 'tract' | 'block-group' | 'county',
 *   variables?: string[],
 *   year?: number
 * }
 */
router.post('/spatial', async (req, res) => {
  try {
    const spatial = getSpatialQuery();

    // Validate request
    const validation = SpatialCensusQuerySchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid spatial query',
        details: validation.error.errors,
      });
    }

    const query: SpatialQueryType = validation.data;

    // Execute spatial query
    const response = await spatial.query(query);

    res.json({
      success: true,
      type: 'FeatureCollection',
      features: response.features,
      count: response.count,
      bounds: response.bounds,
    });
  } catch (error) {
    console.error('Spatial census query error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/census/variables
 * Get available census variables for a dataset
 *
 * Query params:
 * - year: number (default: 2021)
 * - dataset: string (default: 'acs5')
 */
router.get('/variables', async (req, res) => {
  try {
    const client = getCensusClient();
    const year = parseInt(req.query.year as string) || 2021;
    const dataset = (req.query.dataset as string) || 'acs5';

    const variables = await client.getVariables(year, dataset);

    res.json({
      success: true,
      year,
      dataset,
      variables,
    });
  } catch (error) {
    console.error('Variables fetch error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/census/geographies
 * Get available geographies for a dataset
 *
 * Query params:
 * - year: number (default: 2021)
 * - dataset: string (default: 'acs5')
 */
router.get('/geographies', async (req, res) => {
  try {
    const client = getCensusClient();
    const year = parseInt(req.query.year as string) || 2021;
    const dataset = (req.query.dataset as string) || 'acs5';

    const geographies = await client.getGeographies(year, dataset);

    res.json({
      success: true,
      year,
      dataset,
      geographies,
    });
  } catch (error) {
    console.error('Geographies fetch error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/census/variable-list
 * Get list of commonly used census variables
 */
router.get('/variable-list', (req, res) => {
  res.json({
    success: true,
    variables: CENSUS_VARIABLES,
    categories: {
      population: [
        'TOTAL_POPULATION',
        'MALE_POPULATION',
        'FEMALE_POPULATION',
      ],
      age: [
        'AGE_UNDER_5',
        'AGE_5_TO_9',
        'AGE_10_TO_14',
        'AGE_15_TO_19',
        'AGE_20_TO_24',
        'AGE_25_TO_34',
        'AGE_35_TO_44',
        'AGE_45_TO_54',
        'AGE_55_TO_64',
        'AGE_65_PLUS',
        'MEDIAN_AGE',
      ],
      race: [
        'WHITE_ALONE',
        'BLACK_ALONE',
        'ASIAN_ALONE',
        'HISPANIC',
      ],
      housing: [
        'TOTAL_HOUSING_UNITS',
        'OCCUPIED_HOUSING',
        'VACANT_HOUSING',
        'OWNER_OCCUPIED',
        'RENTER_OCCUPIED',
      ],
      income: [
        'MEDIAN_HOUSEHOLD_INCOME',
        'PER_CAPITA_INCOME',
        'POVERTY_POPULATION',
      ],
      employment: [
        'IN_LABOR_FORCE',
        'EMPLOYED',
        'UNEMPLOYED',
      ],
      transportation: [
        'TOTAL_WORKERS',
        'DROVE_ALONE',
        'CARPOOLED',
        'PUBLIC_TRANSIT',
        'WALKED',
        'BICYCLE',
        'WORKED_FROM_HOME',
      ],
      education: [
        'LESS_THAN_HS',
        'HS_GRADUATE',
        'BACHELORS',
        'GRADUATE_DEGREE',
      ],
    },
  });
});

/**
 * POST /api/census/export
 * Export census data to various formats (CSV, JSON, GeoJSON)
 */
router.post('/export', async (req, res) => {
  try {
    const { data, format = 'json' } = req.body;

    if (!data) {
      return res.status(400).json({
        error: 'Missing required field: data',
      });
    }

    switch (format) {
      case 'json':
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename="census_data.json"');
        res.json(data);
        break;

      case 'geojson':
        res.setHeader('Content-Type', 'application/geo+json');
        res.setHeader('Content-Disposition', 'attachment; filename="census_data.geojson"');
        res.json({
          type: 'FeatureCollection',
          features: Array.isArray(data) ? data : [data],
        });
        break;

      case 'csv':
        // Convert data to CSV
        const csv = convertToCSV(data);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="census_data.csv"');
        res.send(csv);
        break;

      default:
        res.status(400).json({
          error: 'Unsupported format. Use: json, geojson, or csv',
        });
    }
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * DELETE /api/census/cache
 * Clear the census data cache
 */
router.delete('/cache', (req, res) => {
  try {
    const client = getCensusClient();
    client.clearCache();

    res.json({
      success: true,
      message: 'Cache cleared successfully',
    });
  } catch (error) {
    console.error('Cache clear error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Helper function to convert census data to CSV
 */
function convertToCSV(data: any): string {
  if (!data) return '';

  const items = Array.isArray(data) ? data : [data];
  if (items.length === 0) return '';

  // Flatten the nested structure
  const flattened = items.map(item => {
    if (item.properties) {
      // Spatial query response
      return flattenObject(item.properties);
    }
    // Regular census data
    return flattenObject(item);
  });

  // Get all unique keys
  const keys = Array.from(new Set(flattened.flatMap(obj => Object.keys(obj))));

  // Create CSV header
  const header = keys.join(',');

  // Create CSV rows
  const rows = flattened.map(obj => {
    return keys.map(key => {
      const value = obj[key];
      if (value === null || value === undefined) return '';
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`;
      }
      return value;
    }).join(',');
  });

  return [header, ...rows].join('\n');
}

/**
 * Helper function to flatten nested objects
 */
function flattenObject(obj: any, prefix = ''): Record<string, any> {
  const flattened: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      Object.assign(flattened, flattenObject(value, newKey));
    } else {
      flattened[newKey] = value;
    }
  }

  return flattened;
}

export default router;
