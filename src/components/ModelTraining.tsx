import React, { useState, useEffect } from 'react';
import { Brain, Loader2 } from 'lucide-react';
import { MarketExitModel } from '../ml/model';

export function ModelTraining() {
  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [loss, setLoss] = useState(0);

  useEffect(() => {
    const trainModel = async () => {
      setIsTraining(true);
      const model = new MarketExitModel();

      try {
        await model.train((epoch, logs) => {
          setProgress(((epoch + 1) / 50) * 100);
          if (logs.acc) setAccuracy(logs.acc * 100);
          if (logs.loss) setLoss(logs.loss);
        });
      } catch (error) {
        console.error('Training failed:', error);
      } finally {
        setIsTraining(false);
        model.dispose();
      }
    };

    trainModel();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center mb-4">
        <Brain className="h-6 w-6 text-purple-500 mr-2" />
        <h2 className="text-lg font-semibold">Deep Learning Model Training</h2>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Training Progress</span>
            <span className="text-sm font-medium text-gray-900">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-sm font-medium text-purple-900 mb-1">Accuracy</div>
            <div className="text-2xl font-bold text-purple-700">
              {accuracy.toFixed(1)}%
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm font-medium text-blue-900 mb-1">Loss</div>
            <div className="text-2xl font-bold text-blue-700">
              {loss.toFixed(4)}
            </div>
          </div>
        </div>

        {isTraining && (
          <div className="flex items-center justify-center text-purple-600 gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm font-medium">Training in progress...</span>
          </div>
        )}
      </div>
    </div>
  );
}