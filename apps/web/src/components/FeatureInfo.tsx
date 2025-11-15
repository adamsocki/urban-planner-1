import React from 'react';
import { useMapStore } from '../stores/mapStore';
import { X, Info, MapPin } from 'lucide-react';
import { formatCoordinates, calculateArea, calculateLength, formatArea, formatDistance } from '../lib/mapUtils';
import type { LineString, Polygon } from 'geojson';

const FeatureInfo: React.FC = () => {
  const { selectedFeature, setSelectedFeature, toggleFeatureInfo } = useMapStore();

  if (!selectedFeature) {
    return (
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg z-10 w-80 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Info size={18} />
            <h3 className="font-semibold text-sm">Feature Info</h3>
          </div>
          <button
            onClick={toggleFeatureInfo}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X size={16} />
          </button>
        </div>
        <div className="text-center py-6 text-gray-400 text-sm">
          Click on a feature to view its information
        </div>
      </div>
    );
  }

  const { feature, layerId, coordinates } = selectedFeature;
  const { geometry, properties } = feature;

  // Calculate measurements
  let measurements: Array<{ label: string; value: string }> = [];

  if (geometry.type === 'LineString') {
    const length = calculateLength(geometry as LineString);
    measurements.push({
      label: 'Length',
      value: formatDistance(length),
    });
  } else if (geometry.type === 'Polygon') {
    const area = calculateArea(geometry as Polygon);
    measurements.push({
      label: 'Area',
      value: formatArea(area),
    });
  }

  return (
    <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg z-10 w-80">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <Info size={18} />
          <h3 className="font-semibold text-sm">Feature Info</h3>
        </div>
        <button
          onClick={() => setSelectedFeature(null)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <X size={16} />
        </button>
      </div>

      <div className="p-3 max-h-96 overflow-y-auto">
        {/* Geometry Type */}
        <div className="mb-3 p-2 bg-blue-50 rounded-lg">
          <div className="text-xs text-gray-600 mb-1">Type</div>
          <div className="text-sm font-medium text-blue-900">{geometry.type}</div>
        </div>

        {/* Layer */}
        <div className="mb-3 p-2 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-600 mb-1">Layer</div>
          <div className="text-sm font-medium">{layerId}</div>
        </div>

        {/* Coordinates */}
        <div className="mb-3 p-2 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-1 mb-1">
            <MapPin size={12} className="text-gray-600" />
            <div className="text-xs text-gray-600">Clicked Location</div>
          </div>
          <div className="text-sm font-mono">{formatCoordinates(coordinates)}</div>
        </div>

        {/* Measurements */}
        {measurements.length > 0 && (
          <div className="mb-3">
            <div className="text-xs text-gray-600 mb-2">Measurements</div>
            <div className="space-y-2">
              {measurements.map((m, index) => (
                <div key={index} className="p-2 bg-green-50 rounded-lg">
                  <div className="text-xs text-gray-600">{m.label}</div>
                  <div className="text-sm font-medium text-green-900">{m.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Properties */}
        {properties && Object.keys(properties).length > 0 && (
          <div className="mb-3">
            <div className="text-xs text-gray-600 mb-2">Properties</div>
            <div className="space-y-2">
              {Object.entries(properties).map(([key, value]) => (
                <div key={key} className="p-2 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">{key}</div>
                  <div className="text-sm font-medium break-words">
                    {typeof value === 'object'
                      ? JSON.stringify(value, null, 2)
                      : String(value)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Properties Message */}
        {(!properties || Object.keys(properties).length === 0) && (
          <div className="text-center py-4 text-gray-400 text-xs">
            No properties available
          </div>
        )}
      </div>
    </div>
  );
};

export default FeatureInfo;
