import React, { useRef, useEffect, useState } from 'react';
import Map, { NavigationControl, ScaleControl, GeolocateControl, FullscreenControl, Source, Layer } from 'react-map-gl';
import type { MapRef, LayerProps } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMapStore, getMapboxStyle } from '../stores/mapStore';
import { useMapInteractions, useMapLayers } from '../hooks/useMap';
import LayerControl from './LayerControl';
import DrawingTools from './DrawingTools';
import FeatureInfo from './FeatureInfo';
import GTFSViewer from './GTFSViewer';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const MapCanvas: React.FC = () => {
  const mapRef = useRef<MapRef>(null);
  const {
    viewport,
    setViewport,
    mapStyle,
    setMap,
    layers,
    drawingFeatures,
    showLayerControl,
    showDrawingTools,
    showFeatureInfo,
    showGTFSViewer,
  } = useMapStore();

  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map interactions
  useMapInteractions();
  useMapLayers();

  useEffect(() => {
    if (mapRef.current && mapLoaded) {
      setMap(mapRef.current.getMap());
    }
  }, [mapRef.current, mapLoaded, setMap]);

  const handleMapLoad = () => {
    setMapLoaded(true);
  };

  // Drawing layer style
  const drawingLayerStyle: LayerProps = {
    id: 'drawing-layer',
    type: 'circle',
    paint: {
      'circle-radius': 6,
      'circle-color': '#FF6B6B',
      'circle-stroke-width': 2,
      'circle-stroke-color': '#FFFFFF',
    },
  };

  const drawingLineStyle: LayerProps = {
    id: 'drawing-line-layer',
    type: 'line',
    paint: {
      'line-color': '#FF6B6B',
      'line-width': 3,
    },
  };

  const drawingFillStyle: LayerProps = {
    id: 'drawing-fill-layer',
    type: 'fill',
    paint: {
      'fill-color': '#FF6B6B',
      'fill-opacity': 0.2,
    },
  };

  return (
    <div className="relative w-full h-screen">
      <Map
        ref={mapRef}
        {...viewport}
        onMove={(evt) => setViewport(evt.viewState)}
        onLoad={handleMapLoad}
        mapStyle={getMapboxStyle(mapStyle)}
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        interactiveLayerIds={layers.filter((l) => l.visible).map((l) => l.id)}
      >
        {/* Map Controls */}
        <NavigationControl position="top-right" />
        <GeolocateControl position="top-right" />
        <ScaleControl position="bottom-left" />
        <FullscreenControl position="top-right" />

        {/* Render user layers */}
        {mapLoaded &&
          layers
            .filter((layer) => layer.visible && layer.data)
            .map((layer) => (
              <React.Fragment key={layer.id}>
                <Source
                  id={layer.id}
                  type="geojson"
                  data={layer.data!}
                >
                  {/* Point layer */}
                  <Layer
                    id={`${layer.id}-circle`}
                    type="circle"
                    filter={['==', '$type', 'Point']}
                    paint={{
                      'circle-radius': 6,
                      'circle-color': layer.color || '#4ECDC4',
                      'circle-opacity': layer.opacity,
                      'circle-stroke-width': 2,
                      'circle-stroke-color': '#FFFFFF',
                    }}
                  />

                  {/* Line layer */}
                  <Layer
                    id={`${layer.id}-line`}
                    type="line"
                    filter={['==', '$type', 'LineString']}
                    paint={{
                      'line-color': layer.color || '#4ECDC4',
                      'line-width': 3,
                      'line-opacity': layer.opacity,
                    }}
                  />

                  {/* Polygon fill layer */}
                  <Layer
                    id={`${layer.id}-fill`}
                    type="fill"
                    filter={['==', '$type', 'Polygon']}
                    paint={{
                      'fill-color': layer.color || '#4ECDC4',
                      'fill-opacity': layer.opacity * 0.3,
                    }}
                  />

                  {/* Polygon outline layer */}
                  <Layer
                    id={`${layer.id}-outline`}
                    type="line"
                    filter={['==', '$type', 'Polygon']}
                    paint={{
                      'line-color': layer.color || '#4ECDC4',
                      'line-width': 2,
                      'line-opacity': layer.opacity,
                    }}
                  />
                </Source>
              </React.Fragment>
            ))}

        {/* Drawing features layer */}
        {mapLoaded && drawingFeatures.length > 0 && (
          <Source
            id="drawing-source"
            type="geojson"
            data={{
              type: 'FeatureCollection',
              features: drawingFeatures,
            }}
          >
            <Layer {...drawingFillStyle} filter={['==', '$type', 'Polygon']} />
            <Layer {...drawingLineStyle} filter={['==', '$type', 'LineString']} />
            <Layer {...drawingLayerStyle} filter={['==', '$type', 'Point']} />
          </Source>
        )}
      </Map>

      {/* UI Overlays */}
      {showLayerControl && <LayerControl />}
      {showDrawingTools && <DrawingTools />}
      {showFeatureInfo && <FeatureInfo />}
      {showGTFSViewer && <GTFSViewer />}

      {/* Map Style Selector */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-2 z-10">
        <select
          value={mapStyle}
          onChange={(e) => useMapStore.getState().setMapStyle(e.target.value as any)}
          className="text-sm border-none outline-none cursor-pointer"
        >
          <option value="streets">Streets</option>
          <option value="satellite">Satellite</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="outdoors">Outdoors</option>
        </select>
      </div>
    </div>
  );
};

export default MapCanvas;
