# Document Generation Guide

This guide explains how to use the document generation system in the Urban Planning Platform.

## Overview

The document generation system allows you to create professional planning documents in multiple formats (PDF, DOCX, XLSX) from structured data. It includes pre-built templates for common urban planning documents.

## Available Templates

### 1. Comprehensive Plan
**ID:** `comprehensive-plan`
**Formats:** PDF, DOCX
**Description:** Full urban comprehensive plan with all major elements

**Sections:**
- Cover Page
- Table of Contents
- Executive Summary
- Introduction
- Demographics & Population Analysis
- Land Use & Development
- Transportation & Mobility
- Recommendations & Implementation
- Appendices

### 2. Transit Network Analysis
**ID:** `transit-analysis`
**Formats:** PDF, DOCX, HTML
**Description:** GTFS-based transit network analysis report

**Sections:**
- Network Overview
- Route-Level Analysis
- Service Coverage Analysis
- Service Frequency Analysis
- Service Equity Analysis
- Findings & Recommendations

### 3. Ridership Forecast Report
**ID:** `ridership-forecast`
**Formats:** PDF, DOCX, XLSX
**Description:** Detailed ridership forecast for proposed transit service

**Sections:**
- Methodology
- Key Assumptions
- Demographic Inputs
- Service Parameters
- Forecast Results
- Sensitivity Analysis
- Conclusions & Recommendations

### 4. Zoning Analysis Report
**ID:** `zoning-report`
**Formats:** PDF, DOCX
**Description:** Parcel-level zoning compliance and analysis

**Sections:**
- Property Information
- Zoning Analysis
- Compliance Review
- Site Map
- Recommendations

### 5. Environmental Impact Assessment
**ID:** `environmental-impact`
**Formats:** PDF, DOCX
**Description:** Environmental impact analysis for development projects

**Sections:**
- Project Description
- Environmental Baseline
- Impact Analysis
- Mitigation Measures
- Monitoring Plan
- Conclusion

### 6. Public Meeting Materials
**ID:** `public-meeting`
**Formats:** PDF, HTML
**Description:** Materials for public engagement meetings

**Sections:**
- Cover Slide
- Meeting Agenda
- Project Overview
- Key Findings
- Maps & Visualizations
- Next Steps
- Contact Information

## Using the API

### Generate a Document

**Endpoint:** `POST /api/documents/generate`

**Request Body:**
```json
{
  "data": {
    "title": "Downtown Transit Analysis 2025",
    "subtitle": "Comprehensive Network Assessment",
    "author": "City Planning Department",
    "projectName": "Downtown Revitalization",
    "date": "2025-01-15T00:00:00.000Z",
    "executiveSummary": "This report analyzes the current transit network...",
    "introduction": "The purpose of this study is to...",
    "findings": "Our analysis revealed several key findings...",
    "recommendations": "Based on the findings, we recommend...",
    "transitData": {
      "feedName": "City Transit GTFS",
      "agencyName": "Metro Transit Authority",
      "dateRange": {
        "start": "2025-01-01",
        "end": "2025-12-31"
      },
      "stats": {
        "totalRoutes": 45,
        "totalStops": 876,
        "totalTrips": 12500,
        "serviceArea": 250
      },
      "routesByType": [
        { "type": "Bus", "count": 38 },
        { "type": "Light Rail", "count": 5 },
        { "type": "BRT", "count": 2 }
      ],
      "coverage": {
        "populationServed": 450000,
        "percentCovered": 78,
        "avgStopsPerRoute": 19.5
      }
    },
    "demographics": {
      "totalPopulation": 580000,
      "households": 225000,
      "medianIncome": 68500,
      "medianAge": 34.5,
      "employmentRate": 62.8,
      "ageDistribution": [
        { "label": "Under 18", "value": 120000 },
        { "label": "18-64", "value": 380000 },
        { "label": "65+", "value": 80000 }
      ]
    },
    "charts": [
      {
        "type": "bar",
        "title": "Routes by Type",
        "data": {
          "labels": ["Bus", "Light Rail", "BRT"],
          "datasets": [{
            "label": "Number of Routes",
            "data": [38, 5, 2],
            "backgroundColor": ["#4299e1", "#48bb78", "#ed8936"]
          }]
        }
      }
    ],
    "tables": [
      {
        "title": "Service Metrics by Route Type",
        "headers": ["Mode", "Routes", "Stops", "Daily Trips"],
        "rows": [
          ["Bus", "38", "720", "9,800"],
          ["Light Rail", "5", "126", "2,400"],
          ["BRT", "2", "30", "300"]
        ]
      }
    ]
  },
  "options": {
    "format": "pdf",
    "template": "transit-analysis",
    "paperSize": "letter",
    "orientation": "portrait",
    "includeTableOfContents": true,
    "includePageNumbers": true
  }
}
```

**Response:**
Binary file download with appropriate Content-Type header

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/documents/generate \
  -H "Content-Type: application/json" \
  -d @request.json \
  --output report.pdf
```

### Generate Preview

**Endpoint:** `POST /api/documents/preview`

Returns a base64-encoded preview instead of downloading the file.

**Response:**
```json
{
  "success": true,
  "format": "pdf",
  "data": "data:application/pdf;base64,JVBERi0xLjcK...",
  "size": 245678,
  "metadata": {
    "generatedAt": "2025-01-15T10:30:00.000Z",
    "pageCount": 12
  }
}
```

### List Templates

**Endpoint:** `GET /api/documents/templates`

**Response:**
```json
{
  "success": true,
  "count": 6,
  "templates": [
    {
      "id": "comprehensive-plan",
      "name": "Comprehensive Plan",
      "description": "Full urban comprehensive plan with all major elements",
      "type": "comprehensive-plan",
      "supportedFormats": ["pdf", "docx"],
      "requiredData": ["projectName", "executiveSummary", "demographics", "transitData"],
      "optionalData": ["maps", "charts", "recommendations"],
      "sections": [...]
    },
    ...
  ]
}
```

### Get Template Details

**Endpoint:** `GET /api/documents/templates/:id`

**Example:** `GET /api/documents/templates/transit-analysis`

### Convenience Endpoints

#### Transit Analysis Report
**Endpoint:** `POST /api/documents/transit-analysis`

```bash
curl -X POST http://localhost:3000/api/documents/transit-analysis \
  -H "Content-Type: application/json" \
  -d '{"data": {...}, "format": "pdf"}' \
  --output transit_analysis.pdf
```

#### Ridership Forecast
**Endpoint:** `POST /api/documents/ridership-forecast`

```bash
curl -X POST http://localhost:3000/api/documents/ridership-forecast \
  -H "Content-Type: application/json" \
  -d '{"data": {...}, "format": "pdf"}' \
  --output ridership_forecast.pdf
```

## Using the Frontend

### React Component

The `DocumentGenerator` component provides a user-friendly interface:

```typescript
import DocumentGenerator from './components/DocumentGenerator';

function App() {
  return (
    <div>
      <DocumentGenerator />
    </div>
  );
}
```

### Workflow

1. **Select Template**: Choose from available templates
2. **Select Format**: Pick PDF, DOCX, or XLSX (based on template)
3. **Fill in Details**: Complete the form with document content
4. **Generate**: Click generate and download the file

## Programmatic Usage

### TypeScript/JavaScript

```typescript
import { generateDocument, generateTransitAnalysisReport } from '@urban-planner/doc-generator';

// Using the general generator
const result = await generateDocument(
  {
    title: 'My Report',
    executiveSummary: 'Summary text...',
    // ... more data
  },
  {
    format: 'pdf',
    template: 'transit-analysis',
    includePageNumbers: true,
  }
);

if (result.success) {
  // result.buffer contains the PDF
  await fs.writeFile('output.pdf', result.buffer);
}

// Using convenience function
const transitReport = await generateTransitAnalysisReport(
  {
    title: 'Transit Analysis',
    transitData: { /* ... */ },
  },
  'pdf'
);
```

## Data Types Reference

### DocumentData Interface

```typescript
interface DocumentData {
  // Metadata
  title: string;
  subtitle?: string;
  author?: string;
  date?: Date;
  projectName?: string;

  // Content
  executiveSummary?: string;
  introduction?: string;
  methodology?: string;
  findings?: string;
  recommendations?: string;
  conclusion?: string;

  // Visual elements
  maps?: MapSnapshot[];
  charts?: ChartData[];
  tables?: TableData[];
  images?: { url: string; caption: string; }[];

  // Structured data
  demographics?: DemographicData;
  transitData?: TransitAnalysisData;
  zoningData?: ZoningData;
  forecastData?: RidershipForecastData;

  // Custom fields
  customFields?: Record<string, any>;
}
```

### Example: Complete Transit Analysis Data

```typescript
const transitAnalysisData: DocumentData = {
  title: "Citywide Transit Network Analysis",
  subtitle: "2025 Service Review",
  author: "Metropolitan Planning Organization",
  date: new Date("2025-01-15"),
  projectName: "Transit Improvement Plan",

  executiveSummary: "This comprehensive analysis examines...",
  introduction: "The Metropolitan Transit Authority operates...",

  transitData: {
    feedName: "MTA-GTFS-2025",
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
      { type: "BRT", count: 2 }
    ],
    coverage: {
      populationServed: 1250000,
      percentCovered: 85,
      avgStopsPerRoute: 17.7
    }
  },

  charts: [
    {
      type: "bar",
      title: "Daily Boardings by Route Type",
      data: {
        labels: ["Local Bus", "Express Bus", "Light Rail", "BRT"],
        datasets: [{
          label: "Daily Boardings",
          data: [145000, 28000, 62000, 8500],
          backgroundColor: ["#4299e1", "#48bb78", "#ed8936", "#9f7aea"]
        }]
      }
    }
  ],

  findings: "Our analysis identified several key trends...",
  recommendations: "Based on the findings, we recommend: 1. Increase frequency on high-ridership routes, 2. Expand weekend service, 3. Improve connectivity between modes..."
};
```

## Best Practices

1. **Required Fields**: Always include `title` and template-specific required fields
2. **Data Validation**: Validate data before sending to API
3. **Error Handling**: Check `result.success` and handle `result.errors`
4. **File Size**: Keep in mind PDF/DOCX size limits (typically < 50MB)
5. **Maps**: Provide high-quality map snapshots (recommended: 1200x800px)
6. **Charts**: Use clear labels and appropriate chart types
7. **Tables**: Keep tables concise (< 50 rows per table for readability)

## Customization

### Custom Templates

You can create custom templates by:

1. Defining a new template in `packages/doc-generator/src/templates/index.ts`
2. Implementing custom rendering logic in the generators
3. Adding the template ID to your requests

### Styling

Customize document styles by modifying the generator classes:
- PDF: `packages/doc-generator/src/generators/pdf-generator.ts`
- DOCX: `packages/doc-generator/src/generators/docx-generator.ts`

## Troubleshooting

### Document Generation Fails

**Issue:** API returns 500 error
**Solution:** Check console logs for detailed error messages. Common issues:
- Missing required fields
- Invalid data types
- Corrupt image buffers

### PDF Too Large

**Issue:** Generated PDF is > 50MB
**Solution:**
- Reduce number of maps/images
- Compress images before including
- Use vector graphics where possible

### DOCX Template Not Found

**Issue:** "Template not found" error
**Solution:**
- Verify template ID is correct
- Ensure template file exists in templates directory
- Check file permissions

## Examples

See the `examples/` directory for complete working examples:
- `examples/transit-analysis.ts` - Generate transit analysis report
- `examples/ridership-forecast.ts` - Generate ridership forecast
- `examples/comprehensive-plan.ts` - Generate comprehensive plan

## Support

For issues or questions:
- Check the [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
- Review [API documentation](#using-the-api)
- Open an issue on GitHub

---

Happy documenting! 📄✨
