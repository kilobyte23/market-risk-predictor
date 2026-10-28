import { describe, expect, it } from 'vitest';
import { generateDataset, splitDataset, trueExitProbability } from './dataset';
import { companyToFeatures } from './features';
import { MarketExitModel, rocAuc } from './model';
import { mockCompanies } from '../mockData';

describe('rocAuc', () => {
  it('is 1 for a perfect ranking and 0.5 for ties', () => {
    expect(rocAuc([0.1, 0.4, 0.8, 0.9], [0, 0, 1, 1])).toBe(1);
    expect(rocAuc([0.5, 0.5, 0.5, 0.5], [0, 1, 0, 1])).toBe(0.5);
  });
});

describe('synthetic dataset', () => {
  it('has learnable signal and a realistic exit rate', () => {
    const data = generateDataset(4000, 7);
    const rate = data.labels.reduce((a, b) => a + b, 0) / data.labels.length;
    expect(rate).toBeGreaterThan(0.12);
    expect(rate).toBeLessThan(0.3);
    expect(rocAuc(data.features.map(trueExitProbability), data.labels)).toBeGreaterThan(0.85);
  });
});

describe('MarketExitModel', () => {
  it('learns the signal, ranks real companies sensibly, and explains scores', async () => {
    const model = new MarketExitModel();
    const metrics = await model.train({ samples: 3000, epochs: 25 });

    expect(metrics.auc).toBeGreaterThan(0.8);
    expect(metrics.accuracy).toBeGreaterThanOrEqual(metrics.baselineAccuracy);

    const byTicker = Object.fromEntries(
      mockCompanies.map(c => [c.ticker, model.predict(companyToFeatures(c))]),
    );
    // Distressed companies score above healthy peers in the same industry.
    expect(byTicker.TVCP).toBeGreaterThan(byTicker.BRLS);
    expect(byTicker.SOLP).toBeGreaterThan(byTicker.ECOS);
    expect(byTicker.HRBR).toBeGreaterThan(byTicker.CRST);

    const tvcp = companyToFeatures(mockCompanies.find(c => c.ticker === 'TVCP')!);
    const factors = model.explain(tvcp);
    expect(factors).toHaveLength(10);
    expect(factors[0].impact).toBeGreaterThan(0);

    // The held-out split is separate from the training data.
    const { train, test } = splitDataset(generateDataset(100));
    expect(train.features.length + test.features.length).toBe(100);
    model.dispose();
  }, 120_000);
});
