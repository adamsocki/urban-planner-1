/**
 * Document Generator Package
 * Main export file
 */

export * from './types';
export * from './templates';
export { PDFGenerator } from './generators/pdf-generator';
export { DOCXGenerator } from './generators/docx-generator';

import { PDFGenerator } from './generators/pdf-generator';
import { DOCXGenerator } from './generators/docx-generator';
import {
  DocumentData,
  GenerationOptions,
  GenerationResult,
  DocumentFormat,
} from './types';

/**
 * Main document generator function
 * Automatically selects the appropriate generator based on format
 */
export async function generateDocument(
  data: DocumentData,
  options: GenerationOptions
): Promise<GenerationResult> {
  const { format } = options;

  switch (format) {
    case 'pdf':
      const pdfGen = new PDFGenerator(options);
      return await pdfGen.generate(data);

    case 'docx':
      const docxGen = new DOCXGenerator(options);
      return await docxGen.generate(data);

    case 'xlsx':
      // TODO: Implement Excel generator
      return {
        success: false,
        format: 'xlsx',
        errors: ['Excel generation not yet implemented'],
      };

    case 'html':
      // TODO: Implement HTML generator
      return {
        success: false,
        format: 'html',
        errors: ['HTML generation not yet implemented'],
      };

    default:
      return {
        success: false,
        format,
        errors: [`Unsupported format: ${format}`],
      };
  }
}

/**
 * Convenience functions for specific document types
 */

export async function generateTransitAnalysisReport(
  data: DocumentData,
  format: DocumentFormat = 'pdf'
): Promise<GenerationResult> {
  return generateDocument(data, {
    format,
    template: 'transit-analysis',
    includeTableOfContents: true,
    includePageNumbers: true,
  });
}

export async function generateRidershipForecast(
  data: DocumentData,
  format: DocumentFormat = 'pdf'
): Promise<GenerationResult> {
  return generateDocument(data, {
    format,
    template: 'ridership-forecast',
    includeTableOfContents: true,
    includePageNumbers: true,
  });
}

export async function generateComprehensivePlan(
  data: DocumentData,
  format: DocumentFormat = 'pdf'
): Promise<GenerationResult> {
  return generateDocument(data, {
    format,
    template: 'comprehensive-plan',
    includeTableOfContents: true,
    includePageNumbers: true,
    paperSize: 'letter',
    orientation: 'portrait',
  });
}

export async function generateZoningReport(
  data: DocumentData,
  format: DocumentFormat = 'pdf'
): Promise<GenerationResult> {
  return generateDocument(data, {
    format,
    template: 'zoning-report',
    includePageNumbers: true,
  });
}
