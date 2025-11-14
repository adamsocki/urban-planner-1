/**
 * GTFS Validator
 *
 * Validates GTFS feeds against the specification
 * https://gtfs.org/schedule/reference/
 */

import { GTFSFeed, ValidationResult, ValidationError, FeedStats, RouteType } from './types';

export function validateGTFS(feed: GTFSFeed): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Check required files
  if (!feed.agency || feed.agency.length === 0) {
    errors.push({
      file: 'agency.txt',
      message: 'Required file agency.txt is missing or empty',
      severity: 'error',
    });
  }

  if (!feed.routes || feed.routes.length === 0) {
    errors.push({
      file: 'routes.txt',
      message: 'Required file routes.txt is missing or empty',
      severity: 'error',
    });
  }

  if (!feed.stops || feed.stops.length === 0) {
    errors.push({
      file: 'stops.txt',
      message: 'Required file stops.txt is missing or empty',
      severity: 'error',
    });
  }

  if (!feed.trips || feed.trips.length === 0) {
    errors.push({
      file: 'trips.txt',
      message: 'Required file trips.txt is missing or empty',
      severity: 'error',
    });
  }

  if (!feed.stop_times || feed.stop_times.length === 0) {
    errors.push({
      file: 'stop_times.txt',
      message: 'Required file stop_times.txt is missing or empty',
      severity: 'error',
    });
  }

  // Check calendar or calendar_dates
  if ((!feed.calendar || feed.calendar.length === 0) &&
      (!feed.calendar_dates || feed.calendar_dates.length === 0)) {
    errors.push({
      file: 'calendar.txt',
      message: 'Either calendar.txt or calendar_dates.txt must be provided',
      severity: 'error',
    });
  }

  // Validate agencies
  if (feed.agency) {
    feed.agency.forEach((agency, index) => {
      if (!agency.agency_name) {
        errors.push({
          file: 'agency.txt',
          line: index + 2,
          field: 'agency_name',
          message: 'agency_name is required',
          severity: 'error',
        });
      }
      if (!agency.agency_url) {
        errors.push({
          file: 'agency.txt',
          line: index + 2,
          field: 'agency_url',
          message: 'agency_url is required',
          severity: 'error',
        });
      }
      if (!agency.agency_timezone) {
        errors.push({
          file: 'agency.txt',
          line: index + 2,
          field: 'agency_timezone',
          message: 'agency_timezone is required',
          severity: 'error',
        });
      }
    });
  }

  // Validate routes
  if (feed.routes) {
    feed.routes.forEach((route, index) => {
      if (!route.route_id) {
        errors.push({
          file: 'routes.txt',
          line: index + 2,
          field: 'route_id',
          message: 'route_id is required',
          severity: 'error',
        });
      }
      if (route.route_type === undefined || route.route_type === null) {
        errors.push({
          file: 'routes.txt',
          line: index + 2,
          field: 'route_type',
          message: 'route_type is required',
          severity: 'error',
        });
      }
      if (!route.route_short_name && !route.route_long_name) {
        errors.push({
          file: 'routes.txt',
          line: index + 2,
          message: 'Either route_short_name or route_long_name must be provided',
          severity: 'error',
        });
      }
    });
  }

  // Validate stops
  if (feed.stops) {
    feed.stops.forEach((stop, index) => {
      if (!stop.stop_id) {
        errors.push({
          file: 'stops.txt',
          line: index + 2,
          field: 'stop_id',
          message: 'stop_id is required',
          severity: 'error',
        });
      }

      // For stops/platforms (location_type 0 or undefined), coordinates are required
      if ((stop.location_type === 0 || stop.location_type === undefined)) {
        if (stop.stop_lat === undefined || stop.stop_lat === null) {
          errors.push({
            file: 'stops.txt',
            line: index + 2,
            field: 'stop_lat',
            message: 'stop_lat is required for stops and platforms',
            severity: 'error',
          });
        }
        if (stop.stop_lon === undefined || stop.stop_lon === null) {
          errors.push({
            file: 'stops.txt',
            line: index + 2,
            field: 'stop_lon',
            message: 'stop_lon is required for stops and platforms',
            severity: 'error',
          });
        }

        // Validate coordinate ranges
        if (stop.stop_lat !== undefined && (stop.stop_lat < -90 || stop.stop_lat > 90)) {
          errors.push({
            file: 'stops.txt',
            line: index + 2,
            field: 'stop_lat',
            message: `Invalid latitude: ${stop.stop_lat} (must be between -90 and 90)`,
            severity: 'error',
          });
        }
        if (stop.stop_lon !== undefined && (stop.stop_lon < -180 || stop.stop_lon > 180)) {
          errors.push({
            file: 'stops.txt',
            line: index + 2,
            field: 'stop_lon',
            message: `Invalid longitude: ${stop.stop_lon} (must be between -180 and 180)`,
            severity: 'error',
          });
        }
      }
    });
  }

  // Validate referential integrity
  const routeIds = new Set(feed.routes?.map(r => r.route_id) || []);
  const stopIds = new Set(feed.stops?.map(s => s.stop_id) || []);
  const tripIds = new Set(feed.trips?.map(t => t.trip_id) || []);

  // Check trips reference valid routes
  if (feed.trips) {
    feed.trips.forEach((trip, index) => {
      if (!routeIds.has(trip.route_id)) {
        errors.push({
          file: 'trips.txt',
          line: index + 2,
          field: 'route_id',
          message: `route_id '${trip.route_id}' not found in routes.txt`,
          severity: 'error',
        });
      }
    });
  }

  // Check stop_times reference valid trips and stops
  if (feed.stop_times) {
    feed.stop_times.forEach((stopTime, index) => {
      if (!tripIds.has(stopTime.trip_id)) {
        errors.push({
          file: 'stop_times.txt',
          line: index + 2,
          field: 'trip_id',
          message: `trip_id '${stopTime.trip_id}' not found in trips.txt`,
          severity: 'error',
        });
      }
      if (!stopIds.has(stopTime.stop_id)) {
        errors.push({
          file: 'stop_times.txt',
          line: index + 2,
          field: 'stop_id',
          message: `stop_id '${stopTime.stop_id}' not found in stops.txt`,
          severity: 'error',
        });
      }
    });
  }

  // Calculate statistics
  const routeTypes: Record<RouteType, number> = {} as any;
  feed.routes?.forEach(route => {
    routeTypes[route.route_type] = (routeTypes[route.route_type] || 0) + 1;
  });

  const stats: FeedStats = {
    agencies: feed.agency?.length || 0,
    routes: feed.routes?.length || 0,
    stops: feed.stops?.length || 0,
    trips: feed.trips?.length || 0,
    stopTimes: feed.stop_times?.length || 0,
    shapes: feed.shapes?.length || 0,
    routeTypes,
  };

  // Extract date range
  if (feed.calendar && feed.calendar.length > 0) {
    const startDates = feed.calendar.map(c => parseGTFSDate(c.start_date));
    const endDates = feed.calendar.map(c => parseGTFSDate(c.end_date));
    stats.validFrom = new Date(Math.min(...startDates.map(d => d.getTime())));
    stats.validUntil = new Date(Math.max(...endDates.map(d => d.getTime())));
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats,
  };
}

function parseGTFSDate(dateStr: string): Date {
  // GTFS dates are in YYYYMMDD format
  const year = parseInt(dateStr.substring(0, 4));
  const month = parseInt(dateStr.substring(4, 6)) - 1; // Month is 0-indexed
  const day = parseInt(dateStr.substring(6, 8));
  return new Date(year, month, day);
}
