/**
 * Scenario Comparison Tools
 *
 * Compare different service scenarios (e.g., different frequencies, alignments, etc.)
 */

import { ForecastInputs, ForecastResult, ScenarioComparison } from '../types';
import { calculateDirectDemand } from '../models/direct-demand';
import { calculateMLForecast, calculateEnsembleForecast } from '../models/ml-forecast';

export interface NamedScenario {
  name: string;
  description: string;
  inputs: ForecastInputs;
}

/**
 * Compare multiple scenarios
 */
export function compareScenarios(
  scenarios: NamedScenario[],
  modelType: 'direct-demand' | 'ml' | 'ensemble' = 'ensemble'
): ScenarioComparison {
  const results = scenarios.map((scenario) => {
    let result: ForecastResult;

    if (modelType === 'direct-demand') {
      result = calculateDirectDemand(scenario.inputs);
    } else if (modelType === 'ml') {
      result = calculateMLForecast(scenario.inputs);
    } else {
      // Ensemble
      const ddResult = calculateDirectDemand(scenario.inputs);
      const mlResult = calculateMLForecast(scenario.inputs);
      result = calculateEnsembleForecast(scenario.inputs, ddResult, mlResult);
    }

    return {
      name: scenario.name,
      inputs: scenario.inputs,
      results: result,
    };
  });

  // Calculate differences between scenarios
  const differences = analyzeDifferences(scenarios, results);

  return {
    scenarios: results,
    differences,
  };
}

/**
 * Analyze key differences between scenarios
 */
function analyzeDifferences(
  scenarios: NamedScenario[],
  results: { name: string; inputs: ForecastInputs; results: ForecastResult }[]
): ScenarioComparison['differences'] {
  const differences: ScenarioComparison['differences'] = [];

  // Compare ridership
  const ridershipValues: Record<string, number> = {};
  results.forEach((result) => {
    const moderate = result.results.scenarios.find((s) => s.scenario === 'moderate')!;
    ridershipValues[result.name] = moderate.dailyRidership;
  });

  differences.push({
    parameter: 'Daily Ridership (Moderate Scenario)',
    values: ridershipValues,
    impact: calculateImpactDescription(ridershipValues),
  });

  // Compare frequency
  const frequencyValues: Record<string, number> = {};
  scenarios.forEach((scenario, i) => {
    frequencyValues[scenario.name] = scenario.inputs.service.frequency;
  });

  differences.push({
    parameter: 'Service Frequency (veh/hr)',
    values: frequencyValues,
    impact: calculateImpactDescription(frequencyValues),
  });

  // Compare speed
  const speedValues: Record<string, number> = {};
  scenarios.forEach((scenario, i) => {
    speedValues[scenario.name] = scenario.inputs.service.speed;
  });

  differences.push({
    parameter: 'Average Speed (mph)',
    values: speedValues,
    impact: calculateImpactDescription(speedValues),
  });

  return differences;
}

/**
 * Calculate impact description
 */
function calculateImpactDescription(values: Record<string, number>): string {
  const valuesArray = Object.values(values);
  const min = Math.min(...valuesArray);
  const max = Math.max(...valuesArray);
  const range = max - min;
  const percentDiff = (range / min) * 100;

  if (percentDiff < 5) return 'Minimal difference';
  if (percentDiff < 15) return 'Small difference';
  if (percentDiff < 30) return 'Moderate difference';
  if (percentDiff < 50) return 'Significant difference';
  return 'Major difference';
}

/**
 * Create common comparison scenarios
 */
export function createFrequencyComparisonScenarios(
  baseInputs: ForecastInputs
): NamedScenario[] {
  return [
    {
      name: 'Low Frequency (4 veh/hr)',
      description: 'Every 15 minutes during peak',
      inputs: {
        ...baseInputs,
        service: { ...baseInputs.service, frequency: 4 },
      },
    },
    {
      name: 'Moderate Frequency (6 veh/hr)',
      description: 'Every 10 minutes during peak',
      inputs: {
        ...baseInputs,
        service: { ...baseInputs.service, frequency: 6 },
      },
    },
    {
      name: 'High Frequency (10 veh/hr)',
      description: 'Every 6 minutes during peak',
      inputs: {
        ...baseInputs,
        service: { ...baseInputs.service, frequency: 10 },
      },
    },
    {
      name: 'Very High Frequency (12 veh/hr)',
      description: 'Every 5 minutes during peak',
      inputs: {
        ...baseInputs,
        service: { ...baseInputs.service, frequency: 12 },
      },
    },
  ];
}

/**
 * Create service quality comparison scenarios
 */
export function createServiceQualityScenarios(
  baseInputs: ForecastInputs
): NamedScenario[] {
  return [
    {
      name: 'Basic Service',
      description: 'Lower frequency, local stops',
      inputs: {
        ...baseInputs,
        service: {
          ...baseInputs.service,
          frequency: 4,
          speed: 15,
          stopSpacing: 0.25,
        },
      },
    },
    {
      name: 'Enhanced Service',
      description: 'Moderate frequency, limited stops',
      inputs: {
        ...baseInputs,
        service: {
          ...baseInputs.service,
          frequency: 6,
          speed: 20,
          stopSpacing: 0.5,
        },
      },
    },
    {
      name: 'Premium BRT',
      description: 'High frequency, rapid service',
      inputs: {
        ...baseInputs,
        service: {
          ...baseInputs.service,
          frequency: 10,
          speed: 25,
          stopSpacing: 0.75,
        },
      },
    },
  ];
}

/**
 * Generate comparison summary report
 */
export function generateComparisonReport(comparison: ScenarioComparison): string {
  let report = 'SCENARIO COMPARISON REPORT\n';
  report += '='.repeat(50) + '\n\n';

  // Summary table
  report += 'RIDERSHIP SUMMARY (Moderate Scenario)\n';
  report += '-'.repeat(50) + '\n';

  comparison.scenarios.forEach((scenario) => {
    const moderate = scenario.results.scenarios.find((s) => s.scenario === 'moderate')!;
    report += `${scenario.name.padEnd(30)} ${moderate.dailyRidership.toLocaleString().padStart(10)} daily\n`;
  });

  report += '\n';

  // Differences
  report += 'KEY DIFFERENCES\n';
  report += '-'.repeat(50) + '\n';

  comparison.differences.forEach((diff) => {
    report += `\n${diff.parameter}:\n`;
    Object.entries(diff.values).forEach(([name, value]) => {
      const formatted = typeof value === 'number' ? value.toLocaleString() : value;
      report += `  ${name.padEnd(30)} ${formatted}\n`;
    });
    report += `  Impact: ${diff.impact}\n`;
  });

  report += '\n';

  // Recommendations
  report += 'ANALYSIS\n';
  report += '-'.repeat(50) + '\n';

  const ridershipDiff = comparison.differences.find(
    (d) => d.parameter.includes('Ridership')
  );

  if (ridershipDiff) {
    const values = Object.values(ridershipDiff.values) as number[];
    const bestScenario = comparison.scenarios.find((s) => {
      const moderate = s.results.scenarios.find((sc) => sc.scenario === 'moderate')!;
      return moderate.dailyRidership === Math.max(...values);
    });

    if (bestScenario) {
      report += `Highest ridership: ${bestScenario.name}\n`;
    }

    const worstScenario = comparison.scenarios.find((s) => {
      const moderate = s.results.scenarios.find((sc) => sc.scenario === 'moderate')!;
      return moderate.dailyRidership === Math.min(...values);
    });

    if (worstScenario && bestScenario) {
      const bestRidership = bestScenario.results.scenarios.find((s) => s.scenario === 'moderate')!.dailyRidership;
      const worstRidership = worstScenario.results.scenarios.find((s) => s.scenario === 'moderate')!.dailyRidership;
      const improvement = ((bestRidership - worstRidership) / worstRidership) * 100;

      report += `Ridership improvement: ${improvement.toFixed(1)}% increase from `;
      report += `${worstScenario.name} to ${bestScenario.name}\n`;
    }
  }

  return report;
}
