/**
 * Main App Component
 */

import DocumentGenerator from './components/DocumentGenerator';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="container">
          <h1 className="logo">Urban Planning Platform</h1>
          <nav>
            <a href="#generator">Document Generator</a>
            <a href="#maps">Maps</a>
            <a href="#transit">Transit</a>
            <a href="#forecasting">Forecasting</a>
          </nav>
        </div>
      </header>

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
        }

        nav a:hover {
          color: white;
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
