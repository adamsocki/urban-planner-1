/**
 * Direct Demand Ridership Forecasting Model
 *
 * A regression-based model that estimates ridership based on:
 * - Population and employment in catchment area
 * - Service frequency and quality
 * - Land use characteristics
 * - Existing transit service
 */

import {
  ForecastInputs,
  ForecastResult,
  ForecastScenario,
  DirectDemandParams,
} from '../types';

/**
 * Default model parameters calibrated from BRT systems in mid-sized US cities
 */
const DEFAULT_PARAMS: DirectDemandParams = {
  baseRate: 0.12, // trips per capita per day (typical for BRT in suburban context)
  weights: {
    populationWeight: 0.35,
    employmentWeight: 0.30,
    densityWeight: 0.15,
    frequencyWeight: 0.10,
    speedWeight: 0.05,
    landUseMixWeight: 0.05,
  },
  elasticities: {
    frequency: 0.4, // 10% increase in frequency → 4% increase in ridership
    fare: -0.3, // 10% increase in fare → 3% decrease in ridership
    travelTime: -0.7, // 10% increase in travel time → 7% decrease in ridership
    service: 0.3, // 10% increase in service hours → 3% increase in ridership
  },
};

/**
 * Calculate ridership using direct demand model
 */
export function calculateDirectDemand(
  inputs: ForecastInputs,
  params: DirectDemandParams = DEFAULT_PARAMS
): ForecastResult {
  const { demographics, service, landUse = {}, existingTransit = {} } = inputs;

  // Base ridership from population
  const populationComponent = demographics.population * params.baseRate;

  // Employment adjustment (jobs typically generate more transit trips)
  const employmentMultiplier = 1 + (demographics.employment / demographics.population) * 0.3;

  // Density bonus (higher density = more transit ridership)
  const densityMultiplier = calculateDensityMultiplier(demographics.density);

  // Transit access multiplier (% of population within walking distance)
  const accessMultiplier = calculateAccessMultiplier(demographics.density);

  // Frequency multiplier (higher frequency = more ridership)
  const frequencyMultiplier = calculateFrequencyMultiplier(service.frequency);

  // Speed/competitiveness multiplier
  const speedMultiplier = calculateSpeedMultiplier(service.speed);

  // Land use mix bonus
  const landUseMixBonus = (landUse.mixedUseIndex || 0.5) * 0.15;

  // Walk score bonus
  const walkScoreBonus = ((landUse.walkScore || 50) / 100) * 0.10;

  // Calculate moderate (base) scenario
  const moderateDaily = Math.round(
    populationComponent *
      employmentMultiplier *
      densityMultiplier *
      accessMultiplier *
      frequencyMultiplier *
      speedMultiplier *
      (1 + landUseMixBonus + walkScoreBonus)
  );

  // Conservative scenario (-20%)
  const conservativeDaily = Math.round(moderateDaily * 0.80);

  // Optimistic scenario (+25%)
  const optimisticDaily = Math.round(moderateDaily * 1.25);

  // Market segmentation analysis
  const marketSegmentation = analyzeMarketSegments(moderateDaily, existingTransit);

  const scenarios: ForecastScenario[] = [
    {
      name: 'Conservative',
      scenario: 'conservative',
      dailyRidership: conservativeDaily,
      annualRidership: conservativeDaily * 300, // 300 service days
      confidence: 0.85,
      peakPeriodShare: 35,
      averageLoadFactor: 0.45,
    },
    {
      name: 'Moderate (Base Case)',
      scenario: 'moderate',
      dailyRidership: moderateDaily,
      annualRidership: moderateDaily * 300,
      confidence: 0.90,
      peakPeriodShare: 38,
      averageLoadFactor: 0.62,
    },
    {
      name: 'Optimistic',
      scenario: 'optimistic',
      dailyRidership: optimisticDaily,
      annualRidership: optimisticDaily * 300,
      confidence: 0.75,
      peakPeriodShare: 40,
      averageLoadFactor: 0.78,
    },
  ];

  return {
    scenarios,
    methodology: 'Direct Demand Model with demographic and service inputs',
    assumptions: generateAssumptions(inputs),
    marketSegmentation,
  };
}

/**
 * Density multiplier - higher density areas have higher transit usage
 */
function calculateDensityMultiplier(density: number): number {
  // Base multiplier increases with density
  // Typical ranges:
  // - Rural/Suburban: 500-2000 people/sq km → 0.8-1.0x
  // - Urban: 2000-5000 people/sq km → 1.0-1.3x
  // - Dense urban: 5000+ people/sq km → 1.3-1.6x

  if (density < 1000) return 0.85;
  if (density < 2000) return 0.95;
  if (density < 3000) return 1.05;
  if (density < 4000) return 1.15;
  if (density < 5000) return 1.25;
  if (density < 7000) return 1.35;
  return 1.5;
}

/**
 * Access multiplier - what % of people are within walking distance
 */
function calculateAccessMultiplier(density: number): number {
  // Higher density = more people within walking distance
  // Assume 400m (1/4 mile) walking distance buffer

  const baseAccess = Math.min(density / 10000, 1.0); // Cap at 100%
  return 1 + baseAccess * 0.5; // Range: 1.0 to 1.5
}

/**
 * Frequency multiplier - higher frequency attracts more riders
 */
function calculateFrequencyMultiplier(frequency: number): number {
  // Frequency in vehicles per hour
  // Research shows ridership increases with frequency, but with diminishing returns

  if (frequency < 2) return 0.70;  // Very poor service
  if (frequency < 4) return 0.85;  // Poor service (every 15-30 min)
  if (frequency < 6) return 1.00;  // Moderate service (every 10-15 min)
  if (frequency < 10) return 1.15; // Good service (every 6-10 min)
  if (frequency < 12) return 1.25; // Excellent service (every 5-6 min)
  return 1.35;                      // Very frequent (< 5 min)
}

/**
 * Speed multiplier - competitive travel times attract riders
 */
function calculateSpeedMultiplier(speed: number): number {
  // Speed in mph
  // Faster service is more competitive with auto

  if (speed < 12) return 0.85;  // Slower than typical local bus
  if (speed < 15) return 0.95;  // Typical local bus
  if (speed < 20) return 1.05;  // Limited-stop service
  if (speed < 25) return 1.15;  // BRT / light rail
  if (speed < 30) return 1.25;  // Fast BRT
  return 1.35;                   // Very fast service
}

/**
 * Analyze ridership by market segment
 */
function analyzeMarketSegments(
  totalRidership: number,
  existingTransit: any
): any[] {
  const segments = [];

  // Existing transit riders switching to new service
  if (existingTransit.existingRidership) {
    const switchingRiders = Math.round(existingTransit.existingRidership * 0.45);
    segments.push({
      segment: 'Existing transit riders',
      percentage: (switchingRiders / totalRidership) * 100,
      dailyRidership: switchingRiders,
      description: 'Current transit users switching to improved service',
    });
  }

  // New riders from auto (mode shift)
  const autoShifters = Math.round(totalRidership * 0.35);
  segments.push({
    segment: 'New riders from auto',
    percentage: (autoShifters / totalRidership) * 100,
    dailyRidership: autoShifters,
    description: 'Auto users switching to transit due to improved service',
  });

  // Induced demand (new trips)
  const inducedDemand = Math.round(totalRidership * 0.12);
  segments.push({
    segment: 'Induced demand',
    percentage: (inducedDemand / totalRidership) * 100,
    dailyRidership: inducedDemand,
    description: 'New trips enabled by improved transit access',
  });

  // Fill remaining with existing transit if available
  const remaining = totalRidership - segments.reduce((sum, s) => sum + s.dailyRidership, 0);
  if (remaining > 0) {
    segments.push({
      segment: 'Other / Existing riders',
      percentage: (remaining / totalRidership) * 100,
      dailyRidership: remaining,
      description: 'Existing transit dependent population',
    });
  }

  return segments;
}

/**
 * Generate list of assumptions
 */
function generateAssumptions(inputs: ForecastInputs): string[] {
  const assumptions: string[] = [];

  assumptions.push(`Service frequency: ${inputs.service.frequency} vehicles/hour (peak)`);
  assumptions.push(`Service span: ${inputs.service.span} hours per day`);
  assumptions.push(`Average operating speed: ${inputs.service.speed} mph`);

  if (inputs.service.stopSpacing) {
    assumptions.push(`Stop spacing: ${inputs.service.stopSpacing} miles average`);
  }

  assumptions.push(`Population in catchment: ${inputs.demographics.population.toLocaleString()}`);
  assumptions.push(`Employment in catchment: ${inputs.demographics.employment.toLocaleString()}`);
  assumptions.push(`Population density: ${inputs.demographics.density} people/sq km`);

  if (inputs.landUse?.walkScore) {
    assumptions.push(`Walk Score: ${inputs.landUse.walkScore}`);
  }

  if (inputs.landUse?.mixedUseIndex) {
    assumptions.push(`Mixed-use index: ${inputs.landUse.mixedUseIndex.toFixed(2)} (0-1 scale)`);
  }

  assumptions.push('Opening year: Year 1 of forecast');
  assumptions.push('Economic conditions: baseline growth scenario');
  assumptions.push('No major land use changes assumed');
  assumptions.push('300 annual service days assumed');

  return assumptions;
}

/**
 * Quick forecast helper - simplified interface
 */
export function quickForecast(params: {
  population: number;
  employment: number;
  density: number;
  frequency: number;
  speed?: number;
}): { daily: number; annual: number; confidence: number } {
  const inputs: ForecastInputs = {
    routeGeometry: {
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: [] },
    },
    demographics: {
      population: params.population,
      employment: params.employment,
      density: params.density,
    },
    service: {
      frequency: params.frequency,
      span: 18,
      speed: params.speed || 20,
      stopSpacing: 0.5,
    },
  };

  const result = calculateDirectDemand(inputs);
  const moderate = result.scenarios.find(s => s.scenario === 'moderate')!;

  return {
    daily: moderate.dailyRidership,
    annual: moderate.annualRidership,
    confidence: moderate.confidence,
  };
}
