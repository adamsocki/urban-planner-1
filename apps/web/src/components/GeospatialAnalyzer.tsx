/**
 * AI-Powered Geospatial Analyzer Component
 * Natural language queries for transit network analysis
 */

import React, { useState } from 'react';
import { useSettingsStore } from '../stores/settingsStore';

interface StopPoint {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

interface RouteData {
  id: string;
  name: string;
  coordinates: [number, number][];
}

interface QueryResult {
  query: string;
  insights: string;
  recommendations: string[];
  metrics: Record<string, any>;
  visualizations?: string[];
}

const EXAMPLE_QUERIES = [
  {
    type: 'coverage' as const,
    text: 'Analyze the transit coverage in the network',
  },
  {
    type: 'accessibility' as const,
    text: 'How accessible is transit from downtown?',
  },
  {
    type: 'connectivity' as const,
    text: 'Evaluate network connectivity and transfer opportunities',
  },
  {
    type: 'optimization' as const,
    text: 'Suggest improvements to optimize the transit network',
  },
];

export const GeospatialAnalyzer: React.FC = () => {
  const { llmSettings, isConfigured } = useSettingsStore();
  const [query, setQuery] = useState('');
  const [queryType, setQueryType] = useState<'coverage' | 'accessibility' | 'connectivity' | 'optimization' | 'general'>('general');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sample data for demonstration
  const [sampleStops] = useState<StopPoint[]>([
    { id: '1', name: 'Main Station', lat: 40.7580, lon: -73.9855 },
    { id: '2', name: 'Central Plaza', lat: 40.7614, lon: -73.9776 },
    { id: '3', name: 'Park Avenue', lat: 40.7527, lon: -73.9772 },
    { id: '4', name: 'Union Square', lat: 40.7359, lon: -73.9911 },
  ]);

  const [sampleRoutes] = useState<RouteData[]>([
    {
      id: 'R1',
      name: 'Route 1',
      coordinates: [
        [-73.9855, 40.7580],
        [-73.9776, 40.7614],
        [-73.9772, 40.7527],
      ],
    },
    {
      id: 'R2',
      name: 'Route 2',
      coordinates: [
        [-73.9911, 40.7359],
        [-73.9772, 40.7527],
      ],
    },
  ]);

  const handleAnalyze = async () => {
    if (!isConfigured()) {
      alert('Please configure your LLM API settings first');
      return;
    }

    if (!query.trim()) {
      setError('Please enter a query');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('http://localhost:3000/api/geospatial/ai/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: {
            type: queryType,
            question: query,
            context: {
              stops: sampleStops,
              routes: sampleRoutes,
            },
          },
          llmConfig: llmSettings,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Analysis failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Geospatial analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExampleQuery = (example: typeof EXAMPLE_QUERIES[0]) => {
    setQuery(example.text);
    setQueryType(example.type);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>AI-Powered Geospatial Analysis</h2>
        <p style={styles.subtitle}>
          Ask questions about transit coverage, accessibility, connectivity, and optimization
        </p>
      </div>

      {!isConfigured() && (
        <div style={styles.warningBanner}>
          ⚠️ Please configure your LLM API settings in the Settings menu to use this feature
        </div>
      )}

      <div style={styles.querySection}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Query Type</label>
          <select
            value={queryType}
            onChange={(e) => setQueryType(e.target.value as any)}
            style={styles.select}
          >
            <option value="general">General Analysis</option>
            <option value="coverage">Coverage Analysis</option>
            <option value="accessibility">Accessibility Analysis</option>
            <option value="connectivity">Connectivity Analysis</option>
            <option value="optimization">Optimization Suggestions</option>
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Your Question</label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., How well does the transit network serve the downtown area?"
            rows={3}
            style={styles.textarea}
          />
        </div>

        <div style={styles.examplesSection}>
          <label style={styles.label}>Example Queries:</label>
          <div style={styles.exampleButtons}>
            {EXAMPLE_QUERIES.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleQuery(example)}
                style={styles.exampleButton}
              >
                {example.text}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !isConfigured()}
          style={{
            ...styles.analyzeButton,
            ...(isAnalyzing || !isConfigured() ? styles.analyzeButtonDisabled : {}),
          }}
        >
          {isAnalyzing ? (
            <>
              <span style={styles.spinner}></span>
              Analyzing...
            </>
          ) : (
            <>
              🧠 Analyze with AI
            </>
          )}
        </button>
      </div>

      {error && (
        <div style={styles.errorBox}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div style={styles.resultsSection}>
          <h3 style={styles.resultsTitle}>Analysis Results</h3>

          <div style={styles.resultCard}>
            <h4 style={styles.cardTitle}>Query</h4>
            <p style={styles.cardText}>{result.query}</p>
          </div>

          <div style={styles.resultCard}>
            <h4 style={styles.cardTitle}>Insights</h4>
            <div style={styles.cardText}>
              {result.insights.split('\n').map((line, i) => (
                <p key={i} style={{ marginBottom: '0.5rem' }}>
                  {line}
                </p>
              ))}
            </div>
          </div>

          {result.recommendations && result.recommendations.length > 0 && (
            <div style={styles.resultCard}>
              <h4 style={styles.cardTitle}>Recommendations</h4>
              <ul style={styles.recommendationsList}>
                {result.recommendations.map((rec, index) => (
                  <li key={index} style={styles.recommendationItem}>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.metrics && Object.keys(result.metrics).length > 0 && (
            <div style={styles.resultCard}>
              <h4 style={styles.cardTitle}>Key Metrics</h4>
              <div style={styles.metricsGrid}>
                {Object.entries(result.metrics).map(([key, value]) => (
                  <div key={key} style={styles.metricItem}>
                    <span style={styles.metricLabel}>{key}:</span>
                    <span style={styles.metricValue}>
                      {typeof value === 'number'
                        ? value.toFixed(2)
                        : JSON.stringify(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.visualizations && result.visualizations.length > 0 && (
            <div style={styles.resultCard}>
              <h4 style={styles.cardTitle}>Suggested Visualizations</h4>
              <div style={styles.visualizationTags}>
                {result.visualizations.map((viz, index) => (
                  <span key={index} style={styles.vizTag}>
                    {viz.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1a202c',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '1.125rem',
    color: '#718096',
  },
  warningBanner: {
    backgroundColor: '#fef3c7',
    border: '1px solid #f59e0b',
    color: '#92400e',
    padding: '1rem',
    borderRadius: '0.5rem',
    marginBottom: '1.5rem',
  },
  querySection: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    marginBottom: '2rem',
  },
  formGroup: {
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '600',
    color: '#2d3748',
  },
  select: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #e2e8f0',
    borderRadius: '0.375rem',
    fontSize: '1rem',
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #e2e8f0',
    borderRadius: '0.375rem',
    fontSize: '1rem',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  examplesSection: {
    marginBottom: '1.5rem',
  },
  exampleButtons: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  exampleButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#f7fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  analyzeButton: {
    width: '100%',
    padding: '1rem 2rem',
    backgroundColor: '#3182ce',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '1.125rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    transition: 'background-color 0.2s',
  },
  analyzeButtonDisabled: {
    backgroundColor: '#cbd5e0',
    cursor: 'not-allowed',
  },
  spinner: {
    display: 'inline-block',
    width: '1rem',
    height: '1rem',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTopColor: 'white',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
  },
  errorBox: {
    backgroundColor: '#fed7d7',
    color: '#9b2c2c',
    border: '1px solid #fc8181',
    padding: '1rem',
    borderRadius: '0.5rem',
    marginBottom: '1.5rem',
  },
  resultsSection: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  resultsTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1a202c',
    marginBottom: '1.5rem',
  },
  resultCard: {
    backgroundColor: '#f7fafc',
    padding: '1.5rem',
    borderRadius: '0.5rem',
    marginBottom: '1rem',
  },
  cardTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '1rem',
  },
  cardText: {
    color: '#4a5568',
    lineHeight: '1.6',
  },
  recommendationsList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  recommendationItem: {
    padding: '0.75rem',
    backgroundColor: 'white',
    borderLeft: '4px solid #3182ce',
    marginBottom: '0.5rem',
    borderRadius: '0.25rem',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  },
  metricItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  metricLabel: {
    fontSize: '0.875rem',
    color: '#718096',
    fontWeight: '500',
  },
  metricValue: {
    fontSize: '1.125rem',
    color: '#2d3748',
    fontWeight: '600',
  },
  visualizationTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  vizTag: {
    padding: '0.5rem 1rem',
    backgroundColor: '#e6fffa',
    color: '#047857',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
};

export default GeospatialAnalyzer;
