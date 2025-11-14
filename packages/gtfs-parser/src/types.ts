/**
 * TypeScript types for GTFS specification
 * Based on: https://gtfs.org/schedule/reference/
 */

export interface GTFSAgency {
  agency_id?: string;
  agency_name: string;
  agency_url: string;
  agency_timezone: string;
  agency_lang?: string;
  agency_phone?: string;
  agency_fare_url?: string;
  agency_email?: string;
}

export interface GTFSRoute {
  route_id: string;
  agency_id?: string;
  route_short_name?: string;
  route_long_name?: string;
  route_desc?: string;
  route_type: RouteType;
  route_url?: string;
  route_color?: string;
  route_text_color?: string;
  route_sort_order?: number;
  continuous_pickup?: ContinuousPickupDropOff;
  continuous_drop_off?: ContinuousPickupDropOff;
}

export enum RouteType {
  Tram = 0,
  Subway = 1,
  Rail = 2,
  Bus = 3,
  Ferry = 4,
  CableTram = 5,
  AerialLift = 6,
  Funicular = 7,
  Trolleybus = 11,
  Monorail = 12,
}

export enum ContinuousPickupDropOff {
  Continuous = 0,
  NotAvailable = 1,
  MustPhoneAgency = 2,
  MustCoordinateWithDriver = 3,
}

export interface GTFSStop {
  stop_id: string;
  stop_code?: string;
  stop_name?: string;
  stop_desc?: string;
  stop_lat?: number;
  stop_lon?: number;
  zone_id?: string;
  stop_url?: string;
  location_type?: LocationType;
  parent_station?: string;
  stop_timezone?: string;
  wheelchair_boarding?: WheelchairAccessible;
  level_id?: string;
  platform_code?: string;
}

export enum LocationType {
  StopPlatform = 0,
  Station = 1,
  EntranceExit = 2,
  GenericNode = 3,
  BoardingArea = 4,
}

export enum WheelchairAccessible {
  NoInfo = 0,
  Accessible = 1,
  NotAccessible = 2,
}

export interface GTFSTrip {
  route_id: string;
  service_id: string;
  trip_id: string;
  trip_headsign?: string;
  trip_short_name?: string;
  direction_id?: DirectionId;
  block_id?: string;
  shape_id?: string;
  wheelchair_accessible?: WheelchairAccessible;
  bikes_allowed?: BikesAllowed;
}

export enum DirectionId {
  Outbound = 0,
  Inbound = 1,
}

export enum BikesAllowed {
  NoInfo = 0,
  Allowed = 1,
  NotAllowed = 2,
}

export interface GTFSStopTime {
  trip_id: string;
  arrival_time: string;
  departure_time: string;
  stop_id: string;
  stop_sequence: number;
  stop_headsign?: string;
  pickup_type?: PickupDropOffType;
  drop_off_type?: PickupDropOffType;
  continuous_pickup?: ContinuousPickupDropOff;
  continuous_drop_off?: ContinuousPickupDropOff;
  shape_dist_traveled?: number;
  timepoint?: Timepoint;
}

export enum PickupDropOffType {
  RegularlyScheduled = 0,
  NotAvailable = 1,
  MustPhoneAgency = 2,
  MustCoordinateWithDriver = 3,
}

export enum Timepoint {
  Approximate = 0,
  Exact = 1,
}

export interface GTFSCalendar {
  service_id: string;
  monday: BinaryBoolean;
  tuesday: BinaryBoolean;
  wednesday: BinaryBoolean;
  thursday: BinaryBoolean;
  friday: BinaryBoolean;
  saturday: BinaryBoolean;
  sunday: BinaryBoolean;
  start_date: string; // YYYYMMDD
  end_date: string; // YYYYMMDD
}

export type BinaryBoolean = 0 | 1;

export interface GTFSCalendarDate {
  service_id: string;
  date: string; // YYYYMMDD
  exception_type: ExceptionType;
}

export enum ExceptionType {
  ServiceAdded = 1,
  ServiceRemoved = 2,
}

export interface GTFSShape {
  shape_id: string;
  shape_pt_lat: number;
  shape_pt_lon: number;
  shape_pt_sequence: number;
  shape_dist_traveled?: number;
}

export interface GTFSFeedInfo {
  feed_publisher_name: string;
  feed_publisher_url: string;
  feed_lang: string;
  default_lang?: string;
  feed_start_date?: string;
  feed_end_date?: string;
  feed_version?: string;
  feed_contact_email?: string;
  feed_contact_url?: string;
}

/**
 * Parsed GTFS Feed structure
 */
export interface GTFSFeed {
  agency: GTFSAgency[];
  routes: GTFSRoute[];
  stops: GTFSStop[];
  trips: GTFSTrip[];
  stop_times: GTFSStopTime[];
  calendar?: GTFSCalendar[];
  calendar_dates?: GTFSCalendarDate[];
  shapes?: GTFSShape[];
  feed_info?: GTFSFeedInfo[];
  // Optional files
  frequencies?: any[];
  transfers?: any[];
  pathways?: any[];
  levels?: any[];
  translations?: any[];
  attributions?: any[];
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  stats: FeedStats;
}

export interface ValidationError {
  file: string;
  line?: number;
  field?: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning extends ValidationError {
  severity: 'warning';
}

export interface FeedStats {
  agencies: number;
  routes: number;
  stops: number;
  trips: number;
  stopTimes: number;
  shapes: number;
  validFrom?: Date;
  validUntil?: Date;
  routeTypes: Record<RouteType, number>;
}

/**
 * GeoJSON representation of GTFS data
 */
export interface GTFSRouteGeoJSON {
  type: 'Feature';
  geometry: {
    type: 'LineString';
    coordinates: [number, number][]; // [lon, lat]
  };
  properties: GTFSRoute & {
    shape_id?: string;
    trip_count?: number;
  };
}

export interface GTFSStopGeoJSON {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [lon, lat]
  };
  properties: GTFSStop & {
    routes?: string[]; // route_ids serving this stop
    trip_count?: number;
  };
}
