import { useCallback, useEffect, useRef, useState } from 'react';
import type { Company } from '../types';
import { companyToFeatures } from './features';
import { EpochUpdate, EvaluationMetrics, FactorContribution, MarketExitModel } from './model';

export interface CompanyRisk {
  /** Model probability of a market exit, 0-1. */
  probability: number;
  /** Factors ranked by how much they push this company towards exiting. */
  factors: FactorContribution[];
}

export type ModelStatus = 'training' | 'ready' | 'error';

export interface RiskModelState {
  status: ModelStatus;
  history: EpochUpdate[];
  metrics: EvaluationMetrics | null;
  risks: Record<string, CompanyRisk>;
  error: string | null;
  retrain: () => void;
}

/** Trains the exit model in the browser, then scores every company with it. */
export function useRiskModel(companies: Company[]): RiskModelState {
  const [status, setStatus] = useState<ModelStatus>('training');
  const [history, setHistory] = useState<EpochUpdate[]>([]);
  const [metrics, setMetrics] = useState<EvaluationMetrics | null>(null);
  const [risks, setRisks] = useState<Record<string, CompanyRisk>>({});
  const [error, setError] = useState<string | null>(null);
  const [run, setRun] = useState(0);
  const modelRef = useRef<MarketExitModel | null>(null);

  useEffect(() => {
    let cancelled = false;
    const model = new MarketExitModel();
    setStatus('training');
    setHistory([]);
    setError(null);

    model
      .train({
        seed: 42 + run,
        onEpoch: update => {
          if (!cancelled) setHistory(h => [...h, update]);
        },
      })
      .then(result => {
        if (cancelled) return model.dispose();
        modelRef.current?.dispose();
        modelRef.current = model;
        setMetrics(result);
        setStatus('ready');
      })
      .catch(e => {
        model.dispose();
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e));
          setStatus('error');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [run]);

  // Score companies whenever the model or the company list changes.
  useEffect(() => {
    const model = modelRef.current;
    if (status !== 'ready' || !model) return;
    const next: Record<string, CompanyRisk> = {};
    for (const company of companies) {
      const x = companyToFeatures(company);
      next[company.id] = { probability: model.predict(x), factors: model.explain(x) };
    }
    setRisks(next);
  }, [status, companies]);

  useEffect(() => () => modelRef.current?.dispose(), []);

  const retrain = useCallback(() => setRun(r => r + 1), []);
  return { status, history, metrics, risks, error, retrain };
}

export function riskBand(probability: number): { label: string; timeframe: string; className: string } {
  if (probability >= 0.6) return { label: 'High', timeframe: 'within 12 months', className: 'bg-red-100 text-red-800' };
  if (probability >= 0.3) return { label: 'Elevated', timeframe: 'within 12-24 months', className: 'bg-yellow-100 text-yellow-800' };
  return { label: 'Low', timeframe: 'not expected in the next 24 months', className: 'bg-green-100 text-green-800' };
}
