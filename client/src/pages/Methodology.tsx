import React from 'react';
import { BookOpen, Calculator, ShieldAlert, Cpu, Network, CheckCircle2 } from 'lucide-react';
import { DemoNotice } from '../components/ui/DemoNotice';
import { EditorialPageHeader } from '../components/ui/EditorialPageHeader';
import { SectionHeading } from '../components/ui/SectionHeading';
import { MethodologyAccordion } from '../components/ui/MethodologyAccordion';

export const Methodology: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10">
      <DemoNotice />

      {/* Editorial Page Header */}
      <EditorialPageHeader
        title="Analytical Methodology &amp; Mathematical Rigor"
        subtitle="Mathematical definitions, econometric formulations, spatial algorithms, and academic limitations."
        badge={
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-terracotta">
              Academic Documentation
            </span>
            <span className="text-stone">·</span>
            <span className="text-[10px] font-mono text-sage">Level 3 Technical Specification</span>
          </div>
        }
      />

      {/* Pipeline Architecture */}
      <section className="bg-paper rounded-lg border border-stone/70 p-6 sm:p-8 space-y-6">
        <SectionHeading
          title="Urban Intelligence Pipeline Architecture"
          subtitle="Structured 4-stage data pipeline designed to ingest, normalize, and score urban micro-market signals"
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-md bg-ivory/60 border border-stone/50 space-y-2">
            <span className="text-[10px] uppercase font-bold text-forest block">
              Stage 1: Ingestion
            </span>
            <h4 className="font-serif font-bold text-charcoal">Raw Geospatial Ingest</h4>
            <p className="text-sage leading-relaxed">
              Registrar deed sales filings, municipal building permits, and OpenStreetMap vector geometries are ingested into spatial PostgreSQL / PostGIS.
            </p>
          </div>

          <div className="p-4 rounded-md bg-ivory/60 border border-stone/50 space-y-2">
            <span className="text-[10px] uppercase font-bold text-forest block">
              Stage 2: Cleansing
            </span>
            <h4 className="font-serif font-bold text-charcoal">Outlier Filtering</h4>
            <p className="text-sage leading-relaxed">
              Transactions exceeding 3 standard deviations (inter-family transfers, distressed auctions) are identified via Grubbs test and trimmed.
            </p>
          </div>

          <div className="p-4 rounded-md bg-ivory/60 border border-stone/50 space-y-2">
            <span className="text-[10px] uppercase font-bold text-forest block">
              Stage 3: Modeling
            </span>
            <h4 className="font-serif font-bold text-charcoal">Econometric Scoring</h4>
            <p className="text-sage leading-relaxed">
              Price indices are constructed using repeat-sales hedonic regression. Forward projections are generated via SARIMA and Facebook Prophet.
            </p>
          </div>

          <div className="p-4 rounded-md bg-ivory/60 border border-stone/50 space-y-2">
            <span className="text-[10px] uppercase font-bold text-forest block">
              Stage 4: Serving
            </span>
            <h4 className="font-serif font-bold text-charcoal">API &amp; Vector Serving</h4>
            <p className="text-sage leading-relaxed">
              Aggregated neighborhood metrics are cached and served via low-latency REST endpoints to the React client dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* Core Mathematical Formulations */}
      <section className="bg-paper rounded-lg border border-stone/70 p-6 sm:p-8 space-y-6">
        <SectionHeading
          title="Core Mathematical &amp; Financial Formulations"
          subtitle="Formulas executed deterministically across the mortgage and transformation analysis engines"
        />

        {/* EMI Formula */}
        <div className="p-5 rounded-lg bg-forest text-ivory font-mono text-xs space-y-2.5">
          <span className="text-terracotta-light font-bold block">// 1. Equated Monthly Installment (Reducing Balance):</span>
          <div className="text-base text-ivory font-semibold py-1">
            EMI = [ P × r × (1 + r)ⁿ ] / [ (1 + r)ⁿ − 1 ]
          </div>
          <p className="text-sage font-sans text-xs leading-relaxed">
            Where: <strong>P</strong> = Principal loan amount (₹), <strong>r</strong> = Monthly interest rate (annual rate / 1200), <strong>n</strong> = Loan tenure in total months (tenure years × 12).
          </p>
        </div>

        {/* Affordability Index Formula */}
        <div className="p-5 rounded-lg bg-forest text-ivory font-mono text-xs space-y-2.5">
          <span className="text-terracotta-light font-bold block">// 2. Citywide Affordability Score (0 – 100 Index):</span>
          <div className="text-base text-ivory font-semibold py-1">
            Affordability Score = clamp( 100 − [ (EMI_median / Income_household) × 100 ], 0, 100 )
          </div>
          <p className="text-sage font-sans text-xs leading-relaxed">
            Normalizes the proportion of monthly household income needed to service a benchmark 20-year mortgage on a median 2BHK unit.
          </p>
        </div>

        {/* Haversine Formula */}
        <div className="p-5 rounded-lg bg-forest text-ivory font-mono text-xs space-y-2.5">
          <span className="text-terracotta-light font-bold block">// 3. Haversine Great-Circle Spatial Distance:</span>
          <div className="text-base text-ivory font-semibold py-1">
            d = 2R × arcsin( √[ sin²(Δφ/2) + cos(φ₁)cos(φ₂)sin²(Δλ/2) ] )
          </div>
          <p className="text-sage font-sans text-xs leading-relaxed">
            Where: <strong>R</strong> = 6,371 km (Earth radius), <strong>φ</strong> = Latitude in radians, <strong>λ</strong> = Longitude in radians. Used to calculate proximity to nearest civic facilities.
          </p>
        </div>
      </section>

      {/* Disclaimers & Ethics */}
      <section className="bg-paper rounded-lg border border-stone/70 p-6 space-y-3">
        <div className="flex items-center gap-2 text-forest text-sm font-semibold">
          <ShieldAlert className="w-4 h-4 text-terracotta" />
          <span>Academic Disclaimers &amp; Ethical Constraints</span>
        </div>
        <p className="text-xs text-charcoal/80 leading-relaxed">
          UrbanLens is developed as a computer science capstone research project. While empirical RBI HPI and OpenStreetMap datasets are integrated where available, illustrative synthetic variables are explicitly demarcated. Nothing on this platform constitutes formal real estate appraisal, commercial investment advice, or guaranteed banking pre-qualification.
        </p>
      </section>
    </div>
  );
};
