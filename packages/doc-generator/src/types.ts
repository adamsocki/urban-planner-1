/**
 * Document Generator Types
 */

export type DocumentFormat = 'pdf' | 'docx' | 'xlsx' | 'html';

export type DocumentType =
  | 'comprehensive-plan'
  | 'zoning-report'
  | 'transit-analysis'
  | 'environmental-impact'
  | 'public-meeting'
  | 'ridership-forecast'
  | 'custom';

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  type: DocumentType;
  supportedFormats: DocumentFormat[];
  requiredData: string[];
  optionalData: string[];
  sections: DocumentSection[];
}

export interface DocumentSection {
  id: string;
  title: string;
  order: number;
  type: 'text' | 'map' | 'chart' | 'table' | 'image' | 'list';
  required: boolean;
  content?: string; // Template string with {{placeholders}}
  config?: Record<string, any>;
}

export interface MapSnapshot {
  imageUrl?: string;
  imageBuffer?: Buffer;
  caption: string;
  center?: [number, number]; // [lon, lat]
  zoom?: number;
  bounds?: [[number, number], [number, number]];
  layers?: string[];
  width?: number;
  height?: number;
}

export interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'area';
  title: string;
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string | string[];
    }[];
  };
  options?: Record<string, any>;
}

export interface TableData {
  title?: string;
  headers: string[];
  rows: (string | number)[][];
  footer?: (string | number)[];
  style?: {
    headerBg?: string;
    altRowBg?: string;
    fontSize?: number;
  };
}

export interface DocumentData {
  // Metadata
  title: string;
  subtitle?: string;
  author?: string;
  date?: Date;
  projectName?: string;

  // Content
  executiveSummary?: string;
  introduction?: string;
  methodology?: string;
  findings?: string;
  recommendations?: string;
  conclusion?: string;

  // Visual elements
  maps?: MapSnapshot[];
  charts?: ChartData[];
  tables?: TableData[];
  images?: { url: string; caption: string; }[];

  // Structured data
  demographics?: DemographicData;
  transitData?: TransitAnalysisData;
  zoningData?: ZoningData;
  forecastData?: RidershipForecastData;

  // Custom fields
  customFields?: Record<string, any>;
}

export interface DemographicData {
  totalPopulation: number;
  households: number;
  medianIncome: number;
  medianAge: number;
  employmentRate: number;
  ageDistribution?: {
    label: string;
    value: number;
  }[];
  raceEthnicity?: {
    label: string;
    value: number;
  }[];
  housingTenure?: {
    owned: number;
    rented: number;
  };
}

export interface TransitAnalysisData {
  feedName: string;
  agencyName: string;
  dateRange: {
    start: string;
    end: string;
  };
  stats: {
    totalRoutes: number;
    totalStops: number;
    totalTrips: number;
    serviceArea: number; // sq km
  };
  routesByType: {
    type: string;
    count: number;
  }[];
  coverage: {
    populationServed: number;
    percentCovered: number;
    avgStopsPerRoute: number;
  };
}

export interface ZoningData {
  parcelId: string;
  address: string;
  currentZoning: string;
  proposedZoning?: string;
  area: number;
  landUse: string;
  owner?: string;
  assessedValue?: number;
  complianceStatus: 'compliant' | 'variance-required' | 'non-compliant';
  notes?: string;
}

export interface RidershipForecastData {
  routeName: string;
  methodology: string;
  assumptions: string[];
  forecasts: {
    scenario: 'conservative' | 'moderate' | 'optimistic';
    dailyRidership: number;
    annualRidership: number;
    confidence: number;
  }[];
  demographicInputs: {
    population: number;
    employment: number;
    density: number;
  };
  serviceInputs: {
    frequency: number;
    span: string;
    speed: number;
  };
}

export interface GenerationOptions {
  format: DocumentFormat;
  template?: string; // Template ID or custom template
  paperSize?: 'letter' | 'a4' | 'legal';
  orientation?: 'portrait' | 'landscape';
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  includeTableOfContents?: boolean;
  includePageNumbers?: boolean;
  headerText?: string;
  footerText?: string;
  colorScheme?: 'default' | 'grayscale' | 'high-contrast';
}

export interface GenerationResult {
  success: boolean;
  format: DocumentFormat;
  buffer?: Buffer;
  filePath?: string;
  fileSize?: number;
  errors?: string[];
  warnings?: string[];
  metadata?: {
    generatedAt: Date;
    pageCount?: number;
    wordCount?: number;
  };
}
