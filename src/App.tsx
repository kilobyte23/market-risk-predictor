import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertTriangle, TrendingDown, Users, Truck, Search, Brain, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import type { Company, RiskAlert } from './types';
import { mockCompanies, mockAlerts } from './mockData';
import { ModelTraining } from './components/ModelTraining';
import { MarketSentiment } from './components/MarketSentiment';
import { CompetitorAnalysis } from './components/CompetitorAnalysis';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  
  const { data: companies = mockCompanies, isLoading } = useQuery<Company[]>({
    queryKey: ['companies'],
    queryFn: async () => mockCompanies
  });

  const { data: alerts = mockAlerts } = useQuery<RiskAlert[]>({
    queryKey: ['alerts'],
    queryFn: async () => mockAlerts
  });

  const filteredCompanies = companies.filter(company => 
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.ticker.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const companyAlerts = alerts.filter(alert => 
    !selectedCompany || alert.companyId === selectedCompany.id
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <span className="ml-2 text-xl font-semibold">Market Exit Risk Predictor</span>
            </div>
            <div className="flex items-center space-x-4">
              <Brain className="h-6 w-6 text-purple-500" />
              <span className="text-sm font-medium">AI-Powered Analysis</span>
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
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ModelTraining />
            <MarketSentiment />
            
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Risk Alerts</h2>
              <div className="space-y-4">
                {companyAlerts.map(alert => (
                  <div key={alert.id} className={`p-4 rounded-lg ${
                    alert.severity === 'critical' ? 'bg-red-50 border-red-200' :
                    alert.severity === 'high' ? 'bg-orange-50 border-orange-200' :
                    alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-blue-50 border-blue-200'
                  } border`}>
                    <div className="flex items-start">
                      <AlertCircle className={`h-5 w-5 ${
                        alert.severity === 'critical' ? 'text-red-500' :
                        alert.severity === 'high' ? 'text-orange-500' :
                        alert.severity === 'medium' ? 'text-yellow-500' :
                        'text-blue-500'
                      } mt-0.5`} />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium">{alert.message}</h3>
                        <p className="text-sm text-gray-500 mt-1">{alert.details}</p>
                        <p className="text-xs text-gray-400 mt-1">{format(new Date(alert.date), 'MMM d, yyyy')}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedCompany && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4">Historical Risk Analysis</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={selectedCompany.historicalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="riskScore" stroke="#ef4444" name="Risk Score" />
                    <Line type="monotone" dataKey="stockPrice" stroke="#3b82f6" name="Stock Price" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <CompetitorAnalysis />
            {filteredCompanies.map((company) => (
              <div
                key={company.id}
                className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedCompany(company)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{company.name}</h3>
                    <p className="text-sm text-gray-500">{company.ticker} • {company.industry}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {company.headquarters} • {(company.marketCap / 1e9).toFixed(1)}B Market Cap
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full ${
                    company.riskScore >= 70 ? 'bg-red-100 text-red-800' :
                    company.riskScore >= 40 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    Risk: {company.riskScore}%
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <TrendingDown className="h-5 w-5 mx-auto text-blue-500 mb-1" />
                    <div className="text-sm font-medium">{company.financialHealth}%</div>
                    <div className="text-xs text-gray-500">Financial</div>
                  </div>
                  <div className="text-center">
                    <Users className="h-5 w-5 mx-auto text-purple-500 mb-1" />
                    <div className="text-sm font-medium">{company.layoffScore}%</div>
                    <div className="text-xs text-gray-500">Workforce</div>
                  </div>
                  <div className="text-center">
                    <Truck className="h-5 w-5 mx-auto text-green-500 mb-1" />
                    <div className="text-sm font-medium">{company.supplyChainRisk}%</div>
                    <div className="text-xs text-gray-500">Supply Chain</div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center mb-2">
                    <Brain className="h-5 w-5 text-purple-500 mr-2" />
                    <h4 className="text-sm font-semibold text-purple-900">AI Prediction</h4>
                  </div>
                  <p className="text-sm text-purple-900">
                    {company.aiPredictions.exitProbability * 100}% probability of market exit within {company.aiPredictions.timeframe}
                  </p>
                  <p className="text-xs text-purple-700 mt-1">
                    Confidence: {company.aiPredictions.confidenceScore * 100}%
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Key Risk Factors:</h4>
                  {company.aiPredictions.factors.map((factor, index) => (
                    <div key={index} className="text-sm text-gray-600">
                      • {factor.name} ({(factor.impact * 100).toFixed(0)}% impact)
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;