# @urban-planner/forecasting

Ridership forecasting models and analysis tools for transit planning.

## Features

- **Direct Demand Model**: Regression-based ridership forecasting
- **Machine Learning Model**: Feature-based predictions with comparable systems benchmarking
- **Ensemble Model**: Combines multiple models for improved accuracy
- **Sensitivity Analysis**: Understand impact of parameter changes
- **Scenario Comparison**: Compare different service alternatives

## Installation

```bash
pnpm add @urban-planner/forecasting
```

## Quick Start

```typescript
import { forecastRidership } from '@urban-planner/forecasting';

const forecast = forecastRidership({
  routeGeometry: myRouteGeoJSON,
  demographics: {
    population: 50000,
    employment: 25000,
    density: 3500 // people per sq km
  },
  service: {
    frequency: 8,  // vehicles per hour (peak)
    span: 18,      // hours of service per day
    speed: 22,     // mph
    stopSpacing: 0.6 // miles
  }
});

console.log(forecast.scenarios);
// [
//   { scenario: 'conservative', dailyRidership: 6200, ... },
//   { scenario: 'moderate', dailyRidership: 7800, ... },
//   { scenario: 'optimistic', dailyRidership: 9750, ... }
// ]
```

## Models

### Direct Demand Model

Simple, interpretable model based on:
- Population and employment in catchment area
- Service frequency and speed
- Population density
- Land use characteristics

```typescript
import { calculateDirectDemand } from '@urban-planner/forecasting';

const result = calculateDirectDemand(inputs);
```

### Machine Learning Model

Advanced model using:
- Demographic features (normalized)
- Service quality metrics
- Built environment indicators
- Benchmarking against 50+ comparable systems

```typescript
import { calculateMLForecast } from '@urban-planner/forecasting';

const result = calculateMLForecast(inputs);
```

### Ensemble Model

Combines direct demand and ML models for best accuracy:

```typescript
import { forecastRidership } from '@urban-planner/forecasting';

const result = forecastRidership(inputs, 'ensemble'); // default
```

## Sensitivity Analysis

Understand how ridership changes with parameter variations:

```typescript
import { runComprehensiveSensitivity, generateSensitivitySummary } from '@urban-planner/forecasting';

const analyses = runComprehensiveSensitivity(inputs);
const summary = generateSensitivitySummary(analyses);

console.log(summary);
// Shows elasticity of ridership to frequency, speed, population, etc.
```

## Scenario Comparison

Compare different service alternatives:

```typescript
import { compareScenarios, generateComparisonReport } from '@urban-planner/forecasting';

const scenarios = [
  {
    name: 'Low Frequency',
    description: 'Every 15 minutes',
    inputs: { ...baseInputs, service: { ...baseInputs.service, frequency: 4 } }
  },
  {
    name: 'High Frequency',
    description: 'Every 6 minutes',
    inputs: { ...baseInputs, service: { ...baseInputs.service, frequency: 10 } }
  }
];

const comparison = compareScenarios(scenarios);
const report = generateComparisonReport(comparison);
```

## API Reference

### Main Functions

#### `forecastRidership(inputs, modelType?)`

Main forecasting function with automatic model selection.

**Parameters:**
- `inputs: ForecastInputs` - Demographics, service, and land use data
- `modelType?: 'direct-demand' | 'ml' | 'ensemble'` - Model to use (default: 'ensemble')

**Returns:** `ForecastResult` with scenarios and analysis

#### `quickEstimate(population, employment, density, frequency, speed?)`

Quick ridership estimate with minimal inputs.

**Parameters:**
- `population: number` - Population in catchment area
- `employment: number` - Employment in catchment area
- `density: number` - Population density (people/sq km)
- `frequency: number` - Peak frequency (veh/hr)
- `speed?: number` - Average speed in mph (default: 20)

**Returns:** `{ daily, annual, confidence }`

### Types

See [types.ts](./src/types.ts) for complete type definitions.

## Examples

See [examples/](../../examples/) directory for complete examples including:
- `generate-ridership-forecast.ts` - Full forecast with document generation

## License

MIT
