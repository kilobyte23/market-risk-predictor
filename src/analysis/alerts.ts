import type { Company, RiskAlert, Severity } from '../types';
import { companySentiment } from './sentiment';

const SEVERITY_ORDER: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 };
const pct = (x: number) => `${(x * 100).toFixed(0)}%`;
const usd = (x: number) => `$${(Math.abs(x) / 1e6).toFixed(0)}M`;

/** Rule-based warning signs read straight from a company's metrics. */
export function deriveAlerts(company: Company): RiskAlert[] {
  const f = company.financialMetrics;
  const w = company.workforceMetrics;
  const s = company.supplyChainMetrics;
  const alerts: Omit<RiskAlert, 'id' | 'companyId'>[] = [];
  const add = (type: RiskAlert['type'], severity: Severity, message: string, details: string, date = company.lastUpdated) =>
    alerts.push({ type, severity, message, details, date });

  if (f.cashFlow < 0) {
    add('financial', f.currentRatio < 1 ? 'critical' : 'high', 'Negative operating cash flow',
      `Burned ${usd(f.cashFlow)} last quarter with a current ratio of ${f.currentRatio.toFixed(2)}.`, f.lastFilingDate);
  }
  if (f.interestCoverage < 1.5) {
    add('financial', 'critical', 'Earnings barely cover interest',
      `Interest coverage is ${f.interestCoverage.toFixed(1)}x; below 1.5x signals refinancing risk.`, f.lastFilingDate);
  } else if (f.interestCoverage < 2.5) {
    add('financial', 'medium', 'Thin interest coverage', `Interest coverage is ${f.interestCoverage.toFixed(1)}x.`, f.lastFilingDate);
  }
  if (f.revenueGrowth <= -0.1) {
    add('financial', 'high', 'Revenue in steep decline', `Revenue fell ${pct(-f.revenueGrowth)} year over year.`, f.lastFilingDate);
  } else if (f.revenueGrowth < 0) {
    add('financial', 'medium', 'Revenue shrinking', `Revenue fell ${pct(-f.revenueGrowth)} year over year.`, f.lastFilingDate);
  }

  const layoffRate = w.layoffCount / company.employees;
  if (layoffRate >= 0.1) {
    add('workforce', 'high', 'Mass layoff event', `${w.layoffCount.toLocaleString()} layoffs (${pct(layoffRate)} of staff).`);
  } else if (layoffRate >= 0.04) {
    add('workforce', 'medium', 'Significant layoffs', `${w.layoffCount.toLocaleString()} layoffs (${pct(layoffRate)} of staff).`);
  }
  if (w.hiringFreeze) add('workforce', 'medium', 'Hiring freeze in effect', `Only ${w.jobPostings} open job postings.`);
  if (w.seniorExitRate >= 0.12) {
    add('workforce', 'high', 'Leadership departures', `${pct(w.seniorExitRate)} of senior staff left in the last year.`);
  }

  for (const supplier of s.mainSuppliers) {
    if (supplier.dependency >= 0.3 && supplier.riskScore >= 60) {
      add('supply_chain', supplier.dependency >= 0.5 ? 'high' : 'medium', `Heavy reliance on a risky supplier`,
        `${pct(supplier.dependency)} of supply comes from ${supplier.name} (${supplier.country}), risk score ${supplier.riskScore}.`);
    }
  }
  if (s.geographicRisk >= 70) {
    add('supply_chain', 'medium', 'High geographic supply risk', `Geographic risk score ${s.geographicRisk}/100; lead time ${s.leadTime} days.`);
  }

  const sentiment = companySentiment(company);
  if (sentiment.average < -1) {
    add('market', sentiment.average < -3 ? 'high' : 'medium', 'Negative news coverage',
      `${sentiment.negative} of ${company.news.length} recent articles are negative.`,
      company.news[0]?.date ?? company.lastUpdated);
  }

  return alerts
    .map((a, i) => ({ ...a, id: `${company.id}-${i}`, companyId: company.id }))
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
}
