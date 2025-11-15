/**
 * Spatial Census Query
 * Geographic queries for census data using coordinates and boundaries
 */

import axios from 'axios';
import {
  SpatialCensusQuery,
  SpatialCensusResponse,
  GeographicArea,
  BoundingBox,
  GeoJSONGeometry,
  CensusData,
  CENSUS_VARIABLES,
} from './types';
import { CensusClient } from './census-client';

export class SpatialCensusQuery {
  private censusClient: CensusClient;
  private geocodingBaseUrl: string;

  constructor(censusClient: CensusClient, geocodingBaseUrl?: string) {
    this.censusClient = censusClient;
    this.geocodingBaseUrl = geocodingBaseUrl || 'https://geocoding.geo.census.gov/geocoder';
  }

  /**
   * Query census data by spatial criteria
   */
  async query(query: SpatialCensusQuery): Promise<SpatialCensusResponse> {
    switch (query.type) {
      case 'point':
        return this.queryByPoint(query);
      case 'bbox':
        return this.queryByBoundingBox(query);
      case 'polygon':
        return this.queryByPolygon(query);
      default:
        throw new Error(`Unsupported query type: ${query.type}`);
    }
  }

  /**
   * Query census data for a point location
   */
  private async queryByPoint(query: SpatialCensusQuery): Promise<SpatialCensusResponse> {
    if (!query.coordinates) {
      throw new Error('Coordinates are required for point query');
    }

    try {
      // Step 1: Geocode the point to get census geographies
      const geographies = await this.geocodePoint(
        query.coordinates.latitude,
        query.coordinates.longitude
      );

      // Step 2: Determine which geography level to use
      const geography = this.selectGeographyLevel(geographies, query.level);

      // Step 3: Fetch census data for the geography
      const variables = query.variables || this.getDefaultVariables();
      const censusResponse = await this.censusClient.getCensusData({
        variables,
        geography,
        year: query.year,
      });

      // Step 4: Get geometry for the geography
      const geometry = await this.getGeometryForGeography(geography);

      return {
        features: [
          {
            geometry,
            properties: censusResponse.data,
          },
        ],
        count: 1,
      };
    } catch (error: any) {
      throw new Error(`Point query failed: ${error.message}`);
    }
  }

  /**
   * Query census data within a bounding box
   */
  private async queryByBoundingBox(query: SpatialCensusQuery): Promise<SpatialCensusResponse> {
    if (!query.boundingBox) {
      throw new Error('Bounding box is required for bbox query');
    }

    try {
      // Step 1: Get all geographies within the bounding box
      const geographies = await this.getGeographiesInBounds(query.boundingBox, query.level);

      // Step 2: Fetch census data for each geography
      const variables = query.variables || this.getDefaultVariables();
      const batchResponse = await this.censusClient.getBatchCensusData({
        geographies,
        variables,
        year: query.year,
      });

      // Step 3: Get geometries for each geography
      const features = await Promise.all(
        batchResponse.data.map(async (censusData) => {
          const geometry = await this.getGeometryForGeography(censusData.geography);
          return {
            geometry,
            properties: censusData,
          };
        })
      );

      return {
        features,
        count: features.length,
        bounds: query.boundingBox,
      };
    } catch (error: any) {
      throw new Error(`Bounding box query failed: ${error.message}`);
    }
  }

  /**
   * Query census data within a polygon
   */
  private async queryByPolygon(query: SpatialCensusQuery): Promise<SpatialCensusResponse> {
    if (!query.polygon) {
      throw new Error('Polygon is required for polygon query');
    }

    try {
      // Step 1: Convert polygon to bounding box for initial filtering
      const bbox = this.polygonToBoundingBox(query.polygon);

      // Step 2: Get all geographies in the bounding box
      const geographies = await this.getGeographiesInBounds(bbox, query.level);

      // Step 3: Filter geographies that intersect with the polygon
      const intersectingGeographies = await this.filterGeographiesByPolygon(
        geographies,
        query.polygon
      );

      // Step 4: Fetch census data for intersecting geographies
      const variables = query.variables || this.getDefaultVariables();
      const batchResponse = await this.censusClient.getBatchCensusData({
        geographies: intersectingGeographies,
        variables,
        year: query.year,
      });

      // Step 5: Get geometries for each geography
      const features = await Promise.all(
        batchResponse.data.map(async (censusData) => {
          const geometry = await this.getGeometryForGeography(censusData.geography);
          return {
            geometry,
            properties: censusData,
          };
        })
      );

      return {
        features,
        count: features.length,
        bounds: bbox,
      };
    } catch (error: any) {
      throw new Error(`Polygon query failed: ${error.message}`);
    }
  }

  /**
   * Geocode a point to census geographies
   */
  private async geocodePoint(
    latitude: number,
    longitude: number
  ): Promise<{
    state: string;
    county: string;
    tract: string;
    blockGroup: string;
  }> {
    try {
      const response = await axios.get(`${this.geocodingBaseUrl}/geographies/coordinates`, {
        params: {
          x: longitude,
          y: latitude,
          benchmark: 'Public_AR_Current',
          vintage: 'Current_Current',
          format: 'json',
        },
      });

      const geographies = response.data?.result?.geographies;
      if (!geographies) {
        throw new Error('No geographies found for coordinates');
      }

      // Extract FIPS codes
      const censusTract = geographies['Census Tracts']?.[0];
      const censusBlockGroup = geographies['Census Block Groups']?.[0];

      return {
        state: censusTract?.STATE || '',
        county: censusTract?.COUNTY || '',
        tract: censusTract?.TRACT || '',
        blockGroup: censusBlockGroup?.BLKGRP || '',
      };
    } catch (error: any) {
      throw new Error(`Geocoding failed: ${error.message}`);
    }
  }

  /**
   * Select appropriate geography level from geocoding results
   */
  private selectGeographyLevel(
    geographies: {
      state: string;
      county: string;
      tract: string;
      blockGroup: string;
    },
    level: 'tract' | 'block-group' | 'county'
  ): GeographicArea {
    switch (level) {
      case 'block-group':
        return {
          type: 'block-group',
          state: geographies.state,
          county: geographies.county,
          tract: geographies.tract,
          blockGroup: geographies.blockGroup,
        };
      case 'tract':
        return {
          type: 'tract',
          state: geographies.state,
          county: geographies.county,
          tract: geographies.tract,
        };
      case 'county':
        return {
          type: 'county',
          state: geographies.state,
          county: geographies.county,
        };
      default:
        throw new Error(`Unsupported geography level: ${level}`);
    }
  }

  /**
   * Get all geographies within a bounding box
   * Note: This is a simplified implementation. In production, you'd use a proper spatial database.
   */
  private async getGeographiesInBounds(
    bbox: BoundingBox,
    level: 'tract' | 'block-group' | 'county'
  ): Promise<GeographicArea[]> {
    // This is a placeholder implementation
    // In production, you would:
    // 1. Query a spatial database (PostGIS) with census geometry data
    // 2. Or use the Census Bureau's TIGER/Line shapefiles
    // 3. Or use a third-party geocoding service

    // For now, return a single geography based on the center point
    const centerLat = (bbox.north + bbox.south) / 2;
    const centerLon = (bbox.east + bbox.west) / 2;

    const geographies = await this.geocodePoint(centerLat, centerLon);
    return [this.selectGeographyLevel(geographies, level)];
  }

  /**
   * Filter geographies by polygon intersection
   */
  private async filterGeographiesByPolygon(
    geographies: GeographicArea[],
    polygon: GeoJSONGeometry
  ): Promise<GeographicArea[]> {
    // This is a placeholder implementation
    // In production, you would use a proper spatial library like Turf.js
    // to check for polygon intersection

    // For now, return all geographies
    return geographies;
  }

  /**
   * Get geometry for a geographic area
   */
  private async getGeometryForGeography(geography: GeographicArea): Promise<GeoJSONGeometry> {
    // This is a placeholder implementation
    // In production, you would:
    // 1. Query the Census Bureau's TIGER/Line database
    // 2. Or use a cached geometry database
    // 3. Or use a third-party service

    // For now, return a simple point geometry
    return {
      type: 'Point',
      coordinates: [0, 0],
    };
  }

  /**
   * Convert polygon to bounding box
   */
  private polygonToBoundingBox(polygon: GeoJSONGeometry): BoundingBox {
    // Extract coordinates based on geometry type
    let coords: number[][] = [];

    if (polygon.type === 'Polygon') {
      coords = polygon.coordinates[0] as number[][];
    } else if (polygon.type === 'MultiPolygon') {
      coords = (polygon.coordinates[0] as number[][][])[0];
    }

    // Find min/max lat/lon
    const lons = coords.map((c) => c[0]);
    const lats = coords.map((c) => c[1]);

    return {
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lons),
      west: Math.min(...lons),
    };
  }

  /**
   * Get default census variables for queries
   */
  private getDefaultVariables(): string[] {
    return [
      CENSUS_VARIABLES.TOTAL_POPULATION,
      CENSUS_VARIABLES.MEDIAN_HOUSEHOLD_INCOME,
      CENSUS_VARIABLES.TOTAL_HOUSING_UNITS,
      CENSUS_VARIABLES.TOTAL_HOUSEHOLDS,
      CENSUS_VARIABLES.MEDIAN_AGE,
      CENSUS_VARIABLES.PUBLIC_TRANSIT,
      CENSUS_VARIABLES.TOTAL_WORKERS,
    ];
  }
}
