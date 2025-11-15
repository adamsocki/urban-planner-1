import React from 'react';
import { useMapStore } from '../stores/mapStore';
import { Bus, X, Upload, Eye, EyeOff } from 'lucide-react';
import type { FeatureCollection } from 'geojson';

const GTFSViewer: React.FC = () => {
  const { gtfsData, setGTFSData, clearGTFSData, toggleGTFSViewer, addLayer, updateLayer, toggleLayerVisibility, layers } =
    useMapStore();

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'routes' | 'stops' | 'shapes'
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const geojson = JSON.parse(text) as FeatureCollection;

      setGTFSData(type, geojson);

      // Use stable layer ID
      const layerId = `gtfs-${type}`;
      
      // Check if layer already exists and update it, otherwise add new layer
      const existingLayer = layers.find(l => l.id === layerId);
      if (existingLayer) {
        // Update existing layer data
        updateLayer(layerId, { data: geojson });
      } else {
        // Add as a new layer with stable ID
        addLayer({
          id: layerId,
          name: `GTFS ${type.charAt(0).toUpperCase() + type.slice(1)}`,
          type: 'gtfs',
          visible: true,
          opacity: 1,
          data: geojson,
          color: type === 'routes' ? '#2563EB' : type === 'stops' ? '#DC2626' : '#059669',
        });
      }
    } catch (error) {
      console.error(`Error loading GTFS ${type}:`, error);
      alert(`Failed to load GTFS ${type} file. Please check the file format.`);
    }
  };

  // Helper function to get layer visibility from store
  const getLayerVisibility = (type: 'routes' | 'stops' | 'shapes'): boolean => {
    const layer = layers.find(l => l.id === `gtfs-${type}`);
    return layer?.visible ?? true;
  };

  const hasGTFSData = gtfsData.routes || gtfsData.stops || gtfsData.shapes;

  return (
    <div className="absolute top-20 left-96 bg-white rounded-lg shadow-lg z-10 w-80">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <Bus size={18} />
          <h3 className="font-semibold text-sm">GTFS Transit Data</h3>
        </div>
        <button
          onClick={toggleGTFSViewer}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <X size={16} />
        </button>
      </div>

      <div className="p-3">
        {/* Upload Sections */}
        <div className="space-y-3 mb-4">
          {/* Routes */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full" />
                <span className="text-sm font-medium">Routes</span>
              </div>
              {gtfsData.routes && (
                <button
                  onClick={() => toggleLayerVisibility('gtfs-routes')}
                  className="p-1 hover:bg-blue-100 rounded"
                >
                  {getLayerVisibility('routes') ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
              )}
            </div>
            <label className="block">
              <input
                type="file"
                accept=".geojson,.json"
                onChange={(e) => handleFileUpload(e, 'routes')}
                className="hidden"
              />
              <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-white border border-blue-300 rounded cursor-pointer hover:bg-blue-50">
                <Upload size={12} />
                {gtfsData.routes ? 'Replace Routes' : 'Upload Routes'}
              </span>
            </label>
            {gtfsData.routes && (
              <div className="mt-2 text-xs text-blue-900">
                {gtfsData.routes.features.length} routes loaded
              </div>
            )}
          </div>

          {/* Stops */}
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-600 rounded-full" />
                <span className="text-sm font-medium">Stops</span>
              </div>
              {gtfsData.stops && (
                <button
                  onClick={() => toggleLayerVisibility('gtfs-stops')}
                  className="p-1 hover:bg-red-100 rounded"
                >
                  {getLayerVisibility('stops') ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
              )}
            </div>
            <label className="block">
              <input
                type="file"
                accept=".geojson,.json"
                onChange={(e) => handleFileUpload(e, 'stops')}
                className="hidden"
              />
              <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-white border border-red-300 rounded cursor-pointer hover:bg-red-50">
                <Upload size={12} />
                {gtfsData.stops ? 'Replace Stops' : 'Upload Stops'}
              </span>
            </label>
            {gtfsData.stops && (
              <div className="mt-2 text-xs text-red-900">
                {gtfsData.stops.features.length} stops loaded
              </div>
            )}
          </div>

          {/* Shapes */}
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-600 rounded-full" />
                <span className="text-sm font-medium">Shapes</span>
              </div>
              {gtfsData.shapes && (
                <button
                  onClick={() => toggleLayerVisibility('gtfs-shapes')}
                  className="p-1 hover:bg-green-100 rounded"
                >
                  {getLayerVisibility('shapes') ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
              )}
            </div>
            <label className="block">
              <input
                type="file"
                accept=".geojson,.json"
                onChange={(e) => handleFileUpload(e, 'shapes')}
                className="hidden"
              />
              <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-white border border-green-300 rounded cursor-pointer hover:bg-green-50">
                <Upload size={12} />
                {gtfsData.shapes ? 'Replace Shapes' : 'Upload Shapes'}
              </span>
            </label>
            {gtfsData.shapes && (
              <div className="mt-2 text-xs text-green-900">
                {gtfsData.shapes.features.length} shapes loaded
              </div>
            )}
          </div>
        </div>

        {/* Info Message */}
        {!hasGTFSData && (
          <div className="text-center py-6 text-gray-400 text-xs">
            Upload GTFS data as GeoJSON files to visualize transit routes, stops, and
            shapes on the map
          </div>
        )}

        {/* Clear All Button */}
        {hasGTFSData && (
          <button
            onClick={clearGTFSData}
            className="w-full px-3 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Clear All GTFS Data
          </button>
        )}

        {/* Usage Instructions */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-xs font-medium text-gray-900 mb-2">
            How to use:
          </div>
          <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
            <li>Export GTFS data as GeoJSON from your source</li>
            <li>Upload routes, stops, and shapes separately</li>
            <li>Data will appear on the map and in layers panel</li>
            <li>Click features to view transit information</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GTFSViewer;
