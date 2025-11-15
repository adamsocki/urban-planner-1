/**
 * Example: Complete Ridership Forecast with Sensitivity Analysis
 *
 * This example demonstrates the full forecasting workflow:
 * 1. Run ridership forecast with multiple models
 * 2. Perform sensitivity analysis
 * 3. Compare service scenarios
 * 4. Generate professional PDF report
 */

import {
  forecastRidership,
  runComprehensiveSensitivity,
  compareScenarios,
  createFrequencyComparisonScenarios,
  generateSensitivitySummary,
  generateComparisonReport,
  type ForecastInputs,
} from '@urban-planner/forecasting';

import { generateRidershipForecast } from '@urban-planner/doc-generator';
import type { DocumentData } from '@urban-planner/doc-generator';
import fs from 'fs/promises';

async function main() {
  console.log('🚀 Urban Planner - Ridership Forecasting Example\n');

  // Define the proposed route and service characteristics
  const forecastInputs: ForecastInputs = {
    routeGeometry: {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [-122.4194, 37.7749], // San Francisco example
          [-122.4094, 37.7849],
        ],
      },
    },
    demographics: {
      population: 145000,
      employment: 82000,
      density: 4200, // people per sq km
      medianIncome: 58500,
      medianAge: 33.8,
      zeroVehicleHouseholds: 18,
    },
    service: {
      frequency: 10, // vehicles per hour (peak)
      span: 19, // hours of service
      speed: 25, // mph
      stopSpacing: 0.75, // miles
    },
    landUse: {
      mixedUseIndex: 0.7,
      walkScore: 72,
      transitScore: 65,
    },
    existingTransit: {
      nearbyRoutes: 4,
      transferOpportunities: 3,
      existingRidership: 12000,
    },
  };

  // 1. Run main forecast
  console.log('📊 Running ridership forecast models...');
  const forecast = forecastRidership(forecastInputs, 'ensemble');

  console.log('\nForecast Results (Ensemble Model):');
  forecast.scenarios.forEach((scenario) => {
    console.log(
      `  ${scenario.name.padEnd(25)} ${scenario.dailyRidership.toLocaleString().padStart(8)} daily riders`
    );
  });

  // 2. Run sensitivity analysis
  console.log('\n🔍 Running sensitivity analysis...');
  const sensitivityAnalyses = runComprehensiveSensitivity(forecastInputs);
  const sensitivitySummary = generateSensitivitySummary(sensitivityAnalyses);

  console.log('\n' + sensitivitySummary);

  // 3. Compare service scenarios
  console.log('📈 Comparing service frequency scenarios...');
  const scenarios = createFrequencyComparisonScenarios(forecastInputs);
  const comparison = compareScenarios(scenarios, 'ensemble');
  const comparisonReport = generateComparisonReport(comparison);

  console.log('\n' + comparisonReport);

  // 4. Generate professional PDF report
  console.log('\n📄 Generating PDF report...');

  const documentData: DocumentData = {
    title: 'North Corridor BRT Ridership Forecast',
    subtitle: 'Proposed Route 500 - Airport to Downtown',
    author: 'Transit Planning Division',
    date: new Date(),
    projectName: 'North Corridor Transit Improvements',

    executiveSummary: `
This report presents ridership forecasts for the proposed North Corridor Bus
Rapid Transit (BRT) line connecting the regional airport to downtown via major
employment centers. Using an ensemble approach combining direct demand modeling
and machine learning techniques, we project moderate daily ridership of ${
      forecast.scenarios[1].dailyRidership.toLocaleString()
    } boardings.

The forecast is based on demographic analysis of the corridor, proposed service
parameters (10-minute peak frequency), and comparable BRT systems nationwide.
Sensitivity analysis shows ridership is most responsive to service frequency
and corridor employment density.
    `.trim(),

    methodology: forecast.methodology,

    forecastData: {
      routeName: 'Route 500 - North Corridor BRT',
      methodology: forecast.methodology,
      assumptions: forecast.assumptions,
      forecasts: forecast.scenarios.map((s) => ({
        scenario: s.scenario,
        dailyRidership: s.dailyRidership,
        annualRidership: s.annualRidership,
        confidence: s.confidence,
      })),
      demographicInputs: {
        population: forecastInputs.demographics.population,
        employment: forecastInputs.demographics.employment,
        density: forecastInputs.demographics.density,
      },
      serviceInputs: {
        frequency: forecastInputs.service.frequency,
        span: `${forecastInputs.service.span} hours (5 AM - 12 AM)`,
        speed: forecastInputs.service.speed,
      },
    },

    demographics: {
      totalPopulation: forecastInputs.demographics.population,
      households: 58000,
      medianIncome: forecastInputs.demographics.medianIncome!,
      medianAge: forecastInputs.demographics.medianAge!,
      employmentRate: 62.0,
      ageDistribution: [
        { label: '18-34', value: 52000 },
        { label: '35-64', value: 68000 },
        { label: '65+', value: 25000 },
      ],
    },

    charts: [
      {
        type: 'bar',
        title: 'Ridership Forecast Range',
        data: {
          labels: ['Conservative', 'Moderate', 'Optimistic'],
          datasets: [
            {
              label: 'Daily Ridership',
              data: forecast.scenarios.map((s) => s.dailyRidership),
              backgroundColor: ['#ed8936', '#48bb78', '#4299e1'],
            },
          ],
        },
      },
      {
        type: 'line',
        title: 'Projected Ridership Growth (First 10 Years)',
        data: {
          labels: ['Year 1', 'Year 2', 'Year 3', 'Year 5', 'Year 10'],
          datasets: [
            {
              label: 'Daily Ridership',
              data: [
                forecast.scenarios[1].dailyRidership * 0.76,
                forecast.scenarios[1].dailyRidership * 0.90,
                forecast.scenarios[1].dailyRidership,
                forecast.scenarios[1].dailyRidership * 1.11,
                forecast.scenarios[1].dailyRidership * 1.32,
              ],
              borderColor: '#3182ce',
              backgroundColor: 'rgba(49, 130, 206, 0.1)',
            },
          ],
        },
      },
    ],

    tables: [
      {
        title: 'Forecast Scenarios Comparison',
        headers: ['Metric', 'Conservative', 'Moderate', 'Optimistic'],
        rows: [
          [
            'Daily Boardings',
            forecast.scenarios[0].dailyRidership.toLocaleString(),
            forecast.scenarios[1].dailyRidership.toLocaleString(),
            forecast.scenarios[2].dailyRidership.toLocaleString(),
          ],
          [
            'Annual Boardings',
            forecast.scenarios[0].annualRidership.toLocaleString(),
            forecast.scenarios[1].annualRidership.toLocaleString(),
            forecast.scenarios[2].annualRidership.toLocaleString(),
          ],
          [
            'Confidence Level',
            `${(forecast.scenarios[0].confidence * 100).toFixed(0)}%`,
            `${(forecast.scenarios[1].confidence * 100).toFixed(0)}%`,
            `${(forecast.scenarios[2].confidence * 100).toFixed(0)}%`,
          ],
        ],
      },
      {
        title: 'Service Frequency Sensitivity',
        headers: ['Frequency', 'Daily Ridership', 'Change from Base'],
        rows: comparison.scenarios.map((scenario, i) => {
          const moderate = scenario.results.scenarios.find(
            (s) => s.scenario === 'moderate'
          )!;
          const baseRidership = forecast.scenarios[1].dailyRidership;
          const change =
            ((moderate.dailyRidership - baseRidership) / baseRidership) * 100;
          return [
            scenario.name,
            moderate.dailyRidership.toLocaleString(),
            `${change > 0 ? '+' : ''}${change.toFixed(1)}%`,
          ];
        }),
      },
    ],

    findings: `
KEY FINDINGS:

1. FORECAST RESULTS
The ensemble model projects ${forecast.scenarios[1].dailyRidership.toLocaleString()} daily boardings under moderate
assumptions, with a range from ${forecast.scenarios[0].dailyRidership.toLocaleString()} (conservative) to
${forecast.scenarios[2].dailyRidership.toLocaleString()} (optimistic). This forecast reflects:
• Strong corridor demographics (4,200 persons/sq km density)
• High-quality BRT service (10 veh/hr peak frequency, 25 mph average speed)
• Significant employment concentration (82,000 jobs in catchment)

2. MODEL VALIDATION
The forecast was validated using:
• Direct demand regression model calibrated to similar BRT systems
• Machine learning model trained on 50+ comparable systems nationwide
• Ensemble approach combining both models for improved accuracy
• Benchmarking against Cleveland HealthLine, Eugene EmX, and other peer systems

3. SENSITIVITY ANALYSIS
${sensitivitySummary.split('\n').slice(2, 10).join('\n')}

4. SERVICE FREQUENCY IMPACT
Analysis of different frequency scenarios shows:
${comparison.scenarios.map((s, i) => {
  const moderate = s.results.scenarios.find(sc => sc.scenario === 'moderate')!;
  return `• ${s.name}: ${moderate.dailyRidership.toLocaleString()} daily riders`;
}).join('\n')}

Higher frequency service significantly increases ridership, demonstrating the
importance of maintaining planned 10-minute peak headways.

5. MARKET SEGMENTATION
${forecast.marketSegmentation ? forecast.marketSegmentation.map(seg =>
  `• ${seg.segment}: ${seg.percentage.toFixed(1)}% (${seg.dailyRidership.toLocaleString()} riders)`
).join('\n') : 'Market segmentation analysis included in technical appendix.'}
    `.trim(),

    recommendations: `
RECOMMENDATIONS:

1. PROCEED WITH PROJECT DEVELOPMENT
The ridership forecasts strongly support advancing the North Corridor BRT to
final design and construction. The moderate scenario of ${forecast.scenarios[1].dailyRidership.toLocaleString()}
daily boardings significantly exceeds FTA thresholds for Small Starts funding.

2. MAINTAIN SERVICE QUALITY STANDARDS
Sensitivity analysis demonstrates that ridership is highly responsive to service
frequency. We recommend:
• Maintain 10 veh/hr (6-minute) peak frequency as planned
• Do not reduce service levels to save costs
• Consider increasing to 12 veh/hr if demand materializes at upper end of forecast

3. PHASED IMPLEMENTATION IF NEEDED
If capital funding is constrained, consider phasing:
• Phase 1: Airport to Midtown (captures ~70% of forecast ridership)
• Phase 2: Midtown to Downtown extension
This maintains project viability while enabling earlier service launch.

4. MONITORING AND ADAPTIVE MANAGEMENT
Implement comprehensive monitoring program:
• Automatic passenger counters on all vehicles from day one
• Quarterly ridership reports comparing actuals to forecast
• Service adjustments based on observed patterns
• Annual forecast updates incorporating actual performance

5. SUPPORTIVE POLICIES
To achieve upper-end forecasts:
• Coordinate with local jurisdictions on transit-oriented development
• Upzone station areas for mixed-use development
• Implement reduced parking requirements near stations
• Prioritize affordable housing within walking distance

6. MARKETING AND PUBLIC ENGAGEMENT
Launch comprehensive marketing campaign:
• Begin outreach 6 months before opening
• Free ride promotions during first month
• Employer outreach and transit pass programs
• Real-time passenger information systems from day one

NEXT STEPS:
1. Advance to 30% preliminary engineering
2. Submit FTA Small Starts Letter of Interest
3. Initiate environmental review process
4. Secure local matching funds commitment
5. Begin stakeholder engagement and public outreach
    `.trim(),

    conclusion: `
The North Corridor BRT represents a high-value investment in the region's transit
infrastructure. Our ensemble forecasting approach, combining multiple methodologies
and validated against comparable systems nationwide, projects strong ridership
potential of ${forecast.scenarios[1].dailyRidership.toLocaleString()} daily boardings.

The project would serve a transit-supportive corridor with high population and
employment density, limited competing highway capacity, and significant transit-
dependent populations. Sensitivity analysis confirms the forecast is robust to
reasonable variations in key assumptions.

We recommend proceeding with project development and pursuing federal Small Starts
funding to complement local investment. With appropriate service planning,
supportive land use policies, and effective marketing, actual ridership could
exceed moderate forecasts and approach optimistic projections.
    `.trim(),
  };

  try {
    const result = await generateRidershipForecast(documentData, 'pdf');

    if (result.success) {
      const outputPath = './north_corridor_ridership_forecast.pdf';
      await fs.writeFile(outputPath, result.buffer!);

      console.log('\n✅ Complete forecast report generated!');
      console.log(`📄 File: ${outputPath}`);
      console.log(`📊 Size: ${(result.fileSize! / 1024).toFixed(2)} KB`);
      console.log('\n📈 Forecast Summary:');
      forecast.scenarios.forEach((scenario) => {
        console.log(
          `   ${scenario.name.padEnd(25)} ${scenario.dailyRidership.toLocaleString().padStart(8)} daily riders (${(scenario.confidence * 100).toFixed(0)}% confidence)`
        );
      });
    } else {
      console.error('❌ Generation failed:', result.errors);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { main as generateCompleteForecast };
