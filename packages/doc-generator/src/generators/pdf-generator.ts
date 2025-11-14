/**
 * PDF Generator using PDFKit
 */

import PDFDocument from 'pdfkit';
import { format } from 'date-fns';
import {
  DocumentData,
  GenerationOptions,
  GenerationResult,
  ChartData,
  TableData,
  MapSnapshot,
} from '../types';
import { getTemplate } from '../templates';

export class PDFGenerator {
  private doc: PDFKit.PDFDocument;
  private pageNumber = 0;
  private options: GenerationOptions;

  constructor(options: GenerationOptions) {
    this.options = {
      paperSize: 'letter',
      orientation: 'portrait',
      margins: { top: 72, right: 72, bottom: 72, left: 72 },
      includePageNumbers: true,
      includeTableOfContents: true,
      ...options,
    };

    this.doc = new PDFDocument({
      size: this.options.paperSize,
      layout: this.options.orientation,
      margins: this.options.margins,
      bufferPages: true,
      autoFirstPage: true,
    });
  }

  async generate(data: DocumentData): Promise<GenerationResult> {
    try {
      const chunks: Buffer[] = [];

      // Collect PDF data
      this.doc.on('data', (chunk) => chunks.push(chunk));

      // Get template if specified
      const template = this.options.template
        ? getTemplate(this.options.template)
        : null;

      // Generate content
      this.generateCoverPage(data);

      if (this.options.includeTableOfContents) {
        this.generateTableOfContents(data, template);
      }

      this.generateContent(data, template);

      // Finalize PDF
      this.doc.end();

      // Wait for PDF to complete
      const buffer = await new Promise<Buffer>((resolve) => {
        this.doc.on('end', () => {
          resolve(Buffer.concat(chunks));
        });
      });

      return {
        success: true,
        format: 'pdf',
        buffer,
        fileSize: buffer.length,
        metadata: {
          generatedAt: new Date(),
          pageCount: this.pageNumber,
        },
      };
    } catch (error) {
      return {
        success: false,
        format: 'pdf',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  private generateCoverPage(data: DocumentData) {
    const { title, subtitle, author, date, projectName } = data;

    // Center vertically
    this.doc.moveDown(8);

    // Title
    this.doc
      .font('Helvetica-Bold')
      .fontSize(32)
      .text(title, { align: 'center' });

    this.doc.moveDown(2);

    // Subtitle
    if (subtitle) {
      this.doc
        .font('Helvetica')
        .fontSize(20)
        .text(subtitle, { align: 'center' });
      this.doc.moveDown(1);
    }

    // Project name
    if (projectName) {
      this.doc.moveDown(4);
      this.doc
        .font('Helvetica-Bold')
        .fontSize(16)
        .text(projectName, { align: 'center' });
    }

    // Author and date
    this.doc.moveDown(8);
    this.doc.font('Helvetica').fontSize(12);

    if (author) {
      this.doc.text(`Prepared by: ${author}`, { align: 'center' });
    }

    if (date) {
      this.doc.text(format(date, 'MMMM d, yyyy'), { align: 'center' });
    }

    this.doc.addPage();
  }

  private generateTableOfContents(data: DocumentData, template: any) {
    this.doc
      .font('Helvetica-Bold')
      .fontSize(24)
      .text('Table of Contents', { underline: true });

    this.doc.moveDown(2);

    const sections = [
      { title: 'Executive Summary', page: 3 },
      { title: 'Introduction', page: 4 },
      { title: 'Demographics & Population Analysis', page: 5 },
      { title: 'Transportation & Mobility', page: 8 },
      { title: 'Findings & Recommendations', page: 12 },
      { title: 'Appendices', page: 15 },
    ];

    this.doc.font('Helvetica').fontSize(12);

    sections.forEach((section) => {
      this.doc.text(
        `${section.title} ${'.'.repeat(50)} ${section.page}`,
        { indent: 20 }
      );
      this.doc.moveDown(0.5);
    });

    this.doc.addPage();
  }

  private generateContent(data: DocumentData, template: any) {
    // Executive Summary
    if (data.executiveSummary) {
      this.addSection('Executive Summary', data.executiveSummary);
    }

    // Introduction
    if (data.introduction) {
      this.addSection('Introduction', data.introduction);
    }

    // Demographics
    if (data.demographics) {
      this.addDemographicsSection(data.demographics);
    }

    // Transit Data
    if (data.transitData) {
      this.addTransitSection(data.transitData);
    }

    // Ridership Forecast
    if (data.forecastData) {
      this.addForecastSection(data.forecastData);
    }

    // Maps
    if (data.maps && data.maps.length > 0) {
      this.addMapsSection(data.maps);
    }

    // Charts
    if (data.charts && data.charts.length > 0) {
      this.addChartsSection(data.charts);
    }

    // Tables
    if (data.tables && data.tables.length > 0) {
      data.tables.forEach((table) => this.addTable(table));
    }

    // Findings
    if (data.findings) {
      this.addSection('Findings', data.findings);
    }

    // Recommendations
    if (data.recommendations) {
      this.addSection('Recommendations', data.recommendations);
    }

    // Conclusion
    if (data.conclusion) {
      this.addSection('Conclusion', data.conclusion);
    }
  }

  private addSection(title: string, content: string) {
    this.doc.addPage();

    this.doc
      .font('Helvetica-Bold')
      .fontSize(20)
      .text(title, { underline: true });

    this.doc.moveDown(1);

    this.doc
      .font('Helvetica')
      .fontSize(12)
      .text(content, {
        align: 'justify',
        lineGap: 4,
      });

    this.doc.moveDown(2);
  }

  private addDemographicsSection(demographics: any) {
    this.doc.addPage();

    this.doc
      .font('Helvetica-Bold')
      .fontSize(20)
      .text('Demographics & Population Analysis', { underline: true });

    this.doc.moveDown(1);

    // Summary statistics
    this.doc.font('Helvetica').fontSize(12);
    this.doc.text(`Total Population: ${demographics.totalPopulation.toLocaleString()}`);
    this.doc.text(`Households: ${demographics.households.toLocaleString()}`);
    this.doc.text(`Median Income: $${demographics.medianIncome.toLocaleString()}`);
    this.doc.text(`Median Age: ${demographics.medianAge} years`);
    this.doc.text(`Employment Rate: ${demographics.employmentRate}%`);

    this.doc.moveDown(2);

    // Age distribution table
    if (demographics.ageDistribution) {
      this.addTable({
        title: 'Age Distribution',
        headers: ['Age Group', 'Population', 'Percentage'],
        rows: demographics.ageDistribution.map((item: any) => [
          item.label,
          item.value.toLocaleString(),
          `${((item.value / demographics.totalPopulation) * 100).toFixed(1)}%`,
        ]),
      });
    }
  }

  private addTransitSection(transitData: any) {
    this.doc.addPage();

    this.doc
      .font('Helvetica-Bold')
      .fontSize(20)
      .text('Transit Network Analysis', { underline: true });

    this.doc.moveDown(1);

    this.doc.font('Helvetica').fontSize(12);
    this.doc.text(`Agency: ${transitData.agencyName}`);
    this.doc.text(`Feed: ${transitData.feedName}`);
    this.doc.text(
      `Service Period: ${transitData.dateRange.start} to ${transitData.dateRange.end}`
    );

    this.doc.moveDown(2);

    // Statistics
    this.doc.font('Helvetica-Bold').fontSize(14).text('Network Statistics');
    this.doc.moveDown(0.5);
    this.doc.font('Helvetica').fontSize(12);
    this.doc.text(`Total Routes: ${transitData.stats.totalRoutes}`);
    this.doc.text(`Total Stops: ${transitData.stats.totalStops}`);
    this.doc.text(`Total Trips: ${transitData.stats.totalTrips}`);
    this.doc.text(`Service Area: ${transitData.stats.serviceArea} sq km`);

    this.doc.moveDown(2);

    // Routes by type
    if (transitData.routesByType) {
      this.addTable({
        title: 'Routes by Type',
        headers: ['Mode', 'Number of Routes'],
        rows: transitData.routesByType.map((item: any) => [
          item.type,
          item.count.toString(),
        ]),
      });
    }

    this.doc.moveDown(2);

    // Coverage statistics
    if (transitData.coverage) {
      this.doc.font('Helvetica-Bold').fontSize(14).text('Service Coverage');
      this.doc.moveDown(0.5);
      this.doc.font('Helvetica').fontSize(12);
      this.doc.text(
        `Population Served: ${transitData.coverage.populationServed.toLocaleString()}`
      );
      this.doc.text(
        `Coverage: ${transitData.coverage.percentCovered}% of service area`
      );
      this.doc.text(
        `Average Stops per Route: ${transitData.coverage.avgStopsPerRoute}`
      );
    }
  }

  private addForecastSection(forecastData: any) {
    this.doc.addPage();

    this.doc
      .font('Helvetica-Bold')
      .fontSize(20)
      .text('Ridership Forecast', { underline: true });

    this.doc.moveDown(1);

    this.doc.font('Helvetica').fontSize(12);
    this.doc.text(`Route: ${forecastData.routeName}`);
    this.doc.text(`Methodology: ${forecastData.methodology}`);

    this.doc.moveDown(2);

    // Assumptions
    this.doc.font('Helvetica-Bold').fontSize(14).text('Key Assumptions');
    this.doc.moveDown(0.5);
    this.doc.font('Helvetica').fontSize(12);
    forecastData.assumptions.forEach((assumption: string) => {
      this.doc.text(`• ${assumption}`, { indent: 20 });
    });

    this.doc.moveDown(2);

    // Forecast results
    this.addTable({
      title: 'Ridership Forecasts',
      headers: ['Scenario', 'Daily Ridership', 'Annual Ridership', 'Confidence'],
      rows: forecastData.forecasts.map((f: any) => [
        f.scenario.charAt(0).toUpperCase() + f.scenario.slice(1),
        f.dailyRidership.toLocaleString(),
        f.annualRidership.toLocaleString(),
        `${(f.confidence * 100).toFixed(0)}%`,
      ]),
    });

    this.doc.moveDown(2);

    // Inputs
    this.addTable({
      title: 'Demographic Inputs',
      headers: ['Parameter', 'Value'],
      rows: [
        ['Population', forecastData.demographicInputs.population.toLocaleString()],
        ['Employment', forecastData.demographicInputs.employment.toLocaleString()],
        [
          'Density (per sq km)',
          forecastData.demographicInputs.density.toLocaleString(),
        ],
      ],
    });
  }

  private addMapsSection(maps: MapSnapshot[]) {
    this.doc.addPage();

    this.doc
      .font('Helvetica-Bold')
      .fontSize(20)
      .text('Maps & Geographic Analysis', { underline: true });

    this.doc.moveDown(1);

    maps.forEach((map, index) => {
      if (index > 0) {
        this.doc.moveDown(2);
      }

      // Map image
      if (map.imageBuffer) {
        try {
          this.doc.image(map.imageBuffer, {
            fit: [450, 300],
            align: 'center',
          });
        } catch (error) {
          this.doc.text('[Map image could not be loaded]', { align: 'center' });
        }
      } else if (map.imageUrl) {
        this.doc.text(`[Map: ${map.imageUrl}]`, { align: 'center' });
      }

      // Caption
      this.doc.moveDown(0.5);
      this.doc
        .font('Helvetica-Oblique')
        .fontSize(10)
        .text(map.caption, { align: 'center' });
      this.doc.font('Helvetica').fontSize(12);

      if (index < maps.length - 1 && this.doc.y > 600) {
        this.doc.addPage();
      }
    });
  }

  private addChartsSection(charts: ChartData[]) {
    this.doc.addPage();

    this.doc
      .font('Helvetica-Bold')
      .fontSize(20)
      .text('Charts & Visualizations', { underline: true });

    this.doc.moveDown(1);

    charts.forEach((chart) => {
      this.doc.font('Helvetica-Bold').fontSize(14).text(chart.title);
      this.doc.moveDown(0.5);

      // Note: In production, you would render charts using chartjs-node-canvas
      // For now, we'll represent them as tables
      this.doc.font('Helvetica').fontSize(10);
      this.doc.text('[Chart would be rendered here]', { align: 'center' });

      this.doc.moveDown(2);
    });
  }

  private addTable(tableData: TableData) {
    if (tableData.title) {
      this.doc
        .font('Helvetica-Bold')
        .fontSize(14)
        .text(tableData.title, { underline: true });
      this.doc.moveDown(0.5);
    }

    const columnWidth = 450 / tableData.headers.length;
    const startX = 72;
    let startY = this.doc.y;

    // Headers
    this.doc.font('Helvetica-Bold').fontSize(10);
    tableData.headers.forEach((header, i) => {
      this.doc.text(header, startX + i * columnWidth, startY, {
        width: columnWidth - 5,
        align: 'left',
      });
    });

    startY += 20;
    this.doc.moveTo(startX, startY).lineTo(startX + 450, startY).stroke();
    startY += 5;

    // Rows
    this.doc.font('Helvetica').fontSize(10);
    tableData.rows.forEach((row, rowIndex) => {
      const rowY = startY + rowIndex * 20;

      // Check if we need a new page
      if (rowY > 700) {
        this.doc.addPage();
        startY = 72;
        return;
      }

      row.forEach((cell, colIndex) => {
        this.doc.text(String(cell), startX + colIndex * columnWidth, rowY, {
          width: columnWidth - 5,
          align: 'left',
        });
      });
    });

    this.doc.moveDown(2);
  }
}
