/**
 * Main App Component
 */

import { useState } from 'react';
import DocumentGenerator from './components/DocumentGenerator';
import ThemeSwitcher from './components/ThemeSwitcher';
import { useTheme } from './contexts/ThemeContext';

function App() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'map' | 'documents'>('documents');

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: theme.colors.background,
      color: theme.colors.text 
    }}>
      <header style={{ 
        padding: '1.5rem', 
        backgroundColor: theme.colors.primary,
        color: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold',
            marginBottom: '1rem'
          }}>
            🏙️ Urban Planning Platform
          </h1>
          <nav style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setActiveTab('map')}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: activeTab === 'map' ? 'rgba(255,255,255,0.2)' : 'transparent',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              🗺️ Maps
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: activeTab === 'documents' ? 'rgba(255,255,255,0.2)' : 'transparent',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              📄 Documents
            </button>
          </nav>
        </div>
      </header>

      <main style={{ padding: '2rem 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
          {activeTab === 'map' ? (
            <div style={{ 
              padding: '3rem',
              backgroundColor: theme.colors.surface,
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
                🗺️ Interactive Map View
              </h2>
              <p style={{ color: theme.colors.textSecondary }}>
                Map visualization coming soon! This will include GIS mapping, GTFS transit routes,
                and interactive planning tools.
              </p>
            </div>
          ) : (
            <DocumentGenerator />
          )}
        </div>
      </main>

      <footer style={{ 
        padding: '2rem',
        backgroundColor: theme.colors.surface,
        borderTop: `1px solid ${theme.colors.border}`,
        marginTop: '3rem',
        textAlign: 'center',
        color: theme.colors.textSecondary
      }}>
        <p>&copy; 2025 Urban Planning Platform. Built with React, TypeScript, and Vite.</p>
      </footer>

      <ThemeSwitcher />
    </div>
  );
}

export default App;
