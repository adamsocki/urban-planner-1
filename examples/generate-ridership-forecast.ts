/**
 * Example: Generate a Ridership Forecast Report
 *
 * This example demonstrates forecasting ridership for a new
 * bus rapid transit line.
 */

import { generateRidershipForecast } from '@urban-planner/doc-generator';
import type { DocumentData } from '@urban-planner/doc-generator';
import fs from 'fs/promises';

async function main() {
  const documentData: DocumentData = {
    title: "North Corridor BRT Ridership Forecast",
    subtitle: "Proposed Route 500 - Airport to Downtown",
    author: "Transit Planning Division",
    date: new Date(),
    projectName: "North Corridor Transit Improvements",

    executiveSummary: `
This report presents ridership forecasts for the proposed North Corridor Bus
Rapid Transit (BRT) line connecting the regional airport to downtown via major
employment centers. Using a combined direct demand and machine learning approach,
we project moderate daily ridership of 8,200 boardings, with a range from 6,500
(conservative) to 10,400 (optimistic).

The forecast is based on demographic analysis of the corridor, proposed service
parameters (10-minute peak frequency), and comparable BRT systems. The route
would serve an estimated 145,000 residents and 82,000 jobs within a 10-minute
walk, making it a strong candidate for high-quality transit service.
    `.trim(),

    methodology: `
This ridership forecast employs three complementary methodologies:

1. DIRECT DEMAND MODEL
A regression-based model using population density, employment density, transit
access, and service frequency as predictor variables. Calibrated using observed
ridership from existing BRT systems in similar markets.

2. MACHINE LEARNING ENSEMBLE
A Random Forest model trained on 50+ BRT systems nationwide, incorporating 24
features including demographics, built environment, service characteristics, and
regional transportation metrics.

3. COMPARATIVE ANALYSIS
Benchmarking against peer BRT systems with similar corridor characteristics:
- Cleveland HealthLine
- Pittsburgh Martin Luther King Jr. East Busway
- Richmond Pulse

All three approaches were weighted equally in the final forecast range.
    `.trim(),

    forecastData: {
      routeName: "Route 500 - North Corridor BRT",
      methodology: "Combined Direct Demand, Machine Learning, and Comparative Analysis",
      assumptions: [
        "Service span: 5:00 AM to 12:00 AM daily",
        "Peak frequency: 6 minutes (10 buses/hour)",
        "Off-peak frequency: 10 minutes",
        "Weekend frequency: 12 minutes",
        "Average speed: 25 mph (vs 12 mph for local bus)",
        "Fare: $2.50, same as existing service",
        "Station spacing: 0.75 miles average",
        "Opening year: 2027",
        "Economic conditions: baseline growth (2.5% annually)",
        "Competing auto travel time: 22 minutes",
        "No major land use changes assumed (conservative)"
      ],
      forecasts: [
        {
          scenario: "conservative",
          dailyRidership: 6500,
          annualRidership: 1950000,
          confidence: 0.85
        },
        {
          scenario: "moderate",
          dailyRidership: 8200,
          annualRidership: 2460000,
          confidence: 0.90
        },
        {
          scenario: "optimistic",
          dailyRidership: 10400,
          annualRidership: 3120000,
          confidence: 0.75
        }
      ],
      demographicInputs: {
        population: 145000,
        employment: 82000,
        density: 4200 // people per sq km
      },
      serviceInputs: {
        frequency: 10, // peak vehicles per hour
        span: "19 hours (5 AM - 12 AM)",
        speed: 25 // mph
      }
    },

    demographics: {
      totalPopulation: 145000,
      households: 58000,
      medianIncome: 58500,
      medianAge: 33.8,
      employmentRate: 62.0,
      ageDistribution: [
        { label: "18-34", value: 52000 },
        { label: "35-64", value: 68000 },
        { label: "65+", value: 25000 }
      ]
    },

    charts: [
      {
        type: "bar",
        title: "Ridership Forecast Range",
        data: {
          labels: ["Conservative", "Moderate", "Optimistic"],
          datasets: [{
            label: "Daily Ridership",
            data: [6500, 8200, 10400],
            backgroundColor: ["#ed8936", "#48bb78", "#4299e1"]
          }]
        }
      },
      {
        type: "line",
        title: "Projected Ridership Growth (First 10 Years)",
        data: {
          labels: ["Year 1", "Year 2", "Year 3", "Year 5", "Year 10"],
          datasets: [{
            label: "Daily Ridership",
            data: [6200, 7400, 8200, 9100, 10800],
            borderColor: "#3182ce",
            backgroundColor: "rgba(49, 130, 206, 0.1)"
          }]
        }
      }
    ],

    tables: [
      {
        title: "Forecast Scenarios Comparison",
        headers: ["Metric", "Conservative", "Moderate", "Optimistic"],
        rows: [
          ["Daily Boardings", "6,500", "8,200", "10,400"],
          ["Annual Boardings", "1,950,000", "2,460,000", "3,120,000"],
          ["Boardings/Mile", "520", "656", "832"],
          ["Peak Period Share", "35%", "38%", "40%"],
          ["Load Factor (peak)", "45%", "62%", "78%"]
        ]
      },
      {
        title: "Comparable BRT Systems",
        headers: ["System", "Metro Pop", "Daily Ridership", "Length (mi)", "Ridership/Mile"],
        rows: [
          ["Cleveland HealthLine", "2.0M", "14,500", "7.1", "2,042"],
          ["Pittsburgh MLK Busway", "2.3M", "11,800", "6.8", "1,735"],
          ["Richmond Pulse", "1.3M", "4,200", "7.6", "553"],
          ["Eugene EmX", "0.4M", "9,100", "10.2", "892"],
          ["Proposed Route 500", "1.5M", "8,200", "12.5", "656"]
        ]
      }
    ],

    findings: `
KEY FINDINGS:

1. CORRIDOR DEMAND CHARACTERISTICS
The North Corridor exhibits strong fundamentals for BRT service:
• High residential density (4,200 persons/sq km, 2.5x metro average)
• Major employment concentrations at airport and downtown
• Limited highway capacity (chronically congested I-90 corridor)
• High zero-vehicle household rate (18% vs 12% metro average)

2. COMPETITIVE TRAVEL TIMES
BRT travel time of 30 minutes compares favorably to:
• Existing local bus: 52 minutes
• Auto (off-peak): 22 minutes
• Auto (peak): 38-45 minutes

The BRT would be competitive with driving during peak periods while providing
more reliable travel times.

3. MARKET CAPTURE ANALYSIS
Our model estimates the BRT would capture:
• 45% of existing corridor transit riders (switching from local bus)
• 8% new transit riders from auto
• 12% induced demand (new trips enabled by improved access)

4. SENSITIVITY TO KEY VARIABLES
Ridership is most sensitive to:
• Service frequency (+10% frequency → +6% ridership)
• Travel time savings (+10% speed → +8% ridership)
• Corridor employment growth (+10% jobs → +5% ridership)
• Fare levels (+10% fare → -4% ridership)

5. COMPARATIVE PERFORMANCE
The moderate forecast (8,200 daily) positions Route 500 as:
• Higher than peer systems in similar-sized metros (Richmond, Eugene)
• Lower than systems in larger metros (Cleveland, Pittsburgh)
• Appropriate given local market conditions
    `.trim(),

    recommendations: `
RECOMMENDATIONS:

1. PROCEED WITH PROJECT DEVELOPMENT
The ridership forecasts support advancing the North Corridor BRT to final design
and construction. The moderate scenario of 8,200 daily boardings exceeds the FTA
threshold for Small Starts funding (typically 3,000+ for BRT projects).

2. OPTIMIZE SERVICE PLAN
To achieve upper-end ridership forecasts:
• Maintain 6-minute peak frequency (do not reduce to save costs)
• Provide consistent 10-minute midday service
• Extend evening service to 1:00 AM on weekends
• Consider express/limited-stop variant for airport trips

3. SUPPORTIVE LAND USE POLICIES
Partner with local jurisdictions to:
• Upzone station areas for mixed-use development
• Require reduced parking ratios near stations
• Prioritize affordable housing near transit

Scenario modeling suggests transit-oriented development could increase ridership
by 15-25% over 10 years.

4. PHASING OPTIONS
If capital budget is constrained, consider:
• Phase 1: Airport to Midtown (8 miles, ~70% of ridership)
• Phase 2: Midtown to Downtown (4.5 miles)

This allows earlier service introduction while maintaining viable ridership.

5. MONITORING AND ADJUSTMENT
Implement ridership monitoring program:
• Automatic passenger counters on all vehicles
• Annual ridership reports comparing to forecasts
• Service adjustments based on observed demand patterns

6. MARKETING AND OUTREACH
To achieve forecast ridership:
• Pre-opening marketing campaign 6 months prior
• "Free ride days" for first month of operation
• Targeted outreach to employers along corridor
• Mobile app with real-time arrival information

NEXT STEPS:
1. Advance to 30% design with preferred alignment
2. Submit FTA Small Starts Letter of Interest
3. Conduct environmental review
4. Secure local matching funds ($45M local share of $180M project)
5. Begin property acquisition at station sites
    `.trim(),

    conclusion: `
The North Corridor BRT presents a strong opportunity to provide high-quality
transit service in an underserved corridor with significant demand potential.
Our forecast of 8,200 daily boardings (moderate scenario) is well-supported by
multiple methodologies and comparable system analysis.

The project would serve transit-dependent populations, reduce corridor congestion,
and support economic development goals. With appropriate service planning and
supportive land use policies, actual ridership could exceed moderate forecasts.

We recommend proceeding with project development and pursuing federal Small Starts
funding to supplement local investment.
    `.trim()
  };

  console.log('Generating Ridership Forecast Report...');
  console.log('Route: North Corridor BRT');
  console.log('Format: PDF\n');

  try {
    const result = await generateRidershipForecast(documentData, 'pdf');

    if (result.success) {
      const outputPath = './ridership_forecast.pdf';
      await fs.writeFile(outputPath, result.buffer!);

      console.log('✅ Forecast report generated!');
      console.log(`📄 File: ${outputPath}`);
      console.log(`📊 Size: ${(result.fileSize! / 1024).toFixed(2)} KB`);
      console.log('\n📈 Forecast Summary:');
      console.log(`   Conservative: 6,500 daily boardings`);
      console.log(`   Moderate:     8,200 daily boardings`);
      console.log(`   Optimistic:   10,400 daily boardings`);
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

export { main as generateForecastReport };
