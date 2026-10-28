import { BarChart3 } from 'lucide-react';
import { Legend, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from 'recharts';
import type { Company } from '../types';
import { companyToFeatures, groupHealth } from '../ml/features';
import { companySentiment } from '../analysis/sentiment';
import type { CompanyRisk } from '../ml/useRiskModel';

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444'];

/** 0-100 scores for the radar, higher is healthier on every axis. */
function profile(company: Company, risk?: CompanyRisk) {
  const health = groupHealth(companyToFeatures(company));
  const sentiment = companySentiment(company).average;
  return {
    Finance: health.financial,
    Staff: health.workforce,
    Supply: health.supplyChain,
    News: Math.round(Math.min(100, Math.max(0, 50 + sentiment * 8))),
    Survival: risk ? Math.round(100 * (1 - risk.probability)) : 0,
  };
}

interface Props {
  companies: Company[];
  selected: Company | null;
  risks: Record<string, CompanyRisk>;
}

export function CompetitorAnalysis({ companies, selected, risks }: Props) {
  if (!selected) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-2">
          <BarChart3 className="h-6 w-6 text-indigo-500 mr-2" />
          <h2 className="text-lg font-semibold">Competitor Analysis</h2>
        </div>
        <p className="text-sm text-gray-500">Select a company to compare it with others in its industry.</p>
      </div>
    );
  }

  const peers = [selected, ...companies.filter(c => c.industry === selected.industry && c.id !== selected.id)];
  const profiles = peers.map(c => profile(c, risks[c.id]));
  const axes = Object.keys(profiles[0]) as (keyof ReturnType<typeof profile>)[];
  const data = axes.map(axis => {
    const row: Record<string, string | number> = { subject: axis };
    peers.forEach((c, i) => (row[c.ticker] = profiles[i][axis]));
    return row;
  });
  const industryCap = peers.reduce((sum, c) => sum + c.marketCap, 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <BarChart3 className="h-6 w-6 text-indigo-500 mr-2" />
        <h2 className="text-lg font-semibold">Competitor Analysis: {selected.industry}</h2>
      </div>

      {peers.length === 1 ? (
        <p className="text-sm text-gray-500">No other {selected.industry} companies are tracked yet.</p>
      ) : (
        <>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data} outerRadius="70%">
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" fontSize={11} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                {peers.map((c, i) => (
                  <Radar key={c.id} name={c.ticker} dataKey={c.ticker} stroke={COLORS[i % COLORS.length]}
                    fill={COLORS[i % COLORS.length]} fillOpacity={i === 0 ? 0.3 : 0.1} />
                ))}
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <table className="w-full text-sm mt-2">
            <thead>
              <tr className="text-xs text-gray-500 text-left">
                <th className="font-medium py-1">Company</th>
                <th className="font-medium">Share of peer cap</th>
                <th className="font-medium text-right">Exit risk</th>
              </tr>
            </thead>
            <tbody>
              {peers.map(c => (
                <tr key={c.id} className={c.id === selected.id ? 'font-semibold' : ''}>
                  <td className="py-1">{c.name}</td>
                  <td>{((c.marketCap / industryCap) * 100).toFixed(0)}%</td>
                  <td className="text-right">{risks[c.id] ? `${(risks[c.id].probability * 100).toFixed(0)}%` : '…'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-gray-400 mt-3">All axes 0-100, higher is healthier. Survival = 100 − model exit risk.</p>
        </>
      )}
    </div>
  );
}
