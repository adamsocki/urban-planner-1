/**
 * Main App Component
 */

import React, { useState } from 'react';
import DocumentGenerator from './components/DocumentGenerator';
import { SettingsModal } from './components/SettingsModal';

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="app">
      <header className="app-header">
        <div className="container">
          <div className="header-content">
            <h1 className="logo">Urban Planning Platform</h1>
            <div className="header-right">
              <nav>
                <a href="#generator">Document Generator</a>
                <a href="#maps">Maps</a>
                <a href="#transit">Transit</a>
                <a href="#forecasting">Forecasting</a>
              </nav>
              <button
                className="settings-button"
                onClick={() => setIsSettingsOpen(true)}
                title="LLM Settings"
              >
                ⚙️ Settings
              </button>
            </div>
          </div>
        </div>
      </header>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <main>
        <DocumentGenerator />
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

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .logo {
          font-size: 1.5rem;
          font-weight: 700;
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
        }

        nav a:hover {
          color: white;
        }

        .settings-button {
          background-color: #4299e1;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
          white-space: nowrap;
        }

        .settings-button:hover {
          background-color: #3182ce;
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
