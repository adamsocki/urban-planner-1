import * as turf from '@turf/turf';
import type { Feature, FeatureCollection, Point, LineString, Polygon, Position, GeoJsonProperties } from 'geojson';
import type { LngLatBoundsLike } from 'mapbox-gl';

/**
 * Convert coordinates array to GeoJSON Point feature
 */
export const createPoint = (
  coordinates: [number, number],
  properties: GeoJsonProperties = {}
): Feature<Point> => {
  return turf.point(coordinates, properties);
};

/**
 * Convert coordinates array to GeoJSON LineString feature
 */
export const createLineString = (
  coordinates: Position[],
  properties: GeoJsonProperties = {}
): Feature<LineString> => {
  return turf.lineString(coordinates, properties);
};

/**
 * Convert coordinates array to GeoJSON Polygon feature
 */
export const createPolygon = (
  coordinates: Position[][],
  properties: GeoJsonProperties = {}
): Feature<Polygon> => {
  return turf.polygon(coordinates, properties);
};

/**
 * Calculate area of a polygon in square meters
 */
export const calculateArea = (polygon: Feature<Polygon> | Polygon): number => {
  return turf.area(polygon);
};

/**
 * Calculate length of a line in meters
 */
export const calculateLength = (
  line: Feature<LineString> | LineString,
  units: turf.Units = 'meters'
): number => {
  return turf.length(line, { units });
};

/**
 * Create a buffer around a feature
 */
export const createBuffer = (
  feature: Feature,
  radius: number,
  units: turf.Units = 'meters'
): Feature<Polygon> | null => {
  try {
    return turf.buffer(feature, radius, { units });
  } catch (error) {
    console.error('Error creating buffer:', error);
    return null;
  }
};

/**
 * Check if a point is inside a polygon
 */
export const isPointInPolygon = (
  point: Feature<Point> | Position,
  polygon: Feature<Polygon> | Polygon
): boolean => {
  const pt = Array.isArray(point) ? turf.point(point) : point;
  return turf.booleanPointInPolygon(pt, polygon);
};

/**
 * Calculate distance between two points
 */
export const calculateDistance = (
  from: Position | Feature<Point>,
  to: Position | Feature<Point>,
  units: turf.Units = 'meters'
): number => {
  const fromPoint = Array.isArray(from) ? turf.point(from) : from;
  const toPoint = Array.isArray(to) ? turf.point(to) : to;
  return turf.distance(fromPoint, toPoint, { units });
};

/**
 * Get center point of a feature or feature collection
 */
export const getCenter = (
  feature: Feature | FeatureCollection
): Feature<Point> => {
  return turf.center(feature);
};

/**
 * Get bounding box of features
 */
export const getBounds = (
  features: Feature | FeatureCollection
): LngLatBoundsLike => {
  const bbox = turf.bbox(features);
  return [
    [bbox[0], bbox[1]],
    [bbox[2], bbox[3]],
  ] as LngLatBoundsLike;
};

/**
 * Simplify a feature's geometry
 */
export const simplifyGeometry = <T extends LineString | Polygon>(
  feature: Feature<T>,
  tolerance: number = 0.01,
  highQuality: boolean = false
): Feature<T> => {
  return turf.simplify(feature, {
    tolerance,
    highQuality,
  });
};

/**
 * Find nearest point on a line from a given point
 */
export const nearestPointOnLine = (
  line: Feature<LineString> | LineString,
  point: Feature<Point> | Position
): Feature<Point> => {
  const pt = Array.isArray(point) ? turf.point(point) : point;
  return turf.nearestPointOnLine(line, pt);
};

/**
 * Create a grid of points within a polygon
 */
export const createPointGrid = (
  bbox: number[],
  cellSize: number,
  units: turf.Units = 'meters'
): FeatureCollection<Point> => {
  return turf.pointGrid(bbox, cellSize, { units });
};

/**
 * Union multiple polygons into one
 */
export const unionPolygons = (
  ...polygons: (Feature<Polygon> | Polygon)[]
): Feature<Polygon> | null => {
  try {
    if (polygons.length === 0) return null;
    if (polygons.length === 1) {
      return polygons[0] as Feature<Polygon>;
    }

    let result = polygons[0] as Feature<Polygon>;
    for (let i = 1; i < polygons.length; i++) {
      const union = turf.union(result, polygons[i] as Feature<Polygon>);
      if (union) result = union as Feature<Polygon>;
    }
    return result;
  } catch (error) {
    console.error('Error creating union:', error);
    return null;
  }
};

/**
 * Get intersection of two polygons
 */
export const intersectPolygons = (
  poly1: Feature<Polygon> | Polygon,
  poly2: Feature<Polygon> | Polygon
): Feature<Polygon> | null => {
  try {
    return turf.intersect(poly1, poly2);
  } catch (error) {
    console.error('Error calculating intersection:', error);
    return null;
  }
};

/**
 * Calculate bearing between two points
 */
export const calculateBearing = (
  from: Position | Feature<Point>,
  to: Position | Feature<Point>
): number => {
  const fromPoint = Array.isArray(from) ? turf.point(from) : from;
  const toPoint = Array.isArray(to) ? turf.point(to) : to;
  return turf.bearing(fromPoint, toPoint);
};

/**
 * Get destination point given distance and bearing
 */
export const getDestination = (
  origin: Position | Feature<Point>,
  distance: number,
  bearing: number,
  units: turf.Units = 'meters'
): Feature<Point> => {
  const originPoint = Array.isArray(origin) ? turf.point(origin) : origin;
  return turf.destination(originPoint, distance, bearing, { units });
};

/**
 * Check if two features intersect
 */
export const doFeaturesIntersect = (
  feature1: Feature,
  feature2: Feature
): boolean => {
  try {
    return turf.booleanIntersects(feature1, feature2);
  } catch (error) {
    console.error('Error checking intersection:', error);
    return false;
  }
};

/**
 * Get points along a line at regular intervals
 */
export const getPointsAlongLine = (
  line: Feature<LineString> | LineString,
  interval: number,
  units: turf.Units = 'meters'
): FeatureCollection<Point> => {
  const length = turf.length(line, { units });
  const points: Feature<Point>[] = [];

  for (let i = 0; i <= length; i += interval) {
    const point = turf.along(line, i, { units });
    points.push(point);
  }

  return turf.featureCollection(points);
};

/**
 * Convert feature collection to GeoJSON string
 */
export const featureCollectionToGeoJSON = (
  fc: FeatureCollection
): string => {
  return JSON.stringify(fc, null, 2);
};

/**
 * Parse GeoJSON string to feature collection
 */
export const parseGeoJSON = (
  geojson: string
): FeatureCollection | null => {
  try {
    const parsed = JSON.parse(geojson);
    if (parsed.type === 'FeatureCollection') {
      return parsed as FeatureCollection;
    } else if (parsed.type === 'Feature') {
      return turf.featureCollection([parsed]);
    }
    return null;
  } catch (error) {
    console.error('Error parsing GeoJSON:', error);
    return null;
  }
};

/**
 * Validate GeoJSON feature
 */
export const isValidFeature = (feature: any): feature is Feature => {
  return (
    feature &&
    typeof feature === 'object' &&
    feature.type === 'Feature' &&
    feature.geometry &&
    feature.geometry.type &&
    feature.geometry.coordinates
  );
};

/**
 * Get random color for layer visualization
 */
export const getRandomColor = (): string => {
  const colors = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#FFA07A',
    '#98D8C8',
    '#F7DC6F',
    '#BB8FCE',
    '#85C1E2',
    '#F8B739',
    '#52BE80',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * Format coordinates to readable string
 */
export const formatCoordinates = (
  coordinates: Position,
  precision: number = 6
): string => {
  return `${coordinates[1].toFixed(precision)}°, ${coordinates[0].toFixed(precision)}°`;
};

/**
 * Format area to readable string
 */
export const formatArea = (area: number): string => {
  if (area < 10000) {
    return `${area.toFixed(2)} m²`;
  } else if (area < 1000000) {
    return `${(area / 10000).toFixed(2)} hectares`;
  } else {
    return `${(area / 1000000).toFixed(2)} km²`;
  }
};

/**
 * Format distance to readable string
 */
export const formatDistance = (distance: number): string => {
  if (distance < 1000) {
    return `${distance.toFixed(2)} m`;
  } else {
    return `${(distance / 1000).toFixed(2)} km`;
  }
};
