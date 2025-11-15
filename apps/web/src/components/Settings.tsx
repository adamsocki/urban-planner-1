/**
 * Settings Component
 * Comprehensive settings page for the Urban Planning Platform
 */

import React, { useState } from 'react';
import { useSettingsStore } from '../stores/settingsStore';

type SettingsTab = 'general' | 'map' | 'data' | 'documents' | 'notifications' | 'accessibility';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const {
    userPreferences,
    mapSettings,
    dataSettings,
    documentSettings,
    notificationSettings,
    accessibilitySettings,
    updateUserPreferences,
    updateMapSettings,
    updateDataSettings,
    updateDocumentSettings,
    updateNotificationSettings,
    updateAccessibilitySettings,
    resetSettings,
    resetSection,
    exportSettings,
    importSettings,
  } = useSettingsStore();

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleExport = () => {
    const json = exportSettings();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `urban-planner-settings-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportModal(false);
    showNotification('success', 'Settings exported successfully!');
  };

  const handleImport = () => {
    try {
      importSettings(importText);
      setShowImportModal(false);
      setImportText('');
      showNotification('success', 'Settings imported successfully!');
    } catch (error) {
      showNotification('error', 'Failed to import settings. Please check the format.');
    }
  };

  const handleResetAll = () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      resetSettings();
      showNotification('success', 'All settings have been reset to defaults.');
    }
  };

  const handleResetSection = (section: string) => {
    if (window.confirm(`Reset ${section} settings to defaults?`)) {
      resetSection(section as any);
      showNotification('success', `${section} settings have been reset.`);
    }
  };

  const tabs = [
    { id: 'general' as const, label: 'General', icon: '⚙️' },
    { id: 'map' as const, label: 'Map', icon: '🗺️' },
    { id: 'data' as const, label: 'Data', icon: '💾' },
    { id: 'documents' as const, label: 'Documents', icon: '📄' },
    { id: 'notifications' as const, label: 'Notifications', icon: '🔔' },
    { id: 'accessibility' as const, label: 'Accessibility', icon: '♿' },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Settings</h1>
        <p style={styles.subtitle}>Customize your Urban Planning Platform experience</p>
      </div>

      {notification && (
        <div style={{
          ...styles.notification,
          backgroundColor: notification.type === 'success' ? '#48bb78' : '#f56565',
        }}>
          {notification.message}
        </div>
      )}

      <div style={styles.content}>
        {/* Sidebar */}
        <div style={styles.sidebar}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...styles.tabButton,
                ...(activeTab === tab.id ? styles.tabButtonActive : {}),
              }}
            >
              <span style={styles.tabIcon}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}

          <div style={styles.sidebarActions}>
            <button onClick={() => setShowExportModal(true)} style={styles.actionButton}>
              📤 Export Settings
            </button>
            <button onClick={() => setShowImportModal(true)} style={styles.actionButton}>
              📥 Import Settings
            </button>
            <button onClick={handleResetAll} style={styles.resetButton}>
              🔄 Reset All
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div style={styles.mainContent}>
          {activeTab === 'general' && (
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>General Preferences</h2>
                <button onClick={() => handleResetSection('userPreferences')} style={styles.resetSectionButton}>
                  Reset Section
                </button>
              </div>

              <div style={styles.settingGroup}>
                <label style={styles.label}>
                  Theme
                  <select
                    value={userPreferences.theme}
                    onChange={(e) => updateUserPreferences({ theme: e.target.value as any })}
                    style={styles.select}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto (System)</option>
                  </select>
                </label>

                <label style={styles.label}>
                  Language
                  <select
                    value={userPreferences.language}
                    onChange={(e) => updateUserPreferences({ language: e.target.value as any })}
                    style={styles.select}
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                  </select>
                </label>

                <label style={styles.label}>
                  Measurement Units
                  <select
                    value={userPreferences.measurementUnit}
                    onChange={(e) => updateUserPreferences({ measurementUnit: e.target.value as any })}
                    style={styles.select}
                  >
                    <option value="metric">Metric (km, m)</option>
                    <option value="imperial">Imperial (mi, ft)</option>
                  </select>
                </label>

                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={userPreferences.autoSave}
                    onChange={(e) => updateUserPreferences({ autoSave: e.target.checked })}
                    style={styles.checkbox}
                  />
                  <span>Enable auto-save</span>
                </label>

                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={userPreferences.compactView}
                    onChange={(e) => updateUserPreferences({ compactView: e.target.checked })}
                    style={styles.checkbox}
                  />
                  <span>Compact view</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'map' && (
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>Map Settings</h2>
                <button onClick={() => handleResetSection('mapSettings')} style={styles.resetSectionButton}>
                  Reset Section
                </button>
              </div>

              <div style={styles.settingGroup}>
                <label style={styles.label}>
                  Default Map Style
                  <select
                    value={mapSettings.defaultStyle}
                    onChange={(e) => updateMapSettings({ defaultStyle: e.target.value as any })}
                    style={styles.select}
                  >
                    <option value="streets">Streets</option>
                    <option value="satellite">Satellite</option>
                    <option value="outdoors">Outdoors</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </label>

                <label style={styles.label}>
                  Default Zoom Level
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={mapSettings.defaultZoom}
                    onChange={(e) => updateMapSettings({ defaultZoom: parseInt(e.target.value) })}
                    style={styles.range}
                  />
                  <span style={styles.rangeValue}>{mapSettings.defaultZoom}</span>
                </label>

                <div style={styles.coordGroup}>
                  <h3 style={styles.subheading}>Default Center Location</h3>
                  <label style={styles.label}>
                    Latitude
                    <input
                      type="number"
                      step="0.0001"
                      value={mapSettings.defaultCenter.lat}
                      onChange={(e) => updateMapSettings({
                        defaultCenter: { ...mapSettings.defaultCenter, lat: parseFloat(e.target.value) }
                      })}
                      style={styles.input}
                    />
                  </label>
                  <label style={styles.label}>
                    Longitude
                    <input
                      type="number"
                      step="0.0001"
                      value={mapSettings.defaultCenter.lng}
                      onChange={(e) => updateMapSettings({
                        defaultCenter: { ...mapSettings.defaultCenter, lng: parseFloat(e.target.value) }
                      })}
                      style={styles.input}
                    />
                  </label>
                </div>

                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={mapSettings.enableClustering}
                    onChange={(e) => updateMapSettings({ enableClustering: e.target.checked })}
                    style={styles.checkbox}
                  />
                  <span>Enable marker clustering</span>
                </label>

                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={mapSettings.show3DBuildings}
                    onChange={(e) => updateMapSettings({ show3DBuildings: e.target.checked })}
                    style={styles.checkbox}
                  />
                  <span>Show 3D buildings</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>Data Settings</h2>
                <button onClick={() => handleResetSection('dataSettings')} style={styles.resetSectionButton}>
                  Reset Section
                </button>
              </div>

              <div style={styles.settingGroup}>
                <label style={styles.label}>
                  Auto-refresh Interval (minutes)
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={dataSettings.autoRefreshInterval}
                    onChange={(e) => updateDataSettings({ autoRefreshInterval: parseInt(e.target.value) })}
                    style={styles.input}
                  />
                  <span style={styles.helpText}>Set to 0 to disable auto-refresh</span>
                </label>

                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={dataSettings.cacheEnabled}
                    onChange={(e) => updateDataSettings({ cacheEnabled: e.target.checked })}
                    style={styles.checkbox}
                  />
                  <span>Enable data caching</span>
                </label>

                {dataSettings.cacheEnabled && (
                  <>
                    <label style={styles.label}>
                      Cache Duration (hours)
                      <input
                        type="number"
                        min="1"
                        max="168"
                        value={dataSettings.cacheDuration}
                        onChange={(e) => updateDataSettings({ cacheDuration: parseInt(e.target.value) })}
                        style={styles.input}
                      />
                    </label>

                    <label style={styles.label}>
                      Max Cache Size (MB)
                      <input
                        type="number"
                        min="10"
                        max="1000"
                        step="10"
                        value={dataSettings.maxCacheSize}
                        onChange={(e) => updateDataSettings({ maxCacheSize: parseInt(e.target.value) })}
                        style={styles.input}
                      />
                    </label>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>Document Settings</h2>
                <button onClick={() => handleResetSection('documentSettings')} style={styles.resetSectionButton}>
                  Reset Section
                </button>
              </div>

              <div style={styles.settingGroup}>
                <label style={styles.label}>
                  Default Export Format
                  <select
                    value={documentSettings.defaultFormat}
                    onChange={(e) => updateDocumentSettings({ defaultFormat: e.target.value as any })}
                    style={styles.select}
                  >
                    <option value="pdf">PDF</option>
                    <option value="docx">Word (DOCX)</option>
                    <option value="xlsx">Excel (XLSX)</option>
                    <option value="html">HTML</option>
                  </select>
                </label>

                <label style={styles.label}>
                  Default Template
                  <select
                    value={documentSettings.defaultTemplate}
                    onChange={(e) => updateDocumentSettings({ defaultTemplate: e.target.value })}
                    style={styles.select}
                  >
                    <option value="comprehensive-plan">Comprehensive Plan</option>
                    <option value="transit-analysis">Transit Analysis</option>
                    <option value="ridership-forecast">Ridership Forecast</option>
                    <option value="zoning-report">Zoning Report</option>
                    <option value="environmental-impact">Environmental Impact</option>
                    <option value="public-meeting">Public Meeting</option>
                  </select>
                </label>

                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={documentSettings.includeBranding}
                    onChange={(e) => updateDocumentSettings({ includeBranding: e.target.checked })}
                    style={styles.checkbox}
                  />
                  <span>Include branding in exports</span>
                </label>

                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={documentSettings.includeTimestamp}
                    onChange={(e) => updateDocumentSettings({ includeTimestamp: e.target.checked })}
                    style={styles.checkbox}
                  />
                  <span>Include timestamp in exports</span>
                </label>

                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={documentSettings.autoGeneratePreview}
                    onChange={(e) => updateDocumentSettings({ autoGeneratePreview: e.target.checked })}
                    style={styles.checkbox}
                  />
                  <span>Auto-generate preview before export</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>Notification Settings</h2>
                <button onClick={() => handleResetSection('notificationSettings')} style={styles.resetSectionButton}>
                  Reset Section
                </button>
              </div>

              <div style={styles.settingGroup}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={notificationSettings.emailNotifications}
                    onChange={(e) => updateNotificationSettings({ emailNotifications: e.target.checked })}
                    style={styles.checkbox}
                  />
                  <span>Email notifications</span>
                </label>

                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={notificationSettings.browserNotifications}
                    onChange={(e) => updateNotificationSettings({ browserNotifications: e.target.checked })}
                    style={styles.checkbox}
                  />
                  <span>Browser notifications</span>
                </label>

                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={notificationSettings.soundEnabled}
                    onChange={(e) => updateNotificationSettings({ soundEnabled: e.target.checked })}
                    style={styles.checkbox}
                  />
                  <span>Notification sounds</span>
                </label>

                <h3 style={styles.subheading}>Notification Triggers</h3>

                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={notificationSettings.notifyOnExportComplete}
                    onChange={(e) => updateNotificationSettings({ notifyOnExportComplete: e.target.checked })}
                    style={styles.checkbox}
                  />
                  <span>Notify when document export completes</span>
                </label>

                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={notificationSettings.notifyOnDataUpdate}
                    onChange={(e) => updateNotificationSettings({ notifyOnDataUpdate: e.target.checked })}
                    style={styles.checkbox}
                  />
                  <span>Notify when data is updated</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'accessibility' && (
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>Accessibility Settings</h2>
                <button onClick={() => handleResetSection('accessibilitySettings')} style={styles.resetSectionButton}>
                  Reset Section
                </button>
              </div>

              <div style={styles.settingGroup}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={accessibilitySettings.highContrast}
                    onChange={(e) => updateAccessibilitySettings({ highContrast: e.target.checked })}
                    style={styles.checkbox}
                  />
                  <span>High contrast mode</span>
                </label>

                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={accessibilitySettings.largeText}
                    onChange={(e) => updateAccessibilitySettings({ largeText: e.target.checked })}
                    style={styles.checkbox}
                  />
                  <span>Large text</span>
                </label>

                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={accessibilitySettings.reducedMotion}
                    onChange={(e) => updateAccessibilitySettings({ reducedMotion: e.target.checked })}
                    style={styles.checkbox}
                  />
                  <span>Reduce motion and animations</span>
                </label>

                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={accessibilitySettings.screenReaderOptimized}
                    onChange={(e) => updateAccessibilitySettings({ screenReaderOptimized: e.target.checked })}
                    style={styles.checkbox}
                  />
                  <span>Screen reader optimization</span>
                </label>

                <div style={styles.infoBox}>
                  <p style={styles.infoText}>
                    💡 These settings help make the application more accessible. Changes are applied immediately.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div style={styles.modalOverlay} onClick={() => setShowExportModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Export Settings</h2>
            <p style={styles.modalText}>
              This will download your settings as a JSON file. You can import this file later to restore your settings.
            </p>
            <div style={styles.modalButtons}>
              <button onClick={handleExport} style={styles.primaryButton}>
                Download Settings
              </button>
              <button onClick={() => setShowExportModal(false)} style={styles.secondaryButton}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div style={styles.modalOverlay} onClick={() => setShowImportModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Import Settings</h2>
            <p style={styles.modalText}>
              Paste your settings JSON below. This will replace all current settings.
            </p>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Paste settings JSON here..."
              style={styles.textarea}
            />
            <div style={styles.modalButtons}>
              <button onClick={handleImport} style={styles.primaryButton} disabled={!importText.trim()}>
                Import Settings
              </button>
              <button onClick={() => { setShowImportModal(false); setImportText(''); }} style={styles.secondaryButton}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
  },
  header: {
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '1rem',
    color: '#718096',
  },
  notification: {
    padding: '1rem',
    borderRadius: '8px',
    color: 'white',
    marginBottom: '1rem',
    fontWeight: '500',
  },
  content: {
    display: 'grid',
    gridTemplateColumns: '250px 1fr',
    gap: '2rem',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  tabButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    border: 'none',
    background: 'white',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '500',
    color: '#4a5568',
    transition: 'all 0.2s',
    textAlign: 'left',
  },
  tabButtonActive: {
    background: '#4299e1',
    color: 'white',
    boxShadow: '0 2px 4px rgba(66, 153, 225, 0.3)',
  },
  tabIcon: {
    fontSize: '1.2rem',
  },
  sidebarActions: {
    marginTop: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  actionButton: {
    padding: '0.75rem',
    border: '1px solid #cbd5e0',
    background: 'white',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    color: '#4a5568',
    transition: 'all 0.2s',
  },
  resetButton: {
    padding: '0.75rem',
    border: '1px solid #fc8181',
    background: 'white',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    color: '#e53e3e',
    transition: 'all 0.2s',
  },
  mainContent: {
    background: 'white',
    borderRadius: '12px',
    padding: '2rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '2px solid #e2e8f0',
    paddingBottom: '1rem',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#2d3748',
  },
  resetSectionButton: {
    padding: '0.5rem 1rem',
    border: '1px solid #cbd5e0',
    background: 'white',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '500',
    color: '#718096',
  },
  settingGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    fontSize: '0.95rem',
    fontWeight: '500',
    color: '#4a5568',
  },
  select: {
    padding: '0.75rem',
    border: '1px solid #cbd5e0',
    borderRadius: '6px',
    fontSize: '0.95rem',
    backgroundColor: 'white',
    cursor: 'pointer',
  },
  input: {
    padding: '0.75rem',
    border: '1px solid #cbd5e0',
    borderRadius: '6px',
    fontSize: '0.95rem',
  },
  range: {
    width: '100%',
  },
  rangeValue: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    background: '#e2e8f0',
    borderRadius: '4px',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#4a5568',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '0.95rem',
    color: '#4a5568',
    cursor: 'pointer',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  coordGroup: {
    padding: '1rem',
    background: '#f7fafc',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  subheading: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#2d3748',
    marginTop: '0.5rem',
  },
  helpText: {
    fontSize: '0.85rem',
    color: '#718096',
    fontStyle: 'italic',
  },
  infoBox: {
    padding: '1rem',
    background: '#ebf8ff',
    border: '1px solid #90cdf4',
    borderRadius: '8px',
    marginTop: '1rem',
  },
  infoText: {
    fontSize: '0.9rem',
    color: '#2c5282',
    lineHeight: '1.5',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'white',
    borderRadius: '12px',
    padding: '2rem',
    maxWidth: '500px',
    width: '90%',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
  },
  modalTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '1rem',
  },
  modalText: {
    fontSize: '0.95rem',
    color: '#4a5568',
    marginBottom: '1.5rem',
    lineHeight: '1.6',
  },
  textarea: {
    width: '100%',
    minHeight: '200px',
    padding: '0.75rem',
    border: '1px solid #cbd5e0',
    borderRadius: '6px',
    fontSize: '0.9rem',
    fontFamily: 'monospace',
    resize: 'vertical',
    marginBottom: '1.5rem',
  },
  modalButtons: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
  },
  primaryButton: {
    padding: '0.75rem 1.5rem',
    background: '#4299e1',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '500',
    transition: 'background 0.2s',
  },
  secondaryButton: {
    padding: '0.75rem 1.5rem',
    background: 'white',
    color: '#4a5568',
    border: '1px solid #cbd5e0',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '500',
    transition: 'background 0.2s',
  },
};

export default Settings;
