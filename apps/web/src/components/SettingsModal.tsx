import React, { useState } from 'react';
import { useSettingsStore } from '../stores/settingsStore';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { llmSettings, setLLMSettings } = useSettingsStore();
  const [formData, setFormData] = useState(llmSettings);
  const [showApiKey, setShowApiKey] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setLLMSettings(formData);
    onClose();
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>LLM API Settings</h2>
          <button onClick={onClose} style={styles.closeButton}>
            ×
          </button>
        </div>

        <div style={styles.body}>
          <div style={styles.formGroup}>
            <label style={styles.label}>API Endpoint</label>
            <input
              type="text"
              value={formData.apiEndpoint}
              onChange={(e) => handleChange('apiEndpoint', e.target.value)}
              style={styles.input}
              placeholder="https://api.openai.com/v1/chat/completions"
            />
            <span style={styles.hint}>OpenAI, Anthropic, or compatible endpoint</span>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>API Key</label>
            <div style={styles.passwordGroup}>
              <input
                type={showApiKey ? 'text' : 'password'}
                value={formData.apiKey}
                onChange={(e) => handleChange('apiKey', e.target.value)}
                style={styles.input}
                placeholder="sk-..."
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                style={styles.toggleButton}
              >
                {showApiKey ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <span style={styles.hint}>Your API key will be stored locally</span>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Model</label>
            <input
              type="text"
              value={formData.model}
              onChange={(e) => handleChange('model', e.target.value)}
              style={styles.input}
              placeholder="gpt-4"
            />
            <span style={styles.hint}>e.g., gpt-4, gpt-3.5-turbo, claude-3-opus</span>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Temperature</label>
              <input
                type="number"
                min="0"
                max="2"
                step="0.1"
                value={formData.temperature}
                onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
                style={styles.input}
              />
              <span style={styles.hint}>0.0 - 2.0</span>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Max Tokens</label>
              <input
                type="number"
                min="100"
                max="4000"
                step="100"
                value={formData.maxTokens}
                onChange={(e) => handleChange('maxTokens', parseInt(e.target.value))}
                style={styles.input}
              />
              <span style={styles.hint}>100 - 4000</span>
            </div>
          </div>
        </div>

        <div style={styles.footer}>
          <button onClick={onClose} style={styles.cancelButton}>
            Cancel
          </button>
          <button onClick={handleSave} style={styles.saveButton}>
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  header: {
    padding: '20px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1a202c',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '32px',
    cursor: 'pointer',
    color: '#718096',
    padding: '0',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: '20px',
  },
  formGroup: {
    marginBottom: '20px',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#2d3748',
    fontSize: '14px',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #cbd5e0',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  passwordGroup: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  toggleButton: {
    position: 'absolute',
    right: '8px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
    padding: '4px',
  },
  hint: {
    display: 'block',
    marginTop: '4px',
    fontSize: '12px',
    color: '#718096',
  },
  footer: {
    padding: '20px',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
  },
  cancelButton: {
    padding: '10px 20px',
    border: '1px solid #cbd5e0',
    borderRadius: '4px',
    backgroundColor: 'white',
    color: '#2d3748',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  saveButton: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: '#3182ce',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
};
