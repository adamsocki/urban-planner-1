import React from 'react';
import { useMapStore } from '../stores/mapStore';
import { useDrawing } from '../hooks/useMap';
import { Circle, Minus, Pentagon, Trash2, X, Download, MapPin } from 'lucide-react';
import { calculateArea, calculateLength, formatArea, formatDistance } from '../lib/mapUtils';
import type { LineString, Polygon } from 'geojson';

const DrawingTools: React.FC = () => {
  const { toggleDrawingTools } = useMapStore();
  const { drawMode, drawingFeatures, startDrawing, stopDrawing, deleteFeature, clearAll } =
    useDrawing();

  const exportDrawing = () => {
    if (drawingFeatures.length === 0) return;

    const geojson = {
      type: 'FeatureCollection',
      features: drawingFeatures,
    };

    const blob = new Blob([JSON.stringify(geojson, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drawing-${Date.now()}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="absolute top-20 right-4 bg-white rounded-lg shadow-lg z-10 w-72">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-semibold text-sm">Drawing Tools</h3>
        <button
          onClick={toggleDrawingTools}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <X size={16} />
        </button>
      </div>

      <div className="p-3">
        {/* Drawing Mode Buttons */}
        <div className="mb-4">
          <label className="text-xs text-gray-600 mb-2 block">Draw Mode</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() =>
                drawMode === 'point' ? stopDrawing() : startDrawing('point')
              }
              className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-colors ${
                drawMode === 'point'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <MapPin size={20} />
              <span className="text-xs mt-1">Point</span>
            </button>

            <button
              onClick={() =>
                drawMode === 'line' ? stopDrawing() : startDrawing('line')
              }
              className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-colors ${
                drawMode === 'line'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Minus size={20} />
              <span className="text-xs mt-1">Line</span>
            </button>

            <button
              onClick={() =>
                drawMode === 'polygon' ? stopDrawing() : startDrawing('polygon')
              }
              className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-colors ${
                drawMode === 'polygon'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Pentagon size={20} />
              <span className="text-xs mt-1">Polygon</span>
            </button>
          </div>
        </div>

        {/* Active Drawing Instructions */}
        {drawMode !== 'none' && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-900">
              {drawMode === 'point' && 'Click on the map to add points'}
              {drawMode === 'line' && 'Click to add points. Double-click to finish.'}
              {drawMode === 'polygon' && 'Click to add points. Double-click to finish.'}
            </p>
          </div>
        )}

        {/* Features List */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-gray-600">
              Features ({drawingFeatures.length})
            </label>
            {drawingFeatures.length > 0 && (
              <button
                onClick={clearAll}
                className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <Trash2 size={12} />
                Clear All
              </button>
            )}
          </div>

          {drawingFeatures.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-xs">
              No features drawn yet
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {drawingFeatures.map((feature, index) => {
                let measurement = '';
                if (feature.geometry.type === 'LineString') {
                  const length = calculateLength(feature.geometry as LineString);
                  measurement = formatDistance(length);
                } else if (feature.geometry.type === 'Polygon') {
                  const area = calculateArea(feature.geometry as Polygon);
                  measurement = formatArea(area);
                }

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      {feature.geometry.type === 'Point' && (
                        <MapPin size={14} className="text-gray-600" />
                      )}
                      {feature.geometry.type === 'LineString' && (
                        <Minus size={14} className="text-gray-600" />
                      )}
                      {feature.geometry.type === 'Polygon' && (
                        <Pentagon size={14} className="text-gray-600" />
                      )}
                      <div className="flex-1">
                        <div className="text-xs font-medium">
                          {feature.geometry.type}
                        </div>
                        {measurement && (
                          <div className="text-xs text-gray-500">{measurement}</div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteFeature(index)}
                      className="p-1 hover:bg-red-100 rounded text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Export Button */}
        {drawingFeatures.length > 0 && (
          <button
            onClick={exportDrawing}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Download size={16} />
            <span className="text-sm font-medium">Export GeoJSON</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default DrawingTools;
