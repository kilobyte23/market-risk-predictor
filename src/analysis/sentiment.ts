import Sentiment from 'sentiment';
import type { Company, NewsItem } from '../types';

const analyzer = new Sentiment();

// Finance words the general-purpose AFINN lexicon misses or scores neutrally.
const FINANCE_LEXICON: Record<string, number> = {
  layoffs: -3, layoff: -3, downgrade: -3, losses: -3, widen: -1, tariffs: -2, tariff: -2,
  delays: -2, freeze: -2, freezes: -2, closing: -2, closes: -2, burn: -2, debt: -1,
  beats: 3, record: 2, expands: 2, expansion: 2, raise: 1, outlook: 1, retention: 1, contracts: 1,
};

export function scoreNews(item: NewsItem): number {
  return analyzer.analyze(`${item.title}. ${item.content}`, { extras: FINANCE_LEXICON }).score;
}

export interface CompanySentiment {
  average: number;
  positive: number;
  negative: number;
}

export function companySentiment(company: Company): CompanySentiment {
  const scores = company.news.map(scoreNews);
  return {
    average: scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
    positive: scores.filter(s => s > 0).length,
    negative: scores.filter(s => s < 0).length,
  };
}

export function sentimentLabel(score: number): 'Positive' | 'Negative' | 'Neutral' {
  if (score > 0.5) return 'Positive';
  if (score < -0.5) return 'Negative';
  return 'Neutral';
}
