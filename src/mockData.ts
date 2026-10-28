import { format, subDays } from 'date-fns';
import type { Company, PricePoint } from './types';
import { createRng } from './ml/dataset';

// All companies, metrics and news below are fictional.

/** Seeded random walk so charts don't change on every render. */
function priceHistory(seed: number, start: number, drift: number, volatility: number, days = 90): PricePoint[] {
  const rand = createRng(seed);
  const points: PricePoint[] = [];
  let price = start;
  for (let i = days - 1; i >= 0; i--) {
    points.push({ date: format(subDays(new Date(), i), 'yyyy-MM-dd'), price: Math.round(price * 100) / 100 });
    price = Math.max(1, price * (1 + drift + (rand() - 0.5) * volatility));
  }
  return points;
}

export const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'TechVision Corp',
    ticker: 'TVCP',
    industry: 'Technology',
    lastUpdated: '2026-10-20',
    marketCap: 5_200_000_000,
    employees: 12_500,
    headquarters: 'San Francisco, CA',
    priceHistory: priceHistory(1, 62, -0.004, 0.05),
    financialMetrics: {
      debtRatio: 0.68, currentRatio: 0.9, quickRatio: 0.6, cashFlow: -15_000_000, profitMargin: -0.06,
      revenueGrowth: -0.14, debtToEquity: 1.8, interestCoverage: 1.1, lastFilingDate: '2026-08-15',
    },
    workforceMetrics: {
      layoffCount: 1_850, hiringFreeze: true, turnoverRate: 0.27, jobPostings: 45, seniorExitRate: 0.15,
      departmentChanges: [
        { department: 'Engineering', changePercent: -15, trend: 'decrease' },
        { department: 'Sales', changePercent: -20, trend: 'decrease' },
      ],
    },
    supplyChainMetrics: {
      supplierDiversity: 0.35, inventoryTurnover: 6.2, leadTime: 45, supplierRiskScore: 68, geographicRisk: 72,
      mainSuppliers: [
        { name: 'GlobalTech Solutions', riskScore: 65, country: 'Taiwan', dependency: 0.35 },
        { name: 'MicroComponents Ltd', riskScore: 72, country: 'China', dependency: 0.28 },
      ],
    },
    news: [
      { title: 'TechVision cuts 15% of staff as losses widen', content: 'The company announced layoffs and a hiring freeze after another quarter of falling revenue and weak demand.', date: '2026-10-18', source: 'Market Watch' },
      { title: 'Analysts downgrade TVCP on debt concerns', content: 'Several analysts warned that rising debt and negative cash flow could force a sale of the hardware division.', date: '2026-10-12', source: 'Finance Daily' },
    ],
  },
  {
    id: '2',
    name: 'Brightline Software',
    ticker: 'BRLS',
    industry: 'Technology',
    lastUpdated: '2026-10-20',
    marketCap: 14_800_000_000,
    employees: 9_400,
    headquarters: 'Seattle, WA',
    priceHistory: priceHistory(2, 118, 0.002, 0.03),
    financialMetrics: {
      debtRatio: 0.32, currentRatio: 2.1, quickRatio: 1.8, cashFlow: 140_000_000, profitMargin: 0.19,
      revenueGrowth: 0.18, debtToEquity: 0.5, interestCoverage: 9.5, lastFilingDate: '2026-08-02',
    },
    workforceMetrics: {
      layoffCount: 60, hiringFreeze: false, turnoverRate: 0.11, jobPostings: 320, seniorExitRate: 0.05,
      departmentChanges: [
        { department: 'Engineering', changePercent: 9, trend: 'increase' },
        { department: 'Support', changePercent: 0, trend: 'stable' },
      ],
    },
    supplyChainMetrics: {
      supplierDiversity: 0.8, inventoryTurnover: 11.0, leadTime: 12, supplierRiskScore: 25, geographicRisk: 22,
      mainSuppliers: [
        { name: 'Northwind Cloud', riskScore: 20, country: 'USA', dependency: 0.3 },
        { name: 'Helios Data Centers', riskScore: 28, country: 'Ireland', dependency: 0.2 },
      ],
    },
    news: [
      { title: 'Brightline beats earnings expectations again', content: 'Strong growth in subscriptions and excellent customer retention lifted profit to a record high.', date: '2026-10-16', source: 'Tech Daily' },
      { title: 'Brightline expands engineering hub', content: 'The company plans to hire 800 engineers to support new AI products and continued expansion.', date: '2026-10-05', source: 'Business Wire' },
    ],
  },
  {
    id: '3',
    name: 'EcoEnergy Solutions',
    ticker: 'ECOS',
    industry: 'Clean Energy',
    lastUpdated: '2026-10-20',
    marketCap: 3_800_000_000,
    employees: 8_200,
    headquarters: 'Austin, TX',
    priceHistory: priceHistory(3, 28, 0.001, 0.035),
    financialMetrics: {
      debtRatio: 0.45, currentRatio: 1.8, quickRatio: 1.4, cashFlow: 25_000_000, profitMargin: 0.12,
      revenueGrowth: 0.15, debtToEquity: 0.9, interestCoverage: 4.2, lastFilingDate: '2026-08-20',
    },
    workforceMetrics: {
      layoffCount: 120, hiringFreeze: false, turnoverRate: 0.12, jobPostings: 185, seniorExitRate: 0.08,
      departmentChanges: [
        { department: 'Research', changePercent: 12, trend: 'increase' },
        { department: 'Operations', changePercent: 8, trend: 'increase' },
      ],
    },
    supplyChainMetrics: {
      supplierDiversity: 0.72, inventoryTurnover: 8.5, leadTime: 30, supplierRiskScore: 42, geographicRisk: 38,
      mainSuppliers: [
        { name: 'SolarTech Manufacturing', riskScore: 35, country: 'USA', dependency: 0.25 },
        { name: 'GreenMaterials Co', riskScore: 40, country: 'Germany', dependency: 0.2 },
      ],
    },
    news: [
      { title: 'EcoEnergy wins new government contracts', content: 'Strong government backing and new contracts support steady growth in the clean energy market.', date: '2026-10-14', source: 'Industry Today' },
      { title: 'Panel supplier delays hit EcoEnergy installs', content: 'A key supplier facing production delays may slow installations next quarter.', date: '2026-10-09', source: 'Energy Wire' },
    ],
  },
  {
    id: '4',
    name: 'Solara Power',
    ticker: 'SOLP',
    industry: 'Clean Energy',
    lastUpdated: '2026-10-20',
    marketCap: 1_100_000_000,
    employees: 3_100,
    headquarters: 'Phoenix, AZ',
    priceHistory: priceHistory(4, 19, -0.002, 0.06),
    financialMetrics: {
      debtRatio: 0.74, currentRatio: 1.1, quickRatio: 0.7, cashFlow: -8_000_000, profitMargin: -0.02,
      revenueGrowth: -0.04, debtToEquity: 2.4, interestCoverage: 1.8, lastFilingDate: '2026-08-11',
    },
    workforceMetrics: {
      layoffCount: 240, hiringFreeze: true, turnoverRate: 0.21, jobPostings: 30, seniorExitRate: 0.12,
      departmentChanges: [
        { department: 'Installation', changePercent: -10, trend: 'decrease' },
        { department: 'R&D', changePercent: -5, trend: 'decrease' },
      ],
    },
    supplyChainMetrics: {
      supplierDiversity: 0.3, inventoryTurnover: 4.1, leadTime: 60, supplierRiskScore: 70, geographicRisk: 78,
      mainSuppliers: [
        { name: 'Pacific Cells', riskScore: 74, country: 'China', dependency: 0.55 },
        { name: 'Inverta GmbH', riskScore: 38, country: 'Germany', dependency: 0.15 },
      ],
    },
    news: [
      { title: 'Solara Power freezes hiring amid tariff uncertainty', content: 'The company paused hiring and warned that tariffs and weak demand could hurt margins.', date: '2026-10-17', source: 'Energy Wire' },
      { title: 'Solara explores options for residential unit', content: 'Sources say the company is considering selling or closing its struggling residential business.', date: '2026-10-02', source: 'Market Watch' },
    ],
  },
  {
    id: '5',
    name: 'Harbor Retail Group',
    ticker: 'HRBR',
    industry: 'Retail',
    lastUpdated: '2026-10-20',
    marketCap: 2_300_000_000,
    employees: 41_000,
    headquarters: 'Columbus, OH',
    priceHistory: priceHistory(5, 34, -0.001, 0.04),
    financialMetrics: {
      debtRatio: 0.58, currentRatio: 1.2, quickRatio: 0.5, cashFlow: 12_000_000, profitMargin: 0.02,
      revenueGrowth: -0.03, debtToEquity: 1.4, interestCoverage: 2.6, lastFilingDate: '2026-09-01',
    },
    workforceMetrics: {
      layoffCount: 1_600, hiringFreeze: false, turnoverRate: 0.34, jobPostings: 900, seniorExitRate: 0.09,
      departmentChanges: [
        { department: 'Stores', changePercent: -6, trend: 'decrease' },
        { department: 'E-commerce', changePercent: 14, trend: 'increase' },
      ],
    },
    supplyChainMetrics: {
      supplierDiversity: 0.62, inventoryTurnover: 5.0, leadTime: 40, supplierRiskScore: 50, geographicRisk: 55,
      mainSuppliers: [
        { name: 'Eastport Apparel', riskScore: 55, country: 'Vietnam', dependency: 0.22 },
        { name: 'Midwest Logistics', riskScore: 30, country: 'USA', dependency: 0.18 },
      ],
    },
    news: [
      { title: 'Harbor Retail closes 40 underperforming stores', content: 'The chain is closing stores but growing online sales, which rose for the fourth straight quarter.', date: '2026-10-15', source: 'Retail Dive' },
    ],
  },
  {
    id: '6',
    name: 'Crestline Outfitters',
    ticker: 'CRST',
    industry: 'Retail',
    lastUpdated: '2026-10-20',
    marketCap: 4_600_000_000,
    employees: 22_000,
    headquarters: 'Denver, CO',
    priceHistory: priceHistory(6, 51, 0.0015, 0.03),
    financialMetrics: {
      debtRatio: 0.38, currentRatio: 1.9, quickRatio: 1.0, cashFlow: 48_000_000, profitMargin: 0.09,
      revenueGrowth: 0.07, debtToEquity: 0.7, interestCoverage: 6.8, lastFilingDate: '2026-09-05',
    },
    workforceMetrics: {
      layoffCount: 150, hiringFreeze: false, turnoverRate: 0.22, jobPostings: 640, seniorExitRate: 0.06,
      departmentChanges: [
        { department: 'Stores', changePercent: 4, trend: 'increase' },
        { department: 'Corporate', changePercent: 0, trend: 'stable' },
      ],
    },
    supplyChainMetrics: {
      supplierDiversity: 0.7, inventoryTurnover: 6.5, leadTime: 28, supplierRiskScore: 35, geographicRisk: 40,
      mainSuppliers: [
        { name: 'Summit Textiles', riskScore: 32, country: 'Portugal', dependency: 0.2 },
        { name: 'TrailGear Mfg', riskScore: 41, country: 'Mexico', dependency: 0.18 },
      ],
    },
    news: [
      { title: 'Crestline posts solid quarter on strong outdoor demand', content: 'Healthy sales and improved margins helped the retailer raise its full-year outlook.', date: '2026-10-13', source: 'Retail Dive' },
    ],
  },
];
