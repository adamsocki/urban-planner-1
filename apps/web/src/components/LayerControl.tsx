import React, { useState } from 'react';
import { useMapStore } from '../stores/mapStore';
import { Layers, Eye, EyeOff, Trash2, Plus, X, ChevronDown, ChevronRight } from 'lucide-react';
import { getRandomColor } from '../lib/mapUtils';
import type { FeatureCollection } from 'geojson';

const LayerControl: React.FC = () => {
  const {
    layers,
    addLayer,
    removeLayer,
    toggleLayerVisibility,
    setLayerOpacity,
    toggleLayerControl,
  } = useMapStore();

  const [isExpanded, setIsExpanded] = useState(true);
  const [showAddLayer, setShowAddLayer] = useState(false);
  const [newLayerName, setNewLayerName] = useState('');

  const handleAddLayer = () => {
    if (!newLayerName.trim()) return;

    const newLayer = {
      id: `layer-${Date.now()}`,
      name: newLayerName,
      type: 'geojson' as const,
      visible: true,
      opacity: 1,
      color: getRandomColor(),
      data: {
        type: 'FeatureCollection',
        features: [],
      } as FeatureCollection,
    };

    addLayer(newLayer);
    setNewLayerName('');
    setShowAddLayer(false);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    layerId: string
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const geojson = JSON.parse(text) as FeatureCollection;

      useMapStore.getState().updateLayer(layerId, { data: geojson });
    } catch (error) {
      console.error('Error loading GeoJSON:', error);
      alert('Failed to load GeoJSON file. Please check the file format.');
    }
  };

  return (
    <div className="absolute top-20 left-4 bg-white rounded-lg shadow-lg z-10 w-80">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <Layers size={18} />
          <h3 className="font-semibold text-sm">Layers</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          <button
            onClick={toggleLayerControl}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-3 max-h-96 overflow-y-auto">
          {/* Add Layer Button */}
          {!showAddLayer && (
            <button
              onClick={() => setShowAddLayer(true)}
              className="w-full flex items-center justify-center gap-2 p-2 mb-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <Plus size={16} />
              <span className="text-sm font-medium">Add Layer</span>
            </button>
          )}

          {/* Add Layer Form */}
          {showAddLayer && (
            <div className="mb-3 p-3 bg-gray-50 rounded-lg">
              <input
                type="text"
                value={newLayerName}
                onChange={(e) => setNewLayerName(e.target.value)}
                placeholder="Layer name"
                className="w-full px-3 py-2 text-sm border rounded mb-2"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddLayer}
                  className="flex-1 px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowAddLayer(false);
                    setNewLayerName('');
                  }}
                  className="flex-1 px-3 py-1.5 text-sm bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Layer List */}
          {layers.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              No layers yet. Add a layer to get started.
            </div>
          ) : (
            <div className="space-y-2">
              {layers.map((layer) => (
                <div
                  key={layer.id}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  {/* Layer Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: layer.color }}
                      />
                      <span className="text-sm font-medium truncate">
                        {layer.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleLayerVisibility(layer.id)}
                        className="p-1 hover:bg-gray-200 rounded"
                        title={layer.visible ? 'Hide layer' : 'Show layer'}
                      >
                        {layer.visible ? (
                          <Eye size={16} />
                        ) : (
                          <EyeOff size={16} className="text-gray-400" />
                        )}
                      </button>
                      <button
                        onClick={() => removeLayer(layer.id)}
                        className="p-1 hover:bg-red-100 rounded text-red-600"
                        title="Delete layer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Opacity Slider */}
                  <div className="mb-2">
                    <label className="text-xs text-gray-600 mb-1 block">
                      Opacity: {Math.round(layer.opacity * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={layer.opacity * 100}
                      onChange={(e) =>
                        setLayerOpacity(layer.id, parseInt(e.target.value) / 100)
                      }
                      className="w-full h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Upload GeoJSON */}
                  <div>
                    <label className="block">
                      <input
                        type="file"
                        accept=".geojson,.json"
                        onChange={(e) => handleFileUpload(e, layer.id)}
                        className="hidden"
                      />
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-white border rounded cursor-pointer hover:bg-gray-50">
                        <Plus size={12} />
                        Upload GeoJSON
                      </span>
                    </label>
                    {layer.data && layer.data.features.length > 0 && (
                      <span className="ml-2 text-xs text-gray-500">
                        {layer.data.features.length} features
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LayerControl;
