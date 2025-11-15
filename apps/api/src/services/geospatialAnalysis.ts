/**
 * Geospatial Analysis Service
 * Provides spatial analysis utilities using Turf.js
 */

import * as turf from '@turf/turf';
import type { Feature, Point, LineString, Polygon, FeatureCollection } from 'geojson';

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
  features?: FeatureCollection;
}

export class GeospatialAnalysisService {
  /**
   * Calculate service area coverage around transit stops
   * @param stops Array of stop points
   * @param radiusMeters Buffer radius in meters (default 400m walking distance)
   */
  static calculateStopCoverage(stops: StopPoint[], radiusMeters: number = 400): AnalysisResult {
    const features = stops.map((stop) => {
      const point = turf.point([stop.lon, stop.lat], {
        id: stop.id,
        name: stop.name,
        ...stop.properties,
      });
      return turf.buffer(point, radiusMeters, { units: 'meters' });
    });

    const coverage = turf.featureCollection(features);

    // Calculate total coverage area
    const totalArea = features.reduce((sum, feature) => {
      return sum + turf.area(feature);
    }, 0);

    // Convert to square kilometers
    const areaKm2 = totalArea / 1_000_000;

    return {
      type: 'stop_coverage',
      summary: `${stops.length} stops provide ${areaKm2.toFixed(2)} km² of coverage within ${radiusMeters}m walking distance`,
      metrics: {
        stopCount: stops.length,
        radiusMeters,
        totalAreaKm2: areaKm2,
        averageAreaPerStop: areaKm2 / stops.length,
      },
      features: coverage,
    };
  }

  /**
   * Find stops within a radius of a location
   */
  static findNearbyStops(
    targetLat: number,
    targetLon: number,
    stops: StopPoint[],
    radiusMeters: number = 800
  ): AnalysisResult {
    const targetPoint = turf.point([targetLon, targetLat]);

    const nearbyStops = stops
      .map((stop) => {
        const stopPoint = turf.point([stop.lon, stop.lat]);
        const distance = turf.distance(targetPoint, stopPoint, { units: 'meters' });
        return { ...stop, distance };
      })
      .filter((stop) => stop.distance <= radiusMeters)
      .sort((a, b) => a.distance - b.distance);

    const features = nearbyStops.map((stop) =>
      turf.point([stop.lon, stop.lat], {
        id: stop.id,
        name: stop.name,
        distance: stop.distance,
        ...stop.properties,
      })
    );

    return {
      type: 'nearby_stops',
      summary: `Found ${nearbyStops.length} stops within ${radiusMeters}m of location`,
      metrics: {
        targetLocation: [targetLat, targetLon],
        radiusMeters,
        stopsFound: nearbyStops.length,
        closestStop: nearbyStops[0] ? {
          name: nearbyStops[0].name,
          distance: nearbyStops[0].distance.toFixed(0) + 'm',
        } : null,
      },
      features: turf.featureCollection(features),
    };
  }

  /**
   * Calculate route metrics (length, bounding box, etc.)
   */
  static analyzeRoute(route: RouteData): AnalysisResult {
    const lineString = turf.lineString(route.coordinates);
    const length = turf.length(lineString, { units: 'kilometers' });
    const bbox = turf.bbox(lineString);
    const center = turf.center(lineString);

    return {
      type: 'route_analysis',
      summary: `Route ${route.name} is ${length.toFixed(2)} km long`,
      metrics: {
        routeId: route.id,
        routeName: route.name,
        lengthKm: length,
        boundingBox: {
          minLon: bbox[0],
          minLat: bbox[1],
          maxLon: bbox[2],
          maxLat: bbox[3],
        },
        center: center.geometry.coordinates,
        pointCount: route.coordinates.length,
      },
      features: turf.featureCollection([lineString]),
    };
  }

  /**
   * Calculate network connectivity - find which stops are connected by routes
   */
  static analyzeNetworkConnectivity(
    stops: StopPoint[],
    routes: RouteData[]
  ): AnalysisResult {
    const stopMap = new Map(stops.map((s) => [s.id, s]));

    // For each route, find which stops are nearby (within 50m)
    const connections = routes.flatMap((route) => {
      const routeLine = turf.lineString(route.coordinates);

      return stops
        .map((stop) => {
          const stopPoint = turf.point([stop.lon, stop.lat]);
          const distance = turf.pointToLineDistance(stopPoint, routeLine, { units: 'meters' });

          if (distance <= 50) {
            return {
              stopId: stop.id,
              stopName: stop.name,
              routeId: route.id,
              routeName: route.name,
              distance,
            };
          }
          return null;
        })
        .filter((conn): conn is NonNullable<typeof conn> => conn !== null);
    });

    // Count routes per stop
    const routesPerStop = new Map<string, number>();
    connections.forEach((conn) => {
      routesPerStop.set(conn.stopId, (routesPerStop.get(conn.stopId) || 0) + 1);
    });

    const avgRoutesPerStop = Array.from(routesPerStop.values()).reduce((a, b) => a + b, 0) / routesPerStop.size;

    return {
      type: 'network_connectivity',
      summary: `Network has ${connections.length} stop-route connections, averaging ${avgRoutesPerStop.toFixed(1)} routes per stop`,
      metrics: {
        totalConnections: connections.length,
        stopsWithRoutes: routesPerStop.size,
        routesAnalyzed: routes.length,
        avgRoutesPerStop: avgRoutesPerStop,
        highFrequencyStops: Array.from(routesPerStop.entries())
          .filter(([_, count]) => count >= 3)
          .map(([stopId, count]) => ({
            stopId,
            stopName: stopMap.get(stopId)?.name,
            routeCount: count,
          })),
      },
    };
  }

  /**
   * Calculate catchment area population (requires demographic data)
   */
  static calculateCatchmentArea(
    stops: StopPoint[],
    radiusMeters: number = 800,
    demographicAreas?: Feature<Polygon, { population: number }>[]
  ): AnalysisResult {
    // Create buffer zones around all stops
    const buffers = stops.map((stop) =>
      turf.buffer(turf.point([stop.lon, stop.lat]), radiusMeters, { units: 'meters' })
    );

    // Merge overlapping buffers to get total service area
    const merged = buffers.length > 0 ? turf.union(turf.featureCollection(buffers)) : null;

    const totalAreaKm2 = merged ? turf.area(merged) / 1_000_000 : 0;

    let populationServed = 0;
    let areasIntersected = 0;

    // If demographic data provided, calculate population in catchment
    if (demographicAreas && merged) {
      demographicAreas.forEach((area) => {
        const intersection = turf.intersect(turf.featureCollection([merged, area]));
        if (intersection) {
          const overlapRatio = turf.area(intersection) / turf.area(area);
          populationServed += area.properties.population * overlapRatio;
          areasIntersected++;
        }
      });
    }

    return {
      type: 'catchment_area',
      summary: `Service area covers ${totalAreaKm2.toFixed(2)} km²${demographicAreas ? ` serving approximately ${Math.round(populationServed).toLocaleString()} people` : ''}`,
      metrics: {
        stopCount: stops.length,
        radiusMeters,
        totalAreaKm2,
        populationServed: demographicAreas ? Math.round(populationServed) : null,
        areasAnalyzed: demographicAreas?.length || 0,
        areasIntersected,
      },
      features: merged ? turf.featureCollection([merged]) : undefined,
    };
  }

  /**
   * Analyze route overlap - find where multiple routes share corridors
   */
  static analyzeRouteOverlap(routes: RouteData[], bufferMeters: number = 50): AnalysisResult {
    // Create buffers around each route
    const routeBuffers = routes.map((route) => ({
      ...route,
      buffer: turf.buffer(turf.lineString(route.coordinates), bufferMeters, { units: 'meters' }),
    }));

    // Find overlapping areas
    const overlaps: Array<{ routes: string[]; area: number }> = [];

    for (let i = 0; i < routeBuffers.length; i++) {
      for (let j = i + 1; j < routeBuffers.length; j++) {
        const intersection = turf.intersect(
          turf.featureCollection([routeBuffers[i].buffer, routeBuffers[j].buffer])
        );

        if (intersection) {
          overlaps.push({
            routes: [routeBuffers[i].name, routeBuffers[j].name],
            area: turf.area(intersection),
          });
        }
      }
    }

    const totalOverlapArea = overlaps.reduce((sum, overlap) => sum + overlap.area, 0);

    return {
      type: 'route_overlap',
      summary: `Found ${overlaps.length} route overlaps covering ${(totalOverlapArea / 1_000_000).toFixed(3)} km²`,
      metrics: {
        routesAnalyzed: routes.length,
        overlapCount: overlaps.length,
        totalOverlapAreaKm2: totalOverlapArea / 1_000_000,
        majorOverlaps: overlaps
          .sort((a, b) => b.area - a.area)
          .slice(0, 5)
          .map((o) => ({
            routes: o.routes,
            areaKm2: (o.area / 1_000_000).toFixed(3),
          })),
      },
    };
  }

  /**
   * Calculate center point of multiple features
   */
  static findGeographicCenter(points: StopPoint[]): { lat: number; lon: number } {
    const features = turf.featureCollection(
      points.map((p) => turf.point([p.lon, p.lat]))
    );
    const center = turf.center(features);
    return {
      lon: center.geometry.coordinates[0],
      lat: center.geometry.coordinates[1],
    };
  }

  /**
   * Generate isochrones (travel time areas) - simplified version
   */
  static generateIsochrones(
    centerLat: number,
    centerLon: number,
    timeMinutes: number[],
    walkingSpeedKmH: number = 5
  ): AnalysisResult {
    const center = turf.point([centerLon, centerLat]);

    const isochrones = timeMinutes.map((minutes) => {
      const radiusKm = (walkingSpeedKmH * minutes) / 60;
      return turf.buffer(center, radiusKm, { units: 'kilometers' });
    });

    return {
      type: 'isochrones',
      summary: `Generated ${timeMinutes.length} isochrones for walking times: ${timeMinutes.join(', ')} minutes`,
      metrics: {
        centerLocation: [centerLat, centerLon],
        walkingSpeedKmH,
        timeIntervals: timeMinutes,
        radiusKm: timeMinutes.map((m) => (walkingSpeedKmH * m) / 60),
      },
      features: turf.featureCollection(isochrones),
    };
  }
}
