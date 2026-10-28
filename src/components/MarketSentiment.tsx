import { MessageSquare, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import type { Company } from '../types';
import { companySentiment, scoreNews, sentimentLabel } from '../analysis/sentiment';

const BADGE = {
  Positive: 'bg-green-100 text-green-800',
  Negative: 'bg-red-100 text-red-800',
  Neutral: 'bg-gray-100 text-gray-800',
};

export function MarketSentiment({ companies, selected }: { companies: Company[]; selected: Company | null }) {
  const scope = selected ? [selected] : companies;
  const news = scope
    .flatMap(company => company.news.map(item => ({ company, item, score: scoreNews(item) })))
    .sort((a, b) => b.item.date.localeCompare(a.item.date));
  const average = news.length ? news.reduce((sum, n) => sum + n.score, 0) / news.length : 0;
  const overall = sentimentLabel(average);
  const Icon = overall === 'Positive' ? TrendingUp : overall === 'Negative' ? TrendingDown : Minus;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center mb-4">
        <MessageSquare className="h-6 w-6 text-blue-500 mr-2" />
        <h2 className="text-lg font-semibold">News Sentiment{selected ? `: ${selected.name}` : ''}</h2>
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium">{selected ? 'Coverage tone' : 'Overall market tone'}</span>
        <span className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full ${BADGE[overall]}`}>
          <Icon className="h-4 w-4" /> {overall} ({average.toFixed(1)})
        </span>
      </div>

      {!selected && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
          {companies.map(company => {
            const s = companySentiment(company);
            const label = sentimentLabel(s.average);
            return (
              <div key={company.id} className="flex items-center justify-between text-xs border rounded px-2 py-1">
                <span className="font-medium">{company.ticker}</span>
                <span className={`px-1.5 rounded ${BADGE[label]}`}>{s.average.toFixed(1)}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="space-y-3">
        {news.map(({ company, item, score }) => {
          const label = sentimentLabel(score);
          return (
            <div key={`${company.id}-${item.title}`} className="border rounded-lg p-4">
              <div className="flex justify-between items-start gap-2 mb-2">
                <h3 className="text-sm font-medium">{item.title}</h3>
                <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${BADGE[label]}`}>
                  {label} ({score > 0 ? '+' : ''}{score})
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{item.content}</p>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{item.source}{selected ? '' : ` · ${company.ticker}`}</span>
                <span>{item.date}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
