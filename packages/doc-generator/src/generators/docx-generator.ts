/**
 * DOCX Generator using docxtemplater
 */

import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { format } from 'date-fns';
import {
  DocumentData,
  GenerationOptions,
  GenerationResult,
} from '../types';
import { getTemplate } from '../templates';

export class DOCXGenerator {
  private options: GenerationOptions;

  constructor(options: GenerationOptions) {
    this.options = options;
  }

  async generate(
    data: DocumentData,
    templateBuffer?: Buffer
  ): Promise<GenerationResult> {
    try {
      // If no template provided, use default
      if (!templateBuffer) {
        templateBuffer = await this.getDefaultTemplate();
      }

      const zip = new PizZip(templateBuffer);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      // Prepare data for template
      const templateData = this.prepareTemplateData(data);

      // Render document
      doc.render(templateData);

      // Generate buffer
      const buffer = doc.getZip().generate({
        type: 'nodebuffer',
        compression: 'DEFLATE',
      });

      return {
        success: true,
        format: 'docx',
        buffer,
        fileSize: buffer.length,
        metadata: {
          generatedAt: new Date(),
        },
      };
    } catch (error) {
      return {
        success: false,
        format: 'docx',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  private prepareTemplateData(data: DocumentData) {
    return {
      // Metadata
      title: data.title || 'Untitled Document',
      subtitle: data.subtitle || '',
      author: data.author || 'Urban Planning Department',
      date: data.date ? format(data.date, 'MMMM d, yyyy') : format(new Date(), 'MMMM d, yyyy'),
      projectName: data.projectName || '',

      // Content sections
      executiveSummary: data.executiveSummary || '',
      introduction: data.introduction || '',
      methodology: data.methodology || '',
      findings: data.findings || '',
      recommendations: data.recommendations || '',
      conclusion: data.conclusion || '',

      // Demographics
      demographics: data.demographics
        ? {
            totalPopulation: data.demographics.totalPopulation.toLocaleString(),
            households: data.demographics.households.toLocaleString(),
            medianIncome: `$${data.demographics.medianIncome.toLocaleString()}`,
            medianAge: data.demographics.medianAge,
            employmentRate: `${data.demographics.employmentRate}%`,
            ageDistribution: data.demographics.ageDistribution || [],
            raceEthnicity: data.demographics.raceEthnicity || [],
          }
        : null,

      // Transit data
      transitData: data.transitData
        ? {
            feedName: data.transitData.feedName,
            agencyName: data.transitData.agencyName,
            dateRange: `${data.transitData.dateRange.start} to ${data.transitData.dateRange.end}`,
            totalRoutes: data.transitData.stats.totalRoutes,
            totalStops: data.transitData.stats.totalStops,
            totalTrips: data.transitData.stats.totalTrips,
            serviceArea: data.transitData.stats.serviceArea,
            routesByType: data.transitData.routesByType || [],
            coverage: data.transitData.coverage,
          }
        : null,

      // Forecast data
      forecastData: data.forecastData
        ? {
            routeName: data.forecastData.routeName,
            methodology: data.forecastData.methodology,
            assumptions: data.forecastData.assumptions || [],
            forecasts: data.forecastData.forecasts.map((f) => ({
              scenario: f.scenario.charAt(0).toUpperCase() + f.scenario.slice(1),
              dailyRidership: f.dailyRidership.toLocaleString(),
              annualRidership: f.annualRidership.toLocaleString(),
              confidence: `${(f.confidence * 100).toFixed(0)}%`,
            })),
            demographicInputs: {
              population: data.forecastData.demographicInputs.population.toLocaleString(),
              employment: data.forecastData.demographicInputs.employment.toLocaleString(),
              density: data.forecastData.demographicInputs.density.toLocaleString(),
            },
            serviceInputs: data.forecastData.serviceInputs,
          }
        : null,

      // Zoning data
      zoningData: data.zoningData
        ? {
            parcelId: data.zoningData.parcelId,
            address: data.zoningData.address,
            currentZoning: data.zoningData.currentZoning,
            proposedZoning: data.zoningData.proposedZoning || 'N/A',
            area: data.zoningData.area,
            landUse: data.zoningData.landUse,
            complianceStatus: data.zoningData.complianceStatus,
            notes: data.zoningData.notes || '',
          }
        : null,

      // Tables
      tables: data.tables || [],

      // Custom fields
      ...data.customFields,
    };
  }

  private async getDefaultTemplate(): Promise<Buffer> {
    // In production, this would load a template file from disk or S3
    // For now, return a minimal DOCX template
    const minimalDocx = this.createMinimalTemplate();
    return minimalDocx;
  }

  private createMinimalTemplate(): Buffer {
    // Create a minimal valid DOCX structure
    const zip = new PizZip();

    // [Content_Types].xml
    zip.file(
      '[Content_Types].xml',
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`
    );

    // _rels/.rels
    zip.file(
      '_rels/.rels',
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
    );

    // word/_rels/document.xml.rels
    zip.file(
      'word/_rels/document.xml.rels',
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`
    );

    // word/document.xml with template placeholders
    zip.file(
      'word/document.xml',
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:t>{title}</w:t></w:r></w:p>
    <w:p><w:r><w:t>{subtitle}</w:t></w:r></w:p>
    <w:p><w:r><w:t>Prepared by: {author}</w:t></w:r></w:p>
    <w:p><w:r><w:t>Date: {date}</w:t></w:r></w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>
    <w:p><w:r><w:t>Executive Summary</w:t></w:r></w:p>
    <w:p><w:r><w:t>{executiveSummary}</w:t></w:r></w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>
    <w:p><w:r><w:t>Introduction</w:t></w:r></w:p>
    <w:p><w:r><w:t>{introduction}</w:t></w:r></w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>
    <w:p><w:r><w:t>Findings</w:t></w:r></w:p>
    <w:p><w:r><w:t>{findings}</w:t></w:r></w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>
    <w:p><w:r><w:t>Recommendations</w:t></w:r></w:p>
    <w:p><w:r><w:t>{recommendations}</w:t></w:r></w:p>
  </w:body>
</w:document>`
    );

    return zip.generate({ type: 'nodebuffer' });
  }
}
