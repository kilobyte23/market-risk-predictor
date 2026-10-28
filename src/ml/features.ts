import type { Company } from '../types';

export type FeatureGroup = 'financial' | 'workforce' | 'supplyChain';

export interface FeatureSpec {
  key: string;
  label: string;
  group: FeatureGroup;
  /** Raw metric value for a company. */
  raw: (c: Company) => number;
  /** Maps the raw value to [0, 1] where 1 is the riskiest end of the range. */
  toRisk: (raw: number) => number;
  /** How to show the raw value to a person. */
  format: (raw: number) => string;
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
/** Linear scale over [lo, hi]; `higherIsRiskier` picks the direction. */
const scale = (lo: number, hi: number, higherIsRiskier: boolean) => (x: number) => {
  const t = clamp01((x - lo) / (hi - lo));
  return higherIsRiskier ? t : 1 - t;
};
const pct = (x: number) => `${(x * 100).toFixed(1)}%`;

// The 10 model inputs. Ranges are fixed (not fitted per batch) so a company is
// scored the same way no matter which other companies are on screen.
export const FEATURES: FeatureSpec[] = [
  {
    key: 'debtRatio', label: 'Debt ratio', group: 'financial',
    raw: c => c.financialMetrics.debtRatio, toRisk: scale(0.1, 0.9, true), format: x => x.toFixed(2),
  },
  {
    key: 'currentRatio', label: 'Current ratio', group: 'financial',
    raw: c => c.financialMetrics.currentRatio, toRisk: scale(0.5, 2.5, false), format: x => x.toFixed(2),
  },
  {
    key: 'revenueGrowth', label: 'Revenue growth', group: 'financial',
    raw: c => c.financialMetrics.revenueGrowth, toRisk: scale(-0.3, 0.3, false), format: pct,
  },
  {
    key: 'profitMargin', label: 'Profit margin', group: 'financial',
    raw: c => c.financialMetrics.profitMargin, toRisk: scale(-0.2, 0.25, false), format: pct,
  },
  {
    key: 'interestCoverage', label: 'Interest coverage', group: 'financial',
    raw: c => c.financialMetrics.interestCoverage, toRisk: scale(0, 8, false), format: x => `${x.toFixed(1)}x`,
  },
  {
    key: 'layoffRate', label: 'Layoffs (share of staff)', group: 'workforce',
    raw: c => c.workforceMetrics.layoffCount / c.employees, toRisk: scale(0, 0.2, true), format: pct,
  },
  {
    key: 'turnoverRate', label: 'Staff turnover', group: 'workforce',
    raw: c => c.workforceMetrics.turnoverRate, toRisk: scale(0.05, 0.4, true), format: pct,
  },
  {
    key: 'hiringFreeze', label: 'Hiring freeze', group: 'workforce',
    raw: c => (c.workforceMetrics.hiringFreeze ? 1 : 0), toRisk: x => x, format: x => (x ? 'Yes' : 'No'),
  },
  {
    key: 'supplierDiversity', label: 'Supplier diversity', group: 'supplyChain',
    raw: c => c.supplyChainMetrics.supplierDiversity, toRisk: scale(0.1, 0.9, false), format: x => x.toFixed(2),
  },
  {
    key: 'geographicRisk', label: 'Geographic supply risk', group: 'supplyChain',
    raw: c => c.supplyChainMetrics.geographicRisk, toRisk: scale(10, 90, true), format: x => `${x.toFixed(0)}/100`,
  },
];

export const NUM_FEATURES = FEATURES.length;

/** Risk-oriented model input for a company: 10 numbers in [0, 1]. */
export function companyToFeatures(company: Company): number[] {
  return FEATURES.map(f => f.toRisk(f.raw(company)));
}

/** 0-100 health score per group (100 = healthy), from the same inputs the model sees. */
export function groupHealth(features: number[]): Record<FeatureGroup, number> {
  const groups: Record<FeatureGroup, number[]> = { financial: [], workforce: [], supplyChain: [] };
  FEATURES.forEach((f, i) => groups[f.group].push(features[i]));
  const health = (xs: number[]) => Math.round(100 * (1 - xs.reduce((a, b) => a + b, 0) / xs.length));
  return {
    financial: health(groups.financial),
    workforce: health(groups.workforce),
    supplyChain: health(groups.supplyChain),
  };
}
