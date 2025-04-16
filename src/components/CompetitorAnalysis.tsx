import React from 'react';
import { Users, TrendingDown, Truck, BarChart3 } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';

interface CompetitorData {
  name: string;
  marketShare: number;
  riskScore: number;
  metrics: {
    financial: number;
    workforce: number;
    supplyChain: number;
    innovation: number;
    marketPresence: number;
  };
}

const competitors: CompetitorData[] = [
  {
    name: "TechVision Corp",
    marketShare: 25,
    riskScore: 75,
    metrics: {
      financial: 65,
      workforce: 80,
      supplyChain: 70,
      innovation: 85,
      marketPresence: 75
    }
  },
  {
    name: "EcoEnergy Solutions",
    marketShare: 18,
    riskScore: 45,
    metrics: {
      financial: 75,
      workforce: 65,
      supplyChain: 80,
      innovation: 70,
      marketPresence: 60
    }
  }
];

export function CompetitorAnalysis() {
  const getRadarData = (competitor: CompetitorData) => {
    return Object.entries(competitor.metrics).map(([key, value]) => ({
      subject: key.charAt(0).toUpperCase() + key.slice(1),
      value: value
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center mb-6">
        <BarChart3 className="h-6 w-6 text-indigo-500 mr-2" />
        <h2 className="text-lg font-semibold">Competitor Analysis</h2>
      </div>

      <div className="space-y-6">
        {competitors.map((competitor, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-md font-semibold">{competitor.name}</h3>
                <p className="text-sm text-gray-500">
                  Market Share: {competitor.marketShare}%
                </p>
              </div>
              <div className={`px-3 py-1 rounded-full ${
                competitor.riskScore >= 70 ? 'bg-red-100 text-red-800' :
                competitor.riskScore >= 40 ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                Risk Score: {competitor.riskScore}
              </div>
            </div>

            <div className="h-48 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={getRadarData(competitor)}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <Radar
                    name={competitor.name}
                    dataKey="value"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <TrendingDown className="h-5 w-5 mx-auto text-blue-500 mb-1" />
                <div className="text-sm font-medium">
                  {competitor.metrics.financial}%
                </div>
                <div className="text-xs text-gray-500">Financial</div>
              </div>
              <div className="text-center">
                <Users className="h-5 w-5 mx-auto text-purple-500 mb-1" />
                <div className="text-sm font-medium">
                  {competitor.metrics.workforce}%
                </div>
                <div className="text-xs text-gray-500">Workforce</div>
              </div>
              <div className="text-center">
                <Truck className="h-5 w-5 mx-auto text-green-500 mb-1" />
                <div className="text-sm font-medium">
                  {competitor.metrics.supplyChain}%
                </div>
                <div className="text-xs text-gray-500">Supply Chain</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}