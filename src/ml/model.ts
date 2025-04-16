import * as tf from '@tensorflow/tfjs';
import { TrainingData, generateTrainingData, normalizeData } from './dataset';

export class MarketExitModel {
  private model: tf.LayersModel;
  
  constructor() {
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [10],
          units: 32,
          activation: 'relu',
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: 16,
          activation: 'relu',
        }),
        tf.layers.dropout({ rate: 0.1 }),
        tf.layers.dense({
          units: 1,
          activation: 'sigmoid',
        }),
      ],
    });

    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy'],
    });
  }

  async train(onProgress: (epoch: number, logs: tf.Logs) => void): Promise<void> {
    const trainingData = generateTrainingData(1000);
    const { features, labels } = normalizeData(trainingData);

    const xs = tf.tensor2d(features);
    const ys = tf.tensor2d(labels, [labels.length, 1]);

    await this.model.fit(xs, ys, {
      epochs: 50,
      batchSize: 32,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          onProgress(epoch, logs || {});
        },
      },
    });

    xs.dispose();
    ys.dispose();
  }

  async predict(input: number[]): Promise<number> {
    const inputTensor = tf.tensor2d([input]);
    const prediction = await this.model.predict(inputTensor) as tf.Tensor;
    const value = (await prediction.data())[0];
    inputTensor.dispose();
    prediction.dispose();
    return value;
  }

  dispose(): void {
    this.model.dispose();
  }
}