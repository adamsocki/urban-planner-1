/**
 * Document Generation API Routes
 */

import express from 'express';
import { generateDocument } from '@urban-planner/doc-generator';
import { DocumentData, GenerationOptions } from '@urban-planner/doc-generator';

const router = express.Router();

/**
 * POST /api/documents/generate
 * Generate a document from provided data
 */
router.post('/generate', async (req, res) => {
  try {
    const { data, options }: { data: DocumentData; options: GenerationOptions } = req.body;

    // Validate required fields
    if (!data || !options || !options.format) {
      return res.status(400).json({
        error: 'Missing required fields: data and options.format',
      });
    }

    // Generate document
    const result = await generateDocument(data, options);

    if (!result.success) {
      return res.status(500).json({
        error: 'Document generation failed',
        details: result.errors,
      });
    }

    // Set appropriate content type
    const contentTypes = {
      pdf: 'application/pdf',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      html: 'text/html',
    };

    const contentType = contentTypes[options.format] || 'application/octet-stream';

    // Set filename
    const filename = `${data.title?.replace(/[^a-z0-9]/gi, '_') || 'document'}.${options.format}`;

    // Send file
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', result.buffer!.length);

    res.send(result.buffer);
  } catch (error) {
    console.error('Document generation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/documents/preview
 * Generate a preview of a document (smaller size, lower quality)
 */
router.post('/preview', async (req, res) => {
  try {
    const { data, options }: { data: DocumentData; options: GenerationOptions } = req.body;

    // Generate with preview settings
    const previewOptions: GenerationOptions = {
      ...options,
      // Could add preview-specific optimizations here
    };

    const result = await generateDocument(data, previewOptions);

    if (!result.success) {
      return res.status(500).json({
        error: 'Preview generation failed',
        details: result.errors,
      });
    }

    // Return base64 for preview
    const base64 = result.buffer!.toString('base64');

    res.json({
      success: true,
      format: options.format,
      data: `data:application/${options.format};base64,${base64}`,
      size: result.fileSize,
      metadata: result.metadata,
    });
  } catch (error) {
    console.error('Preview generation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/documents/templates
 * List available document templates
 */
router.get('/templates', (req, res) => {
  const { listTemplates } = require('@urban-planner/doc-generator/src/templates');
  const templates = listTemplates();

  res.json({
    success: true,
    count: templates.length,
    templates,
  });
});

/**
 * GET /api/documents/templates/:id
 * Get details for a specific template
 */
router.get('/templates/:id', (req, res) => {
  const { getTemplate } = require('@urban-planner/doc-generator/src/templates');
  const template = getTemplate(req.params.id);

  if (!template) {
    return res.status(404).json({
      error: 'Template not found',
    });
  }

  res.json({
    success: true,
    template,
  });
});

/**
 * POST /api/documents/transit-analysis
 * Generate a transit analysis report (convenience endpoint)
 */
router.post('/transit-analysis', async (req, res) => {
  try {
    const { generateTransitAnalysisReport } = require('@urban-planner/doc-generator');
    const { data, format = 'pdf' } = req.body;

    const result = await generateTransitAnalysisReport(data, format);

    if (!result.success) {
      return res.status(500).json({
        error: 'Report generation failed',
        details: result.errors,
      });
    }

    const filename = `transit_analysis.${format}`;
    const contentTypes: Record<string, string> = {
      pdf: 'application/pdf',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };

    res.setHeader('Content-Type', contentTypes[format]);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(result.buffer);
  } catch (error) {
    console.error('Transit analysis report error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/documents/ridership-forecast
 * Generate a ridership forecast report (convenience endpoint)
 */
router.post('/ridership-forecast', async (req, res) => {
  try {
    const { generateRidershipForecast } = require('@urban-planner/doc-generator');
    const { data, format = 'pdf' } = req.body;

    const result = await generateRidershipForecast(data, format);

    if (!result.success) {
      return res.status(500).json({
        error: 'Report generation failed',
        details: result.errors,
      });
    }

    const filename = `ridership_forecast.${format}`;
    const contentTypes: Record<string, string> = {
      pdf: 'application/pdf',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };

    res.setHeader('Content-Type', contentTypes[format]);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(result.buffer);
  } catch (error) {
    console.error('Ridership forecast report error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
