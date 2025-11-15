/**
 * Census Data Tool Component
 * Interactive map-based census data gathering and visualization
 */

import React, { useState, useCallback, useRef } from 'react';
import Map, { Marker, Layer, Source, MapRef } from 'react-map-gl';
import type { LngLat, MapLayerMouseEvent } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface CensusData {
  geography: {
    type: string;
    state?: string;
    county?: string;
    tract?: string;
    name?: string;
  };
  year: number;
  population: {
    total: number;
    male: number;
    female: number;
  };
  income: {
    medianHouseholdIncome: number;
    perCapitaIncome: number;
    povertyRate: number;
  };
  housing: {
    totalUnits: number;
    vacancyRate: number;
    ownershipRate: number;
  };
  transportation: {
    totalWorkers: number;
    publicTransit: number;
    droveAlone: number;
    walked: number;
    bicycle: number;
    workedFromHome: number;
    transitMode: {
      auto: number;
      transit: number;
      active: number;
      remote: number;
    };
  };
  employment: {
    unemploymentRate: number;
    laborForceParticipationRate: number;
  };
}

interface FeatureData {
  geometry: any;
  properties: CensusData;
}

type QueryMode = 'point' | 'bbox';
type GeographyLevel = 'county' | 'tract' | 'block-group';

export default function CensusDataTool() {
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState({
    longitude: -98.5795,
    latitude: 39.8283,
    zoom: 4,
  });

  const [queryMode, setQueryMode] = useState<QueryMode>('point');
  const [geographyLevel, setGeographyLevel] = useState<GeographyLevel>('tract');
  const [selectedPoint, setSelectedPoint] = useState<LngLat | null>(null);
  const [boundingBox, setBoundingBox] = useState<{ sw: LngLat; ne: LngLat } | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<LngLat | null>(null);

  const [censusData, setCensusData] = useState<FeatureData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<number | null>(null);

  /**
   * Handle map click for point queries
   */
  const handleMapClick = useCallback(
    async (event: MapLayerMouseEvent) => {
      if (queryMode === 'point') {
        const { lng, lat } = event.lngLat;
        setSelectedPoint(event.lngLat);

        // Query census data for this point
        await fetchCensusDataForPoint(lat, lng);
      }
    },
    [queryMode, geographyLevel]
  );

  /**
   * Handle bounding box drawing
   */
  const handleMouseDown = useCallback(
    (event: MapLayerMouseEvent) => {
      if (queryMode === 'bbox') {
        setIsDrawing(true);
        setDrawStart(event.lngLat);
        setBoundingBox(null);
      }
    },
    [queryMode]
  );

  const handleMouseMove = useCallback(
    (event: MapLayerMouseEvent) => {
      if (isDrawing && drawStart) {
        const { lng, lat } = event.lngLat;
        setBoundingBox({
          sw: {
            lng: Math.min(drawStart.lng, lng),
            lat: Math.min(drawStart.lat, lat),
          } as LngLat,
          ne: {
            lng: Math.max(drawStart.lng, lng),
            lat: Math.max(drawStart.lat, lat),
          } as LngLat,
        });
      }
    },
    [isDrawing, drawStart]
  );

  const handleMouseUp = useCallback(
    async (event: MapLayerMouseEvent) => {
      if (isDrawing && drawStart) {
        setIsDrawing(false);
        const { lng, lat } = event.lngLat;

        const bbox = {
          sw: {
            lng: Math.min(drawStart.lng, lng),
            lat: Math.min(drawStart.lat, lat),
          } as LngLat,
          ne: {
            lng: Math.max(drawStart.lng, lng),
            lat: Math.max(drawStart.lat, lat),
          } as LngLat,
        };

        setBoundingBox(bbox);
        setDrawStart(null);

        // Query census data for this bounding box
        await fetchCensusDataForBbox(bbox);
      }
    },
    [isDrawing, drawStart, geographyLevel]
  );

  /**
   * Fetch census data for a point
   */
  const fetchCensusDataForPoint = async (latitude: number, longitude: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/census/spatial`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'point',
          coordinates: { latitude, longitude },
          level: geographyLevel,
          year: 2021,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.features) {
        setCensusData(data.features);
        setSelectedFeature(0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch census data');
      console.error('Census data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch census data for a bounding box
   */
  const fetchCensusDataForBbox = async (bbox: { sw: LngLat; ne: LngLat }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/census/spatial`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'bbox',
          boundingBox: {
            north: bbox.ne.lat,
            south: bbox.sw.lat,
            east: bbox.ne.lng,
            west: bbox.sw.lng,
          },
          level: geographyLevel,
          year: 2021,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.features) {
        setCensusData(data.features);
        setSelectedFeature(data.features.length > 0 ? 0 : null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch census data');
      console.error('Census data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Export census data
   */
  const handleExport = async (format: 'json' | 'csv' | 'geojson') => {
    if (censusData.length === 0) {
      alert('No data to export');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/census/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: censusData,
          format,
        }),
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`);
      }

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `census_data.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Export failed');
    }
  };

  /**
   * Clear all selections and data
   */
  const handleClear = () => {
    setSelectedPoint(null);
    setBoundingBox(null);
    setCensusData([]);
    setSelectedFeature(null);
    setError(null);
  };

  const selectedData = selectedFeature !== null ? censusData[selectedFeature]?.properties : null;

  return (
    <div className="census-data-tool" style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <div
        style={{
          width: '400px',
          backgroundColor: '#f5f5f5',
          padding: '20px',
          overflowY: 'auto',
          borderRight: '1px solid #ddd',
        }}
      >
        <h2 style={{ marginTop: 0 }}>Census Data Tool</h2>

        {/* Query Mode */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Query Mode:
          </label>
          <select
            value={queryMode}
            onChange={(e) => {
              setQueryMode(e.target.value as QueryMode);
              handleClear();
            }}
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="point">Point (Click on map)</option>
            <option value="bbox">Bounding Box (Draw area)</option>
          </select>
        </div>

        {/* Geography Level */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Geography Level:
          </label>
          <select
            value={geographyLevel}
            onChange={(e) => setGeographyLevel(e.target.value as GeographyLevel)}
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="county">County</option>
            <option value="tract">Census Tract</option>
            <option value="block-group">Block Group</option>
          </select>
        </div>

        {/* Instructions */}
        <div
          style={{
            padding: '10px',
            backgroundColor: '#e3f2fd',
            borderRadius: '4px',
            marginBottom: '20px',
            fontSize: '14px',
          }}
        >
          {queryMode === 'point' ? (
            <p style={{ margin: 0 }}>Click anywhere on the map to query census data for that location.</p>
          ) : (
            <p style={{ margin: 0 }}>Click and drag on the map to draw a bounding box.</p>
          )}
        </div>

        {/* Loading/Error States */}
        {loading && (
          <div style={{ padding: '10px', backgroundColor: '#fff3cd', borderRadius: '4px', marginBottom: '20px' }}>
            Loading census data...
          </div>
        )}

        {error && (
          <div style={{ padding: '10px', backgroundColor: '#f8d7da', borderRadius: '4px', marginBottom: '20px' }}>
            Error: {error}
          </div>
        )}

        {/* Results */}
        {censusData.length > 0 && (
          <>
            <div style={{ marginBottom: '20px' }}>
              <h3>Results ({censusData.length})</h3>

              {censusData.length > 1 && (
                <select
                  value={selectedFeature ?? ''}
                  onChange={(e) => setSelectedFeature(parseInt(e.target.value))}
                  style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                >
                  {censusData.map((feature, index) => (
                    <option key={index} value={index}>
                      {feature.properties.geography.name || `Area ${index + 1}`}
                    </option>
                  ))}
                </select>
              )}

              {selectedData && (
                <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '4px' }}>
                  <h4 style={{ marginTop: 0 }}>Demographics</h4>
                  <table style={{ width: '100%', fontSize: '14px' }}>
                    <tbody>
                      <tr>
                        <td>Population:</td>
                        <td><strong>{selectedData.population.total.toLocaleString()}</strong></td>
                      </tr>
                      <tr>
                        <td>Median Income:</td>
                        <td><strong>${selectedData.income.medianHouseholdIncome.toLocaleString()}</strong></td>
                      </tr>
                      <tr>
                        <td>Poverty Rate:</td>
                        <td><strong>{selectedData.income.povertyRate.toFixed(1)}%</strong></td>
                      </tr>
                    </tbody>
                  </table>

                  <h4>Housing</h4>
                  <table style={{ width: '100%', fontSize: '14px' }}>
                    <tbody>
                      <tr>
                        <td>Total Units:</td>
                        <td><strong>{selectedData.housing.totalUnits.toLocaleString()}</strong></td>
                      </tr>
                      <tr>
                        <td>Vacancy Rate:</td>
                        <td><strong>{selectedData.housing.vacancyRate.toFixed(1)}%</strong></td>
                      </tr>
                      <tr>
                        <td>Ownership Rate:</td>
                        <td><strong>{selectedData.housing.ownershipRate.toFixed(1)}%</strong></td>
                      </tr>
                    </tbody>
                  </table>

                  <h4>Transportation</h4>
                  <table style={{ width: '100%', fontSize: '14px' }}>
                    <tbody>
                      <tr>
                        <td>Total Workers:</td>
                        <td><strong>{selectedData.transportation.totalWorkers.toLocaleString()}</strong></td>
                      </tr>
                      <tr>
                        <td>Transit Mode:</td>
                        <td><strong>{selectedData.transportation.publicTransit.toLocaleString()}</strong></td>
                      </tr>
                      <tr>
                        <td>Work from Home:</td>
                        <td><strong>{selectedData.transportation.workedFromHome.toLocaleString()}</strong></td>
                      </tr>
                    </tbody>
                  </table>

                  <h4>Employment</h4>
                  <table style={{ width: '100%', fontSize: '14px' }}>
                    <tbody>
                      <tr>
                        <td>Unemployment:</td>
                        <td><strong>{selectedData.employment.unemploymentRate.toFixed(1)}%</strong></td>
                      </tr>
                      <tr>
                        <td>Labor Force:</td>
                        <td><strong>{selectedData.employment.laborForceParticipationRate.toFixed(1)}%</strong></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Export Buttons */}
            <div style={{ marginBottom: '20px' }}>
              <h4>Export Data</h4>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => handleExport('json')}
                  style={{ flex: 1, padding: '8px', cursor: 'pointer' }}
                >
                  JSON
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  style={{ flex: 1, padding: '8px', cursor: 'pointer' }}
                >
                  CSV
                </button>
                <button
                  onClick={() => handleExport('geojson')}
                  style={{ flex: 1, padding: '8px', cursor: 'pointer' }}
                >
                  GeoJSON
                </button>
              </div>
            </div>

            <button
              onClick={handleClear}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Clear All
            </button>
          </>
        )}
      </div>

      {/* Map */}
      <div style={{ flex: 1, position: 'relative' }}>
        <Map
          ref={mapRef}
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          onClick={handleMapClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle="mapbox://styles/mapbox/light-v11"
          style={{ width: '100%', height: '100%' }}
          cursor={queryMode === 'bbox' && isDrawing ? 'crosshair' : 'default'}
        >
          {/* Selected Point Marker */}
          {selectedPoint && queryMode === 'point' && (
            <Marker longitude={selectedPoint.lng} latitude={selectedPoint.lat} color="red" />
          )}

          {/* Bounding Box */}
          {boundingBox && (
            <Source
              id="bbox"
              type="geojson"
              data={{
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'Polygon',
                  coordinates: [
                    [
                      [boundingBox.sw.lng, boundingBox.sw.lat],
                      [boundingBox.ne.lng, boundingBox.sw.lat],
                      [boundingBox.ne.lng, boundingBox.ne.lat],
                      [boundingBox.sw.lng, boundingBox.ne.lat],
                      [boundingBox.sw.lng, boundingBox.sw.lat],
                    ],
                  ],
                },
              }}
            >
              <Layer
                id="bbox-fill"
                type="fill"
                paint={{
                  'fill-color': '#088',
                  'fill-opacity': 0.2,
                }}
              />
              <Layer
                id="bbox-outline"
                type="line"
                paint={{
                  'line-color': '#088',
                  'line-width': 2,
                }}
              />
            </Source>
          )}
        </Map>
      </div>
    </div>
  );
}
