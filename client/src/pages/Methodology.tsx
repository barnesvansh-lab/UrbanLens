import React from 'react';
import { BookOpen, Calculator, ShieldAlert, Cpu, Network } from 'lucide-react';
import { DemoNotice } from '../components/ui/DemoNotice';

export const Methodology: React.FC = () => {
  return (
    <div className="space-y-6">
      <DemoNotice />

      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">
              Analytical Methodology & Mathematical Formulations
            </h2>
            <p className="text-xs text-slate-500">
              Rigorous definitions, scoring algorithms, and statistical limits of the UrbanLens platform
            </p>
          </div>
        </div>
      </div>

      {/* Methodology Section 1: End-to-End Pipeline */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
        <h3 className="text-base font-semibold text-slate-800 mb-2 flex items-center gap-2">
          <Network className="w-4 h-4 text-indigo-600" />
          <span>Urban Intelligence Pipeline Architecture</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Structured 4-stage data pipeline designed to ingest, normalize, and score urban micro-market signals
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-indigo-600 block mb-1">
              Stage 1: Ingestion
            </span>
            <h4 className="font-bold text-slate-800 mb-1">Raw Geospatial Ingest</h4>
            <p className="text-slate-600 leading-relaxed">
              Registrar deed sales filings, municipal building permits, and OpenStreetMap vector geometries are ingested into spatial PostgreSQL / PostGIS.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-indigo-600 block mb-1">
              Stage 2: Cleansing
            </span>
            <h4 className="font-bold text-slate-800 mb-1">Outlier Filtering</h4>
            <p className="text-slate-600 leading-relaxed">
              Transactions exceeding 3 standard deviations (inter-family transfers, distressed auctions) are identified via Grubbs test and trimmed.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-indigo-600 block mb-1">
              Stage 3: Modeling
            </span>
            <h4 className="font-bold text-slate-800 mb-1">Econometric Scoring</h4>
            <p className="text-slate-600 leading-relaxed">
              Price indices are constructed using repeat-sales hedonic regression. Forward projections are generated via SARIMA and Facebook Prophet.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-indigo-600 block mb-1">
              Stage 4: Serving
            </span>
            <h4 className="font-bold text-slate-800 mb-1">API & Vector Tiles</h4>
            <p className="text-slate-600 leading-relaxed">
              Aggregated neighborhood metrics are cached and served via low-latency REST endpoints to the React client dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* Methodology Section 2: Mathematical Formulations */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-5">
        <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
          <Calculator className="w-4 h-4 text-indigo-600" />
          <span>Core Mathematical & Financial Formulations</span>
        </h3>

        {/* EMI Formula */}
        <div className="p-4 rounded-lg bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto space-y-2">
          <span className="text-indigo-400 font-bold block">// 1. Equated Monthly Installment (Reducing Balance):</span>
          <div className="text-sm text-emerald-400 font-semibold py-1">
            EMI = [ P × r × (1 + r)ⁿ ] / [ (1 + r)ⁿ − 1 ]
          </div>
          <p className="text-slate-400 font-sans text-xs">
            Where: <strong>P</strong> = Principal loan amount (₹), <strong>r</strong> = Monthly interest rate (annual rate / 1200), <strong>n</strong> = Loan tenure in total months (tenure years × 12).
          </p>
        </div>

        {/* Affordability Index Formula */}
        <div className="p-4 rounded-lg bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto space-y-2">
          <span className="text-indigo-400 font-bold block">// 2. Citywide Affordability Score (0 – 100 Index):</span>
          <div className="text-sm text-emerald-400 font-semibold py-1">
            Affordability Score = min(100, [ (Median Monthly Household Income × 0.35) / EMI_median ] × 100)
          </div>
          <p className="text-slate-400 font-sans text-xs">
            Assumes a prudent maximum debt-to-income (DTI) ratio of 35%. A score of 100 indicates a median income earner can easily service the median mortgage obligation with a standard 20% down payment.
          </p>
        </div>

        {/* Gentrification Risk Formula */}
        <div className="p-4 rounded-lg bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto space-y-2">
          <span className="text-indigo-400 font-bold block">// 3. Gentrification Vulnerability Index:</span>
          <div className="text-sm text-emerald-400 font-semibold py-1">
            GVI = w₁·(ΔPrice_5Y / Metro_Avg) + w₂·(ΔRent_3Y / Metro_Avg) + w₃·(Amenity_Growth_Score)
          </div>
          <p className="text-slate-400 font-sans text-xs">
            Where weights w₁ = 0.45, w₂ = 0.35, w₃ = 0.20. Areas exceeding +1.5 standard deviations above the metro trend line are categorized as High Risk.
          </p>
        </div>
      </div>

      {/* Methodology Section 3: Time Series & ML Models */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
        <h3 className="text-base font-semibold text-slate-800 mb-2 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-600" />
          <span>Forecasting Model Formulation (SARIMA & Prophet)</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Theoretical foundation for time-series projection engines
        </p>

        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <p>
            Real estate price series exhibit strong non-stationarity, autoregressive persistence, and distinct annual seasonal cycles (festival spikes in Q3/Q4 and monsoon slowdowns in Q2).
          </p>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">
              General SARIMA Model Equation:
            </span>
            <code className="text-indigo-600 font-mono text-[11px] block mb-1">
              Φ_P(B^s) · φ_p(B) · (1 − B^s)^D · (1 − B)^d · Y_t = Θ_Q(B^s) · θ_q(B) · ε_t
            </code>
            <span>
              Where <em>B</em> represents the backward shift operator, <em>s=12</em> represents the annual period, and <em>ε_t</em> is a zero-mean white noise process.
            </span>
          </div>
          <p>
            In Milestone 1, synthetic values simulate this dynamic to demonstrate UI responsiveness and data contract structures prior to live model execution.
          </p>
        </div>
      </div>

      {/* Methodology Section 4: Academic & Engineering Limitations */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
        <h3 className="text-base font-semibold text-slate-800 mb-2 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          <span>Assumptions & Operational Limitations</span>
        </h3>

        <ul className="list-disc list-inside space-y-2 text-xs text-slate-600 leading-relaxed">
          <li>
            <strong>Synthetic Data Mode</strong>: All figures presented are programmatic approximations and should never be used as appraisal baselines for financial transactions.
          </li>
          <li>
            <strong>Homogeneity Assumption</strong>: Averages do not capture floor-rise premiums, unit-level views, or micro-developer distress discounts.
          </li>
          <li>
            <strong>Black Swan Exposures</strong>: Macroeconomic interest rate shifts or sudden regulatory policy changes (e.g., stamp duty revisions) are modeled parametrically and may differ from sudden real-world shocks.
          </li>
          <li>
            <strong>No Brokerage or Marketplace Intent</strong>: UrbanLens is strictly an analytics engine. It does not list properties for sale or facilitate real estate agent engagements.
          </li>
        </ul>
      </div>
    </div>
  );
};
