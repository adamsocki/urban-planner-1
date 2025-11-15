/**
 * Urban Planner Ridership Forecasting Package
 *
 * Provides tools for forecasting transit ridership using multiple methodologies:
 * - Direct Demand Models
 * - Machine Learning Models
 * - Ensemble Models
 * - Sensitivity Analysis
 * - Scenario Comparison
 */

// Export types
export * from './types';

// Export models
export {
  calculateDirectDemand,
  quickForecast,
} from './models/direct-demand';

export {
  calculateMLForecast,
  calculateEnsembleForecast,
} from './models/ml-forecast';

// Export utilities
export {
  analyzeSensitivity,
  runComprehensiveSensitivity,
  calculateElasticity,
  rankParametersByImportance,
  generateSensitivitySummary,
} from './utils/sensitivity-analysis';

export {
  compareScenarios,
  createFrequencyComparisonScenarios,
  createServiceQualityScenarios,
  generateComparisonReport,
} from './utils/scenario-comparison';

// Main forecasting function - convenience wrapper
import { ForecastInputs, ForecastResult } from './types';
import { calculateDirectDemand } from './models/direct-demand';
import { calculateMLForecast, calculateEnsembleForecast } from './models/ml-forecast';

/**
 * Main forecasting function with automatic model selection
 *
 * @param inputs - Forecast inputs including demographics, service, and land use
 * @param modelType - Which model(s) to use: 'direct-demand', 'ml', or 'ensemble' (default)
 * @returns Forecast results with scenarios and analysis
 *
 * @example
 * ```typescript
 * const forecast = await forecastRidership({
 *   routeGeometry: myRoute,
 *   demographics: {
 *     population: 50000,
 *     employment: 25000,
 *     density: 3500
 *   },
 *   service: {
 *     frequency: 8,
 *     span: 18,
 *     speed: 22,
 *     stopSpacing: 0.6
 *   }
 * });
 *
 * console.log(`Moderate forecast: ${forecast.scenarios[1].dailyRidership} daily riders`);
 * ```
 */
export function forecastRidership(
  inputs: ForecastInputs,
  modelType: 'direct-demand' | 'ml' | 'ensemble' = 'ensemble'
): ForecastResult {
  if (modelType === 'direct-demand') {
    return calculateDirectDemand(inputs);
  }

  if (modelType === 'ml') {
    return calculateMLForecast(inputs);
  }

  // Ensemble (default)
  const directDemandResult = calculateDirectDemand(inputs);
  const mlResult = calculateMLForecast(inputs);
  return calculateEnsembleForecast(inputs, directDemandResult, mlResult);
}

/**
 * Quick ridership estimate - simplified interface
 *
 * @param population - Population in catchment area
 * @param employment - Employment in catchment area
 * @param density - Population density (people per sq km)
 * @param frequency - Peak service frequency (vehicles per hour)
 * @param speed - Average operating speed (mph), optional
 * @returns Simple forecast object with daily/annual ridership
 *
 * @example
 * ```typescript
 * const { daily, annual } = quickEstimate(45000, 20000, 3200, 6);
 * console.log(`Estimated ${daily} daily riders`);
 * ```
 */
export function quickEstimate(
  population: number,
  employment: number,
  density: number,
  frequency: number,
  speed: number = 20
): { daily: number; annual: number; confidence: number } {
  const inputs: ForecastInputs = {
    routeGeometry: {
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: [] },
    },
    demographics: { population, employment, density },
    service: { frequency, span: 18, speed, stopSpacing: 0.5 },
  };

  const result = calculateDirectDemand(inputs);
  const moderate = result.scenarios.find((s) => s.scenario === 'moderate')!;

  return {
    daily: moderate.dailyRidership,
    annual: moderate.annualRidership,
    confidence: moderate.confidence,
  };
}
