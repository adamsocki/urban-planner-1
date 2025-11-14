# GTFS Resources and Examples

A curated list of GTFS resources, sample feeds, and practical examples for urban planning.

## What is GTFS?

**General Transit Feed Specification (GTFS)** is a standardized data format for public transportation schedules and geographic information. It was developed by Google in 2005 and has become the international standard used by thousands of transit agencies worldwide.

## Why GTFS Matters for Urban Planning

1. **Standardization**: Same format across all transit agencies
2. **Accessibility**: Easy to analyze and visualize transit networks
3. **Integration**: Powers trip planning apps (Google Maps, Transit, Citymapper)
4. **Analysis**: Enables data-driven transit planning decisions
5. **Open Data**: Most feeds are publicly available

## Where to Find GTFS Feeds

### Official Directories

#### 1. Transitland
- **URL**: https://transit.land/
- **Coverage**: 2,500+ feeds worldwide
- **API**: Yes (free with registration)
- **Features**: Feed quality scores, change history
- **Best for**: Global coverage, API access

#### 2. Mobility Database
- **URL**: https://mobilitydatabase.org/
- **Coverage**: 1,800+ feeds
- **Maintained by**: MobilityData (GTFS standards organization)
- **Best for**: High-quality, validated feeds

#### 3. TransitFeeds (Archive)
- **URL**: https://transitfeeds.com/
- **Coverage**: 1,000+ feeds
- **Status**: Legacy site, being migrated to Mobility Database
- **Best for**: Historical feeds

### Major US Transit Agencies

#### Large Systems

**New York (MTA)**
- URL: http://web.mta.info/developers/developer-data-terms.html
- Covers: Subway, bus, LIRR, Metro-North
- Real-time: Yes
- Notes: Separate feeds for each service

**San Francisco (SFMTA + Bay Area)**
- SFMTA: https://gtfs.sfmta.com/transitdata/google_transit.zip
- BART: https://www.bart.gov/schedules/developers/gtfs
- Caltrain: http://www.caltrain.com/Assets/GTFS/caltrain/CT-GTFS.zip
- AC Transit: http://www.actransit.org/planning-focus/

**Chicago (CTA)**
- URL: https://www.transitchicago.com/developers/gtfs/
- Covers: 'L' trains, buses
- Real-time: Yes

**Washington DC (WMATA)**
- URL: https://developer.wmata.com/
- Covers: Metro rail, bus
- API: Comprehensive developer portal

**Los Angeles (Metro)**
- URL: https://developer.metro.net/
- Covers: Rail, bus, BRT
- Real-time: Yes

**Boston (MBTA)**
- URL: https://www.mbta.com/developers/gtfs
- Covers: Subway, bus, commuter rail, ferry
- Real-time: Yes (GTFS-RT and custom API)

#### Medium Systems

- **Portland (TriMet)**: https://developer.trimet.org/
- **Seattle (Sound Transit)**: https://www.soundtransit.org/help-contacts/business-information/open-transit-data-otd
- **Denver (RTD)**: https://www.rtd-denver.com/developer-resources
- **Minneapolis (Metro Transit)**: https://gisdata.mn.gov/dataset/us-mn-state-metc-trans-transit-schedule-google-fd
- **Phoenix (Valley Metro)**: https://www.valleymetro.org/developer-resources

### International Feeds

**Canada**
- TransLink (Vancouver): https://www.translink.ca/about-us/doing-business-with-translink/app-developer-resources
- TTC (Toronto): https://open.toronto.ca/dataset/ttc-routes-and-schedules/
- STM (Montreal): https://www.stm.info/en/about/developers

**Europe**
- Transport for London: https://tfl.gov.uk/info-for/open-data-users/
- RATP (Paris): https://data.ratp.fr/
- Deutsche Bahn (Germany): https://data.deutschebahn.com/

**Other**
- Transport for NSW (Sydney): https://opendata.transport.nsw.gov.au/
- Tokyo Metro: https://developer.odpt.org/

## Sample GTFS Feeds for Testing

### Small/Simple (Good for Learning)

1. **Caltrain** (San Francisco - San Jose)
   - URL: http://www.caltrain.com/Assets/GTFS/caltrain/CT-GTFS.zip
   - Why: Simple corridor service, clean data
   - Routes: 1 rail line
   - Stops: ~30 stations

2. **Chapel Hill Transit**
   - URL: https://www.townofchapelhill.org/town-hall/departments-services/transit/chapel-hill-transit-data
   - Why: Small college town system
   - Routes: ~15 bus routes

### Medium Complexity

3. **TriMet (Portland)**
   - URL: https://developer.trimet.org/schedule/gtfs.zip
   - Why: Well-maintained, multi-modal
   - Routes: Bus, MAX light rail, streetcar
   - Features: Shapes, frequencies, transfers

4. **HART (Tampa)**
   - URL: http://www.gohart.org/developers/gtfs-developers.html
   - Why: Clean data, good documentation
   - Routes: ~30 bus routes

### Large/Complex (Advanced)

5. **MTA New York**
   - URL: http://web.mta.info/developers/
   - Why: Largest system in US, complex network
   - Routes: 400+ routes across multiple modes
   - Warning: Very large file, split into sub-feeds

6. **SFMTA (San Francisco)**
   - URL: https://gtfs.sfmta.com/transitdata/google_transit.zip
   - Why: Dense urban network, good shapes
   - Routes: 80+ routes

## GTFS File Structure Examples

### Basic Route Entry (routes.txt)
```csv
route_id,agency_id,route_short_name,route_long_name,route_type,route_color
101,1,101,Mission - Downtown,3,FF6600
102,1,102,Broadway - Uptown,3,0099CC
```

### Stop Example (stops.txt)
```csv
stop_id,stop_name,stop_lat,stop_lon,location_type,wheelchair_boarding
1001,"Main St & 1st Ave",37.7749,-122.4194,0,1
1002,"Main St & 2nd Ave",37.7750,-122.4180,0,1
```

### Trip and Stop Times
**trips.txt:**
```csv
route_id,service_id,trip_id,trip_headsign,direction_id,shape_id
101,WEEKDAY,T101-001,Downtown,0,S101
101,WEEKDAY,T101-002,Mission,1,S101R
```

**stop_times.txt:**
```csv
trip_id,arrival_time,departure_time,stop_id,stop_sequence
T101-001,08:00:00,08:00:00,1001,1
T101-001,08:05:00,08:05:00,1002,2
T101-001,08:12:00,08:12:00,1003,3
```

## Common GTFS Analysis Queries

### PostgreSQL with PostGIS (after import)

```sql
-- Find all stops within 500m of a point
SELECT
  stop_id,
  stop_name,
  ST_Distance(
    ST_SetSRID(ST_MakePoint(stop_lon, stop_lat), 4326)::geography,
    ST_SetSRID(ST_MakePoint(-122.4194, 37.7749), 4326)::geography
  ) as distance_meters
FROM stops
WHERE ST_DWithin(
  ST_SetSRID(ST_MakePoint(stop_lon, stop_lat), 4326)::geography,
  ST_SetSRID(ST_MakePoint(-122.4194, 37.7749), 4326)::geography,
  500
)
ORDER BY distance_meters;

-- Calculate route frequency during peak hours
SELECT
  r.route_short_name,
  r.route_long_name,
  COUNT(DISTINCT t.trip_id) as trips_count,
  COUNT(DISTINCT t.trip_id) / 3.0 as trips_per_hour
FROM routes r
JOIN trips t ON r.route_id = t.route_id
JOIN stop_times st ON t.trip_id = st.trip_id
WHERE st.stop_sequence = 1
  AND st.departure_time >= '07:00:00'
  AND st.departure_time < '10:00:00'
GROUP BY r.route_id, r.route_short_name, r.route_long_name
ORDER BY trips_per_hour DESC;

-- Find transfers between routes
SELECT DISTINCT
  r1.route_short_name as from_route,
  r2.route_short_name as to_route,
  s.stop_name as transfer_point,
  COUNT(*) as connection_count
FROM trips t1
JOIN trips t2 ON t1.service_id = t2.service_id
JOIN stop_times st1 ON t1.trip_id = st1.trip_id
JOIN stop_times st2 ON t2.trip_id = st2.trip_id
JOIN stops s ON st1.stop_id = s.stop_id
JOIN routes r1 ON t1.route_id = r1.route_id
JOIN routes r2 ON t2.route_id = r2.route_id
WHERE st1.stop_id = st2.stop_id
  AND r1.route_id != r2.route_id
  AND st2.arrival_time BETWEEN st1.departure_time AND (st1.departure_time + INTERVAL '15 minutes')
GROUP BY r1.route_short_name, r2.route_short_name, s.stop_name
ORDER BY connection_count DESC
LIMIT 20;
```

## GTFS Analysis Libraries

### JavaScript/TypeScript

1. **node-gtfs**
   ```bash
   npm install gtfs
   ```
   ```typescript
   import gtfs from 'gtfs';

   // Import feed
   await gtfs.import({ agencies: [{ url: 'http://...' }] });

   // Query routes
   const routes = await gtfs.getRoutes();

   // Get stops for a route
   const stops = await gtfs.getStops({ route_id: '101' });
   ```

2. **gtfs-via-postgres**
   - Imports GTFS directly into PostgreSQL
   - Enables SQL queries on transit data

### Python

1. **gtfs-kit**
   ```python
   import gtfs_kit as gk

   # Load feed
   feed = gk.read_feed('path/to/gtfs.zip', dist_units='km')

   # Compute stats
   stats = feed.compute_route_stats()

   # Export to GeoJSON
   feed.routes.to_file('routes.geojson', driver='GeoJSON')
   ```

2. **partridge**
   ```python
   import partridge as ptg

   # Load feed
   service_ids = ptg.read_service_ids_by_date('gtfs.zip', date='2025-01-15')
   feed = ptg.load_feed('gtfs.zip', service_ids=service_ids)

   # Get trips for a day
   trips = feed.trips
   ```

## GTFS Tools

### Validators

1. **Google's GTFS Validator**
   - URL: https://github.com/MobilityData/gtfs-validator
   - Command-line Java tool
   - Checks against official spec

2. **Transitland Feed Validator**
   - URL: https://transit.land/feed-registry
   - Online validator with quality scores

### Visualization

1. **GTFS-to-HTML**
   - URL: https://gtfstohtml.com/
   - Generates rider-friendly timetables

2. **Transitmix**
   - URL: http://transitmix.net/
   - Visual transit planning tool
   - Imports GTFS for context

3. **Transit.land Explorer**
   - URL: https://transit.land/
   - Visualize any GTFS feed on a map

### Conversion Tools

1. **gtfs-to-geojson**
   - Converts GTFS shapes to GeoJSON
   - Useful for web mapping

2. **gtfs2gps**
   - Generates GPS-like points along routes
   - Useful for animation

## Urban Planning Use Cases

### 1. Transit Coverage Analysis
**Goal**: Identify gaps in transit service

**Process**:
1. Import GTFS feed
2. Buffer stops by walking distance (400m)
3. Overlay with population data
4. Calculate % population within walking distance

**Output**: Coverage map showing underserved areas

### 2. Service Equity Study
**Goal**: Ensure equitable distribution of transit service

**Process**:
1. Load GTFS and census data
2. Calculate service frequency by neighborhood
3. Compare service levels across income/race demographics
4. Identify disparities

**Output**: Report on service equity with recommendations

### 3. New Route Feasibility
**Goal**: Evaluate proposed transit route

**Process**:
1. Draw proposed route geometry
2. Analyze existing GTFS for overlaps/gaps
3. Buffer route to find catchment area
4. Extract population/employment within catchment
5. Run ridership forecast
6. Compare to existing routes

**Output**: Feasibility report with ridership estimates

### 4. Schedule Optimization
**Goal**: Improve headways to match demand

**Process**:
1. Analyze GTFS stop_times.txt for current frequency
2. Obtain ridership data (from APC or fare systems)
3. Identify overcrowded vs. underutilized trips
4. Propose new schedule with optimal headways

**Output**: Revised GTFS feed with new schedules

### 5. Multimodal Network Analysis
**Goal**: Understand how different modes connect

**Process**:
1. Import GTFS from multiple agencies (bus, rail, ferry)
2. Identify transfer points
3. Calculate connectivity metrics
4. Map first-mile/last-mile gaps

**Output**: Network connectivity report

## GTFS Best Practices

### For Urban Planners

1. **Always validate feeds** before analysis
2. **Check date ranges** - many feeds are only valid for specific periods
3. **Understand service_id** - weekday vs. weekend vs. special service
4. **Use shapes.txt** for accurate route geometry (when available)
5. **Join multiple feeds** for regional analysis
6. **Convert times** - GTFS uses 24hr+ format (e.g., 25:30:00 = 1:30 AM next day)

### Common Pitfalls

1. **Missing shapes.txt**: Need to interpolate routes from stop sequences
2. **Inconsistent agency_id**: Can cause issues when merging feeds
3. **Expired feeds**: Always check feed_info.txt for validity dates
4. **Coordinate precision**: Some feeds have low-precision coordinates
5. **Service calendar complexity**: Some services operate on complex schedules

## Next Steps

1. **Download a sample feed**: Start with Caltrain or TriMet
2. **Import using our tool**: See [GETTING_STARTED.md](./GETTING_STARTED.md)
3. **Run basic queries**: Test the examples above
4. **Visualize on map**: Use Mapbox GL JS to display routes and stops
5. **Perform analysis**: Try a coverage or equity study

## Additional Resources

### Documentation
- **GTFS Reference**: https://gtfs.org/schedule/reference/
- **GTFS Best Practices**: https://gtfs.org/schedule/best-practices/
- **GTFS Realtime**: https://gtfs.org/realtime/

### Communities
- **GTFS Slack**: https://share.mobilitydata.org/slack
- **TransitWiki**: http://www.transitwiki.org/

### Papers and Research
- "A Return to Transit: Public Transportation vs. the Car" - Transportation Research Record
- "Measuring Transit Network Connectivity Using GTFS Data" - Journal of Transport Geography
- Search Google Scholar for "GTFS analysis" + your topic

---

Happy transiting! 🚇🚌🚊
