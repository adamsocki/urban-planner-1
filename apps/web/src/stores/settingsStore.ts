/**
 * Settings Store
 * Zustand store for managing application settings with localStorage persistence
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Settings,
  DEFAULT_SETTINGS,
  UserPreferences,
  MapSettings,
  DataSettings,
  DocumentSettings,
  NotificationSettings,
  AccessibilitySettings,
} from '../types/settings';

interface SettingsStore extends Settings {
  // Actions
  updateUserPreferences: (preferences: Partial<UserPreferences>) => void;
  updateMapSettings: (settings: Partial<MapSettings>) => void;
  updateDataSettings: (settings: Partial<DataSettings>) => void;
  updateDocumentSettings: (settings: Partial<DocumentSettings>) => void;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  updateAccessibilitySettings: (settings: Partial<AccessibilitySettings>) => void;
  resetSettings: () => void;
  resetSection: (section: keyof Settings) => void;
  exportSettings: () => string;
  importSettings: (settingsJson: string) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      // Initial state from defaults
      ...DEFAULT_SETTINGS,

      // Actions
      updateUserPreferences: (preferences) =>
        set((state) => ({
          userPreferences: { ...state.userPreferences, ...preferences },
        })),

      updateMapSettings: (settings) =>
        set((state) => ({
          mapSettings: { ...state.mapSettings, ...settings },
        })),

      updateDataSettings: (settings) =>
        set((state) => ({
          dataSettings: { ...state.dataSettings, ...settings },
        })),

      updateDocumentSettings: (settings) =>
        set((state) => ({
          documentSettings: { ...state.documentSettings, ...settings },
        })),

      updateNotificationSettings: (settings) =>
        set((state) => ({
          notificationSettings: { ...state.notificationSettings, ...settings },
        })),

      updateAccessibilitySettings: (settings) =>
        set((state) => ({
          accessibilitySettings: { ...state.accessibilitySettings, ...settings },
        })),

      resetSettings: () => set(DEFAULT_SETTINGS),

      resetSection: (section) =>
        set((state) => ({
          ...state,
          [section]: DEFAULT_SETTINGS[section],
        })),

      exportSettings: () => {
        const state = get();
        const settings: Settings = {
          userPreferences: state.userPreferences,
          mapSettings: state.mapSettings,
          dataSettings: state.dataSettings,
          documentSettings: state.documentSettings,
          notificationSettings: state.notificationSettings,
          accessibilitySettings: state.accessibilitySettings,
        };
        return JSON.stringify(settings, null, 2);
      },

      importSettings: (settingsJson) => {
        try {
          const imported = JSON.parse(settingsJson) as Settings;
          set({
            userPreferences: imported.userPreferences || DEFAULT_SETTINGS.userPreferences,
            mapSettings: imported.mapSettings || DEFAULT_SETTINGS.mapSettings,
            dataSettings: imported.dataSettings || DEFAULT_SETTINGS.dataSettings,
            documentSettings: imported.documentSettings || DEFAULT_SETTINGS.documentSettings,
            notificationSettings: imported.notificationSettings || DEFAULT_SETTINGS.notificationSettings,
            accessibilitySettings: imported.accessibilitySettings || DEFAULT_SETTINGS.accessibilitySettings,
          });
        } catch (error) {
          console.error('Failed to import settings:', error);
          throw new Error('Invalid settings format');
        }
      },
    }),
    {
      name: 'urban-planner-settings', // localStorage key
      version: 1,
    }
  )
);
