/**
 * LLM Integration Routes
 * Handles content generation using configured LLM APIs
 */

import express from 'express';

const router = express.Router();

/**
 * Generate content using LLM
 * POST /api/llm/generate
 */
router.post('/generate', async (req, res) => {
  try {
    const { prompt, context, section, apiConfig } = req.body;

    // Validate required fields
    if (!prompt || !apiConfig) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Prompt and API configuration are required',
      });
    }

    const { apiKey, apiEndpoint, model, temperature, maxTokens } = apiConfig;

    if (!apiKey || !apiEndpoint || !model) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'API key, endpoint, and model are required',
      });
    }

    // Build the system and user messages
    const systemMessage = {
      role: 'system',
      content: `You are a professional urban planning analyst assistant. You generate well-structured, professional content for urban planning documents. Your output should be clear, concise, and appropriate for formal documentation.`,
    };

    const userMessage = {
      role: 'user',
      content: context
        ? `Context: ${context}\n\nTask: ${prompt}`
        : prompt,
    };

    // Prepare request to LLM API
    const llmRequest = {
      model,
      messages: [systemMessage, userMessage],
      temperature: temperature || 0.7,
      max_tokens: maxTokens || 2000,
    };

    // Call the LLM API
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(llmRequest),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: 'LLM API Error',
        message: errorData.error?.message || 'Failed to generate content',
        details: errorData,
      });
    }

    const data = await response.json();

    // Extract the generated content
    const generatedContent = data.choices?.[0]?.message?.content || '';

    if (!generatedContent) {
      return res.status(500).json({
        error: 'Generation failed',
        message: 'No content was generated',
      });
    }

    // Return the generated content
    res.json({
      content: generatedContent,
      section,
      model,
      usage: data.usage,
    });

  } catch (error: any) {
    console.error('LLM generation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Failed to generate content',
    });
  }
});

/**
 * Generate content with predefined templates
 * POST /api/llm/generate-section
 */
router.post('/generate-section', async (req, res) => {
  try {
    const { section, documentType, existingData, apiConfig } = req.body;

    if (!section || !apiConfig) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Section name and API configuration are required',
      });
    }

    // Predefined prompts for common document sections
    const sectionPrompts: { [key: string]: string } = {
      executiveSummary: `Generate a comprehensive executive summary for a ${documentType || 'urban planning'} document. Include key findings, major recommendations, and strategic priorities. The summary should be 2-3 paragraphs long and written in a professional, accessible tone.`,

      introduction: `Write a detailed introduction for a ${documentType || 'urban planning'} document. Provide background context, explain the purpose and scope of the analysis, and outline the document structure. The introduction should be engaging and set clear expectations for the reader.`,

      findings: `Analyze and present the key findings from this ${documentType || 'urban planning'} analysis. Organize findings into clear categories, highlight significant patterns or trends, and support observations with relevant data points. Use professional, objective language.`,

      recommendations: `Develop actionable recommendations based on the findings of this ${documentType || 'urban planning'} analysis. Prioritize recommendations by impact and feasibility, provide clear implementation steps, and consider both short-term and long-term actions.`,

      methodology: `Describe the methodology used in this ${documentType || 'urban planning'} analysis. Include data sources, analytical techniques, tools employed, and any limitations or assumptions. Present in a clear, structured format suitable for technical readers.`,

      conclusion: `Write a compelling conclusion for this ${documentType || 'urban planning'} document. Summarize the key takeaways, reinforce the importance of recommendations, and provide a forward-looking perspective on next steps.`,
    };

    const prompt = sectionPrompts[section] || `Generate professional content for the ${section} section of a ${documentType || 'urban planning'} document.`;

    // Add existing data as context if provided
    let contextString = '';
    if (existingData) {
      contextString = `Existing document data:\n${JSON.stringify(existingData, null, 2)}\n\n`;
    }

    // Forward to the main generate endpoint
    const { apiKey, apiEndpoint, model, temperature, maxTokens } = apiConfig;

    const systemMessage = {
      role: 'system',
      content: `You are a professional urban planning analyst assistant. You generate well-structured, professional content for urban planning documents. Your output should be clear, concise, and appropriate for formal documentation.`,
    };

    const userMessage = {
      role: 'user',
      content: contextString + prompt,
    };

    const llmRequest = {
      model,
      messages: [systemMessage, userMessage],
      temperature: temperature || 0.7,
      max_tokens: maxTokens || 2000,
    };

    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(llmRequest),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: 'LLM API Error',
        message: errorData.error?.message || 'Failed to generate content',
        details: errorData,
      });
    }

    const data = await response.json();
    const generatedContent = data.choices?.[0]?.message?.content || '';

    if (!generatedContent) {
      return res.status(500).json({
        error: 'Generation failed',
        message: 'No content was generated',
      });
    }

    res.json({
      content: generatedContent,
      section,
      model,
      usage: data.usage,
    });

  } catch (error: any) {
    console.error('LLM section generation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Failed to generate section content',
    });
  }
});

export default router;
