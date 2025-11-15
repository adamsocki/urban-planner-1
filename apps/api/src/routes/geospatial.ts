/**
 * Geospatial Analysis Routes
 * API endpoints for AI-powered geospatial analysis
 */

import express from 'express';
import { GeospatialAnalysisService, StopPoint, RouteData } from '../services/geospatialAnalysis';
import { AIGeospatialAnalyzer, GeospatialQuery, LLMConfig } from '../services/aiGeospatialAnalyzer';

const router = express.Router();

/**
 * Calculate stop coverage analysis
 * POST /api/geospatial/stop-coverage
 */
router.post('/stop-coverage', async (req, res) => {
  try {
    const { stops, radiusMeters = 400 } = req.body;

    if (!stops || !Array.isArray(stops)) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Stops array is required',
      });
    }

    const result = GeospatialAnalysisService.calculateStopCoverage(
      stops as StopPoint[],
      radiusMeters
    );

    res.json(result);
  } catch (error: any) {
    console.error('Stop coverage analysis error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * Find nearby stops
 * POST /api/geospatial/nearby-stops
 */
router.post('/nearby-stops', async (req, res) => {
  try {
    const { lat, lon, stops, radiusMeters = 800 } = req.body;

    if (lat === undefined || lon === undefined || !stops) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'lat, lon, and stops are required',
      });
    }

    const result = GeospatialAnalysisService.findNearbyStops(
      lat,
      lon,
      stops as StopPoint[],
      radiusMeters
    );

    res.json(result);
  } catch (error: any) {
    console.error('Nearby stops analysis error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * Analyze route metrics
 * POST /api/geospatial/analyze-route
 */
router.post('/analyze-route', async (req, res) => {
  try {
    const { route } = req.body;

    if (!route || !route.coordinates) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Route with coordinates is required',
      });
    }

    const result = GeospatialAnalysisService.analyzeRoute(route as RouteData);

    res.json(result);
  } catch (error: any) {
    console.error('Route analysis error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * Analyze network connectivity
 * POST /api/geospatial/network-connectivity
 */
router.post('/network-connectivity', async (req, res) => {
  try {
    const { stops, routes } = req.body;

    if (!stops || !routes) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Stops and routes are required',
      });
    }

    const result = GeospatialAnalysisService.analyzeNetworkConnectivity(
      stops as StopPoint[],
      routes as RouteData[]
    );

    res.json(result);
  } catch (error: any) {
    console.error('Network connectivity analysis error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * Calculate catchment area
 * POST /api/geospatial/catchment-area
 */
router.post('/catchment-area', async (req, res) => {
  try {
    const { stops, radiusMeters = 800, demographicAreas } = req.body;

    if (!stops) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Stops are required',
      });
    }

    const result = GeospatialAnalysisService.calculateCatchmentArea(
      stops as StopPoint[],
      radiusMeters,
      demographicAreas
    );

    res.json(result);
  } catch (error: any) {
    console.error('Catchment area analysis error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * Generate isochrones (travel time areas)
 * POST /api/geospatial/isochrones
 */
router.post('/isochrones', async (req, res) => {
  try {
    const { lat, lon, timeMinutes = [5, 10, 15], walkingSpeedKmH = 5 } = req.body;

    if (lat === undefined || lon === undefined) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'lat and lon are required',
      });
    }

    const result = GeospatialAnalysisService.generateIsochrones(
      lat,
      lon,
      timeMinutes,
      walkingSpeedKmH
    );

    res.json(result);
  } catch (error: any) {
    console.error('Isochrone generation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * AI-powered transit network analysis
 * POST /api/geospatial/ai/analyze-network
 */
router.post('/ai/analyze-network', async (req, res) => {
  try {
    const { stops, routes, llmConfig } = req.body;

    if (!stops || !routes || !llmConfig) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Stops, routes, and LLM configuration are required',
      });
    }

    const result = await AIGeospatialAnalyzer.analyzeTransitCoverage(
      stops as StopPoint[],
      routes as RouteData[],
      llmConfig as LLMConfig
    );

    res.json(result);
  } catch (error: any) {
    console.error('AI network analysis error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * Natural language geospatial query
 * POST /api/geospatial/ai/query
 */
router.post('/ai/query', async (req, res) => {
  try {
    const { query, llmConfig } = req.body;

    if (!query || !llmConfig) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Query and LLM configuration are required',
      });
    }

    const result = await AIGeospatialAnalyzer.queryTransitNetwork(
      query as GeospatialQuery,
      llmConfig as LLMConfig
    );

    res.json(result);
  } catch (error: any) {
    console.error('AI query error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * Generate map-aware document content
 * POST /api/geospatial/ai/map-content
 */
router.post('/ai/map-content', async (req, res) => {
  try {
    const { documentType, spatialData, llmConfig } = req.body;

    if (!documentType || !spatialData || !llmConfig) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Document type, spatial data, and LLM configuration are required',
      });
    }

    const result = await AIGeospatialAnalyzer.generateMapAwareContent(
      documentType,
      spatialData,
      llmConfig as LLMConfig
    );

    res.json(result);
  } catch (error: any) {
    console.error('Map content generation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * Find geographic center of points
 * POST /api/geospatial/find-center
 */
router.post('/find-center', async (req, res) => {
  try {
    const { points } = req.body;

    if (!points || !Array.isArray(points)) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Points array is required',
      });
    }

    const result = GeospatialAnalysisService.findGeographicCenter(
      points as StopPoint[]
    );

    res.json(result);
  } catch (error: any) {
    console.error('Find center error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * Analyze route overlap
 * POST /api/geospatial/route-overlap
 */
router.post('/route-overlap', async (req, res) => {
  try {
    const { routes, bufferMeters = 50 } = req.body;

    if (!routes || !Array.isArray(routes)) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Routes array is required',
      });
    }

    const result = GeospatialAnalysisService.analyzeRouteOverlap(
      routes as RouteData[],
      bufferMeters
    );

    res.json(result);
  } catch (error: any) {
    console.error('Route overlap analysis error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

export default router;
