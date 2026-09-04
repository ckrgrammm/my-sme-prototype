import { config as lorry, workflow as lorryWorkflow } from './lorry.js';
import { config as workshop, workflow as workshopWorkflow } from './workshop.js';
import { config as renovation, workflow as renovationWorkflow } from './renovation.js';
import { config as supplier, workflow as supplierWorkflow } from './supplier.js';
import { config as tuition, workflow as tuitionWorkflow } from './tuition.js';

export const INDUSTRY_ORDER = ['lorry', 'workshop', 'renovation', 'supplier', 'tuition'];

export const CONFIG = {
  lorry,
  workshop,
  renovation,
  supplier,
  tuition,
};

export const WORKFLOWS = Object.fromEntries(
  [
    ['lorry', lorryWorkflow],
    ['workshop', workshopWorkflow],
    ['renovation', renovationWorkflow],
    ['supplier', supplierWorkflow],
    ['tuition', tuitionWorkflow],
  ].filter(([, workflow]) => workflow),
);

export function getIndustry(key) {
  return CONFIG[key] || null;
}
