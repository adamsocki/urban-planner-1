/**
 * Example: Generate a Transit Analysis Report
 *
 * This example shows how to generate a complete transit network
 * analysis report using the document generator.
 */

import { generateTransitAnalysisReport } from '@urban-planner/doc-generator';
import type { DocumentData } from '@urban-planner/doc-generator';
import fs from 'fs/promises';

async function main() {
  // Prepare document data
  const documentData: DocumentData = {
    // Metadata
    title: "Citywide Transit Network Analysis",
    subtitle: "2025 Service Assessment and Recommendations",
    author: "Metropolitan Planning Organization",
    date: new Date("2025-01-15"),
    projectName: "Transit System Improvement Plan",

    // Executive Summary
    executiveSummary: `
This comprehensive analysis examines the Metropolitan Transit Authority's network
covering 650 square kilometers and serving over 1.25 million residents. Our assessment
reveals a generally robust system with opportunities for targeted improvements.

Key findings include:
• 85% population coverage within 400m of transit stops
• High ridership on light rail (avg 62,000 daily boardings)
• Service gaps in northeastern neighborhoods
• Opportunity for frequency improvements on high-demand routes

We recommend a phased approach to service enhancements focusing on equity,
frequency, and last-mile connectivity.
    `.trim(),

    // Introduction
    introduction: `
The Metropolitan Transit Authority (MTA) operates an extensive multimodal network
serving the greater metropolitan area. This analysis was commissioned to evaluate
current service levels, identify gaps, and develop recommendations for system
improvements.

Methodology:
This analysis utilized GTFS (General Transit Feed Specification) data from the
MTA's January 2025 service schedule. We conducted spatial analysis of stop coverage,
frequency analysis of route-level service, and demographic analysis to assess
service equity across neighborhoods.

Study Area:
The MTA service area encompasses 650 square kilometers including the central city
and surrounding municipalities. The area has a diverse population of 1.47 million
residents with varying transportation needs.
    `.trim(),

    // Transit network data
    transitData: {
      feedName: "MTA-GTFS-2025-Q1",
      agencyName: "Metropolitan Transit Authority",
      dateRange: {
        start: "2025-01-01",
        end: "2025-12-31"
      },
      stats: {
        totalRoutes: 87,
        totalStops: 1542,
        totalTrips: 28500,
        serviceArea: 650
      },
      routesByType: [
        { type: "Local Bus", count: 62 },
        { type: "Express Bus", count: 15 },
        { type: "Light Rail", count: 8 },
        { type: "Bus Rapid Transit", count: 2 }
      ],
      coverage: {
        populationServed: 1250000,
        percentCovered: 85,
        avgStopsPerRoute: 17.7
      }
    },

    // Demographics
    demographics: {
      totalPopulation: 1470000,
      households: 580000,
      medianIncome: 72500,
      medianAge: 36.2,
      employmentRate: 64.5,
      ageDistribution: [
        { label: "Under 18", value: 294000 },
        { label: "18-34", value: 382000 },
        { label: "35-64", value: 588000 },
        { label: "65+", value: 206000 }
      ],
      raceEthnicity: [
        { label: "White", value: 647400 },
        { label: "Black/African American", value: 220500 },
        { label: "Hispanic/Latino", value: 367500 },
        { label: "Asian", value: 176400 },
        { label: "Other", value: 58200 }
      ],
      housingTenure: {
        owned: 352000,
        rented: 228000
      }
    },

    // Charts
    charts: [
      {
        type: "bar",
        title: "Daily Boardings by Mode",
        data: {
          labels: ["Local Bus", "Express Bus", "Light Rail", "BRT"],
          datasets: [{
            label: "Average Daily Boardings",
            data: [145000, 28000, 62000, 8500],
            backgroundColor: ["#4299e1", "#48bb78", "#ed8936", "#9f7aea"]
          }]
        }
      },
      {
        type: "line",
        title: "Ridership Trends (Last 5 Years)",
        data: {
          labels: ["2020", "2021", "2022", "2023", "2024"],
          datasets: [
            {
              label: "Total Daily Ridership",
              data: [180000, 145000, 195000, 225000, 243500],
              borderColor: "#3182ce",
              backgroundColor: "rgba(49, 130, 206, 0.1)"
            }
          ]
        }
      }
    ],

    // Tables
    tables: [
      {
        title: "Route Performance Metrics",
        headers: ["Route Type", "Routes", "Daily Trips", "Avg Frequency (min)", "Ridership"],
        rows: [
          ["Local Bus", "62", "18,500", "15", "145,000"],
          ["Express Bus", "15", "2,800", "30", "28,000"],
          ["Light Rail", "8", "6,200", "10", "62,000"],
          ["BRT", "2", "1,000", "8", "8,500"]
        ],
        footer: ["Total", "87", "28,500", "-", "243,500"]
      },
      {
        title: "Service Coverage by Neighborhood",
        headers: ["Neighborhood", "Population", "Stops", "Coverage (%)", "Service Level"],
        rows: [
          ["Downtown", "125,000", "245", "95%", "Excellent"],
          ["North Side", "180,000", "198", "88%", "Good"],
          ["South Side", "165,000", "187", "82%", "Good"],
          ["West End", "145,000", "156", "78%", "Fair"],
          ["East District", "132,000", "124", "68%", "Fair"],
          ["Northeast", "98,000", "72", "52%", "Poor"]
        ]
      }
    ],

    // Findings
    findings: `
Our analysis of the MTA network revealed several important findings:

1. SERVICE COVERAGE
The system achieves 85% population coverage with 1,542 stops distributed across
the service area. However, coverage is uneven, with excellent service in the
downtown core (95% coverage) but gaps in northeastern neighborhoods (52% coverage).

2. MODE PERFORMANCE
Light rail demonstrates the highest ridership efficiency, carrying 62,000 daily
passengers on just 8 routes. The BRT system, while limited to 2 routes, shows
strong performance with an average of 4,250 boardings per route.

3. FREQUENCY ANALYSIS
Peak hour frequencies are generally adequate on major corridors (6-10 minute headways),
but off-peak and weekend service drops significantly. Several high-ridership routes
operate at 30-minute headways during midday, which may be suppressing ridership.

4. EQUITY CONCERNS
Lower-income neighborhoods in the northeast quadrant have significantly lower
service levels despite higher transit dependency (42% zero-vehicle households
vs. 28% city average). This represents a potential environmental justice concern.

5. SYSTEM CAPACITY
Several routes operate at or near capacity during peak hours, particularly light
rail lines 1 and 3. Standee counts indicate demand for additional capacity.

6. CONNECTIVITY
Transfer points between modes are generally well-designed, but several high-volume
transfer locations lack weather protection and real-time information displays.
    `.trim(),

    // Recommendations
    recommendations: `
Based on our findings, we recommend the following improvements:

IMMEDIATE PRIORITIES (0-2 years):

1. Service Frequency Enhancements
   • Increase frequency on light rail lines 1 and 3 from 10 to 7.5 minutes during peak
   • Improve midday frequency on top 10 bus routes from 30 to 20 minutes
   • Extend evening service on major corridors to midnight
   • Estimated cost: $8.5M annually

2. Northeast Corridor Improvements
   • Extend bus route 47 into underserved neighborhoods
   • Add new crosstown route connecting northeast to light rail
   • Increase stop amenities (shelters, benches, lighting)
   • Estimated cost: $12M capital, $3.2M annual operating

3. Transfer Point Upgrades
   • Install real-time arrival displays at 25 major transfer points
   • Add weather-protected waiting areas at 15 key locations
   • Improve wayfinding signage at multimodal hubs
   • Estimated cost: $6M capital

MEDIUM-TERM GOALS (2-5 years):

4. Light Rail Capacity Expansion
   • Increase train lengths from 2 to 3 cars on lines 1 and 3
   • Procure 6 additional light rail vehicles
   • Platform extensions at 18 stations
   • Estimated cost: $85M capital

5. Bus Rapid Transit Expansion
   • Extend BRT line 1 to airport (8 km)
   • New BRT line on Main Street corridor (12 km)
   • Estimated cost: $145M capital, $8M annual operating

6. Equity Initiatives
   • Reduced fare program for low-income residents
   • Community shuttle service in transit deserts
   • Mobile app in multiple languages
   • Estimated cost: $4M annually

LONG-TERM VISION (5-10 years):

7. Network Redesign
   • Comprehensive network restructuring based on current demand patterns
   • Grid-based frequent network with simplified route structure
   • All-day 15-minute or better frequency on core network
   • Estimated cost: Revenue neutral through reallocation

8. Technology Integration
   • Contactless payment system
   • Mobility-as-a-Service integration with bike/scooter share
   • Real-time crowding information
   • Estimated cost: $25M capital

IMPLEMENTATION STRATEGY:
We recommend a phased approach beginning with low-cost service improvements
(recommendations 1-3) that can demonstrate quick wins and build public support.
Capital-intensive projects (4-5) should proceed with dedicated funding sources.
The long-term network redesign (7) should be preceded by extensive community
engagement and demand modeling.

FUNDING OPTIONS:
• Federal Transit Administration grants (5307, 5309)
• State transit operating assistance
• Local sales tax increment
• Value capture from transit-oriented development
• Regional mobility authority partnerships
    `.trim(),

    // Conclusion
    conclusion: `
The Metropolitan Transit Authority operates a fundamentally sound transit network
that serves as a backbone for regional mobility. With targeted investments in
frequency, coverage, and equity, the system can better serve current riders and
attract new users.

The recommendations presented in this report are designed to be implementable
in phases, allowing for gradual system improvement even with constrained budgets.
Priority should be given to service enhancements that directly benefit riders—
more frequent service, better coverage, and improved amenities.

Success will require sustained investment, regional coordination, and ongoing
engagement with riders and communities. With these commitments, the MTA can
continue evolving to meet the changing needs of the metropolitan area.
    `.trim(),
  };

  console.log('Generating Transit Analysis Report...');
  console.log('Template: transit-analysis');
  console.log('Format: PDF\n');

  try {
    // Generate PDF report
    const result = await generateTransitAnalysisReport(documentData, 'pdf');

    if (result.success) {
      // Save to file
      const outputPath = './transit_analysis_report.pdf';
      await fs.writeFile(outputPath, result.buffer!);

      console.log('✅ Report generated successfully!');
      console.log(`📄 File: ${outputPath}`);
      console.log(`📊 Size: ${(result.fileSize! / 1024).toFixed(2)} KB`);
      console.log(`📅 Generated: ${result.metadata?.generatedAt}`);
      if (result.metadata?.pageCount) {
        console.log(`📖 Pages: ${result.metadata.pageCount}`);
      }
    } else {
      console.error('❌ Report generation failed:');
      result.errors?.forEach(error => console.error(`   - ${error}`));
    }

    // Also generate DOCX version
    console.log('\nGenerating DOCX version...');
    const docxResult = await generateTransitAnalysisReport(documentData, 'docx');

    if (docxResult.success) {
      const docxPath = './transit_analysis_report.docx';
      await fs.writeFile(docxPath, docxResult.buffer!);
      console.log(`✅ DOCX version saved: ${docxPath}`);
    }

  } catch (error) {
    console.error('Error generating report:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { main as generateTransitReport };
