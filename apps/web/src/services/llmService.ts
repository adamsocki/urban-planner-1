/**
 * LLM Service
 * Handles communication with the LLM API for content generation
 */

import { LLMSettings } from '../stores/settingsStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface GenerateContentRequest {
  prompt: string;
  context?: string;
  section?: string;
  apiConfig: LLMSettings;
}

export interface GenerateSectionRequest {
  section: string;
  documentType?: string;
  existingData?: any;
  apiConfig: LLMSettings;
}

export interface GenerateContentResponse {
  content: string;
  section?: string;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class LLMService {
  /**
   * Generate content using a custom prompt
   */
  static async generateContent(request: GenerateContentRequest): Promise<GenerateContentResponse> {
    const response = await fetch(`${API_BASE_URL}/api/llm/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'Failed to generate content',
      }));
      throw new Error(error.message || 'Failed to generate content');
    }

    return response.json();
  }

  /**
   * Generate content for a specific document section using predefined templates
   */
  static async generateSection(request: GenerateSectionRequest): Promise<GenerateContentResponse> {
    const response = await fetch(`${API_BASE_URL}/api/llm/generate-section`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'Failed to generate section content',
      }));
      throw new Error(error.message || 'Failed to generate section content');
    }

    return response.json();
  }

  /**
   * Build a context string from existing document data
   */
  static buildContext(formData: any, excludeField?: string): string {
    const contextParts: string[] = [];

    if (formData.title && excludeField !== 'title') {
      contextParts.push(`Document Title: ${formData.title}`);
    }

    if (formData.projectName && excludeField !== 'projectName') {
      contextParts.push(`Project: ${formData.projectName}`);
    }

    if (formData.executiveSummary && excludeField !== 'executiveSummary') {
      contextParts.push(`Executive Summary: ${formData.executiveSummary}`);
    }

    if (formData.introduction && excludeField !== 'introduction') {
      contextParts.push(`Introduction: ${formData.introduction}`);
    }

    if (formData.findings && excludeField !== 'findings') {
      contextParts.push(`Findings: ${formData.findings}`);
    }

    if (formData.recommendations && excludeField !== 'recommendations') {
      contextParts.push(`Recommendations: ${formData.recommendations}`);
    }

    return contextParts.join('\n\n');
  }
}
