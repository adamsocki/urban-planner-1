/**
 * Forecasting Types
 */

import { Feature, Polygon, LineString, Point } from 'geojson';

export interface DemographicInputs {
  population: number;
  employment: number;
  density: number; // people per sq km
  medianIncome?: number;
  medianAge?: number;
  zeroVehicleHouseholds?: number; // percentage
  transitDependentPopulation?: number; // percentage
}

export interface ServiceInputs {
  frequency: number; // vehicles per hour (peak)
  span: number; // hours of service per day
  speed: number; // average speed in mph
  stopSpacing: number; // average distance between stops in miles
  reliability?: number; // 0-1, on-time performance
}

export interface LandUseInputs {
  residentialDensity?: number; // dwelling units per acre
  employmentDensity?: number; // jobs per acre
  mixedUseIndex?: number; // 0-1, diversity of land uses
  walkScore?: number; // 0-100
  bikeScore?: number; // 0-100
  transitScore?: number; // 0-100
}

export interface ExistingTransitInputs {
  nearbyRoutes?: number; // count of routes within 0.5 mile
  transferOpportunities?: number; // count of nearby transfer locations
  competingService?: boolean; // parallel transit service exists
  existingRidership?: number; // current ridership in corridor
}

export interface RouteGeometry {
  type: 'Feature' | 'FeatureCollection';
  geometry: LineString;
  properties?: Record<string, any>;
}

export interface CatchmentArea {
  type: 'Feature';
  geometry: Polygon;
  properties?: {
    bufferDistance?: number; // in meters
    walkTime?: number; // in minutes
  };
}

export interface ForecastInputs {
  // Geographic
  routeGeometry: RouteGeometry;
  catchmentArea?: CatchmentArea;

  // Core inputs
  demographics: DemographicInputs;
  service: ServiceInputs;

  // Optional inputs
  landUse?: LandUseInputs;
  existingTransit?: ExistingTransitInputs;

  // Model parameters
  modelType?: 'direct-demand' | 'ml' | 'ensemble';
  calibrationData?: CalibrationData;
}

export interface CalibrationData {
  observedRidership: number;
  observedPopulation: number;
  observedEmployment: number;
  observedFrequency: number;
  marketType?: 'urban' | 'suburban' | 'rural';
}

export interface ForecastScenario {
  name: string;
  scenario: 'conservative' | 'moderate' | 'optimistic' | 'custom';
  dailyRidership: number;
  annualRidership: number;
  confidence: number; // 0-1
  ridershipPerMile?: number;
  peakPeriodShare?: number; // percentage of daily ridership in peak
  averageLoadFactor?: number; // passengers per vehicle
}

export interface ForecastResult {
  scenarios: ForecastScenario[];
  methodology: string;
  assumptions: string[];
  sensitivityAnalysis?: SensitivityAnalysis;
  comparableSystemsAnalysis?: ComparableSystem[];
  marketSegmentation?: MarketSegment[];
}

export interface SensitivityAnalysis {
  parameter: string;
  baseValue: number;
  scenarios: {
    change: string; // e.g., "+10%", "-20%"
    newValue: number;
    ridershipChange: number; // percentage change
    newRidership: number;
  }[];
}

export interface ComparableSystem {
  name: string;
  city: string;
  metroPopulation: number;
  routeLength: number; // miles
  dailyRidership: number;
  ridershipPerMile: number;
  frequency: number; // vehicles per hour
  characteristics: string[];
}

export interface MarketSegment {
  segment: string; // e.g., "Existing transit riders", "New riders from auto", "Induced demand"
  percentage: number;
  dailyRidership: number;
  description: string;
}

export interface ModelWeights {
  populationWeight: number;
  employmentWeight: number;
  densityWeight: number;
  frequencyWeight: number;
  speedWeight: number;
  landUseMixWeight: number;
}

export interface DirectDemandParams {
  baseRate: number; // trips per capita per day
  weights: ModelWeights;
  elasticities: {
    frequency: number; // ridership change per 1% frequency change
    fare: number;
    travelTime: number;
    service: number;
  };
}

export interface MLModelFeatures {
  // Demographics (normalized 0-1)
  populationDensity: number;
  employmentDensity: number;
  medianIncome: number;
  zeroVehicleRate: number;

  // Service (normalized 0-1)
  peakFrequency: number;
  serviceSpan: number;
  averageSpeed: number;

  // Built environment (normalized 0-1)
  walkScore: number;
  landUseMix: number;
  transitAccess: number;

  // Competition
  autoTravelTime: number;
  parkingCost: number;
}

export interface ScenarioComparison {
  scenarios: {
    name: string;
    inputs: Partial<ForecastInputs>;
    results: ForecastResult;
  }[];
  differences: {
    parameter: string;
    values: Record<string, number>;
    impact: string;
  }[];
}
