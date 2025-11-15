import { useEffect, useCallback } from 'react';
import { useMapStore } from '../stores/mapStore';
import type { MapMouseEvent } from 'mapbox-gl';
import type { Feature } from 'geojson';
import { createPoint } from '../lib/mapUtils';

/**
 * Hook for map interactions (click, hover, draw)
 */
export const useMapInteractions = () => {
  const {
    map,
    drawMode,
    addDrawingFeature,
    setSelectedFeature,
    layers,
  } = useMapStore();

  const handleMapClick = useCallback(
    (event: MapMouseEvent) => {
      if (!map) return;

      const { lng, lat } = event.lngLat;

      // If in draw mode, handle drawing
      if (drawMode === 'point') {
        const feature = createPoint([lng, lat], {
          timestamp: Date.now(),
        });
        addDrawingFeature(feature);
      }

      // Check for feature clicks on visible layers
      const features = map.queryRenderedFeatures(event.point, {
        layers: layers.filter((l) => l.visible).flatMap(l => [`${l.id}-circle`, `${l.id}-line`, `${l.id}-fill`, `${l.id}-outline`]),
      });

      if (features.length > 0) {
        const feature = features[0];
        setSelectedFeature({
          feature: feature as Feature,
          layerId: feature.layer?.id || '',
          coordinates: [lng, lat],
        });
      } else {
        setSelectedFeature(null);
      }
    },
    [map, drawMode, addDrawingFeature, setSelectedFeature, layers]
  );

  const handleMapHover = useCallback(
    (event: MapMouseEvent) => {
      if (!map) return;

      const features = map.queryRenderedFeatures(event.point, {
        layers: layers.filter((l) => l.visible).map((l) => l.id),
      });

      map.getCanvas().style.cursor = features.length > 0 ? 'pointer' : '';
    },
    [map, layers]
  );

  useEffect(() => {
    if (!map) return;

    map.on('click', handleMapClick);
    map.on('mousemove', handleMapHover);

    return () => {
      map.off('click', handleMapClick);
      map.off('mousemove', handleMapHover);
    };
  }, [map, handleMapClick, handleMapHover]);

  return {
    handleMapClick,
    handleMapHover,
  };
};

/**
 * Hook for managing map layers
 */
export const useMapLayers = () => {
  const { map, layers } = useMapStore();

  useEffect(() => {
    if (!map || !map.isStyleLoaded()) return;

    // Update layer visibility and opacity
    layers.forEach((layer) => {
      // Update opacity based on layer type
      if (layer.type === 'geojson') {
        const visibility = layer.visible ? 'visible' : 'none';

        if (map.getLayer(`${layer.id}-fill`)) {
          map.setLayoutProperty(`${layer.id}-fill`, 'visibility', visibility);
          map.setPaintProperty(
            `${layer.id}-fill`,
            'fill-opacity',
            layer.opacity * 0.3
          );
        }
        if (map.getLayer(`${layer.id}-line`)) {
          map.setLayoutProperty(`${layer.id}-line`, 'visibility', visibility);
          map.setPaintProperty(
            `${layer.id}-line`,
            'line-opacity',
            layer.opacity
          );
        }
        if (map.getLayer(`${layer.id}-circle`)) {
          map.setLayoutProperty(`${layer.id}-circle`, 'visibility', visibility);
          map.setPaintProperty(
            `${layer.id}-circle`,
            'circle-opacity',
            layer.opacity
          );
        }
        if (map.getLayer(`${layer.id}-outline`)) {
          map.setLayoutProperty(`${layer.id}-outline`, 'visibility', visibility);
          map.setPaintProperty(
            `${layer.id}-outline`,
            'line-opacity',
            layer.opacity
          );
        }
      }
    });
  }, [map, layers]);

  return null;
};

/**
 * Hook for drawing functionality
 */
export const useDrawing = () => {
  const {
    drawMode,
    drawingFeatures,
    removeDrawingFeature,
    clearDrawing,
    setDrawMode,
  } = useMapStore();

  const startDrawing = useCallback(
    (mode: 'point' | 'line' | 'polygon') => {
      setDrawMode(mode);
    },
    [setDrawMode]
  );

  const stopDrawing = useCallback(() => {
    setDrawMode('none');
  }, [setDrawMode]);

  const deleteFeature = useCallback(
    (index: number) => {
      removeDrawingFeature(index);
    },
    [removeDrawingFeature]
  );

  const clearAll = useCallback(() => {
    clearDrawing();
    setDrawMode('none');
  }, [clearDrawing, setDrawMode]);

  return {
    drawMode,
    drawingFeatures,
    startDrawing,
    stopDrawing,
    deleteFeature,
    clearAll,
  };
};

/**
 * Hook for viewport management
 */
export const useViewport = () => {
  const { viewport, setViewport, fitBounds, flyTo } = useMapStore();

  const updateViewport = useCallback(
    (updates: Partial<typeof viewport>) => {
      setViewport(updates);
    },
    [setViewport]
  );

  return {
    viewport,
    updateViewport,
    fitBounds,
    flyTo,
  };
};
