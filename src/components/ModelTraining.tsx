import { Brain, Loader2, RefreshCw } from 'lucide-react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { RiskModelState } from '../ml/useRiskModel';

const pct = (x: number) => `${(x * 100).toFixed(1)}%`;

export function ModelTraining({ model }: { model: RiskModelState }) {
  const { status, history, metrics, error, retrain } = model;
  const last = history[history.length - 1];
  const progress = last ? (last.epoch / last.epochs) * 100 : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Brain className="h-6 w-6 text-purple-500 mr-2" />
          <h2 className="text-lg font-semibold">Exit Risk Model</h2>
        </div>
        <button
          onClick={retrain}
          disabled={status === 'training'}
          className="flex items-center gap-1 text-sm text-purple-700 hover:text-purple-900 disabled:text-gray-400"
        >
          <RefreshCw className="h-4 w-4" /> Retrain
        </button>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            {status === 'training' ? `Training: epoch ${last?.epoch ?? 0} of ${last?.epochs ?? '…'}` : 'Training complete'}
          </span>
          <span className="text-sm font-medium text-gray-900">{Math.round(status === 'ready' ? 100 : progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${status === 'ready' ? 100 : progress}%` }}
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600 mb-4">Training failed: {error}</p>}

      {history.length > 1 && (
        <div className="h-40 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="epoch" fontSize={11} />
              <YAxis fontSize={11} domain={[0, 'auto']} />
              <Tooltip formatter={(v: number) => v.toFixed(4)} />
              <Legend />
              <Line type="monotone" dataKey="loss" name="Training loss" stroke="#8b5cf6" dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="valLoss" name="Validation loss" stroke="#3b82f6" dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <Stat label="Test ROC AUC" value={metrics ? metrics.auc.toFixed(3) : '—'}
          hint={metrics ? `heuristic ${metrics.heuristicAuc.toFixed(2)} · ceiling ${metrics.oracleAuc.toFixed(2)}` : '0.5 = guessing, 1 = perfect'} />
        <Stat label="Test accuracy" value={metrics ? pct(metrics.accuracy) : '—'}
          hint={metrics ? `baseline ${pct(metrics.baselineAccuracy)}` : 'vs. always "no exit"'} />
        <Stat label="Brier score" value={metrics ? metrics.brier.toFixed(3) : '—'}
          hint={metrics ? `${metrics.testSize} held-out · ${pct(metrics.positiveRate)} exit` : 'lower is better'} />
      </div>

      {status === 'training' && (
        <div className="flex items-center justify-center text-purple-600 gap-2 mt-4">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm font-medium">Training in your browser…</span>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-4">
        Dense network (10 → 32 → 16 → 1) trained on synthetic companies whose exit labels depend on their
        financial, workforce and supply-chain metrics. Scores are evaluated on a held-out set the model never trained on.
      </p>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="bg-purple-50 rounded-lg p-3">
      <div className="text-xs font-medium text-purple-900 mb-1">{label}</div>
      <div className="text-xl font-bold text-purple-700">{value}</div>
      <div className="text-xs text-purple-600 mt-1">{hint}</div>
    </div>
  );
}
