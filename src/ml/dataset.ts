import { FEATURES, NUM_FEATURES } from './features';

export interface Dataset {
  features: number[][];
  labels: number[];
}

/** Small seeded PRNG (mulberry32) so training data is reproducible. */
export function createRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// The hidden "ground truth" used to label synthetic companies. Weights are on
// the risk-oriented [0, 1] features, in FEATURES order. Cash and growth problems
// and layoffs matter most; supply chain matters least. The model never sees
// these numbers, it has to learn them from the labelled samples.
export const TRUE_WEIGHTS = [1.4, 1.1, 2.2, 1.8, 1.2, 2.4, 0.9, 0.9, 0.7, 0.9];
const TRUE_BIAS = -9.6; // gives roughly a 20% exit rate
// Distressed companies tend to have several problems at once.
const DISTRESS_INTERACTION = 2.0;

const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

/** True exit probability for a feature vector under the hidden rule. */
export function trueExitProbability(x: number[]): number {
  const financial = (x[2] + x[3] + x[4]) / 3;
  const workforce = (x[5] + x[7]) / 2;
  let z = TRUE_BIAS + DISTRESS_INTERACTION * financial * workforce;
  for (let i = 0; i < NUM_FEATURES; i++) z += TRUE_WEIGHTS[i] * x[i];
  return sigmoid(z);
}

/**
 * Synthetic companies whose exit label depends on their metrics (plus noise),
 * so there is real signal to learn. Features are already in risk-oriented
 * [0, 1] space, the same space `companyToFeatures` produces.
 */
export function generateDataset(numSamples: number, seed = 42): Dataset {
  const rand = createRng(seed);
  const features: number[][] = [];
  const labels: number[] = [];
  for (let n = 0; n < numSamples; n++) {
    // A latent "health" pulls all metrics in the same direction, like real companies.
    const distress = rand();
    const x = FEATURES.map(f => {
      if (f.key === 'hiringFreeze') return rand() < 0.1 + 0.5 * distress ? 1 : 0;
      const noise = (rand() + rand()) / 2;
      return Math.min(1, Math.max(0, 0.5 * distress + 0.6 * noise - 0.05));
    });
    features.push(x);
    labels.push(rand() < trueExitProbability(x) ? 1 : 0);
  }
  return { features, labels };
}

/** Deterministic train/test split. */
export function splitDataset(data: Dataset, testFraction = 0.2): { train: Dataset; test: Dataset } {
  const cut = Math.floor(data.features.length * (1 - testFraction));
  return {
    train: { features: data.features.slice(0, cut), labels: data.labels.slice(0, cut) },
    test: { features: data.features.slice(cut), labels: data.labels.slice(cut) },
  };
}
