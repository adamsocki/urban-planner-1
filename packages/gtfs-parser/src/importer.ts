/**
 * GTFS Importer
 *
 * Handles downloading, extracting, and importing GTFS feeds
 */

import AdmZip from 'adm-zip';
import { parse } from 'csv-parse/sync';
import { GTFSFeed, ValidationResult } from './types';
import { validateGTFS } from './validator';

export class GTFSImporter {
  /**
   * Import GTFS from a ZIP file (URL or local path)
   */
  async importFeed(source: string | Buffer): Promise<{
    feed: GTFSFeed;
    validation: ValidationResult;
  }> {
    // 1. Download or load ZIP
    const zipBuffer = await this.loadZip(source);

    // 2. Extract files
    const files = this.extractFiles(zipBuffer);

    // 3. Parse CSV files
    const feed = this.parseFiles(files);

    // 4. Validate
    const validation = validateGTFS(feed);

    return { feed, validation };
  }

  /**
   * Load ZIP file from URL or buffer
   */
  private async loadZip(source: string | Buffer): Promise<Buffer> {
    if (Buffer.isBuffer(source)) {
      return source;
    }

    // If URL, fetch it
    if (source.startsWith('http://') || source.startsWith('https://')) {
      const response = await fetch(source);
      if (!response.ok) {
        throw new Error(`Failed to download GTFS: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    }

    // If local file path
    const fs = await import('fs/promises');
    return await fs.readFile(source);
  }

  /**
   * Extract files from ZIP
   */
  private extractFiles(zipBuffer: Buffer): Map<string, string> {
    const zip = new AdmZip(zipBuffer);
    const files = new Map<string, string>();

    for (const entry of zip.getEntries()) {
      if (!entry.isDirectory && entry.entryName.endsWith('.txt')) {
        const filename = entry.entryName.split('/').pop()!;
        const content = entry.getData().toString('utf8');
        files.set(filename, content);
      }
    }

    return files;
  }

  /**
   * Parse CSV files into typed objects
   */
  private parseFiles(files: Map<string, string>): GTFSFeed {
    const feed: GTFSFeed = {
      agency: [],
      routes: [],
      stops: [],
      trips: [],
      stop_times: [],
    };

    // Required files
    if (files.has('agency.txt')) {
      feed.agency = this.parseCSV(files.get('agency.txt')!);
    }

    if (files.has('routes.txt')) {
      feed.routes = this.parseCSV(files.get('routes.txt')!);
    }

    if (files.has('stops.txt')) {
      feed.stops = this.parseCSV(files.get('stops.txt')!).map(stop => ({
        ...stop,
        stop_lat: parseFloat(stop.stop_lat),
        stop_lon: parseFloat(stop.stop_lon),
        location_type: stop.location_type ? parseInt(stop.location_type) : 0,
        wheelchair_boarding: stop.wheelchair_boarding ? parseInt(stop.wheelchair_boarding) : 0,
      }));
    }

    if (files.has('trips.txt')) {
      feed.trips = this.parseCSV(files.get('trips.txt')!);
    }

    if (files.has('stop_times.txt')) {
      feed.stop_times = this.parseCSV(files.get('stop_times.txt')!).map(st => ({
        ...st,
        stop_sequence: parseInt(st.stop_sequence),
        pickup_type: st.pickup_type ? parseInt(st.pickup_type) : 0,
        drop_off_type: st.drop_off_type ? parseInt(st.drop_off_type) : 0,
      }));
    }

    // Optional files
    if (files.has('calendar.txt')) {
      feed.calendar = this.parseCSV(files.get('calendar.txt')!);
    }

    if (files.has('calendar_dates.txt')) {
      feed.calendar_dates = this.parseCSV(files.get('calendar_dates.txt')!);
    }

    if (files.has('shapes.txt')) {
      feed.shapes = this.parseCSV(files.get('shapes.txt')!).map(shape => ({
        ...shape,
        shape_pt_lat: parseFloat(shape.shape_pt_lat),
        shape_pt_lon: parseFloat(shape.shape_pt_lon),
        shape_pt_sequence: parseInt(shape.shape_pt_sequence),
        shape_dist_traveled: shape.shape_dist_traveled ? parseFloat(shape.shape_dist_traveled) : undefined,
      }));
    }

    if (files.has('feed_info.txt')) {
      feed.feed_info = this.parseCSV(files.get('feed_info.txt')!);
    }

    return feed;
  }

  /**
   * Parse CSV content
   */
  private parseCSV(content: string): any[] {
    return parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
    });
  }

  /**
   * Build GeoJSON geometries from shapes
   */
  buildRouteGeometries(feed: GTFSFeed): Map<string, [number, number][]> {
    const geometries = new Map<string, [number, number][]>();

    if (!feed.shapes) {
      return geometries;
    }

    // Group shapes by shape_id
    const shapeGroups = new Map<string, typeof feed.shapes>();
    for (const shape of feed.shapes) {
      if (!shapeGroups.has(shape.shape_id)) {
        shapeGroups.set(shape.shape_id, []);
      }
      shapeGroups.get(shape.shape_id)!.push(shape);
    }

    // Build line strings
    for (const [shapeId, points] of shapeGroups) {
      const sorted = points.sort((a, b) => a.shape_pt_sequence - b.shape_pt_sequence);
      const coordinates: [number, number][] = sorted.map(p => [p.shape_pt_lon, p.shape_pt_lat]);
      geometries.set(shapeId, coordinates);
    }

    return geometries;
  }

  /**
   * Calculate feed statistics
   */
  calculateStats(feed: GTFSFeed): {
    totalStops: number;
    totalRoutes: number;
    totalTrips: number;
    routesByType: Record<number, number>;
    dateRange: { start?: string; end?: string };
  } {
    const routesByType: Record<number, number> = {};

    for (const route of feed.routes) {
      const type = route.route_type;
      routesByType[type] = (routesByType[type] || 0) + 1;
    }

    let startDate: string | undefined;
    let endDate: string | undefined;

    if (feed.calendar && feed.calendar.length > 0) {
      const dates = feed.calendar.map(c => ({
        start: c.start_date,
        end: c.end_date,
      }));
      startDate = dates.reduce((min, d) => d.start < min ? d.start : min, dates[0].start);
      endDate = dates.reduce((max, d) => d.end > max ? d.end : max, dates[0].end);
    }

    return {
      totalStops: feed.stops.length,
      totalRoutes: feed.routes.length,
      totalTrips: feed.trips.length,
      routesByType,
      dateRange: { start: startDate, end: endDate },
    };
  }
}
