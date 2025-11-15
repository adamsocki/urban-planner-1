/**
 * Settings Types
 * Type definitions for application settings
 */

export type Theme = 'light' | 'dark' | 'auto';
export type MapStyle = 'streets' | 'satellite' | 'outdoors' | 'light' | 'dark';
export type MeasurementUnit = 'metric' | 'imperial';
export type Language = 'en' | 'es' | 'fr';
export type DocumentFormat = 'pdf' | 'docx' | 'xlsx' | 'html';

export interface MapSettings {
  defaultStyle: MapStyle;
  defaultZoom: number;
  defaultCenter: {
    lat: number;
    lng: number;
  };
  enableClustering: boolean;
  show3DBuildings: boolean;
}

export interface UserPreferences {
  theme: Theme;
  language: Language;
  measurementUnit: MeasurementUnit;
  autoSave: boolean;
  compactView: boolean;
}

export interface DataSettings {
  autoRefreshInterval: number; // in minutes, 0 = disabled
  cacheEnabled: boolean;
  cacheDuration: number; // in hours
  maxCacheSize: number; // in MB
}

export interface DocumentSettings {
  defaultFormat: DocumentFormat;
  includeBranding: boolean;
  includeTimestamp: boolean;
  defaultTemplate: string;
  autoGeneratePreview: boolean;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  browserNotifications: boolean;
  soundEnabled: boolean;
  notifyOnExportComplete: boolean;
  notifyOnDataUpdate: boolean;
}

export interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReaderOptimized: boolean;
}

export interface Settings {
  userPreferences: UserPreferences;
  mapSettings: MapSettings;
  dataSettings: DataSettings;
  documentSettings: DocumentSettings;
  notificationSettings: NotificationSettings;
  accessibilitySettings: AccessibilitySettings;
}

export const DEFAULT_SETTINGS: Settings = {
  userPreferences: {
    theme: 'auto',
    language: 'en',
    measurementUnit: 'imperial',
    autoSave: true,
    compactView: false,
  },
  mapSettings: {
    defaultStyle: 'streets',
    defaultZoom: 12,
    defaultCenter: {
      lat: 40.7128,
      lng: -74.0060, // New York City
    },
    enableClustering: true,
    show3DBuildings: false,
  },
  dataSettings: {
    autoRefreshInterval: 30,
    cacheEnabled: true,
    cacheDuration: 24,
    maxCacheSize: 100,
  },
  documentSettings: {
    defaultFormat: 'pdf',
    includeBranding: true,
    includeTimestamp: true,
    defaultTemplate: 'comprehensive-plan',
    autoGeneratePreview: false,
  },
  notificationSettings: {
    emailNotifications: false,
    browserNotifications: true,
    soundEnabled: true,
    notifyOnExportComplete: true,
    notifyOnDataUpdate: false,
  },
  accessibilitySettings: {
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    screenReaderOptimized: false,
  },
};
