import { create } from 'zustand';
import type { Map as MapboxMap, LngLatBoundsLike, LngLatLike } from 'mapbox-gl';
import type { Feature, FeatureCollection } from 'geojson';

export type DrawMode = 'point' | 'line' | 'polygon' | 'none';
export type MapStyle = 'streets' | 'satellite' | 'light' | 'dark' | 'outdoors';

export interface MapLayer {
  id: string;
  name: string;
  type: 'geojson' | 'raster' | 'gtfs' | 'analysis';
  visible: boolean;
  opacity: number;
  data?: FeatureCollection;
  color?: string;
  source?: string;
  order?: number;
}

export interface SelectedFeature {
  feature: Feature;
  layerId: string;
  coordinates: [number, number];
}

interface MapState {
  // Map instance
  map: MapboxMap | null;
  setMap: (map: MapboxMap | null) => void;

  // View state
  viewport: {
    latitude: number;
    longitude: number;
    zoom: number;
    bearing: number;
    pitch: number;
  };
  setViewport: (viewport: Partial<MapState['viewport']>) => void;

  // Map style
  mapStyle: MapStyle;
  setMapStyle: (style: MapStyle) => void;

  // Layers
  layers: MapLayer[];
  addLayer: (layer: MapLayer) => void;
  removeLayer: (layerId: string) => void;
  updateLayer: (layerId: string, updates: Partial<MapLayer>) => void;
  toggleLayerVisibility: (layerId: string) => void;
  setLayerOpacity: (layerId: string, opacity: number) => void;
  reorderLayers: (layerIds: string[]) => void;

  // Drawing
  drawMode: DrawMode;
  setDrawMode: (mode: DrawMode) => void;
  drawingFeatures: Feature[];
  addDrawingFeature: (feature: Feature) => void;
  updateDrawingFeature: (index: number, feature: Feature) => void;
  removeDrawingFeature: (index: number) => void;
  clearDrawing: () => void;

  // Selection
  selectedFeature: SelectedFeature | null;
  setSelectedFeature: (feature: SelectedFeature | null) => void;

  // GTFS
  gtfsData: {
    routes: FeatureCollection | null;
    stops: FeatureCollection | null;
    shapes: FeatureCollection | null;
  };
  setGTFSData: (type: 'routes' | 'stops' | 'shapes', data: FeatureCollection) => void;
  clearGTFSData: () => void;

  // UI State
  showLayerControl: boolean;
  showDrawingTools: boolean;
  showFeatureInfo: boolean;
  showGTFSViewer: boolean;
  toggleLayerControl: () => void;
  toggleDrawingTools: () => void;
  toggleFeatureInfo: () => void;
  toggleGTFSViewer: () => void;

  // Utility
  fitBounds: (bounds: LngLatBoundsLike, padding?: number) => void;
  flyTo: (center: LngLatLike, zoom?: number) => void;
  reset: () => void;
}

const MAPBOX_STYLES: Record<MapStyle, string> = {
  streets: 'mapbox://styles/mapbox/streets-v12',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  light: 'mapbox://styles/mapbox/light-v11',
  dark: 'mapbox://styles/mapbox/dark-v11',
  outdoors: 'mapbox://styles/mapbox/outdoors-v12',
};

const initialViewport = {
  latitude: 40.7128,
  longitude: -74.006,
  zoom: 12,
  bearing: 0,
  pitch: 0,
};

export const useMapStore = create<MapState>((set, get) => ({
  // Map instance
  map: null,
  setMap: (map) => set({ map }),

  // View state
  viewport: initialViewport,
  setViewport: (viewport) =>
    set((state) => ({
      viewport: { ...state.viewport, ...viewport },
    })),

  // Map style
  mapStyle: 'streets',
  setMapStyle: (mapStyle) => set({ mapStyle }),

  // Layers
  layers: [],
  addLayer: (layer) =>
    set((state) => ({
      layers: [...state.layers, layer],
    })),
  removeLayer: (layerId) =>
    set((state) => ({
      layers: state.layers.filter((l) => l.id !== layerId),
    })),
  updateLayer: (layerId, updates) =>
    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === layerId ? { ...l, ...updates } : l
      ),
    })),
  toggleLayerVisibility: (layerId) =>
    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === layerId ? { ...l, visible: !l.visible } : l
      ),
    })),
  setLayerOpacity: (layerId, opacity) =>
    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === layerId ? { ...l, opacity } : l
      ),
    })),
  reorderLayers: (layerIds) =>
    set((state) => {
      const layerMap = new Map(state.layers.map((l) => [l.id, l]));
      return {
        layers: layerIds
          .map((id) => layerMap.get(id))
          .filter((l): l is MapLayer => l !== undefined),
      };
    }),

  // Drawing
  drawMode: 'none',
  setDrawMode: (mode) => set({ drawMode: mode }),
  drawingFeatures: [],
  addDrawingFeature: (feature) =>
    set((state) => ({
      drawingFeatures: [...state.drawingFeatures, feature],
    })),
  updateDrawingFeature: (index, feature) =>
    set((state) => ({
      drawingFeatures: state.drawingFeatures.map((f, i) =>
        i === index ? feature : f
      ),
    })),
  removeDrawingFeature: (index) =>
    set((state) => ({
      drawingFeatures: state.drawingFeatures.filter((_, i) => i !== index),
    })),
  clearDrawing: () => set({ drawingFeatures: [] }),

  // Selection
  selectedFeature: null,
  setSelectedFeature: (feature) => set({ selectedFeature: feature }),

  // GTFS
  gtfsData: {
    routes: null,
    stops: null,
    shapes: null,
  },
  setGTFSData: (type, data) =>
    set((state) => ({
      gtfsData: { ...state.gtfsData, [type]: data },
    })),
  clearGTFSData: () =>
    set({
      gtfsData: {
        routes: null,
        stops: null,
        shapes: null,
      },
    }),

  // UI State
  showLayerControl: true,
  showDrawingTools: false,
  showFeatureInfo: false,
  showGTFSViewer: false,
  toggleLayerControl: () =>
    set((state) => ({ showLayerControl: !state.showLayerControl })),
  toggleDrawingTools: () =>
    set((state) => ({ showDrawingTools: !state.showDrawingTools })),
  toggleFeatureInfo: () =>
    set((state) => ({ showFeatureInfo: !state.showFeatureInfo })),
  toggleGTFSViewer: () =>
    set((state) => ({ showGTFSViewer: !state.showGTFSViewer })),

  // Utility
  fitBounds: (bounds, padding = 50) => {
    const map = get().map;
    if (map) {
      map.fitBounds(bounds, { padding });
    }
  },
  flyTo: (center, zoom = 14) => {
    const map = get().map;
    if (map) {
      map.flyTo({ center, zoom });
    }
  },
  reset: () =>
    set({
      viewport: initialViewport,
      layers: [],
      drawMode: 'none',
      drawingFeatures: [],
      selectedFeature: null,
      gtfsData: {
        routes: null,
        stops: null,
        shapes: null,
      },
      showLayerControl: true,
      showDrawingTools: false,
      showFeatureInfo: false,
      showGTFSViewer: false,
    }),
}));

export const getMapboxStyle = (style: MapStyle): string => MAPBOX_STYLES[style];
