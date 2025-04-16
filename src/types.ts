export interface Company {
  id: string;
  name: string;
  ticker: string;
  industry: string;
  riskScore: number;
  financialHealth: number;
  layoffScore: number;
  supplyChainRisk: number;
  lastUpdated: string;
  marketCap: number;
  employees: number;
  headquarters: string;
  aiPredictions: AIPredictions;
  historicalData: HistoricalData[];
  financialMetrics: FinancialMetrics;
  workforceMetrics: WorkforceMetrics;
  supplyChainMetrics: SupplyChainMetrics;
}

export interface AIPredictions {
  exitProbability: number;
  confidenceScore: number;
  timeframe: string;
  factors: PredictionFactor[];
}

export interface PredictionFactor {
  name: string;
  impact: number;
  description: string;
}

export interface HistoricalData {
  date: string;
  riskScore: number;
  stockPrice: number;
  volume: number;
}

export interface FinancialMetrics {
  debtRatio: number;
  currentRatio: number;
  quickRatio: number;
  cashFlow: number;
  profitMargin: number;
  revenueGrowth: number;
  debtToEquity: number;
  interestCoverage: number;
  lastFilingDate: string;
}

export interface WorkforceMetrics {
  layoffCount: number;
  hiringFreeze: boolean;
  turnoverRate: number;
  jobPostings: number;
  seniorExitRate: number;
  departmentChanges: DepartmentChange[];
}

export interface DepartmentChange {
  department: string;
  changePercent: number;
  trend: 'increase' | 'decrease' | 'stable';
}

export interface SupplyChainMetrics {
  supplierDiversity: number;
  inventoryTurnover: number;
  leadTime: number;
  supplierRiskScore: number;
  geographicRisk: number;
  mainSuppliers: Supplier[];
}

export interface Supplier {
  name: string;
  riskScore: number;
  country: string;
  dependency: number;
}

export interface RiskAlert {
  id: string;
  companyId: string;
  type: 'financial' | 'workforce' | 'supply_chain' | 'market';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  date: string;
  details: string;
}