/**
 * Main App Component
 */

import DocumentGenerator from './components/DocumentGenerator';
import ThemeSwitcher from './components/ThemeSwitcher';
import { useTheme } from './contexts/ThemeContext';

function App() {
  const { theme } = useTheme();

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

      <ThemeSwitcher />

      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: var(--typography-fontFamily);
          font-weight: var(--typography-bodyWeight);
          font-size: var(--typography-baseFontSize);
          letter-spacing: var(--typography-letterSpacing);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          background: var(--color-background);
          color: var(--color-text);
          transition: var(--effect-transition);
        }

        ${theme.effects.pattern ? `
        body::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: ${theme.effects.pattern};
          pointer-events: none;
          z-index: 0;
        }
        ` : ''}

        .app {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          position: relative;
          z-index: 1;
        }

        .app-header {
          background: var(--color-primary);
          color: var(--color-textInverse);
          padding: var(--spacing-medium) 0;
          box-shadow: var(--shadow-medium);
          border-bottom: 2px solid var(--color-border);
          backdrop-filter: blur(var(--effect-blur, 0px));
          transition: var(--effect-transition);
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 var(--spacing-medium);
        }

        .logo {
          font-family: var(--typography-headingFamily);
          font-weight: var(--typography-headingWeight);
          font-size: 2rem;
          margin-bottom: var(--spacing-small);
          letter-spacing: var(--typography-letterSpacing);
        }

        nav {
          display: flex;
          gap: var(--spacing-medium);
          flex-wrap: wrap;
        }

        nav a {
          color: var(--color-textInverse);
          text-decoration: none;
          font-weight: 500;
          transition: var(--effect-transition);
          padding: var(--spacing-base) var(--spacing-small);
          border-radius: var(--radius-small);
          border: 2px solid transparent;
        }

        nav a:hover {
          background: var(--color-primaryLight);
          border-color: var(--color-accent);
          transform: translateY(-2px);
          box-shadow: var(--shadow-hover);
        }

        main {
          flex: 1;
          padding: var(--spacing-large) 0;
          background: var(--color-backgroundSecondary);
        }

        .app-footer {
          background: var(--color-primaryDark);
          color: var(--color-textInverse);
          padding: var(--spacing-large) 0;
          margin-top: var(--spacing-xlarge);
          border-top: 2px solid var(--color-border);
        }

        .app-footer p {
          text-align: center;
          opacity: 0.9;
        }

        @media (max-width: 768px) {
          .logo {
            font-size: 1.5rem;
          }

          nav {
            gap: var(--spacing-small);
          }

          nav a {
            font-size: 14px;
            padding: var(--spacing-base);
          }
        }
      `}</style>
    </div>
  );
}

export default App;
