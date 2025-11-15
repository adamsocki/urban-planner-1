/**
 * Document Generator Component
 * Frontend UI for generating planning documents
 */

import React, { useState } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import { LLMService } from '../services/llmService';

interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  supportedFormats: string[];
}

interface DocumentData {
  title: string;
  subtitle?: string;
  author?: string;
  projectName?: string;
  executiveSummary?: string;
  introduction?: string;
  findings?: string;
  recommendations?: string;
}

export const DocumentGenerator: React.FC = () => {
  const { llmSettings, isConfigured } = useSettingsStore();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'docx'>('pdf');
  const [formData, setFormData] = useState<DocumentData>({
    title: '',
    subtitle: '',
    author: '',
    projectName: '',
    executiveSummary: '',
    introduction: '',
    findings: '',
    recommendations: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingField, setGeneratingField] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const templates: DocumentTemplate[] = [
    {
      id: 'comprehensive-plan',
      name: 'Comprehensive Plan',
      description: 'Full urban comprehensive plan with all major elements',
      type: 'comprehensive-plan',
      supportedFormats: ['pdf', 'docx'],
    },
    {
      id: 'transit-analysis',
      name: 'Transit Network Analysis',
      description: 'GTFS-based transit network analysis report',
      type: 'transit-analysis',
      supportedFormats: ['pdf', 'docx', 'html'],
    },
    {
      id: 'ridership-forecast',
      name: 'Ridership Forecast Report',
      description: 'Detailed ridership forecast for proposed transit service',
      type: 'ridership-forecast',
      supportedFormats: ['pdf', 'docx', 'xlsx'],
    },
    {
      id: 'zoning-report',
      name: 'Zoning Analysis Report',
      description: 'Parcel-level zoning compliance and analysis',
      type: 'zoning-report',
      supportedFormats: ['pdf', 'docx'],
    },
    {
      id: 'environmental-impact',
      name: 'Environmental Impact Assessment',
      description: 'Environmental impact analysis for development projects',
      type: 'environmental-impact',
      supportedFormats: ['pdf', 'docx'],
    },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerateField = async (fieldName: string) => {
    if (!isConfigured()) {
      alert('Please configure your LLM API settings first (click the Settings button in the header)');
      return;
    }

    setGeneratingField(fieldName);
    setError(null);

    try {
      const selectedTemplateObj = templates.find((t) => t.id === selectedTemplate);
      const documentType = selectedTemplateObj?.name || 'urban planning';

      const response = await LLMService.generateSection({
        section: fieldName,
        documentType,
        existingData: formData,
        apiConfig: llmSettings,
      });

      setFormData((prev) => ({ ...prev, [fieldName]: response.content }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate content');
      console.error('LLM generation error:', err);
    } finally {
      setGeneratingField(null);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.title) {
        throw new Error('Document title is required');
      }

      if (!selectedTemplate) {
        throw new Error('Please select a template');
      }

      // Prepare request data
      const requestData = {
        data: {
          ...formData,
          date: new Date(),
        },
        options: {
          format: selectedFormat,
          template: selectedTemplate,
          includeTableOfContents: true,
          includePageNumbers: true,
        },
      };

      // Call API
      const response = await fetch('http://localhost:3000/api/documents/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Generation failed');
      }

      // Download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${formData.title.replace(/[^a-z0-9]/gi, '_')}.${selectedFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Success message
      alert('Document generated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedTemplateObj = templates.find((t) => t.id === selectedTemplate);

  return (
    <div className="document-generator">
      <div className="container">
        <h1>Document Generator</h1>
        <p className="subtitle">Generate professional urban planning documents</p>

        {error && (
          <div className="alert alert-error">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="form-section">
          <h2>1. Select Template</h2>
          <div className="template-grid">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`template-card ${
                  selectedTemplate === template.id ? 'selected' : ''
                }`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <h3>{template.name}</h3>
                <p>{template.description}</p>
                <div className="formats">
                  {template.supportedFormats.map((format) => (
                    <span key={format} className="format-badge">
                      {format.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedTemplate && (
          <>
            <div className="form-section">
              <h2>2. Select Format</h2>
              <div className="format-selector">
                {selectedTemplateObj?.supportedFormats.map((format) => (
                  <button
                    key={format}
                    className={`format-button ${
                      selectedFormat === format ? 'active' : ''
                    }`}
                    onClick={() => setSelectedFormat(format as any)}
                  >
                    {format.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-section">
              <h2>3. Document Details</h2>
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="form-group">
                  <label htmlFor="title">Document Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Downtown Transit Analysis 2025"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subtitle">Subtitle</label>
                  <input
                    type="text"
                    id="subtitle"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleInputChange}
                    placeholder="Optional subtitle"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="author">Author</label>
                    <input
                      type="text"
                      id="author"
                      name="author"
                      value={formData.author}
                      onChange={handleInputChange}
                      placeholder="Your name or organization"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="projectName">Project Name</label>
                    <input
                      type="text"
                      id="projectName"
                      name="projectName"
                      value={formData.projectName}
                      onChange={handleInputChange}
                      placeholder="Associated project"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div className="field-header">
                    <label htmlFor="executiveSummary">Executive Summary</label>
                    <button
                      type="button"
                      className="ai-generate-button"
                      onClick={() => handleGenerateField('executiveSummary')}
                      disabled={generatingField !== null}
                      title="Generate with AI"
                    >
                      {generatingField === 'executiveSummary' ? (
                        <>
                          <span className="spinner-small"></span>
                          Generating...
                        </>
                      ) : (
                        <>
                          ✨ Generate with AI
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    id="executiveSummary"
                    name="executiveSummary"
                    value={formData.executiveSummary}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Brief overview of the document..."
                  />
                </div>

                <div className="form-group">
                  <div className="field-header">
                    <label htmlFor="introduction">Introduction</label>
                    <button
                      type="button"
                      className="ai-generate-button"
                      onClick={() => handleGenerateField('introduction')}
                      disabled={generatingField !== null}
                      title="Generate with AI"
                    >
                      {generatingField === 'introduction' ? (
                        <>
                          <span className="spinner-small"></span>
                          Generating...
                        </>
                      ) : (
                        <>
                          ✨ Generate with AI
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    id="introduction"
                    name="introduction"
                    value={formData.introduction}
                    onChange={handleInputChange}
                    rows={6}
                    placeholder="Introduce the purpose and scope..."
                  />
                </div>

                <div className="form-group">
                  <div className="field-header">
                    <label htmlFor="findings">Findings</label>
                    <button
                      type="button"
                      className="ai-generate-button"
                      onClick={() => handleGenerateField('findings')}
                      disabled={generatingField !== null}
                      title="Generate with AI"
                    >
                      {generatingField === 'findings' ? (
                        <>
                          <span className="spinner-small"></span>
                          Generating...
                        </>
                      ) : (
                        <>
                          ✨ Generate with AI
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    id="findings"
                    name="findings"
                    value={formData.findings}
                    onChange={handleInputChange}
                    rows={8}
                    placeholder="Key findings and analysis..."
                  />
                </div>

                <div className="form-group">
                  <div className="field-header">
                    <label htmlFor="recommendations">Recommendations</label>
                    <button
                      type="button"
                      className="ai-generate-button"
                      onClick={() => handleGenerateField('recommendations')}
                      disabled={generatingField !== null}
                      title="Generate with AI"
                    >
                      {generatingField === 'recommendations' ? (
                        <>
                          <span className="spinner-small"></span>
                          Generating...
                        </>
                      ) : (
                        <>
                          ✨ Generate with AI
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    id="recommendations"
                    name="recommendations"
                    value={formData.recommendations}
                    onChange={handleInputChange}
                    rows={6}
                    placeholder="Recommended actions and next steps..."
                  />
                </div>
              </form>
            </div>

            <div className="form-section">
              <h2>4. Generate Document</h2>
              <button
                className="generate-button"
                onClick={handleGenerate}
                disabled={isGenerating || !formData.title}
              >
                {isGenerating ? (
                  <>
                    <span className="spinner"></span>
                    Generating...
                  </>
                ) : (
                  `Generate ${selectedFormat.toUpperCase()}`
                )}
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        .document-generator {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          color: #1a202c;
        }

        .subtitle {
          font-size: 1.125rem;
          color: #718096;
          margin-bottom: 2rem;
        }

        .alert {
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .alert-error {
          background-color: #fed7d7;
          color: #9b2c2c;
          border: 1px solid #fc8181;
        }

        .form-section {
          margin-bottom: 3rem;
        }

        .form-section h2 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: #2d3748;
        }

        .template-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1rem;
        }

        .template-card {
          border: 2px solid #e2e8f0;
          border-radius: 0.5rem;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .template-card:hover {
          border-color: #4299e1;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .template-card.selected {
          border-color: #3182ce;
          background-color: #ebf8ff;
        }

        .template-card h3 {
          font-size: 1.125rem;
          margin-bottom: 0.5rem;
          color: #2d3748;
        }

        .template-card p {
          font-size: 0.875rem;
          color: #718096;
          margin-bottom: 1rem;
        }

        .formats {
          display: flex;
          gap: 0.5rem;
        }

        .format-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          background-color: #edf2f7;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: #4a5568;
        }

        .format-selector {
          display: flex;
          gap: 1rem;
        }

        .format-button {
          padding: 0.75rem 1.5rem;
          border: 2px solid #e2e8f0;
          border-radius: 0.5rem;
          background-color: white;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }

        .format-button:hover {
          border-color: #4299e1;
        }

        .format-button.active {
          border-color: #3182ce;
          background-color: #3182ce;
          color: white;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .field-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        label {
          display: block;
          font-weight: 600;
          color: #2d3748;
          margin: 0;
        }

        .ai-generate-button {
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          white-space: nowrap;
        }

        .ai-generate-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .ai-generate-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        input,
        textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        input:focus,
        textarea:focus {
          outline: none;
          border-color: #4299e1;
          box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
        }

        textarea {
          resize: vertical;
          font-family: inherit;
        }

        .generate-button {
          padding: 1rem 2rem;
          background-color: #3182ce;
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-size: 1.125rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .generate-button:hover:not(:disabled) {
          background-color: #2c5aa0;
        }

        .generate-button:disabled {
          background-color: #cbd5e0;
          cursor: not-allowed;
        }

        .spinner {
          display: inline-block;
          width: 1rem;
          height: 1rem;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        .spinner-small {
          display: inline-block;
          width: 0.875rem;
          height: 0.875rem;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default DocumentGenerator;
