/**
 * Main App Component
 */

import React, { useState } from 'react';
import DocumentGenerator from './components/DocumentGenerator';
import MapCanvas from './components/MapCanvas';
import { useMapStore } from './stores/mapStore';
import { Map, FileText, Layers, Pencil, Info, Bus } from 'lucide-react';

type Tab = 'map' | 'documents';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('map');
  const {
    toggleLayerControl,
    toggleDrawingTools,
    toggleFeatureInfo,
    toggleGTFSViewer,
    showLayerControl,
    showDrawingTools,
    showFeatureInfo,
    showGTFSViewer,
  } = useMapStore();

  return (
    <div className="app">
      <header className="app-header">
        <div className="container">
          <h1 className="logo">Urban Planning Platform</h1>
          <nav>
            <button
              onClick={() => setActiveTab('map')}
              className={activeTab === 'map' ? 'active' : ''}
            >
              <Map size={16} />
              Maps
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={activeTab === 'documents' ? 'active' : ''}
            >
              <FileText size={16} />
              Documents
            </button>
          </nav>
        </div>
      </header>

      {activeTab === 'map' && (
        <div className="map-toolbar">
          <div className="container">
            <div className="toolbar-buttons">
              <button
                onClick={toggleLayerControl}
                className={showLayerControl ? 'active' : ''}
                title="Toggle Layer Control"
              >
                <Layers size={16} />
                Layers
              </button>
              <button
                onClick={toggleDrawingTools}
                className={showDrawingTools ? 'active' : ''}
                title="Toggle Drawing Tools"
              >
                <Pencil size={16} />
                Draw
              </button>
              <button
                onClick={toggleFeatureInfo}
                className={showFeatureInfo ? 'active' : ''}
                title="Toggle Feature Info"
              >
                <Info size={16} />
                Info
              </button>
              <button
                onClick={toggleGTFSViewer}
                className={showGTFSViewer ? 'active' : ''}
                title="Toggle GTFS Viewer"
              >
                <Bus size={16} />
                Transit
              </button>
            </div>
          </div>
        </div>
      )}

      <main className={activeTab === 'map' ? 'no-padding' : ''}>
        {activeTab === 'map' ? <MapCanvas /> : <DocumentGenerator />}
      </main>

      {activeTab !== 'map' && (
        <footer className="app-footer">
          <div className="container">
            <p>&copy; 2025 Urban Planning Platform. Built with React, TypeScript, and Mapbox.</p>
          </div>
        </footer>
      )}

      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
            'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
            sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          background-color: #f7fafc;
        }

        .app {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .app-header {
          background-color: #2d3748;
          color: white;
          padding: 1rem 0;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          position: relative;
          z-index: 1000;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .logo {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        nav {
          display: flex;
          gap: 1rem;
        }

        nav button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #cbd5e0;
          background: none;
          border: none;
          font-weight: 500;
          padding: 0.5rem 1rem;
          cursor: pointer;
          transition: all 0.2s;
          border-radius: 0.375rem;
        }

        nav button:hover {
          color: white;
          background-color: rgba(255, 255, 255, 0.1);
        }

        nav button.active {
          color: white;
          background-color: rgba(255, 255, 255, 0.15);
        }

        .map-toolbar {
          background-color: #f7fafc;
          border-bottom: 1px solid #e2e8f0;
          padding: 0.75rem 0;
          position: relative;
          z-index: 999;
        }

        .toolbar-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .toolbar-buttons button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background-color: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #4a5568;
          cursor: pointer;
          transition: all 0.2s;
        }

        .toolbar-buttons button:hover {
          background-color: #f7fafc;
          border-color: #cbd5e0;
        }

        .toolbar-buttons button.active {
          background-color: #3b82f6;
          border-color: #3b82f6;
          color: white;
        }

        main {
          flex: 1;
          padding: 2rem 0;
        }

        main.no-padding {
          padding: 0;
        }

        .app-footer {
          background-color: #2d3748;
          color: #cbd5e0;
          padding: 2rem 0;
          margin-top: 4rem;
        }

        .app-footer p {
          text-align: center;
        }
      `}</style>
    </div>
  );
}

export default App;
