/**
 * Document Template Definitions
 */

import { DocumentTemplate } from '../types';

export const templates: Record<string, DocumentTemplate> = {
  'comprehensive-plan': {
    id: 'comprehensive-plan',
    name: 'Comprehensive Plan',
    description: 'Full urban comprehensive plan with all major elements',
    type: 'comprehensive-plan',
    supportedFormats: ['pdf', 'docx'],
    requiredData: ['projectName', 'executiveSummary', 'demographics', 'transitData'],
    optionalData: ['maps', 'charts', 'recommendations'],
    sections: [
      {
        id: 'cover',
        title: 'Cover Page',
        order: 1,
        type: 'text',
        required: true,
      },
      {
        id: 'toc',
        title: 'Table of Contents',
        order: 2,
        type: 'text',
        required: true,
      },
      {
        id: 'executive-summary',
        title: 'Executive Summary',
        order: 3,
        type: 'text',
        required: true,
        content: '{{executiveSummary}}',
      },
      {
        id: 'introduction',
        title: 'Introduction',
        order: 4,
        type: 'text',
        required: true,
        content: '{{introduction}}',
      },
      {
        id: 'demographics',
        title: 'Demographics & Population Analysis',
        order: 5,
        type: 'text',
        required: true,
      },
      {
        id: 'land-use',
        title: 'Land Use & Development',
        order: 6,
        type: 'text',
        required: false,
      },
      {
        id: 'transportation',
        title: 'Transportation & Mobility',
        order: 7,
        type: 'text',
        required: true,
      },
      {
        id: 'recommendations',
        title: 'Recommendations & Implementation',
        order: 8,
        type: 'text',
        required: true,
        content: '{{recommendations}}',
      },
      {
        id: 'appendices',
        title: 'Appendices',
        order: 9,
        type: 'text',
        required: false,
      },
    ],
  },

  'transit-analysis': {
    id: 'transit-analysis',
    name: 'Transit Network Analysis',
    description: 'GTFS-based transit network analysis report',
    type: 'transit-analysis',
    supportedFormats: ['pdf', 'docx', 'html'],
    requiredData: ['projectName', 'transitData'],
    optionalData: ['maps', 'charts', 'recommendations'],
    sections: [
      {
        id: 'cover',
        title: 'Cover Page',
        order: 1,
        type: 'text',
        required: true,
      },
      {
        id: 'executive-summary',
        title: 'Executive Summary',
        order: 2,
        type: 'text',
        required: true,
      },
      {
        id: 'network-overview',
        title: 'Network Overview',
        order: 3,
        type: 'text',
        required: true,
      },
      {
        id: 'route-analysis',
        title: 'Route-Level Analysis',
        order: 4,
        type: 'table',
        required: true,
      },
      {
        id: 'coverage-analysis',
        title: 'Service Coverage Analysis',
        order: 5,
        type: 'map',
        required: true,
      },
      {
        id: 'frequency-analysis',
        title: 'Service Frequency Analysis',
        order: 6,
        type: 'chart',
        required: true,
      },
      {
        id: 'equity-analysis',
        title: 'Service Equity Analysis',
        order: 7,
        type: 'text',
        required: false,
      },
      {
        id: 'recommendations',
        title: 'Findings & Recommendations',
        order: 8,
        type: 'text',
        required: true,
      },
    ],
  },

  'ridership-forecast': {
    id: 'ridership-forecast',
    name: 'Ridership Forecast Report',
    description: 'Detailed ridership forecast for proposed transit service',
    type: 'ridership-forecast',
    supportedFormats: ['pdf', 'docx', 'xlsx'],
    requiredData: ['projectName', 'forecastData'],
    optionalData: ['maps', 'charts', 'demographics'],
    sections: [
      {
        id: 'cover',
        title: 'Cover Page',
        order: 1,
        type: 'text',
        required: true,
      },
      {
        id: 'executive-summary',
        title: 'Executive Summary',
        order: 2,
        type: 'text',
        required: true,
      },
      {
        id: 'methodology',
        title: 'Methodology',
        order: 3,
        type: 'text',
        required: true,
      },
      {
        id: 'assumptions',
        title: 'Key Assumptions',
        order: 4,
        type: 'list',
        required: true,
      },
      {
        id: 'demographic-inputs',
        title: 'Demographic Inputs',
        order: 5,
        type: 'table',
        required: true,
      },
      {
        id: 'service-inputs',
        title: 'Service Parameters',
        order: 6,
        type: 'table',
        required: true,
      },
      {
        id: 'forecast-results',
        title: 'Forecast Results',
        order: 7,
        type: 'chart',
        required: true,
      },
      {
        id: 'sensitivity-analysis',
        title: 'Sensitivity Analysis',
        order: 8,
        type: 'chart',
        required: false,
      },
      {
        id: 'recommendations',
        title: 'Conclusions & Recommendations',
        order: 9,
        type: 'text',
        required: true,
      },
    ],
  },

  'zoning-report': {
    id: 'zoning-report',
    name: 'Zoning Analysis Report',
    description: 'Parcel-level zoning compliance and analysis',
    type: 'zoning-report',
    supportedFormats: ['pdf', 'docx'],
    requiredData: ['projectName', 'zoningData'],
    optionalData: ['maps', 'images'],
    sections: [
      {
        id: 'cover',
        title: 'Cover Page',
        order: 1,
        type: 'text',
        required: true,
      },
      {
        id: 'property-info',
        title: 'Property Information',
        order: 2,
        type: 'table',
        required: true,
      },
      {
        id: 'zoning-analysis',
        title: 'Zoning Analysis',
        order: 3,
        type: 'text',
        required: true,
      },
      {
        id: 'compliance-review',
        title: 'Compliance Review',
        order: 4,
        type: 'text',
        required: true,
      },
      {
        id: 'site-map',
        title: 'Site Map',
        order: 5,
        type: 'map',
        required: true,
      },
      {
        id: 'recommendations',
        title: 'Recommendations',
        order: 6,
        type: 'text',
        required: true,
      },
    ],
  },

  'environmental-impact': {
    id: 'environmental-impact',
    name: 'Environmental Impact Assessment',
    description: 'Environmental impact analysis for development projects',
    type: 'environmental-impact',
    supportedFormats: ['pdf', 'docx'],
    requiredData: ['projectName', 'introduction', 'findings'],
    optionalData: ['maps', 'charts', 'images', 'tables'],
    sections: [
      {
        id: 'cover',
        title: 'Cover Page',
        order: 1,
        type: 'text',
        required: true,
      },
      {
        id: 'executive-summary',
        title: 'Executive Summary',
        order: 2,
        type: 'text',
        required: true,
      },
      {
        id: 'project-description',
        title: 'Project Description',
        order: 3,
        type: 'text',
        required: true,
      },
      {
        id: 'environmental-baseline',
        title: 'Environmental Baseline',
        order: 4,
        type: 'text',
        required: true,
      },
      {
        id: 'impact-analysis',
        title: 'Impact Analysis',
        order: 5,
        type: 'text',
        required: true,
      },
      {
        id: 'mitigation-measures',
        title: 'Mitigation Measures',
        order: 6,
        type: 'list',
        required: true,
      },
      {
        id: 'monitoring-plan',
        title: 'Monitoring Plan',
        order: 7,
        type: 'text',
        required: false,
      },
      {
        id: 'conclusion',
        title: 'Conclusion',
        order: 8,
        type: 'text',
        required: true,
      },
    ],
  },

  'public-meeting': {
    id: 'public-meeting',
    name: 'Public Meeting Materials',
    description: 'Materials for public engagement meetings',
    type: 'public-meeting',
    supportedFormats: ['pdf', 'html'],
    requiredData: ['projectName', 'introduction'],
    optionalData: ['maps', 'charts', 'images'],
    sections: [
      {
        id: 'cover',
        title: 'Cover Slide',
        order: 1,
        type: 'text',
        required: true,
      },
      {
        id: 'agenda',
        title: 'Meeting Agenda',
        order: 2,
        type: 'list',
        required: true,
      },
      {
        id: 'project-overview',
        title: 'Project Overview',
        order: 3,
        type: 'text',
        required: true,
      },
      {
        id: 'key-findings',
        title: 'Key Findings',
        order: 4,
        type: 'text',
        required: true,
      },
      {
        id: 'visual-materials',
        title: 'Maps & Visualizations',
        order: 5,
        type: 'map',
        required: false,
      },
      {
        id: 'next-steps',
        title: 'Next Steps',
        order: 6,
        type: 'list',
        required: true,
      },
      {
        id: 'contact-info',
        title: 'Contact Information',
        order: 7,
        type: 'text',
        required: true,
      },
    ],
  },
};

export function getTemplate(id: string): DocumentTemplate | undefined {
  return templates[id];
}

export function listTemplates(): DocumentTemplate[] {
  return Object.values(templates);
}

export function getTemplatesByType(type: DocumentTemplate['type']): DocumentTemplate[] {
  return Object.values(templates).filter(t => t.type === type);
}
