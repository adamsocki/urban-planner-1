/**
 * Census API Client
 * Client for fetching data from the US Census Bureau API
 */

import axios, { AxiosInstance } from 'axios';
import {
  CensusAPIConfig,
  CensusAPIRequest,
  CensusAPIResponse,
  CensusBatchRequest,
  CensusBatchResponse,
  CensusData,
  CensusRawResponse,
  GeographicArea,
  CENSUS_VARIABLES,
} from './types';

export class CensusClient {
  private client: AxiosInstance;
  private apiKey: string;
  private cache: Map<string, { data: any; timestamp: number }>;
  private cacheTTL: number;

  constructor(config: CensusAPIConfig) {
    this.apiKey = config.apiKey;
    this.cache = new Map();
    this.cacheTTL = config.cacheTTL || 3600000; // 1 hour default

    this.client = axios.create({
      baseURL: config.baseUrl || 'https://api.census.gov/data',
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Fetch census data for a specific geographic area
   */
  async getCensusData(request: CensusAPIRequest): Promise<CensusAPIResponse> {
    const cacheKey = this.getCacheKey(request);

    // Check cache if enabled
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const dataset = request.dataset || 'acs5';
      const year = request.year || 2021;

      // Build the API URL
      const url = `/${year}/acs/${dataset}`;

      // Build the variables string
      const variables = request.variables.join(',');

      // Build the geography string
      const geographyString = this.buildGeographyString(request.geography);

      // Make the API request
      const response = await this.client.get(url, {
        params: {
          get: variables,
          for: geographyString,
          key: this.apiKey,
        },
      });

      // Parse the response
      const censusData = this.parseResponse(response.data, request.geography, year, dataset);

      const result: CensusAPIResponse = {
        data: censusData,
        rawResponse: response.data,
      };

      // Cache the result
      this.setCache(cacheKey, result);

      return result;
    } catch (error: any) {
      return {
        data: this.getEmptyCensusData(request.geography, request.year || 2021, request.dataset || 'acs5'),
        errors: [error.message],
      };
    }
  }

  /**
   * Fetch census data for multiple geographic areas
   */
  async getBatchCensusData(request: CensusBatchRequest): Promise<CensusBatchResponse> {
    const results: CensusData[] = [];
    const errors: Array<{ geography: GeographicArea; error: string }> = [];

    // Process each geography
    for (const geography of request.geographies) {
      try {
        const response = await this.getCensusData({
          variables: request.variables,
          geography,
          year: request.year,
          dataset: request.dataset,
        });

        if (response.data) {
          results.push(response.data);
        }

        if (response.errors) {
          errors.push({
            geography,
            error: response.errors.join(', '),
          });
        }
      } catch (error: any) {
        errors.push({
          geography,
          error: error.message,
        });
      }
    }

    return {
      data: results,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Get all available variables for a dataset
   */
  async getVariables(year: number = 2021, dataset: string = 'acs5'): Promise<any> {
    try {
      const response = await this.client.get(`/${year}/acs/${dataset}/variables.json`, {
        params: { key: this.apiKey },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to fetch variables: ${error.message}`);
    }
  }

  /**
   * Get geography options
   */
  async getGeographies(year: number = 2021, dataset: string = 'acs5'): Promise<any> {
    try {
      const response = await this.client.get(`/${year}/acs/${dataset}/geography.json`, {
        params: { key: this.apiKey },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to fetch geographies: ${error.message}`);
    }
  }

  /**
   * Build geography string for API request
   */
  private buildGeographyString(geography: GeographicArea): string {
    switch (geography.type) {
      case 'state':
        return `state:${geography.state || '*'}`;
      case 'county':
        return `county:${geography.county || '*'}${geography.state ? `&in=state:${geography.state}` : ''}`;
      case 'tract':
        return `tract:${geography.tract || '*'}${geography.county && geography.state ? `&in=state:${geography.state}+county:${geography.county}` : ''}`;
      case 'block-group':
        return `block group:${geography.blockGroup || '*'}${geography.tract && geography.county && geography.state ? `&in=state:${geography.state}+county:${geography.county}+tract:${geography.tract}` : ''}`;
      case 'place':
        return `place:${geography.fips || '*'}${geography.state ? `&in=state:${geography.state}` : ''}`;
      case 'zcta':
        return `zip code tabulation area:${geography.fips || '*'}`;
      default:
        throw new Error(`Unsupported geography type: ${geography.type}`);
    }
  }

  /**
   * Parse raw Census API response into structured data
   */
  private parseResponse(
    rawData: any[],
    geography: GeographicArea,
    year: number,
    dataset: string
  ): CensusData {
    if (!rawData || rawData.length < 2) {
      return this.getEmptyCensusData(geography, year, dataset);
    }

    // First row is headers, second row is data
    const headers = rawData[0];
    const values = rawData[1];

    // Create a map of variable to value
    const dataMap: Record<string, number> = {};
    headers.forEach((header: string, index: number) => {
      const value = values[index];
      dataMap[header] = typeof value === 'string' ? parseFloat(value) || 0 : value;
    });

    // Extract data using our variable mapping
    const population = {
      total: dataMap[CENSUS_VARIABLES.TOTAL_POPULATION] || 0,
      male: dataMap[CENSUS_VARIABLES.MALE_POPULATION] || 0,
      female: dataMap[CENSUS_VARIABLES.FEMALE_POPULATION] || 0,
    };

    const ageDistribution = {
      under5: dataMap[CENSUS_VARIABLES.AGE_UNDER_5] || 0,
      age5to9: dataMap[CENSUS_VARIABLES.AGE_5_TO_9] || 0,
      age10to14: dataMap[CENSUS_VARIABLES.AGE_10_TO_14] || 0,
      age15to19: dataMap[CENSUS_VARIABLES.AGE_15_TO_19] || 0,
      age20to24: dataMap[CENSUS_VARIABLES.AGE_20_TO_24] || 0,
      age25to34: dataMap[CENSUS_VARIABLES.AGE_25_TO_34] || 0,
      age35to44: dataMap[CENSUS_VARIABLES.AGE_35_TO_44] || 0,
      age45to54: dataMap[CENSUS_VARIABLES.AGE_45_TO_54] || 0,
      age55to64: dataMap[CENSUS_VARIABLES.AGE_55_TO_64] || 0,
      age65Plus: dataMap[CENSUS_VARIABLES.AGE_65_PLUS] || 0,
      medianAge: dataMap[CENSUS_VARIABLES.MEDIAN_AGE] || 0,
    };

    const totalRaceEth =
      (dataMap[CENSUS_VARIABLES.WHITE_ALONE] || 0) +
      (dataMap[CENSUS_VARIABLES.BLACK_ALONE] || 0) +
      (dataMap[CENSUS_VARIABLES.ASIAN_ALONE] || 0) +
      (dataMap[CENSUS_VARIABLES.HISPANIC] || 0);

    const raceEthnicity = {
      whiteAlone: dataMap[CENSUS_VARIABLES.WHITE_ALONE] || 0,
      blackAlone: dataMap[CENSUS_VARIABLES.BLACK_ALONE] || 0,
      asianAlone: dataMap[CENSUS_VARIABLES.ASIAN_ALONE] || 0,
      hispanic: dataMap[CENSUS_VARIABLES.HISPANIC] || 0,
      other: population.total - totalRaceEth,
      total: population.total,
    };

    const totalUnits = dataMap[CENSUS_VARIABLES.TOTAL_HOUSING_UNITS] || 0;
    const occupied = dataMap[CENSUS_VARIABLES.OCCUPIED_HOUSING] || 0;
    const vacant = dataMap[CENSUS_VARIABLES.VACANT_HOUSING] || 0;
    const ownerOccupied = dataMap[CENSUS_VARIABLES.OWNER_OCCUPIED] || 0;

    const housing = {
      totalUnits,
      occupied,
      vacant,
      ownerOccupied,
      renterOccupied: dataMap[CENSUS_VARIABLES.RENTER_OCCUPIED] || 0,
      vacancyRate: totalUnits > 0 ? (vacant / totalUnits) * 100 : 0,
      ownershipRate: occupied > 0 ? (ownerOccupied / occupied) * 100 : 0,
    };

    const totalHouseholds = dataMap[CENSUS_VARIABLES.TOTAL_HOUSEHOLDS] || 0;
    const households = {
      totalHouseholds,
      familyHouseholds: dataMap[CENSUS_VARIABLES.FAMILY_HOUSEHOLDS] || 0,
      nonfamilyHouseholds: dataMap[CENSUS_VARIABLES.NONFAMILY_HOUSEHOLDS] || 0,
      averageHouseholdSize: totalHouseholds > 0 ? population.total / totalHouseholds : 0,
    };

    const povertyPop = dataMap[CENSUS_VARIABLES.POVERTY_POPULATION] || 0;
    const income = {
      medianHouseholdIncome: dataMap[CENSUS_VARIABLES.MEDIAN_HOUSEHOLD_INCOME] || 0,
      perCapitaIncome: dataMap[CENSUS_VARIABLES.PER_CAPITA_INCOME] || 0,
      povertyPopulation: povertyPop,
      povertyRate: population.total > 0 ? (povertyPop / population.total) * 100 : 0,
    };

    const inLaborForce = dataMap[CENSUS_VARIABLES.IN_LABOR_FORCE] || 0;
    const employed = dataMap[CENSUS_VARIABLES.EMPLOYED] || 0;
    const unemployed = dataMap[CENSUS_VARIABLES.UNEMPLOYED] || 0;

    const employment = {
      inLaborForce,
      employed,
      unemployed,
      laborForceParticipationRate: population.total > 0 ? (inLaborForce / population.total) * 100 : 0,
      unemploymentRate: inLaborForce > 0 ? (unemployed / inLaborForce) * 100 : 0,
    };

    const totalWorkers = dataMap[CENSUS_VARIABLES.TOTAL_WORKERS] || 0;
    const droveAlone = dataMap[CENSUS_VARIABLES.DROVE_ALONE] || 0;
    const carpooled = dataMap[CENSUS_VARIABLES.CARPOOLED] || 0;
    const publicTransit = dataMap[CENSUS_VARIABLES.PUBLIC_TRANSIT] || 0;
    const walked = dataMap[CENSUS_VARIABLES.WALKED] || 0;
    const bicycle = dataMap[CENSUS_VARIABLES.BICYCLE] || 0;
    const workedFromHome = dataMap[CENSUS_VARIABLES.WORKED_FROM_HOME] || 0;

    const transportation = {
      totalWorkers,
      droveAlone,
      carpooled,
      publicTransit,
      walked,
      bicycle,
      workedFromHome,
      transitMode: {
        auto: droveAlone + carpooled,
        transit: publicTransit,
        active: walked + bicycle,
        remote: workedFromHome,
      },
    };

    const education = {
      lessThanHighSchool: dataMap[CENSUS_VARIABLES.LESS_THAN_HS] || 0,
      highSchoolGraduate: dataMap[CENSUS_VARIABLES.HS_GRADUATE] || 0,
      bachelors: dataMap[CENSUS_VARIABLES.BACHELORS] || 0,
      graduateDegree: dataMap[CENSUS_VARIABLES.GRADUATE_DEGREE] || 0,
      totalPopulation25Plus: 0, // Would need to calculate from age data
    };

    return {
      geography,
      year,
      dataset,
      population,
      ageDistribution,
      raceEthnicity,
      housing,
      households,
      income,
      employment,
      transportation,
      education,
      metadata: {
        fetchedAt: new Date(),
        source: 'US Census Bureau API',
        reliability: 'high',
      },
    };
  }

  /**
   * Get empty census data structure
   */
  private getEmptyCensusData(geography: GeographicArea, year: number, dataset: string): CensusData {
    return {
      geography,
      year,
      dataset,
      population: { total: 0, male: 0, female: 0 },
      ageDistribution: {
        under5: 0,
        age5to9: 0,
        age10to14: 0,
        age15to19: 0,
        age20to24: 0,
        age25to34: 0,
        age35to44: 0,
        age45to54: 0,
        age55to64: 0,
        age65Plus: 0,
        medianAge: 0,
      },
      raceEthnicity: {
        whiteAlone: 0,
        blackAlone: 0,
        asianAlone: 0,
        hispanic: 0,
        other: 0,
        total: 0,
      },
      housing: {
        totalUnits: 0,
        occupied: 0,
        vacant: 0,
        ownerOccupied: 0,
        renterOccupied: 0,
        vacancyRate: 0,
        ownershipRate: 0,
      },
      households: {
        totalHouseholds: 0,
        familyHouseholds: 0,
        nonfamilyHouseholds: 0,
        averageHouseholdSize: 0,
      },
      income: {
        medianHouseholdIncome: 0,
        perCapitaIncome: 0,
        povertyPopulation: 0,
        povertyRate: 0,
      },
      employment: {
        inLaborForce: 0,
        employed: 0,
        unemployed: 0,
        laborForceParticipationRate: 0,
        unemploymentRate: 0,
      },
      transportation: {
        totalWorkers: 0,
        droveAlone: 0,
        carpooled: 0,
        publicTransit: 0,
        walked: 0,
        bicycle: 0,
        workedFromHome: 0,
        transitMode: {
          auto: 0,
          transit: 0,
          active: 0,
          remote: 0,
        },
      },
      education: {
        lessThanHighSchool: 0,
        highSchoolGraduate: 0,
        bachelors: 0,
        graduateDegree: 0,
        totalPopulation25Plus: 0,
      },
      metadata: {
        fetchedAt: new Date(),
        source: 'US Census Bureau API',
        reliability: 'low',
      },
    };
  }

  /**
   * Cache management
   */
  private getCacheKey(request: CensusAPIRequest): string {
    return JSON.stringify({
      variables: request.variables.sort(),
      geography: request.geography,
      year: request.year,
      dataset: request.dataset,
    });
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}
