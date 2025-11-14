# Document Generation Examples

This directory contains example scripts demonstrating how to use the document generation system.

## Examples

### 1. Transit Analysis Report
**File:** `generate-transit-report.ts`

Generates a comprehensive transit network analysis report including:
- Network statistics and metrics
- Service coverage analysis
- Demographic analysis
- Route performance data
- Charts and tables
- Recommendations

**Run:**
```bash
cd urban-planner
pnpm install
npx tsx examples/generate-transit-report.ts
```

**Output:**
- `transit_analysis_report.pdf`
- `transit_analysis_report.docx`

### 2. Ridership Forecast
**File:** `generate-ridership-forecast.ts`

Generates a ridership forecast report for a proposed BRT line including:
- Methodology description
- Forecast scenarios (conservative, moderate, optimistic)
- Demographic and service inputs
- Sensitivity analysis
- Comparable systems analysis
- Implementation recommendations

**Run:**
```bash
npx tsx examples/generate-ridership-forecast.ts
```

**Output:**
- `ridership_forecast.pdf`

## Using the Examples

### Prerequisites

```bash
# Install dependencies
pnpm install

# Ensure packages are built
cd packages/doc-generator
pnpm build
```

### Customizing Examples

You can modify the example scripts to generate reports with your own data:

```typescript
import { generateTransitAnalysisReport } from '@urban-planner/doc-generator';

const myData = {
  title: "My Transit Report",
  transitData: {
    // Your GTFS data here
  },
  // ... more data
};

const result = await generateTransitAnalysisReport(myData, 'pdf');
```

### Using with Real GTFS Data

To generate reports from real GTFS feeds:

```typescript
import { GTFSImporter } from '@urban-planner/gtfs-parser';
import { generateTransitAnalysisReport } from '@urban-planner/doc-generator';

// 1. Import GTFS feed
const importer = new GTFSImporter();
const { feed, validation } = await importer.importFeed(
  'https://example.com/gtfs.zip'
);

// 2. Calculate statistics
const stats = importer.calculateStats(feed);

// 3. Generate report
const documentData = {
  title: "Transit Analysis",
  transitData: {
    feedName: feed.feed_info?.[0]?.feed_publisher_name || 'Transit Feed',
    agencyName: feed.agency[0].agency_name,
    stats: {
      totalRoutes: stats.totalRoutes,
      totalStops: stats.totalStops,
      totalTrips: stats.totalTrips,
      // ... more stats
    },
    // ... more data
  }
};

await generateTransitAnalysisReport(documentData, 'pdf');
```

## API Usage

### Generating via HTTP API

```bash
# Start the API server
cd apps/api
pnpm dev

# Generate document via API
curl -X POST http://localhost:3000/api/documents/generate \
  -H "Content-Type: application/json" \
  -d @examples/transit-report-data.json \
  --output report.pdf
```

### Using the Frontend

```bash
# Start the web app
cd apps/web
pnpm dev

# Open http://localhost:5173
# Use the Document Generator UI
```

## Sample Data Files

JSON data files for use with the API:

- `transit-report-data.json` - Sample transit analysis data
- `forecast-data.json` - Sample ridership forecast data
- `comprehensive-plan-data.json` - Sample comprehensive plan data

## Output Formats

All examples support multiple output formats:

```typescript
// PDF
await generateTransitAnalysisReport(data, 'pdf');

// Microsoft Word
await generateTransitAnalysisReport(data, 'docx');

// Excel (for tabular reports)
await generateRidershipForecast(data, 'xlsx');
```

## Tips

1. **Large Datasets**: For reports with many maps/charts, use PDF format
2. **Editing**: Use DOCX format if you need to edit the output
3. **Data Export**: Use XLSX for exporting raw data tables
4. **Images**: Provide high-resolution map snapshots (1200x800px minimum)
5. **Charts**: Keep chart data concise (<20 data points per chart)

## Troubleshooting

### "Module not found" errors

```bash
# Build the packages first
cd packages/doc-generator
pnpm build
cd ../gtfs-parser
pnpm build
```

### Memory errors with large documents

Increase Node.js memory:
```bash
NODE_OPTIONS="--max-old-space-size=4096" npx tsx examples/generate-transit-report.ts
```

### PDF generation errors

Ensure PDFKit dependencies are installed:
```bash
cd packages/doc-generator
pnpm install
```

## Further Reading

- [Document Generation Guide](../DOCUMENT_GENERATION_GUIDE.md)
- [API Documentation](../apps/api/README.md)
- [Architecture Overview](../ARCHITECTURE.md)
