export interface TrainingData {
  financialMetrics: number[];
  workforceMetrics: number[];
  supplyChainMetrics: number[];
  marketExitLabel: number;
}

// Generate synthetic dataset for training
export function generateTrainingData(numSamples: number): TrainingData[] {
  return Array.from({ length: numSamples }, () => ({
    financialMetrics: [
      Math.random(), // debt ratio
      Math.random(), // current ratio
      Math.random() * 2 - 1, // revenue growth
      Math.random(), // profit margin
    ],
    workforceMetrics: [
      Math.random(), // layoff rate
      Math.random(), // turnover rate
      Math.random(), // hiring freeze indicator
    ],
    supplyChainMetrics: [
      Math.random(), // supplier diversity
      Math.random(), // geographic risk
      Math.random(), // lead time performance
    ],
    marketExitLabel: Math.random() > 0.8 ? 1 : 0, // 20% market exit rate
  }));
}

export function normalizeData(data: TrainingData[]): {
  features: number[][];
  labels: number[];
} {
  const features = data.map(sample => [
    ...sample.financialMetrics,
    ...sample.workforceMetrics,
    ...sample.supplyChainMetrics,
  ]);

  const labels = data.map(sample => sample.marketExitLabel);

  // Min-max normalization
  const numFeatures = features[0].length;
  for (let i = 0; i < numFeatures; i++) {
    const column = features.map(row => row[i]);
    const min = Math.min(...column);
    const max = Math.max(...column);
    for (let j = 0; j < features.length; j++) {
      features[j][i] = (features[j][i] - min) / (max - min);
    }
  }

  return { features, labels };
}