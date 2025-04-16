import { Company, RiskAlert } from './types';
import { format, subDays } from 'date-fns';

export const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'TechVision Corp',
    ticker: 'TVCP',
    industry: 'Technology',
    riskScore: 75,
    financialHealth: 65,
    layoffScore: 80,
    supplyChainRisk: 70,
    lastUpdated: '2024-03-10',
    marketCap: 5200000000,
    employees: 12500,
    headquarters: 'San Francisco, CA',
    aiPredictions: {
      exitProbability: 0.68,
      confidenceScore: 0.85,
      timeframe: '12-18 months',
      factors: [
        {
          name: 'Declining Cash Reserves',
          impact: 0.8,
          description: 'Rapid depletion of cash reserves over last 3 quarters'
        },
        {
          name: 'Market Competition',
          impact: 0.75,
          description: 'Increasing market share loss to competitors'
        }
      ]
    },
    historicalData: Array.from({ length: 30 }, (_, i) => ({
      date: format(subDays(new Date(), i), 'yyyy-MM-dd'),
      riskScore: 75 + Math.random() * 10 - 5,
      stockPrice: 45 + Math.random() * 5,
      volume: 1000000 + Math.random() * 500000
    })),
    financialMetrics: {
      debtRatio: 0.65,
      currentRatio: 1.2,
      quickRatio: 0.9,
      cashFlow: -15000000,
      profitMargin: 0.08,
      revenueGrowth: -0.12,
      debtToEquity: 1.8,
      interestCoverage: 2.1,
      lastFilingDate: '2024-02-15'
    },
    workforceMetrics: {
      layoffCount: 850,
      hiringFreeze: true,
      turnoverRate: 0.25,
      jobPostings: 45,
      seniorExitRate: 0.15,
      departmentChanges: [
        {
          department: 'Engineering',
          changePercent: -15,
          trend: 'decrease'
        },
        {
          department: 'Sales',
          changePercent: -20,
          trend: 'decrease'
        }
      ]
    },
    supplyChainMetrics: {
      supplierDiversity: 0.45,
      inventoryTurnover: 6.2,
      leadTime: 45,
      supplierRiskScore: 68,
      geographicRisk: 72,
      mainSuppliers: [
        {
          name: 'GlobalTech Solutions',
          riskScore: 65,
          country: 'Taiwan',
          dependency: 0.35
        },
        {
          name: 'MicroComponents Ltd',
          riskScore: 72,
          country: 'China',
          dependency: 0.28
        }
      ]
    }
  },
  {
    id: '2',
    name: 'EcoEnergy Solutions',
    ticker: 'ECOS',
    industry: 'Clean Energy',
    riskScore: 45,
    financialHealth: 75,
    layoffScore: 35,
    supplyChainRisk: 40,
    lastUpdated: '2024-03-10',
    marketCap: 3800000000,
    employees: 8200,
    headquarters: 'Austin, TX',
    aiPredictions: {
      exitProbability: 0.32,
      confidenceScore: 0.78,
      timeframe: '24+ months',
      factors: [
        {
          name: 'Government Contracts',
          impact: 0.4,
          description: 'Strong government backing and contracts'
        },
        {
          name: 'Market Growth',
          impact: 0.3,
          description: 'Expanding clean energy market share'
        }
      ]
    },
    historicalData: Array.from({ length: 30 }, (_, i) => ({
      date: format(subDays(new Date(), i), 'yyyy-MM-dd'),
      riskScore: 45 + Math.random() * 8 - 4,
      stockPrice: 28 + Math.random() * 3,
      volume: 750000 + Math.random() * 300000
    })),
    financialMetrics: {
      debtRatio: 0.45,
      currentRatio: 1.8,
      quickRatio: 1.4,
      cashFlow: 25000000,
      profitMargin: 0.12,
      revenueGrowth: 0.15,
      debtToEquity: 0.9,
      interestCoverage: 4.2,
      lastFilingDate: '2024-02-20'
    },
    workforceMetrics: {
      layoffCount: 120,
      hiringFreeze: false,
      turnoverRate: 0.12,
      jobPostings: 185,
      seniorExitRate: 0.08,
      departmentChanges: [
        {
          department: 'Research',
          changePercent: 12,
          trend: 'increase'
        },
        {
          department: 'Operations',
          changePercent: 8,
          trend: 'increase'
        }
      ]
    },
    supplyChainMetrics: {
      supplierDiversity: 0.72,
      inventoryTurnover: 8.5,
      leadTime: 30,
      supplierRiskScore: 42,
      geographicRisk: 38,
      mainSuppliers: [
        {
          name: 'SolarTech Manufacturing',
          riskScore: 35,
          country: 'USA',
          dependency: 0.25
        },
        {
          name: 'GreenMaterials Co',
          riskScore: 40,
          country: 'Germany',
          dependency: 0.20
        }
      ]
    }
  }
];

export const mockAlerts: RiskAlert[] = [
  {
    id: '1',
    companyId: '1',
    type: 'financial',
    severity: 'critical',
    message: 'Significant decline in cash reserves',
    date: '2024-03-10',
    details: 'Cash reserves dropped by 45% in Q1 2024'
  },
  {
    id: '2',
    companyId: '1',
    type: 'workforce',
    severity: 'high',
    message: 'Mass layoff event detected',
    date: '2024-03-08',
    details: 'Company announced 15% workforce reduction'
  },
  {
    id: '3',
    companyId: '2',
    type: 'supply_chain',
    severity: 'medium',
    message: 'Supply chain disruption risk',
    date: '2024-03-09',
    details: 'Key supplier facing production delays'
  }
];