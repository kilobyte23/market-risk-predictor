import * as tf from '@tensorflow/tfjs';
import { Dataset, generateDataset, splitDataset } from './dataset';
import { FEATURES, NUM_FEATURES } from './features';

export interface EpochUpdate {
  epoch: number;
  epochs: number;
  loss: number;
  accuracy: number;
  valLoss?: number;
  valAccuracy?: number;
}

export interface EvaluationMetrics {
  accuracy: number;
  /** Accuracy of always predicting "no exit". The model has to beat this. */
  baselineAccuracy: number;
  auc: number;
  positiveRate: number;
  testSize: number;
}

export interface FactorContribution {
  key: string;
  label: string;
  /** Change in exit probability compared with an average company's value. */
  impact: number;
}

export interface TrainOptions {
  samples?: number;
  epochs?: number;
  seed?: number;
  onEpoch?: (update: EpochUpdate) => void;
}

/**
 * Let the browser paint between epochs. Uses a MessageChannel rather than
 * requestAnimationFrame/setTimeout, which background tabs throttle to ~1/s.
 */
const yieldToUi = () =>
  new Promise<void>(resolve => {
    if (typeof MessageChannel === 'undefined') return void setTimeout(resolve, 0);
    const channel = new MessageChannel();
    channel.port1.onmessage = () => {
      channel.port1.close();
      resolve();
    };
    channel.port2.postMessage(null);
  });

/** Area under the ROC curve via the rank-sum (Mann-Whitney) formulation. */
export function rocAuc(scores: number[], labels: number[]): number {
  const order = scores.map((s, i) => [s, labels[i]] as const).sort((a, b) => a[0] - b[0]);
  let rankSum = 0;
  let positives = 0;
  for (let i = 0; i < order.length; ) {
    let j = i;
    while (j < order.length && order[j][0] === order[i][0]) j++;
    const avgRank = (i + j + 1) / 2; // 1-based average rank for ties
    for (let k = i; k < j; k++) {
      if (order[k][1] === 1) {
        rankSum += avgRank;
        positives++;
      }
    }
    i = j;
  }
  const negatives = order.length - positives;
  if (positives === 0 || negatives === 0) return 0.5;
  return (rankSum - (positives * (positives + 1)) / 2) / (positives * negatives);
}

export class MarketExitModel {
  private model: tf.Sequential;
  /** Mean of each training feature: the "average company" used for explanations. */
  private reference: number[] = new Array(NUM_FEATURES).fill(0.5);
  trained = false;

  constructor() {
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [NUM_FEATURES], units: 32, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 16, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.1 }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' }),
      ],
    });
    this.model.compile({
      optimizer: tf.train.adam(0.01),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy'],
    });
  }

  async train({ samples = 3000, epochs = 40, seed = 42, onEpoch }: TrainOptions = {}): Promise<EvaluationMetrics> {
    // The network and batches are tiny, so the CPU backend beats WebGL's upload overhead.
    await tf.setBackend('cpu');
    const { train, test } = splitDataset(generateDataset(samples, seed));
    this.reference = FEATURES.map((_, i) =>
      train.features.reduce((sum, row) => sum + row[i], 0) / train.features.length,
    );

    const xs = tf.tensor2d(train.features);
    const ys = tf.tensor2d(train.labels, [train.labels.length, 1]);
    try {
      await this.model.fit(xs, ys, {
        epochs,
        batchSize: 64,
        validationSplit: 0.15,
        shuffle: true,
        callbacks: {
          onEpochEnd: async (epoch, logs = {}) => {
            onEpoch?.({
              epoch: epoch + 1,
              epochs,
              loss: logs.loss,
              accuracy: logs.acc,
              valLoss: logs.val_loss,
              valAccuracy: logs.val_acc,
            });
            await yieldToUi();
          },
        },
      });
    } finally {
      xs.dispose();
      ys.dispose();
    }

    this.trained = true;
    return this.evaluate(test);
  }

  evaluate(data: Dataset): EvaluationMetrics {
    const scores = this.predictBatch(data.features);
    const correct = scores.filter((s, i) => (s >= 0.5 ? 1 : 0) === data.labels[i]).length;
    const positiveRate = data.labels.reduce((a, b) => a + b, 0) / data.labels.length;
    return {
      accuracy: correct / data.labels.length,
      baselineAccuracy: Math.max(positiveRate, 1 - positiveRate),
      auc: rocAuc(scores, data.labels),
      positiveRate,
      testSize: data.labels.length,
    };
  }

  predictBatch(inputs: number[][]): number[] {
    if (inputs.length === 0) return [];
    return tf.tidy(() => {
      const out = this.model.predict(tf.tensor2d(inputs)) as tf.Tensor;
      return Array.from(out.dataSync());
    });
  }

  predict(input: number[]): number {
    return this.predictBatch([input])[0];
  }

  /**
   * Per-feature contribution for one input: how much the exit probability
   * drops when that feature is reset to the average company's value.
   * Positive impact means the feature pushes this company towards exiting.
   */
  explain(input: number[]): FactorContribution[] {
    const variants = FEATURES.map((_, i) => {
      const copy = [...input];
      copy[i] = this.reference[i];
      return copy;
    });
    const [base, ...occluded] = this.predictBatch([input, ...variants]);
    return FEATURES.map((f, i) => ({ key: f.key, label: f.label, impact: base - occluded[i] }))
      .sort((a, b) => b.impact - a.impact);
  }

  dispose(): void {
    this.model.dispose();
  }
}
