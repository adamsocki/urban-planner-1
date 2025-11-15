# AI-Powered Geospatial Analysis Features

## Overview

This urban planning platform now includes comprehensive AI-powered geospatial analysis capabilities that combine:
- **Turf.js** for precise spatial calculations
- **LLM APIs** for intelligent interpretation and insights
- **Natural language queries** for accessible analysis
- **Professional urban planning analysis** with actionable recommendations

---

## 🗺️ Core Geospatial Analysis Capabilities

### 1. **Stop Coverage Analysis**
Calculate service area coverage around transit stops with customizable walking distances.

**What it does:**
- Creates buffer zones around each stop (default: 400m walking distance)
- Calculates total coverage area in square kilometers
- Provides per-stop coverage metrics
- Generates GeoJSON features for visualization

**Use cases:**
- Assess how much of the city is within walking distance of transit
- Identify coverage gaps
- Plan new stop locations
- Evaluate service area adequacy

**API Endpoint:**
```
POST /api/geospatial/stop-coverage
Body: { stops: StopPoint[], radiusMeters: 400 }
```

---

### 2. **Nearby Stops Search**
Find all transit stops within a specified radius of any location.

**What it does:**
- Searches stops by distance from a point
- Ranks results by proximity
- Returns walking distances
- Identifies closest stop

**Use cases:**
- Check transit access from a specific address
- Evaluate accessibility for new developments
- Find transfer opportunities
- Assess walkability

**API Endpoint:**
```
POST /api/geospatial/nearby-stops
Body: { lat: number, lon: number, stops: StopPoint[], radiusMeters: 800 }
```

---

### 3. **Route Analysis**
Comprehensive metrics for individual transit routes.

**What it does:**
- Calculates route length in kilometers
- Computes bounding box (geographic extent)
- Finds route center point
- Counts coordinate points

**Use cases:**
- Compare route lengths
- Identify service area boundaries
- Plan route extensions
- Optimize route design

**API Endpoint:**
```
POST /api/geospatial/analyze-route
Body: { route: RouteData }
```

---

### 4. **Network Connectivity Analysis**
Evaluate how well stops and routes are connected.

**What it does:**
- Maps which routes serve which stops
- Identifies high-frequency transfer points (3+ routes)
- Calculates average routes per stop
- Highlights major transit hubs

**Use cases:**
- Find transfer opportunities
- Identify underserved stops
- Optimize network design
- Plan new connections

**API Endpoint:**
```
POST /api/geospatial/network-connectivity
Body: { stops: StopPoint[], routes: RouteData[] }
```

---

### 5. **Catchment Area Analysis**
Calculate the population served by transit (with demographic overlay).

**What it does:**
- Merges overlapping stop buffers
- Calculates total service area
- Overlays demographic data (if provided)
- Estimates population within catchment

**Use cases:**
- Ridership forecasting
- Equity analysis (who is/isn't served)
- Service planning
- Grant applications

**API Endpoint:**
```
POST /api/geospatial/catchment-area
Body: { stops: StopPoint[], radiusMeters: 800, demographicAreas?: Feature[] }
```

---

### 6. **Isochrone Generation**
Create "travel time zones" showing how far you can walk in X minutes.

**What it does:**
- Generates concentric zones for multiple time intervals
- Customizable walking speed
- Returns GeoJSON polygons
- Calculates radius in kilometers

**Use cases:**
- Show "5, 10, 15 minute neighborhoods"
- Accessibility visualization
- Station area planning
- Walkability assessment

**API Endpoint:**
```
POST /api/geospatial/isochrones
Body: { lat: number, lon: number, timeMinutes: [5, 10, 15], walkingSpeedKmH: 5 }
```

---

### 7. **Route Overlap Analysis**
Identify where multiple routes share corridors.

**What it does:**
- Buffers routes to create corridors
- Finds intersecting areas
- Calculates overlap area
- Ranks major overlaps

**Use cases:**
- Identify redundant service
- Find high-frequency corridors
- Plan rapid transit upgrades
- Optimize route spacing

**API Endpoint:**
```
POST /api/geospatial/route-overlap
Body: { routes: RouteData[], bufferMeters: 50 }
```

---

## 🤖 AI-Powered Analysis Features

### 1. **Natural Language Geospatial Queries**
Ask questions in plain English and get AI-powered spatial analysis.

**Example queries:**
- "How well does the transit network serve the downtown area?"
- "What areas have poor transit accessibility?"
- "Where should we add new routes to improve coverage?"
- "Analyze network connectivity and transfer opportunities"

**Query types:**
1. **Coverage** - Service area and gap analysis
2. **Accessibility** - How easy is it to reach transit?
3. **Connectivity** - Transfer points and network structure
4. **Optimization** - Improvement suggestions
5. **General** - Comprehensive analysis

**API Endpoint:**
```
POST /api/geospatial/ai/query
Body: {
  query: {
    type: 'coverage',
    question: 'How accessible is transit from downtown?',
    context: { stops, routes, location }
  },
  llmConfig: LLMSettings
}
```

**What you get back:**
- Professional analysis text
- Actionable recommendations (bulleted list)
- Key metrics (coverage area, stop count, etc.)
- Suggested visualizations (maps to create)
- Underlying spatial analysis results

---

### 2. **AI Transit Network Analyzer**
Comprehensive AI-powered network evaluation with professional insights.

**What it analyzes:**
- Overall network coverage and efficiency
- Connectivity patterns and hub identification
- Service gaps and underserved areas
- Optimization opportunities
- Equity considerations

**What it provides:**
- Executive summary-level insights
- Data-driven recommendations
- Specific metrics (total route length, coverage area, etc.)
- High-frequency stop identification
- Prioritized action items

**API Endpoint:**
```
POST /api/geospatial/ai/analyze-network
Body: { stops: StopPoint[], routes: RouteData[], llmConfig: LLMSettings }
```

---

### 3. **Map-Aware Document Generation**
Generate professional document content that incorporates spatial analysis.

**What it creates:**
1. **Executive Summary** - 2-3 paragraphs with spatial context
2. **Key Findings** - Detailed analysis of geographic patterns
3. **Recommendations** - Location-specific action items
4. **Map Descriptions** - What each map should show

**Use cases:**
- Automated report writing
- Comprehensive plans
- Transit analysis reports
- Grant applications
- Public presentations

**API Endpoint:**
```
POST /api/geospatial/ai/map-content
Body: {
  documentType: 'transit-analysis',
  spatialData: { stops, routes, boundingBox, centerPoint },
  llmConfig: LLMSettings
}
```

**Example output:**
```json
{
  "executiveSummary": "The transit network serves approximately 45 square kilometers...",
  "findings": "Analysis reveals three primary service corridors along Main St...",
  "recommendations": "1. Extend Route 5 north to serve the new development...",
  "mapDescriptions": [
    "Network overview map showing all routes and stops",
    "Coverage heat map with 400m walking buffers",
    "High-frequency corridor identification"
  ]
}
```

---

## 🎨 Frontend Interface

### Geospatial AI Tab

Access via the **🗺️ Geospatial AI** tab in the main navigation.

**Features:**
1. **Query Type Selector**
   - Coverage Analysis
   - Accessibility Analysis
   - Connectivity Analysis
   - Optimization Suggestions
   - General Analysis

2. **Natural Language Input**
   - Free-form question text area
   - Example queries for quick start
   - Context-aware analysis

3. **Results Display**
   - Professional insights (formatted text)
   - Bulleted recommendations
   - Key metrics grid
   - Suggested visualizations

4. **Sample Data Included**
   - 4 sample transit stops (NYC area)
   - 2 sample routes
   - Ready to test immediately

---

## 📊 Data Structures

### StopPoint
```typescript
interface StopPoint {
  id: string;           // Unique stop identifier
  name: string;         // Stop name
  lat: number;          // Latitude (WGS84)
  lon: number;          // Longitude (WGS84)
  properties?: any;     // Additional metadata
}
```

### RouteData
```typescript
interface RouteData {
  id: string;                      // Unique route identifier
  name: string;                    // Route name
  coordinates: [number, number][]; // [lon, lat] pairs
  properties?: any;                // Additional metadata
}
```

### AnalysisResult
```typescript
interface AnalysisResult {
  type: string;                    // Analysis type
  summary: string;                 // One-sentence summary
  metrics: Record<string, any>;    // Quantitative results
  features?: FeatureCollection;    // GeoJSON for mapping
}
```

---

## 🚀 Usage Examples

### Example 1: Check Coverage
```typescript
import { GeospatialService } from './services/geospatialService';

const stops = [
  { id: '1', name: 'Main St', lat: 40.7580, lon: -73.9855 },
  { id: '2', name: 'Park Ave', lat: 40.7527, lon: -73.9772 },
];

const result = await GeospatialService.calculateStopCoverage(stops, 400);

console.log(result.summary);
// "2 stops provide 1.01 km² of coverage within 400m walking distance"

console.log(result.metrics);
// { stopCount: 2, radiusMeters: 400, totalAreaKm2: 1.01, ... }
```

---

### Example 2: Ask a Question
```typescript
import { GeospatialService } from './services/geospatialService';
import { useSettingsStore } from './stores/settingsStore';

const { llmSettings } = useSettingsStore();

const result = await GeospatialService.queryWithNaturalLanguage(
  {
    type: 'accessibility',
    question: 'How accessible is transit from the downtown business district?',
    context: { stops, routes, location: { lat: 40.7580, lon: -73.9855 } }
  },
  llmSettings
);

console.log(result.insights);
// "The downtown business district has excellent transit access..."

console.log(result.recommendations);
// ["Consider extending Route 3 to serve the eastern business park", ...]
```

---

### Example 3: Generate Document Content
```typescript
const content = await GeospatialService.generateMapAwareContent(
  'comprehensive-plan',
  {
    stops: myStops,
    routes: myRoutes,
    boundingBox: [[-73.99, 40.70], [-73.97, 40.76]],
    centerPoint: [-73.9855, 40.7580]
  },
  llmSettings
);

console.log(content.executiveSummary);
// Professional 2-3 paragraph summary with spatial context

console.log(content.findings);
// Detailed analysis of geographic patterns

console.log(content.recommendations);
// Location-specific action items
```

---

## 🔧 Integration with Existing Features

### Document Generator Integration
The document generator can now use geospatial analysis:

1. **AI Generate buttons** on each section
2. **Map-aware content** that references spatial analysis
3. **Automatic metric inclusion** from geospatial calculations
4. **Professional formatting** suitable for official reports

### Settings Integration
- LLM API configuration shared across all features
- Settings persisted in localStorage
- API key security (never sent to logs)

---

## 🎯 Use Cases

### 1. Transit Planning Agency
**Scenario:** Evaluate existing network coverage

**Steps:**
1. Upload GTFS data (future feature) or enter stops/routes
2. Navigate to Geospatial AI tab
3. Select "Coverage Analysis"
4. Ask: "How well does our network serve the city?"
5. Review AI insights and recommendations
6. Generate professional report with Document Generator

**Output:** Professional analysis with coverage maps, gap identification, and improvement suggestions

---

### 2. Urban Development Proposal
**Scenario:** Assess transit access for new development

**Steps:**
1. Enter proposed development location
2. Use "Find Nearby Stops" analysis
3. Generate isochrones for walking times
4. Ask: "Is this site well-served by transit?"
5. Include analysis in development application

**Output:** Accessibility assessment with walking distance maps and ridership potential

---

### 3. Equity Analysis
**Scenario:** Ensure equitable transit distribution

**Steps:**
1. Load demographic data (census tracts)
2. Run catchment area analysis with population overlay
3. Ask: "Which neighborhoods are underserved by transit?"
4. Generate recommendations for service improvements
5. Create equity-focused comprehensive plan

**Output:** Equity analysis showing service gaps by neighborhood with recommendations

---

### 4. Network Optimization
**Scenario:** Improve efficiency and reduce redundancy

**Steps:**
1. Analyze route overlap
2. Check network connectivity
3. Ask: "How can we optimize this network?"
4. Review AI suggestions for route restructuring
5. Model proposed changes

**Output:** Optimization plan with specific route modifications and expected benefits

---

## 🌟 Advanced Features

### Multi-Modal Analysis
Combine different analysis types:
```typescript
// Coverage + Accessibility + Connectivity in one query
const result = await GeospatialService.queryWithNaturalLanguage({
  type: 'general',
  question: 'Provide a comprehensive network evaluation',
  context: { stops, routes }
}, llmConfig);
```

### Custom Prompts
The AI system includes specialized prompts for:
- Transit network coverage
- Accessibility assessment
- Connectivity evaluation
- Optimization opportunities
- Equity analysis
- Efficiency metrics

### Visualization Suggestions
AI automatically suggests appropriate map types:
- Coverage maps with buffer zones
- Accessibility heatmaps
- Isochrone maps
- Network connectivity graphs
- Route frequency visualizations
- Overlap corridor maps

---

## 📈 Metrics & KPIs

The system automatically calculates:

**Coverage Metrics:**
- Total service area (km²)
- Coverage per stop
- Average walking distance
- Service gaps

**Accessibility Metrics:**
- Stops within walking distance
- Closest stop distance
- Isochrone areas (5/10/15 min)
- Access time estimates

**Connectivity Metrics:**
- Routes per stop
- Transfer opportunities
- High-frequency stops (3+ routes)
- Network density

**Optimization Metrics:**
- Route overlap areas
- Redundancy percentage
- Service efficiency
- Coverage gaps

---

## 🔒 Privacy & Security

- API keys stored locally (localStorage, never sent to backend logs)
- Spatial data never leaves your control
- LLM calls go directly to your configured endpoint
- No third-party data sharing
- Open source and auditable

---

## 🚧 Future Enhancements

Planned features:
1. **GTFS Upload** - Direct import from GTFS.zip files
2. **Interactive Maps** - Mapbox GL visualization of results
3. **Real-time Editing** - Draw new routes and see instant analysis
4. **Ridership Forecasting** - ML-based ridership predictions
5. **Scenario Planning** - Compare multiple network configurations
6. **3D Visualization** - Deck.gl for large datasets
7. **PostGIS Integration** - Database-backed spatial queries
8. **Export to GIS** - Download results as Shapefiles/GeoJSON

---

## 📚 Technology Stack

**Backend:**
- **Turf.js** - Spatial analysis calculations
- **Express.js** - API framework
- **TypeScript** - Type safety

**Frontend:**
- **React** - UI framework
- **Zustand** - State management
- **TypeScript** - Type safety

**AI:**
- **OpenAI GPT-4** (or compatible)
- **Claude** (Anthropic)
- Any OpenAI-compatible endpoint

**Geospatial:**
- **GeoJSON** - Data interchange format
- **WGS84** - Coordinate system
- **Meters** - Distance units

---

## 📞 API Reference Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/geospatial/stop-coverage` | POST | Calculate service area |
| `/api/geospatial/nearby-stops` | POST | Find stops near point |
| `/api/geospatial/analyze-route` | POST | Route metrics |
| `/api/geospatial/network-connectivity` | POST | Network analysis |
| `/api/geospatial/catchment-area` | POST | Population served |
| `/api/geospatial/isochrones` | POST | Travel time zones |
| `/api/geospatial/route-overlap` | POST | Corridor overlap |
| `/api/geospatial/find-center` | POST | Geographic centroid |
| `/api/geospatial/ai/query` | POST | Natural language query |
| `/api/geospatial/ai/analyze-network` | POST | AI network analysis |
| `/api/geospatial/ai/map-content` | POST | Map-aware documents |

---

## 🎓 Learning Resources

**Urban Planning Concepts:**
- **Catchment area**: Area within walking distance of transit
- **Isochrone**: Equal travel-time boundary
- **Service coverage**: Geographic extent of transit access
- **Network connectivity**: How well routes connect
- **Transit equity**: Fair distribution of service

**Geospatial Concepts:**
- **Buffer**: Area around a feature (e.g., 400m circle)
- **Point-in-polygon**: Is a point inside a boundary?
- **Line distance**: Length of a route
- **Centroid**: Geographic center
- **Bounding box**: Rectangle containing all features

---

## 💡 Tips & Best Practices

1. **Start with simple queries** - Test with example data first
2. **Use appropriate buffer distances** - 400m for stops, 800m for catchment
3. **Combine analyses** - Use general query type for comprehensive insights
4. **Review metrics** - Numbers tell the full story
5. **Generate visualizations** - Follow AI suggestions for maps
6. **Iterate** - Refine queries based on results
7. **Export insights** - Use Document Generator for reports

---

## 🐛 Troubleshooting

**"Please configure your LLM API settings first"**
- Click Settings button (⚙️) in header
- Enter API key and endpoint
- Save settings

**"Analysis failed"**
- Check that stops/routes have valid coordinates
- Verify API key is correct
- Check network connection
- Review browser console for errors

**"No results returned"**
- Increase search radius
- Check coordinate format (lon, lat)
- Verify data is not empty

---

## 📄 License

This feature is part of the Urban Planning Platform and follows the project's license.

---

## 🙌 Credits

Built with:
- [Turf.js](https://turfjs.org/) - Spatial analysis
- [OpenAI API](https://openai.com/) - AI intelligence
- [GeoJSON](https://geojson.org/) - Geographic data format

---

**Questions or suggestions?** Open an issue on GitHub!
