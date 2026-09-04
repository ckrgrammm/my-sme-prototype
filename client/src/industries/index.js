import lorry from './lorry/index.js';
import workshop from './workshop/index.js';
import renovation from './renovation/index.js';
import supplier from './supplier/index.js';
import tuition from './tuition/index.js';

export const DEFAULT_INDUSTRY = 'workshop';
export const INDUSTRIES = [lorry, workshop, renovation, supplier, tuition];
export const INDUSTRY_REGISTRY = Object.fromEntries(INDUSTRIES.map((industry) => [industry.key, industry]));

export function getIndustryDefinition(key) {
  return INDUSTRY_REGISTRY[key] || null;
}

export function mergeIndustryList(serverIndustries = []) {
  const serverByKey = Object.fromEntries(serverIndustries.map((industry) => [industry.key, industry]));
  return INDUSTRIES
    .filter((industry) => serverByKey[industry.key])
    .map((industry) => ({ ...industry, ...serverByKey[industry.key], features: industry.features }));
}
