import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LLMSettings {
  apiKey: string;
  apiEndpoint: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

interface SettingsStore {
  llmSettings: LLMSettings;
  setLLMSettings: (settings: Partial<LLMSettings>) => void;
  isConfigured: () => boolean;
}

const defaultSettings: LLMSettings = {
  apiKey: '',
  apiEndpoint: 'https://api.openai.com/v1/chat/completions',
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 2000,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      llmSettings: defaultSettings,
      setLLMSettings: (settings) =>
        set((state) => ({
          llmSettings: { ...state.llmSettings, ...settings },
        })),
      isConfigured: () => {
        const { apiKey } = get().llmSettings;
        return apiKey.length > 0;
      },
    }),
    {
      name: 'urban-planner-settings',
    }
  )
);
