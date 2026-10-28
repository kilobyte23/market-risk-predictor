export interface Company {
  id: string;
  name: string;
  ticker: string;
  industry: string;
  lastUpdated: string;
  marketCap: number;
  employees: number;
  headquarters: string;
  /** Daily closing prices, oldest first. */
  priceHistory: PricePoint[];
  financialMetrics: FinancialMetrics;
  workforceMetrics: WorkforceMetrics;
  supplyChainMetrics: SupplyChainMetrics;
  news: NewsItem[];
}

export interface PricePoint {
  date: string;
  price: number;
}

export interface FinancialMetrics {
  debtRatio: number;
  currentRatio: number;
  quickRatio: number;
  /** Operating cash flow over the last quarter, in USD. */
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

export interface NewsItem {
  title: string;
  content: string;
  date: string;
  source: string;
}

export type AlertType = 'financial' | 'workforce' | 'supply_chain' | 'market';
export type Severity = 'low' | 'medium' | 'high' | 'critical';

export interface RiskAlert {
  id: string;
  companyId: string;
  type: AlertType;
  severity: Severity;
  message: string;
  date: string;
  details: string;
}
