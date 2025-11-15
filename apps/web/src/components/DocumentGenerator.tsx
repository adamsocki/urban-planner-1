/**
 * Document Generator Component
 * Frontend UI for generating planning documents
 */

import React, { useState } from 'react';

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
                  <label htmlFor="executiveSummary">Executive Summary</label>
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
                  <label htmlFor="introduction">Introduction</label>
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
                  <label htmlFor="findings">Findings</label>
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
                  <label htmlFor="recommendations">Recommendations</label>
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
          padding: var(--spacing-large);
          max-width: 1200px;
          margin: 0 auto;
        }

        .document-generator h1 {
          font-family: var(--typography-headingFamily);
          font-weight: var(--typography-headingWeight);
          font-size: 2.5rem;
          margin-bottom: var(--spacing-small);
          color: var(--color-text);
        }

        .subtitle {
          font-size: 1.125rem;
          color: var(--color-textSecondary);
          margin-bottom: var(--spacing-large);
        }

        .alert {
          padding: var(--spacing-medium);
          border-radius: var(--radius-medium);
          margin-bottom: var(--spacing-medium);
          backdrop-filter: blur(var(--effect-blur, 0px));
        }

        .alert-error {
          background-color: var(--color-error);
          color: var(--color-textInverse);
          border: 2px solid var(--color-border);
          box-shadow: var(--shadow-medium);
        }

        .alert-error strong {
          font-weight: 700;
        }

        .form-section {
          margin-bottom: var(--spacing-xlarge);
        }

        .form-section h2 {
          font-family: var(--typography-headingFamily);
          font-weight: var(--typography-headingWeight);
          font-size: 1.75rem;
          margin-bottom: var(--spacing-medium);
          color: var(--color-text);
          border-bottom: 3px solid var(--color-primary);
          padding-bottom: var(--spacing-small);
        }

        .template-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: var(--spacing-medium);
        }

        .template-card {
          border: 2px solid var(--color-borderLight);
          border-radius: var(--radius-large);
          padding: var(--spacing-medium);
          cursor: pointer;
          transition: var(--effect-transition);
          background: var(--color-surface);
          backdrop-filter: blur(var(--effect-blur, 0px));
          box-shadow: var(--shadow-small);
        }

        .template-card:hover {
          border-color: var(--color-primary);
          box-shadow: var(--shadow-hover);
          transform: translateY(-4px);
        }

        .template-card.selected {
          border-color: var(--color-primary);
          background: var(--color-surfaceHover);
          box-shadow: var(--shadow-medium);
          border-width: 3px;
        }

        .template-card h3 {
          font-family: var(--typography-headingFamily);
          font-weight: var(--typography-headingWeight);
          font-size: 1.25rem;
          margin-bottom: var(--spacing-base);
          color: var(--color-text);
        }

        .template-card p {
          font-size: 0.95rem;
          color: var(--color-textSecondary);
          margin-bottom: var(--spacing-medium);
          line-height: 1.5;
        }

        .formats {
          display: flex;
          gap: var(--spacing-base);
          flex-wrap: wrap;
        }

        .format-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: var(--color-accent);
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--color-textInverse);
          border: 1px solid var(--color-border);
          box-shadow: var(--shadow-small);
        }

        .format-selector {
          display: flex;
          gap: var(--spacing-medium);
          flex-wrap: wrap;
        }

        .format-button {
          padding: var(--spacing-small) var(--spacing-medium);
          border: 2px solid var(--color-border);
          border-radius: var(--radius-medium);
          background: var(--color-surface);
          cursor: pointer;
          font-weight: 600;
          font-family: var(--typography-fontFamily);
          transition: var(--effect-transition);
          color: var(--color-text);
          box-shadow: var(--shadow-small);
        }

        .format-button:hover {
          border-color: var(--color-primary);
          transform: translateY(-2px);
          box-shadow: var(--shadow-hover);
        }

        .format-button.active {
          border-color: var(--color-primary);
          background: var(--color-primary);
          color: var(--color-textInverse);
          box-shadow: var(--shadow-medium);
        }

        .form-group {
          margin-bottom: var(--spacing-medium);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-medium);
        }

        label {
          display: block;
          margin-bottom: var(--spacing-base);
          font-weight: 600;
          color: var(--color-text);
          font-family: var(--typography-fontFamily);
        }

        input,
        textarea {
          width: 100%;
          padding: var(--spacing-small);
          border: 2px solid var(--color-borderLight);
          border-radius: var(--radius-medium);
          font-size: 1rem;
          font-family: var(--typography-fontFamily);
          transition: var(--effect-transition);
          background: var(--color-surface);
          color: var(--color-text);
          backdrop-filter: blur(var(--effect-blur, 0px));
        }

        input:focus,
        textarea:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: var(--shadow-hover);
        }

        input::placeholder,
        textarea::placeholder {
          color: var(--color-textSecondary);
          opacity: 0.7;
        }

        textarea {
          resize: vertical;
          font-family: var(--typography-fontFamily);
        }

        .generate-button {
          padding: var(--spacing-medium) var(--spacing-large);
          background: var(--color-primary);
          color: var(--color-textInverse);
          border: 2px solid var(--color-border);
          border-radius: var(--radius-large);
          font-size: 1.25rem;
          font-weight: 700;
          font-family: var(--typography-headingFamily);
          cursor: pointer;
          transition: var(--effect-transition);
          display: flex;
          align-items: center;
          gap: var(--spacing-small);
          box-shadow: var(--shadow-medium);
        }

        .generate-button:hover:not(:disabled) {
          background: var(--color-primaryDark);
          transform: translateY(-2px);
          box-shadow: var(--shadow-large);
        }

        .generate-button:disabled {
          background: var(--color-borderLight);
          color: var(--color-textSecondary);
          cursor: not-allowed;
          opacity: 0.6;
        }

        .spinner {
          display: inline-block;
          width: 1rem;
          height: 1rem;
          border: 2px solid var(--color-textInverse);
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .document-generator {
            padding: var(--spacing-medium);
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .template-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default DocumentGenerator;
