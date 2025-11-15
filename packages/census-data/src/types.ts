/**
 * Census Data Types
 * Definitions for US Census Bureau API responses and data structures
 */

import { z } from 'zod';

// ============================================================================
// Geographic Types
// ============================================================================

export interface GeographicArea {
  type: 'state' | 'county' | 'tract' | 'block-group' | 'place' | 'zcta';
  fips?: string;
  state?: string;
  county?: string;
  tract?: string;
  blockGroup?: string;
  name?: string;
}

export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface GeoJSONGeometry {
  type: 'Polygon' | 'MultiPolygon' | 'Point';
  coordinates: number[][] | number[][][] | number[];
}

// ============================================================================
// Census Variable Definitions
// ============================================================================

export interface CensusVariable {
  name: string;
  label: string;
  concept: string;
  predicateType: string;
  group: string;
}

export const CENSUS_VARIABLES = {
  // Population
  TOTAL_POPULATION: 'B01003_001E',
  MALE_POPULATION: 'B01001_002E',
  FEMALE_POPULATION: 'B01001_026E',

  // Age Distribution
  AGE_UNDER_5: 'B01001_003E',
  AGE_5_TO_9: 'B01001_004E',
  AGE_10_TO_14: 'B01001_005E',
  AGE_15_TO_19: 'B01001_006E',
  AGE_20_TO_24: 'B01001_007E',
  AGE_25_TO_34: 'B01001_008E',
  AGE_35_TO_44: 'B01001_009E',
  AGE_45_TO_54: 'B01001_010E',
  AGE_55_TO_64: 'B01001_011E',
  AGE_65_PLUS: 'B01001_012E',

  // Median Age
  MEDIAN_AGE: 'B01002_001E',

  // Race and Ethnicity
  WHITE_ALONE: 'B02001_002E',
  BLACK_ALONE: 'B02001_003E',
  ASIAN_ALONE: 'B02001_005E',
  HISPANIC: 'B03003_003E',

  // Housing
  TOTAL_HOUSING_UNITS: 'B25001_001E',
  OCCUPIED_HOUSING: 'B25002_002E',
  VACANT_HOUSING: 'B25002_003E',
  OWNER_OCCUPIED: 'B25003_002E',
  RENTER_OCCUPIED: 'B25003_003E',

  // Households
  TOTAL_HOUSEHOLDS: 'B11001_001E',
  FAMILY_HOUSEHOLDS: 'B11001_002E',
  NONFAMILY_HOUSEHOLDS: 'B11001_007E',

  // Income
  MEDIAN_HOUSEHOLD_INCOME: 'B19013_001E',
  PER_CAPITA_INCOME: 'B19301_001E',
  POVERTY_POPULATION: 'B17001_002E',

  // Employment
  IN_LABOR_FORCE: 'B23025_002E',
  EMPLOYED: 'B23025_004E',
  UNEMPLOYED: 'B23025_005E',

  // Transportation
  TOTAL_WORKERS: 'B08301_001E',
  DROVE_ALONE: 'B08301_003E',
  CARPOOLED: 'B08301_004E',
  PUBLIC_TRANSIT: 'B08301_010E',
  WALKED: 'B08301_019E',
  BICYCLE: 'B08301_018E',
  WORKED_FROM_HOME: 'B08301_021E',

  // Education
  LESS_THAN_HS: 'B15003_002E',
  HS_GRADUATE: 'B15003_017E',
  BACHELORS: 'B15003_022E',
  GRADUATE_DEGREE: 'B15003_023E',
} as const;

// ============================================================================
// Census Data Response Types
// ============================================================================

export interface CensusRawResponse {
  [key: string]: string | number;
}

export interface PopulationData {
  total: number;
  male: number;
  female: number;
  density?: number; // per sq km
  growthRate?: number; // percentage
}

export interface AgeDistribution {
  under5: number;
  age5to9: number;
  age10to14: number;
  age15to19: number;
  age20to24: number;
  age25to34: number;
  age35to44: number;
  age45to54: number;
  age55to64: number;
  age65Plus: number;
  medianAge: number;
}

export interface RaceEthnicityData {
  whiteAlone: number;
  blackAlone: number;
  asianAlone: number;
  hispanic: number;
  other: number;
  total: number;
}

export interface HousingData {
  totalUnits: number;
  occupied: number;
  vacant: number;
  ownerOccupied: number;
  renterOccupied: number;
  vacancyRate: number;
  ownershipRate: number;
}

export interface HouseholdData {
  totalHouseholds: number;
  familyHouseholds: number;
  nonfamilyHouseholds: number;
  averageHouseholdSize: number;
}

export interface IncomeData {
  medianHouseholdIncome: number;
  perCapitaIncome: number;
  povertyPopulation: number;
  povertyRate: number;
}

export interface EmploymentData {
  inLaborForce: number;
  employed: number;
  unemployed: number;
  laborForceParticipationRate: number;
  unemploymentRate: number;
}

export interface TransportationData {
  totalWorkers: number;
  droveAlone: number;
  carpooled: number;
  publicTransit: number;
  walked: number;
  bicycle: number;
  workedFromHome: number;
  transitMode: {
    auto: number;
    transit: number;
    active: number;
    remote: number;
  };
}

export interface EducationData {
  lessThanHighSchool: number;
  highSchoolGraduate: number;
  bachelors: number;
  graduateDegree: number;
  totalPopulation25Plus: number;
}

// ============================================================================
// Comprehensive Census Data
// ============================================================================

export interface CensusData {
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

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface CensusAPIRequest {
  variables: string[];
  geography: GeographicArea;
  year?: number;
  dataset?: 'acs5' | 'acs1' | 'dec';
}

export interface CensusAPIResponse {
  data: CensusData;
  rawResponse?: CensusRawResponse[];
  errors?: string[];
}

export interface CensusBatchRequest {
  geographies: GeographicArea[];
  variables: string[];
  year?: number;
  dataset?: 'acs5' | 'acs1' | 'dec';
}

export interface CensusBatchResponse {
  data: CensusData[];
  errors?: Array<{
    geography: GeographicArea;
    error: string;
  }>;
}

// ============================================================================
// Spatial Query Types
// ============================================================================

export interface SpatialCensusQuery {
  type: 'point' | 'bbox' | 'polygon';
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  boundingBox?: BoundingBox;
  polygon?: GeoJSONGeometry;
  level: 'tract' | 'block-group' | 'county';
  variables?: string[];
  year?: number;
}

export interface SpatialCensusResponse {
  features: Array<{
    geometry: GeoJSONGeometry;
    properties: CensusData;
  }>;
  count: number;
  bounds?: BoundingBox;
}

// ============================================================================
// Zod Schemas for Validation
// ============================================================================

export const GeographicAreaSchema = z.object({
  type: z.enum(['state', 'county', 'tract', 'block-group', 'place', 'zcta']),
  fips: z.string().optional(),
  state: z.string().optional(),
  county: z.string().optional(),
  tract: z.string().optional(),
  blockGroup: z.string().optional(),
  name: z.string().optional(),
});

export const CensusAPIRequestSchema = z.object({
  variables: z.array(z.string()),
  geography: GeographicAreaSchema,
  year: z.number().min(2010).max(new Date().getFullYear()).optional(),
  dataset: z.enum(['acs5', 'acs1', 'dec']).optional(),
});

export const SpatialCensusQuerySchema = z.object({
  type: z.enum(['point', 'bbox', 'polygon']),
  coordinates: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }).optional(),
  boundingBox: z.object({
    north: z.number(),
    south: z.number(),
    east: z.number(),
    west: z.number(),
  }).optional(),
  polygon: z.any().optional(),
  level: z.enum(['tract', 'block-group', 'county']),
  variables: z.array(z.string()).optional(),
  year: z.number().min(2010).max(new Date().getFullYear()).optional(),
});

// ============================================================================
// Utility Types
// ============================================================================

export type CensusVariableKey = keyof typeof CENSUS_VARIABLES;
export type CensusVariableValue = typeof CENSUS_VARIABLES[CensusVariableKey];

export interface CensusAPIConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  cache?: boolean;
  cacheTTL?: number;
}
