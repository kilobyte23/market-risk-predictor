import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertCircle, AlertTriangle, Brain, Search, TrendingDown, Truck, Users, X } from 'lucide-react';
import { format } from 'date-fns';
import type { Company, Severity } from './types';
import { mockCompanies } from './mockData';
import { deriveAlerts } from './analysis/alerts';
import { companyToFeatures, FEATURES, groupHealth } from './ml/features';
import { riskBand, useRiskModel } from './ml/useRiskModel';
import { ModelTraining } from './components/ModelTraining';
import { MarketSentiment } from './components/MarketSentiment';
import { CompetitorAnalysis } from './components/CompetitorAnalysis';

const SEVERITY_STYLE: Record<Severity, { box: string; icon: string }> = {
  critical: { box: 'bg-red-50 border-red-200', icon: 'text-red-500' },
  high: { box: 'bg-orange-50 border-orange-200', icon: 'text-orange-500' },
  medium: { box: 'bg-yellow-50 border-yellow-200', icon: 'text-yellow-500' },
  low: { box: 'bg-blue-50 border-blue-200', icon: 'text-blue-500' },
};

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Swap this queryFn for a real API call to use live data.
  const { data: companies = [], isLoading } = useQuery<Company[]>({
    queryKey: ['companies'],
    queryFn: async () => mockCompanies,
  });

  const model = useRiskModel(companies);
  const selectedCompany = companies.find(c => c.id === selectedId) ?? null;

  const alerts = useMemo(() => companies.flatMap(deriveAlerts), [companies]);
  const companyAlerts = alerts.filter(a => !selectedCompany || a.companyId === selectedCompany.id);

  const query = searchQuery.trim().toLowerCase();
  const filteredCompanies = companies
    .filter(c => c.name.toLowerCase().includes(query) || c.ticker.toLowerCase().includes(query))
    .sort((a, b) => (model.risks[b.id]?.probability ?? 0) - (model.risks[a.id]?.probability ?? 0));

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <span className="ml-2 text-xl font-semibold">Market Exit Risk Predictor</span>
            </div>
            <div className="flex items-center space-x-2">
              <Brain className="h-6 w-6 text-purple-500" />
              <span className="text-sm font-medium">
                {model.status === 'ready' ? 'Model ready' : model.status === 'error' ? 'Model error' : 'Training model…'}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search companies or tickers..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {selectedCompany && (
              <CompanyDetail company={selectedCompany} model={model} onClose={() => setSelectedId(null)} />
            )}

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">
                Risk Alerts{selectedCompany ? `: ${selectedCompany.name}` : ''}
                <span className="ml-2 text-sm font-normal text-gray-500">({companyAlerts.length})</span>
              </h2>
              {companyAlerts.length === 0 && <p className="text-sm text-gray-500">No warning signs in the latest metrics.</p>}
              <div className="space-y-3">
                {companyAlerts.map(alert => (
                  <div key={alert.id} className={`p-4 rounded-lg border ${SEVERITY_STYLE[alert.severity].box}`}>
                    <div className="flex items-start">
                      <AlertCircle className={`h-5 w-5 mt-0.5 ${SEVERITY_STYLE[alert.severity].icon}`} />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium">
                          {alert.message}
                          {!selectedCompany && (
                            <span className="ml-2 text-xs text-gray-500">
                              {companies.find(c => c.id === alert.companyId)?.ticker}
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">{alert.details}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {alert.severity.toUpperCase()} · {format(new Date(alert.date), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <MarketSentiment companies={companies} selected={selectedCompany} />
            <ModelTraining model={model} />
          </div>

          <div className="space-y-6">
            <CompetitorAnalysis companies={companies} selected={selectedCompany} risks={model.risks} />
            {isLoading && <p className="text-sm text-gray-500">Loading companies…</p>}
            {!isLoading && filteredCompanies.length === 0 && (
              <p className="text-sm text-gray-500">No companies match "{searchQuery}".</p>
            )}
            {filteredCompanies.map(company => {
              const risk = model.risks[company.id];
              const health = groupHealth(companyToFeatures(company));
              const band = risk ? riskBand(risk.probability) : null;
              return (
                <div
                  key={company.id}
                  className={`bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow ${
                    company.id === selectedId ? 'ring-2 ring-purple-400' : ''
                  }`}
                  onClick={() => setSelectedId(company.id)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{company.name}</h3>
                      <p className="text-sm text-gray-500">{company.ticker} • {company.industry}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {company.headquarters} • {(company.marketCap / 1e9).toFixed(1)}B Market Cap
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${band?.className ?? 'bg-gray-100 text-gray-500'}`}>
                      {risk ? `Risk: ${(risk.probability * 100).toFixed(0)}%` : 'Scoring…'}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <HealthStat icon={<TrendingDown className="h-5 w-5 mx-auto text-blue-500 mb-1" />} value={health.financial} label="Financial" />
                    <HealthStat icon={<Users className="h-5 w-5 mx-auto text-purple-500 mb-1" />} value={health.workforce} label="Workforce" />
                    <HealthStat icon={<Truck className="h-5 w-5 mx-auto text-green-500 mb-1" />} value={health.supplyChain} label="Supply Chain" />
                  </div>

                  {risk && (
                    <p className="text-xs text-gray-500 mt-4">
                      Top driver: <span className="font-medium text-gray-700">{risk.factors[0].label}</span>
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

function HealthStat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="text-center">
      {icon}
      <div className="text-sm font-medium">{value}/100</div>
      <div className="text-xs text-gray-500">{label} health</div>
    </div>
  );
}

function CompanyDetail({ company, model, onClose }: {
  company: Company;
  model: ReturnType<typeof useRiskModel>;
  onClose: () => void;
}) {
  const risk = model.risks[company.id];
  const band = risk ? riskBand(risk.probability) : null;
  const rawByKey = Object.fromEntries(FEATURES.map(f => [f.key, f.format(f.raw(company))]));
  const maxImpact = risk ? Math.max(...risk.factors.map(f => Math.abs(f.impact)), 0.01) : 1;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-lg font-semibold">{company.name} ({company.ticker})</h2>
          <p className="text-sm text-gray-500">{company.industry} · {company.employees.toLocaleString()} employees</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="bg-purple-50 rounded-lg p-4 mb-6">
        <div className="flex items-center mb-2">
          <Brain className="h-5 w-5 text-purple-500 mr-2" />
          <h3 className="text-sm font-semibold text-purple-900">Model Prediction</h3>
        </div>
        {risk && band ? (
          <>
            <p className="text-sm text-purple-900">
              <span className="text-2xl font-bold mr-2">{(risk.probability * 100).toFixed(0)}%</span>
              probability of market exit · <span className="font-medium">{band.label}</span> risk, exit {band.timeframe}
            </p>
            {model.metrics && (
              <p className="text-xs text-purple-700 mt-1">Model test AUC {model.metrics.auc.toFixed(2)} on held-out data.</p>
            )}
          </>
        ) : (
          <p className="text-sm text-purple-700">Waiting for the model to finish training…</p>
        )}
      </div>

      {risk && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-1">What drives this score</h3>
          <p className="text-xs text-gray-500 mb-3">
            Change in exit probability compared with an average company's value for each metric.
          </p>
          <div className="space-y-2">
            {risk.factors.map(f => (
              <div key={f.key} className="flex items-center gap-3 text-sm">
                <span className="w-44 shrink-0 text-gray-700">{f.label}</span>
                <span className="w-16 shrink-0 text-right text-gray-500 text-xs">{rawByKey[f.key]}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded relative">
                  <div
                    className={`absolute top-0 h-2 rounded ${f.impact >= 0 ? 'bg-red-400 left-1/2' : 'bg-green-400 right-1/2'}`}
                    style={{ width: `${(Math.abs(f.impact) / maxImpact) * 50}%` }}
                  />
                </div>
                <span className={`w-14 text-right text-xs ${f.impact >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {f.impact >= 0 ? '+' : ''}{(f.impact * 100).toFixed(1)}pt
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <h3 className="text-sm font-semibold mb-2">Share price, last 90 days</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={company.priceHistory}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" fontSize={11} tickFormatter={d => format(new Date(d), 'MMM d')} minTickGap={30} />
          <YAxis fontSize={11} domain={['auto', 'auto']} />
          <Tooltip />
          <Line type="monotone" dataKey="price" stroke="#3b82f6" name="Price ($)" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default App;
