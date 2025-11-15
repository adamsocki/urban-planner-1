/**
 * Geospatial Service
 * Frontend service for geospatial analysis API calls
 */

import { LLMSettings } from '../stores/settingsStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface StopPoint {
  id: string;
  name: string;
  lat: number;
  lon: number;
  properties?: Record<string, any>;
}

export interface RouteData {
  id: string;
  name: string;
  coordinates: [number, number][];
  properties?: Record<string, any>;
}

export interface AnalysisResult {
  type: string;
  summary: string;
  metrics: Record<string, any>;
  features?: any; // GeoJSON FeatureCollection
}

export class GeospatialService {
  /**
   * Calculate stop coverage
   */
  static async calculateStopCoverage(
    stops: StopPoint[],
    radiusMeters: number = 400
  ): Promise<AnalysisResult> {
    const response = await fetch(`${API_BASE_URL}/api/geospatial/stop-coverage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stops, radiusMeters }),
    });

    if (!response.ok) {
      throw new Error('Failed to calculate stop coverage');
    }

    return response.json();
  }

  /**
   * Find nearby stops
   */
  static async findNearbyStops(
    lat: number,
    lon: number,
    stops: StopPoint[],
    radiusMeters: number = 800
  ): Promise<AnalysisResult> {
    const response = await fetch(`${API_BASE_URL}/api/geospatial/nearby-stops`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lon, stops, radiusMeters }),
    });

    if (!response.ok) {
      throw new Error('Failed to find nearby stops');
    }

    return response.json();
  }

  /**
   * Analyze route metrics
   */
  static async analyzeRoute(route: RouteData): Promise<AnalysisResult> {
    const response = await fetch(`${API_BASE_URL}/api/geospatial/analyze-route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ route }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze route');
    }

    return response.json();
  }

  /**
   * Analyze network connectivity
   */
  static async analyzeNetworkConnectivity(
    stops: StopPoint[],
    routes: RouteData[]
  ): Promise<AnalysisResult> {
    const response = await fetch(`${API_BASE_URL}/api/geospatial/network-connectivity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stops, routes }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze network connectivity');
    }

    return response.json();
  }

  /**
   * Calculate catchment area
   */
  static async calculateCatchmentArea(
    stops: StopPoint[],
    radiusMeters: number = 800,
    demographicAreas?: any
  ): Promise<AnalysisResult> {
    const response = await fetch(`${API_BASE_URL}/api/geospatial/catchment-area`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stops, radiusMeters, demographicAreas }),
    });

    if (!response.ok) {
      throw new Error('Failed to calculate catchment area');
    }

    return response.json();
  }

  /**
   * Generate isochrones (travel time areas)
   */
  static async generateIsochrones(
    lat: number,
    lon: number,
    timeMinutes: number[] = [5, 10, 15],
    walkingSpeedKmH: number = 5
  ): Promise<AnalysisResult> {
    const response = await fetch(`${API_BASE_URL}/api/geospatial/isochrones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lon, timeMinutes, walkingSpeedKmH }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate isochrones');
    }

    return response.json();
  }

  /**
   * AI-powered transit network analysis
   */
  static async analyzeTransitNetworkWithAI(
    stops: StopPoint[],
    routes: RouteData[],
    llmConfig: LLMSettings
  ): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/geospatial/ai/analyze-network`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stops, routes, llmConfig }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze network with AI');
    }

    return response.json();
  }

  /**
   * Natural language geospatial query
   */
  static async queryWithNaturalLanguage(
    query: {
      type: 'coverage' | 'accessibility' | 'connectivity' | 'optimization' | 'general';
      question: string;
      context?: {
        stops?: StopPoint[];
        routes?: RouteData[];
        location?: { lat: number; lon: number };
      };
    },
    llmConfig: LLMSettings
  ): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/geospatial/ai/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, llmConfig }),
    });

    if (!response.ok) {
      throw new Error('Failed to process query');
    }

    return response.json();
  }

  /**
   * Generate map-aware document content
   */
  static async generateMapAwareContent(
    documentType: string,
    spatialData: {
      stops?: StopPoint[];
      routes?: RouteData[];
      boundingBox?: [[number, number], [number, number]];
      centerPoint?: [number, number];
    },
    llmConfig: LLMSettings
  ): Promise<{
    executiveSummary: string;
    findings: string;
    recommendations: string;
    mapDescriptions: string[];
  }> {
    const response = await fetch(`${API_BASE_URL}/api/geospatial/ai/map-content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentType, spatialData, llmConfig }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate map-aware content');
    }

    return response.json();
  }

  /**
   * Find geographic center of points
   */
  static async findGeographicCenter(points: StopPoint[]): Promise<{ lat: number; lon: number }> {
    const response = await fetch(`${API_BASE_URL}/api/geospatial/find-center`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ points }),
    });

    if (!response.ok) {
      throw new Error('Failed to find geographic center');
    }

    return response.json();
  }

  /**
   * Analyze route overlap
   */
  static async analyzeRouteOverlap(
    routes: RouteData[],
    bufferMeters: number = 50
  ): Promise<AnalysisResult> {
    const response = await fetch(`${API_BASE_URL}/api/geospatial/route-overlap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ routes, bufferMeters }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze route overlap');
    }

    return response.json();
  }
}
