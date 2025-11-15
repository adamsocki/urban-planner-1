/**
 * Sensitivity Analysis Tools
 *
 * Analyze how ridership forecasts change with variations in key parameters
 */

import { ForecastInputs, ForecastResult, SensitivityAnalysis } from '../types';
import { calculateDirectDemand } from '../models/direct-demand';

export interface SensitivityParameter {
  name: string;
  path: string; // e.g., 'service.frequency' or 'demographics.population'
  variations: number[]; // e.g., [-20, -10, 0, 10, 20] for percentage changes
}

/**
 * Run sensitivity analysis on a single parameter
 */
export function analyzeSensitivity(
  baseInputs: ForecastInputs,
  parameter: SensitivityParameter
): SensitivityAnalysis {
  // Get base case ridership
  const baseResult = calculateDirectDemand(baseInputs);
  const baseRidership = baseResult.scenarios.find(
    (s) => s.scenario === 'moderate'
  )!.dailyRidership;

  // Get base value
  const baseValue = getNestedValue(baseInputs, parameter.path);

  const scenarios = parameter.variations.map((variation) => {
    // Create modified inputs
    const modifiedInputs = JSON.parse(JSON.stringify(baseInputs));
    const newValue = baseValue * (1 + variation / 100);
    setNestedValue(modifiedInputs, parameter.path, newValue);

    // Calculate new ridership
    const result = calculateDirectDemand(modifiedInputs);
    const newRidership = result.scenarios.find(
      (s) => s.scenario === 'moderate'
    )!.dailyRidership;

    const ridershipChange = ((newRidership - baseRidership) / baseRidership) * 100;

    return {
      change: variation >= 0 ? `+${variation}%` : `${variation}%`,
      newValue,
      ridershipChange,
      newRidership,
    };
  });

  return {
    parameter: parameter.name,
    baseValue,
    scenarios,
  };
}

/**
 * Run comprehensive sensitivity analysis on all key parameters
 */
export function runComprehensiveSensitivity(
  baseInputs: ForecastInputs
): SensitivityAnalysis[] {
  const parameters: SensitivityParameter[] = [
    {
      name: 'Service Frequency',
      path: 'service.frequency',
      variations: [-20, -10, 0, 10, 20],
    },
    {
      name: 'Average Speed',
      path: 'service.speed',
      variations: [-20, -10, 0, 10, 20],
    },
    {
      name: 'Population',
      path: 'demographics.population',
      variations: [-20, -10, 0, 10, 20],
    },
    {
      name: 'Employment',
      path: 'demographics.employment',
      variations: [-20, -10, 0, 10, 20],
    },
    {
      name: 'Population Density',
      path: 'demographics.density',
      variations: [-20, -10, 0, 10, 20],
    },
  ];

  return parameters.map((param) => analyzeSensitivity(baseInputs, param));
}

/**
 * Calculate elasticity (% change in ridership / % change in parameter)
 */
export function calculateElasticity(
  sensitivity: SensitivityAnalysis
): { [variation: string]: number } {
  const elasticities: { [key: string]: number } = {};

  sensitivity.scenarios.forEach((scenario) => {
    const paramChange = parseFloat(scenario.change);
    if (paramChange !== 0) {
      const elasticity = scenario.ridershipChange / paramChange;
      elasticities[scenario.change] = elasticity;
    }
  });

  return elasticities;
}

/**
 * Find most sensitive parameters
 */
export function rankParametersByImportance(
  analyses: SensitivityAnalysis[]
): { parameter: string; avgElasticity: number }[] {
  return analyses
    .map((analysis) => {
      const elasticities = calculateElasticity(analysis);
      const values = Object.values(elasticities).map(Math.abs);
      const avgElasticity = values.reduce((a, b) => a + b, 0) / values.length;

      return {
        parameter: analysis.parameter,
        avgElasticity,
      };
    })
    .sort((a, b) => b.avgElasticity - a.avgElasticity);
}

/**
 * Helper: Get nested value from object using path
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Helper: Set nested value in object using path
 */
function setNestedValue(obj: any, path: string, value: any): void {
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  const target = keys.reduce((current, key) => current[key], obj);
  target[lastKey] = value;
}

/**
 * Generate sensitivity analysis summary for reports
 */
export function generateSensitivitySummary(
  analyses: SensitivityAnalysis[]
): string {
  const ranked = rankParametersByImportance(analyses);

  let summary = 'SENSITIVITY ANALYSIS SUMMARY\n\n';
  summary += 'Ridership is most sensitive to the following parameters:\n\n';

  ranked.forEach((item, index) => {
    const analysis = analyses.find((a) => a.parameter === item.parameter)!;
    const scenario10pct = analysis.scenarios.find((s) => s.change === '+10%');

    if (scenario10pct) {
      summary += `${index + 1}. ${item.parameter}\n`;
      summary += `   - Elasticity: ${item.avgElasticity.toFixed(2)}\n`;
      summary += `   - 10% increase → ${scenario10pct.ridershipChange > 0 ? '+' : ''}${scenario10pct.ridershipChange.toFixed(1)}% ridership change\n`;
      summary += `   - Impact: ${getImpactLevel(item.avgElasticity)}\n\n`;
    }
  });

  return summary;
}

/**
 * Categorize impact level
 */
function getImpactLevel(elasticity: number): string {
  const absElasticity = Math.abs(elasticity);

  if (absElasticity > 0.8) return 'Very High';
  if (absElasticity > 0.6) return 'High';
  if (absElasticity > 0.4) return 'Moderate';
  if (absElasticity > 0.2) return 'Low';
  return 'Very Low';
}
