# Market Exit Risk Predictor

A React dashboard that estimates how likely a company is to exit a market. A small neural network trained in the browser with TensorFlow.js does the scoring, and the dashboard pairs it with risk alerts, market sentiment and competitor analysis.

> All company data, alerts and training data are **mock/synthetic** (`src/mockData.ts`, `src/ml/dataset.ts`). This is a prototype, not a financial tool.

## Features

- Searchable list of companies (by name or ticker) with per-company risk alerts
- **In-browser model training**: a dense network (10 features → 32 → 16 → 1, sigmoid) trained on generated data, with live epoch progress
- **Market sentiment** analysis using the `sentiment` library
- **Competitor analysis** view
- Charts with Recharts

## Tech stack

React 18, TypeScript, Vite, Tailwind CSS, TensorFlow.js, TanStack Query, Recharts, lucide-react

## Getting started

```bash
npm install
npm run dev
```

Other scripts:

| Command           | Description              |
| ----------------- | ------------------------ |
| `npm run build`   | Production build         |
| `npm run preview` | Preview production build |
| `npm run lint`    | Run ESLint               |

## Project structure

```
src/
  App.tsx                 Main dashboard
  components/             ModelTraining, MarketSentiment, CompetitorAnalysis
  ml/model.ts             TensorFlow.js model (train / predict)
  ml/dataset.ts           Synthetic training data and normalization
  mockData.ts, types.ts   Mock companies and alerts, shared types
```
