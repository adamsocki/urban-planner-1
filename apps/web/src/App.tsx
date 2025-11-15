/**
 * Main App Component
 */

import React, { useState } from 'react';
import DocumentGenerator from './components/DocumentGenerator';
import CensusDataTool from './components/CensusDataTool';

type View = 'generator' | 'census' | 'maps' | 'transit' | 'forecasting';

function App() {
  const [activeView, setActiveView] = useState<View>('census');

  return (
    <div className="app">
      <header className="app-header">
        <div className="container">
          <h1 className="logo">Urban Planning Platform</h1>
          <nav>
            <a
              href="#generator"
              onClick={(e) => { e.preventDefault(); setActiveView('generator'); }}
              className={activeView === 'generator' ? 'active' : ''}
            >
              Document Generator
            </a>
            <a
              href="#census"
              onClick={(e) => { e.preventDefault(); setActiveView('census'); }}
              className={activeView === 'census' ? 'active' : ''}
            >
              Census Data
            </a>
            <a
              href="#maps"
              onClick={(e) => { e.preventDefault(); setActiveView('maps'); }}
              className={activeView === 'maps' ? 'active' : ''}
            >
              Maps
            </a>
            <a
              href="#transit"
              onClick={(e) => { e.preventDefault(); setActiveView('transit'); }}
              className={activeView === 'transit' ? 'active' : ''}
            >
              Transit
            </a>
            <a
              href="#forecasting"
              onClick={(e) => { e.preventDefault(); setActiveView('forecasting'); }}
              className={activeView === 'forecasting' ? 'active' : ''}
            >
              Forecasting
            </a>
          </nav>
        </div>
      </header>

      <main style={{ padding: activeView === 'census' ? 0 : '2rem 0' }}>
        {activeView === 'generator' && <DocumentGenerator />}
        {activeView === 'census' && <CensusDataTool />}
        {activeView === 'maps' && (
          <div className="container">
            <h2>Maps - Coming Soon</h2>
          </div>
        )}
        {activeView === 'transit' && (
          <div className="container">
            <h2>Transit - Coming Soon</h2>
          </div>
        )}
        {activeView === 'forecasting' && (
          <div className="container">
            <h2>Forecasting - Coming Soon</h2>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <div className="container">
          <p>&copy; 2025 Urban Planning Platform. Built with React, TypeScript, and Mapbox.</p>
        </div>
      </footer>

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
        }

        .container {
          max-width: 1200px;
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
          gap: 2rem;
        }

        nav a {
          color: #cbd5e0;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
          cursor: pointer;
        }

        nav a:hover {
          color: white;
        }

        nav a.active {
          color: white;
          border-bottom: 2px solid #4299e1;
          padding-bottom: 4px;
        }

        main {
          flex: 1;
          padding: 2rem 0;
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
