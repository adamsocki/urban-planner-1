/**
 * Census Data Package
 * Main entry point for census data fetching and analysis
 */

export * from './types';
export * from './census-client';
export * from './spatial-query';

// Re-export commonly used items
export { CensusClient } from './census-client';
export { SpatialCensusQuery } from './spatial-query';
export { CENSUS_VARIABLES } from './types';
