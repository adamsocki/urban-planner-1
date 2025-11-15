/**
 * AI-Powered Geospatial Analyzer
 * Uses LLM to interpret spatial data and generate insights
 */

import { GeospatialAnalysisService, StopPoint, RouteData, AnalysisResult } from './geospatialAnalysis';

export interface LLMConfig {
  apiKey: string;
  apiEndpoint: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export interface GeospatialQuery {
  type: 'coverage' | 'accessibility' | 'connectivity' | 'optimization' | 'general';
  question: string;
  context?: {
    stops?: StopPoint[];
    routes?: RouteData[];
    demographics?: any;
    location?: { lat: number; lon: number };
  };
}

export interface AIGeospatialInsight {
  query: string;
  analysis: AnalysisResult[];
  insights: string;
  recommendations: string[];
  visualizations?: string[];
  metrics: Record<string, any>;
}

export class AIGeospatialAnalyzer {
  /**
   * Analyze transit network coverage and generate AI insights
   */
  static async analyzeTransitCoverage(
    stops: StopPoint[],
    routes: RouteData[],
    llmConfig: LLMConfig
  ): Promise<AIGeospatialInsight> {
    // Perform spatial analysis
    const coverageAnalysis = GeospatialAnalysisService.calculateStopCoverage(stops, 400);
    const connectivityAnalysis = GeospatialAnalysisService.analyzeNetworkConnectivity(stops, routes);

    // Calculate route lengths
    const routeAnalyses = routes.map((route) =>
      GeospatialAnalysisService.analyzeRoute(route)
    );
    const totalRouteLength = routeAnalyses.reduce(
      (sum, analysis) => sum + analysis.metrics.lengthKm,
      0
    );

    // Build context for LLM
    const analysisContext = {
      stopCount: stops.length,
      routeCount: routes.length,
      totalCoverageKm2: coverageAnalysis.metrics.totalAreaKm2,
      totalRouteLengthKm: totalRouteLength,
      avgRoutesPerStop: connectivityAnalysis.metrics.avgRoutesPerStop,
      highFrequencyStops: connectivityAnalysis.metrics.highFrequencyStops,
    };

    // Generate AI insights
    const insights = await this.generateInsights(
      'transit_network_coverage',
      analysisContext,
      llmConfig
    );

    return {
      query: 'Analyze transit network coverage and accessibility',
      analysis: [coverageAnalysis, connectivityAnalysis, ...routeAnalyses],
      insights: insights.analysis,
      recommendations: insights.recommendations,
      visualizations: ['coverage_map', 'connectivity_heatmap', 'route_frequency'],
      metrics: analysisContext,
    };
  }

  /**
   * Natural language query for geospatial analysis
   */
  static async queryTransitNetwork(
    query: GeospatialQuery,
    llmConfig: LLMConfig
  ): Promise<AIGeospatialInsight> {
    const analyses: AnalysisResult[] = [];
    const { stops = [], routes = [], location } = query.context || {};

    // Determine what analyses to run based on query type
    switch (query.type) {
      case 'coverage':
        if (stops.length > 0) {
          analyses.push(GeospatialAnalysisService.calculateStopCoverage(stops));
          analyses.push(GeospatialAnalysisService.calculateCatchmentArea(stops));
        }
        break;

      case 'accessibility':
        if (location && stops.length > 0) {
          analyses.push(
            GeospatialAnalysisService.findNearbyStops(
              location.lat,
              location.lon,
              stops,
              800
            )
          );
          analyses.push(
            GeospatialAnalysisService.generateIsochrones(
              location.lat,
              location.lon,
              [5, 10, 15]
            )
          );
        }
        break;

      case 'connectivity':
        if (stops.length > 0 && routes.length > 0) {
          analyses.push(
            GeospatialAnalysisService.analyzeNetworkConnectivity(stops, routes)
          );
          analyses.push(GeospatialAnalysisService.analyzeRouteOverlap(routes));
        }
        break;

      case 'optimization':
        // Analyze current state to identify optimization opportunities
        if (stops.length > 0 && routes.length > 0) {
          analyses.push(
            GeospatialAnalysisService.analyzeNetworkConnectivity(stops, routes)
          );
          analyses.push(GeospatialAnalysisService.calculateStopCoverage(stops));
        }
        break;

      case 'general':
        // Run comprehensive analysis
        if (stops.length > 0) {
          analyses.push(GeospatialAnalysisService.calculateStopCoverage(stops));
        }
        if (stops.length > 0 && routes.length > 0) {
          analyses.push(
            GeospatialAnalysisService.analyzeNetworkConnectivity(stops, routes)
          );
        }
        break;
    }

    // Extract metrics from analyses
    const metrics = analyses.reduce((acc, analysis) => {
      return { ...acc, ...analysis.metrics };
    }, {});

    // Generate AI insights from the analyses
    const insights = await this.generateInsights(
      query.type,
      { query: query.question, analyses, metrics },
      llmConfig
    );

    return {
      query: query.question,
      analysis: analyses,
      insights: insights.analysis,
      recommendations: insights.recommendations,
      visualizations: this.suggestVisualizations(query.type),
      metrics,
    };
  }

  /**
   * Generate insights using LLM
   */
  private static async generateInsights(
    analysisType: string,
    context: any,
    llmConfig: LLMConfig
  ): Promise<{ analysis: string; recommendations: string[] }> {
    const systemPrompt = `You are an expert urban planner and transit analyst. You analyze geospatial transit data and provide actionable insights and recommendations. Your analysis should be:
- Data-driven and specific
- Focused on equity, accessibility, and efficiency
- Actionable with clear recommendations
- Professional and concise`;

    const userPrompt = this.buildAnalysisPrompt(analysisType, context);

    try {
      const response = await fetch(llmConfig.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${llmConfig.apiKey}`,
        },
        body: JSON.stringify({
          model: llmConfig.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: llmConfig.temperature || 0.7,
          max_tokens: llmConfig.maxTokens || 1500,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate insights');
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';

      // Parse the response to extract analysis and recommendations
      const sections = this.parseInsightsResponse(content);

      return sections;
    } catch (error) {
      console.error('LLM insights generation error:', error);
      return {
        analysis: 'Analysis unavailable due to API error',
        recommendations: [],
      };
    }
  }

  /**
   * Build analysis prompt based on type and context
   */
  private static buildAnalysisPrompt(analysisType: string, context: any): string {
    const prompts: Record<string, string> = {
      transit_network_coverage: `Analyze this transit network:

Stop Count: ${context.stopCount}
Route Count: ${context.routeCount}
Total Coverage Area: ${context.totalCoverageKm2?.toFixed(2)} km²
Total Route Length: ${context.totalRouteLengthKm?.toFixed(2)} km
Average Routes per Stop: ${context.avgRoutesPerStop?.toFixed(1)}
High-Frequency Stops (3+ routes): ${context.highFrequencyStops?.length || 0}

Provide:
1. A comprehensive analysis of the network's strengths and weaknesses
2. Specific recommendations for improving coverage and connectivity
3. Equity considerations and underserved areas
4. Efficiency metrics and optimization opportunities`,

      coverage: `Based on the following transit coverage analysis:

${JSON.stringify(context, null, 2)}

Provide:
1. Assessment of coverage adequacy
2. Identification of coverage gaps
3. Recommendations for improving service area
4. Population accessibility metrics`,

      accessibility: `Based on accessibility analysis:

${JSON.stringify(context, null, 2)}

Provide:
1. Assessment of transit accessibility
2. Walking distance and time analysis
3. Recommendations for improving access
4. Equity implications`,

      connectivity: `Based on network connectivity analysis:

${JSON.stringify(context, null, 2)}

Provide:
1. Assessment of network connectivity
2. Transfer opportunities and gaps
3. Recommendations for improving connections
4. Route redundancy analysis`,

      optimization: `Based on current transit network data:

${JSON.stringify(context, null, 2)}

Provide:
1. Optimization opportunities
2. Cost-efficiency improvements
3. Service frequency recommendations
4. Route restructuring suggestions`,

      general: `Analyze this transit network data:

${JSON.stringify(context, null, 2)}

Provide comprehensive insights covering coverage, accessibility, connectivity, and optimization opportunities.`,
    };

    return prompts[analysisType] || prompts.general;
  }

  /**
   * Parse LLM response into structured sections
   */
  private static parseInsightsResponse(content: string): {
    analysis: string;
    recommendations: string[];
  } {
    // Try to extract recommendations section
    const recommendationsMatch = content.match(/recommendations?:?\s*([\s\S]*)/i);
    const analysisText = recommendationsMatch
      ? content.substring(0, recommendationsMatch.index)
      : content;

    // Extract bullet points as recommendations
    const recommendations: string[] = [];
    if (recommendationsMatch) {
      const recText = recommendationsMatch[1];
      const bulletPoints = recText.match(/[-•*]\s*(.+)/g) || [];
      bulletPoints.forEach((bullet) => {
        const cleaned = bullet.replace(/^[-•*]\s*/, '').trim();
        if (cleaned) recommendations.push(cleaned);
      });

      // Also try numbered lists
      const numberedPoints = recText.match(/\d+\.\s*(.+)/g) || [];
      numberedPoints.forEach((point) => {
        const cleaned = point.replace(/^\d+\.\s*/, '').trim();
        if (cleaned && !recommendations.includes(cleaned)) {
          recommendations.push(cleaned);
        }
      });
    }

    return {
      analysis: analysisText.trim(),
      recommendations:
        recommendations.length > 0
          ? recommendations
          : ['Recommendations not available'],
    };
  }

  /**
   * Suggest appropriate visualizations for analysis type
   */
  private static suggestVisualizations(analysisType: string): string[] {
    const visualizations: Record<string, string[]> = {
      coverage: ['coverage_map', 'buffer_zones', 'heatmap'],
      accessibility: ['isochrone_map', 'accessibility_heatmap', 'walking_distance'],
      connectivity: ['network_graph', 'transfer_points', 'route_overlap'],
      optimization: ['efficiency_metrics', 'coverage_gaps', 'frequency_analysis'],
      general: ['overview_map', 'coverage_map', 'network_graph'],
    };

    return visualizations[analysisType] || visualizations.general;
  }

  /**
   * Generate map-aware document content with spatial analysis
   */
  static async generateMapAwareContent(
    documentType: string,
    spatialData: {
      stops?: StopPoint[];
      routes?: RouteData[];
      boundingBox?: [[number, number], [number, number]];
      centerPoint?: [number, number];
    },
    llmConfig: LLMConfig
  ): Promise<{
    executiveSummary: string;
    findings: string;
    recommendations: string;
    mapDescriptions: string[];
  }> {
    // Perform spatial analyses
    const analyses: AnalysisResult[] = [];

    if (spatialData.stops && spatialData.stops.length > 0) {
      analyses.push(GeospatialAnalysisService.calculateStopCoverage(spatialData.stops));
    }

    if (spatialData.stops && spatialData.routes && spatialData.routes.length > 0) {
      analyses.push(
        GeospatialAnalysisService.analyzeNetworkConnectivity(
          spatialData.stops,
          spatialData.routes
        )
      );
    }

    const systemPrompt = `You are an expert urban planning analyst creating professional transit analysis documents. Generate clear, data-driven content that incorporates spatial analysis results and describes maps effectively.`;

    const userPrompt = `Create ${documentType} document content based on this spatial analysis:

${JSON.stringify(analyses, null, 2)}

Bounding Box: ${spatialData.boundingBox ? JSON.stringify(spatialData.boundingBox) : 'N/A'}
Center Point: ${spatialData.centerPoint ? JSON.stringify(spatialData.centerPoint) : 'N/A'}

Generate:
1. Executive Summary (2-3 paragraphs)
2. Key Findings (detailed analysis)
3. Recommendations (actionable items)
4. Map Descriptions (describe what each map should show)

Format as JSON with keys: executiveSummary, findings, recommendations, mapDescriptions (array)`;

    try {
      const response = await fetch(llmConfig.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${llmConfig.apiKey}`,
        },
        body: JSON.stringify({
          model: llmConfig.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '{}';

      // Try to parse as JSON
      try {
        const parsed = JSON.parse(content);
        return {
          executiveSummary: parsed.executiveSummary || '',
          findings: parsed.findings || '',
          recommendations: parsed.recommendations || '',
          mapDescriptions: parsed.mapDescriptions || [],
        };
      } catch {
        // Fallback if not valid JSON
        return {
          executiveSummary: content.substring(0, 500),
          findings: content,
          recommendations: 'See findings for detailed recommendations',
          mapDescriptions: [],
        };
      }
    } catch (error) {
      console.error('Map-aware content generation error:', error);
      return {
        executiveSummary: 'Content generation unavailable',
        findings: '',
        recommendations: '',
        mapDescriptions: [],
      };
    }
  }
}
