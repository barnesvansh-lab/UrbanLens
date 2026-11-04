import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  TrendingUp,
  MapPin,
  Sparkles,
  Calculator,
  Compass,
  Database,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { DemoNotice } from '../components/ui/DemoNotice';
import { MetricCard } from '../components/ui/MetricCard';
import { DataStatusBadge } from '../components/ui/DataStatusBadge';
import { PriceTrendChart } from '../components/charts/PriceTrendChart';
import { MarketOverviewChart } from '../components/charts/MarketOverviewChart';
import { MethodologyAccordion } from '../components/ui/MethodologyAccordion';
import { useApiSummary } from '../api/hooks';
import {
  marketIndicators,
  neighborhoods,
  priceTimeSeries,
} from '../data/syntheticData';

export const Overview: React.FC = () => {
  const recentData = priceTimeSeries.slice(-24);
  const { summary, loading: summaryLoading } = useApiSummary();

  const getRiskBadge = (risk: 'Low' | 'Medium' | 'High') => {
    switch (risk) {
      case 'Low':
        return 'bg-forest/10 text-forest border-forest/20';
      case 'Medium':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'High':
        return 'bg-terracotta/10 text-terracotta border-terracotta/20';
    }
  };

  const hasRealData = (summary?.data_status_breakdown.real || 0) > 0;
  const activeStatus = hasRealData ? 'real' : 'synthetic_test';

  return (
    <div className="w-full">
      {/* ── HERO SECTION: Editorial Introduction ── */}
      <section className="border-b border-stone/80 bg-paper/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest/5 border border-forest/15 text-forest text-xs font-semibold mb-6">
                <Compass className="w-3.5 h-3.5 text-terracotta" />
                <span className="tracking-wide uppercase text-[10px]">Urban Intelligence Atlas</span>
                <span className="text-stone">·</span>
                <span className="text-sage text-[10px] font-normal">Empirical RBI &amp; OSM Data</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-charcoal tracking-tight leading-[1.1] mb-6">
                Understand your city.<br />
                <span className="italic font-normal text-forest">Discover what is changing.</span>
              </h1>

              <p className="text-base sm:text-lg text-sage max-w-2xl leading-relaxed mb-8">
                Explore housing trends, neighbourhood development and affordability through data-driven urban intelligence.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/market-trends"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-forest text-ivory hover:bg-forest/90 font-medium text-sm transition-colors shadow-xs"
                >
                  <span>Explore Housing Market</span>
                  <ArrowRight className="w-4 h-4 text-terracotta" />
                </Link>
                <Link
                  to="/neighborhood"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-md border border-stone bg-paper hover:bg-ivory text-charcoal font-medium text-sm transition-colors"
                >
                  <span>Explore Neighbourhoods</span>
                </Link>
              </div>
            </div>

            {/* Stylized Architectural Card */}
            <div className="lg:col-span-4">
              <div className="p-6 rounded-lg bg-paper border border-stone/80 shadow-xs relative overflow-hidden">
                <div className="text-[10px] uppercase tracking-wider font-semibold text-sage mb-1">
                  Atlas Coverage &amp; Grounding
                </div>
                <h3 className="font-serif text-lg font-semibold text-charcoal mb-4">
                  Institutional Data Foundations
                </h3>

                <ul className="space-y-3 text-xs text-charcoal/80 mb-5">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                    <span><strong>Reserve Bank of India (RBI):</strong> Quarterly House Price Index (2010–2025) across 10 metropolitan centers.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                    <span><strong>OpenStreetMap (OSM):</strong> Genuine spatial infrastructure, transit nodes, and amenity footprints in South Mumbai.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
                    <span><strong>Documented Demarcation:</strong> Micro-level indicators clearly labeled where synthetic testing complements macro data.</span>
                  </li>
                </ul>

                <div className="pt-3 border-t border-stone/40 flex items-center justify-between text-[11px] text-sage">
                  <span>Audited Datasets: <strong>{summary?.total_datasets || 14}</strong></span>
                  <Link to="/data-sources" className="text-terracotta font-semibold hover:underline">
                    Provenance &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        <DemoNotice />

        {/* ── FOUR MAJOR EXPLORATION PORTALS ── */}
        <section>
          <div className="mb-6">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-sage block mb-1">
              Curated Exploration
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-charcoal tracking-tight">
              Four Dimensions of Urban Inquiry
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* 1. Housing Market */}
            <Link
              to="/market-trends"
              className="group p-5 bg-paper rounded-lg border border-stone/70 hover:border-terracotta/60 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-md bg-forest/5 border border-forest/15 flex items-center justify-center text-forest mb-4 group-hover:bg-forest group-hover:text-ivory transition-colors">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-terracotta block mb-1">
                  Macro Intelligence
                </span>
                <h3 className="font-serif text-lg font-semibold text-charcoal group-hover:text-forest transition-colors">
                  Housing Market
                </h3>
                <p className="text-xs font-serif italic text-forest/90 mt-1 mb-2">
                  "How are housing markets changing?"
                </p>
                <p className="text-xs text-sage leading-relaxed">
                  Analyze 15 years of official RBI HPI price trajectories, quarterly fluctuations, and statistical forecasts.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-stone/40 flex items-center justify-between text-xs font-semibold text-forest group-hover:text-terracotta transition-colors">
                <span>Explore Market</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            {/* 2. Explore Neighbourhoods */}
            <Link
              to="/neighborhood"
              className="group p-5 bg-paper rounded-lg border border-stone/70 hover:border-forest/60 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-md bg-forest/5 border border-forest/15 flex items-center justify-center text-forest mb-4 group-hover:bg-forest group-hover:text-ivory transition-colors">
                  <MapPin className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-forest block mb-1">
                  Spatial Intelligence
                </span>
                <h3 className="font-serif text-lg font-semibold text-charcoal group-hover:text-forest transition-colors">
                  Explore Neighbourhoods
                </h3>
                <p className="text-xs font-serif italic text-forest/90 mt-1 mb-2">
                  "What makes an area accessible and connected?"
                </p>
                <p className="text-xs text-sage leading-relaxed">
                  Interactive cartographic atlas of South Mumbai showing schools, healthcare, transit stops, and walkability.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-stone/40 flex items-center justify-between text-xs font-semibold text-forest group-hover:text-terracotta transition-colors">
                <span>View Atlas Map</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            {/* 3. Urban Transformation */}
            <Link
              to="/transformation"
              className="group p-5 bg-paper rounded-lg border border-stone/70 hover:border-forest/60 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-md bg-forest/5 border border-forest/15 flex items-center justify-center text-forest mb-4 group-hover:bg-forest group-hover:text-ivory transition-colors">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-terracotta block mb-1">
                  Pattern Recognition
                </span>
                <h3 className="font-serif text-lg font-semibold text-charcoal group-hover:text-forest transition-colors">
                  Urban Transformation
                </h3>
                <p className="text-xs font-serif italic text-forest/90 mt-1 mb-2">
                  "Which areas show signs of significant change?"
                </p>
                <p className="text-xs text-sage leading-relaxed">
                  14 indicators evaluated across a 5-pillar evidence framework with responsible anomaly tracking.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-stone/40 flex items-center justify-between text-xs font-semibold text-forest group-hover:text-terracotta transition-colors">
                <span>Review Evidence</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            {/* 4. Housing Affordability */}
            <Link
              to="/affordability"
              className="group p-5 bg-paper rounded-lg border border-stone/70 hover:border-terracotta/60 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-md bg-forest/5 border border-forest/15 flex items-center justify-center text-forest mb-4 group-hover:bg-forest group-hover:text-ivory transition-colors">
                  <Calculator className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-forest block mb-1">
                  Decision Support
                </span>
                <h3 className="font-serif text-lg font-semibold text-charcoal group-hover:text-forest transition-colors">
                  Housing Affordability
                </h3>
                <p className="text-xs font-serif italic text-forest/90 mt-1 mb-2">
                  "What can a household realistically afford?"
                </p>
                <p className="text-xs text-sage leading-relaxed">
                  Professional mortgage planning: true ownership expenses, statutory charges, and 10-year rent-vs-buy modeling.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-stone/40 flex items-center justify-between text-xs font-semibold text-forest group-hover:text-terracotta transition-colors">
                <span>Plan Finances</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </div>
        </section>

        {/* ── KEY MACRO INDICATORS ── */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-4">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-sage block">
                Metropolitan Benchmarks
              </span>
              <h3 className="font-serif text-xl font-semibold text-charcoal">
                Key Market Indicators
              </h3>
            </div>
            <span className="text-xs text-sage">Indicative summary across benchmark nodes</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {marketIndicators.map((metric) => (
              <MetricCard
                key={metric.label}
                label={metric.label}
                value={metric.value}
                change={metric.change}
                trend={metric.trend}
                unit={metric.unit}
                sparklineData={metric.sparklineData}
                description={metric.description}
              />
            ))}
          </div>
        </section>

        {/* ── PRIMARY ANALYTICAL CHARTS ── */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PriceTrendChart data={recentData} height={340} />
          </div>
          <div className="lg:col-span-1">
            <MarketOverviewChart data={neighborhoods} height={340} />
          </div>
        </section>

        {/* ── NEIGHBORHOOD SNAPSHOT TABLE ── */}
        <section className="bg-paper rounded-lg border border-stone/70 overflow-hidden">
          <div className="px-6 py-5 border-b border-stone/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-sage block mb-0.5">
                Comparative Valuation
              </span>
              <h3 className="font-serif text-lg font-semibold text-charcoal">
                Neighbourhood Benchmark Snapshot
              </h3>
              <p className="text-xs text-sage mt-0.5">
                Property benchmarks, walk scores, and risk classifications across metropolitan sectors
              </p>
            </div>
            <Link
              to="/neighborhood"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest hover:text-terracotta transition-colors self-start sm:self-auto"
            >
              <span>Explore Interactive Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-charcoal">
              <thead className="bg-ivory/60 text-sage text-[10px] uppercase tracking-wider font-semibold border-b border-stone/50">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Neighbourhood</th>
                  <th scope="col" className="px-4 py-3.5">Capital Value</th>
                  <th scope="col" className="px-4 py-3.5">1-Yr Change</th>
                  <th scope="col" className="px-4 py-3.5">5-Yr Growth</th>
                  <th scope="col" className="px-4 py-3.5">Affordability</th>
                  <th scope="col" className="px-4 py-3.5">Walk Score</th>
                  <th scope="col" className="px-4 py-3.5">Transformation Indicator</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone/40">
                {neighborhoods.map((n) => (
                  <tr key={n.id} className="hover:bg-ivory/40 transition-colors">
                    <td className="px-6 py-3.5 font-medium text-charcoal flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-terracotta shrink-0" />
                      <span>{n.name}</span>
                    </td>
                    <td className="px-4 py-3.5 font-mono font-medium text-charcoal">
                      ₹{n.avgPrice.toLocaleString('en-IN')}{' '}
                      <span className="text-xs font-sans text-sage">/ sq.ft</span>
                    </td>
                    <td className="px-4 py-3.5 font-mono font-medium text-forest">
                      +{n.priceChange1Y}%
                    </td>
                    <td className="px-4 py-3.5 font-mono font-medium text-forest">
                      +{n.priceChange5Y}%
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-stone/50 rounded-full h-1.5">
                          <div
                            className="bg-forest h-1.5 rounded-full"
                            style={{ width: `${n.affordabilityScore}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-sage">
                          {n.affordabilityScore}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-charcoal/80 font-mono">
                      {n.walkScore}/100
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRiskBadge(
                          n.gentrificationRisk
                        )}`}
                      >
                        {n.gentrificationRisk === 'Low' ? 'Stable' : n.gentrificationRisk === 'Medium' ? 'Moderate Shift' : 'High Shift'}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <Link
                        to={`/neighborhood?focus=${n.id}`}
                        className="text-xs font-semibold text-terracotta hover:underline transition-colors"
                      >
                        Explore &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── EXPLANATION & DEMARCATION SECTION ── */}
        <section className="p-6 rounded-lg bg-paper border border-stone/70">
          <div className="flex items-start gap-3 mb-3">
            <Info className="w-5 h-5 text-forest shrink-0 mt-0.5" />
            <div>
              <h4 className="font-serif text-base font-semibold text-charcoal">
                How to Interpret UrbanLens Information
              </h4>
              <p className="text-xs text-sage mt-1 leading-relaxed">
                UrbanLens is an analytical platform designed to make complex urban data interpretable and transparent. It operates on a strict principle of methodological honesty:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-stone/40 text-xs text-charcoal/80">
            <div>
              <strong className="block text-forest mb-1">City-Level vs. Neighbourhood</strong>
              <p className="text-sage leading-relaxed">
                Official RBI House Price Index figures represent city-wide residential property appreciation. They must not be misconstrued as uniform micro-market pricing for specific streets or buildings.
              </p>
            </div>
            <div>
              <strong className="block text-forest mb-1">Anomalies vs. Gentrification</strong>
              <p className="text-sage leading-relaxed">
                A statistical anomaly (such as a rapid rate of business license registrations) does not prove neighborhood gentrification or resident displacement. It indicates an area warranting closer inspection.
              </p>
            </div>
            <div>
              <strong className="block text-forest mb-1">Financial Simulations</strong>
              <p className="text-sage leading-relaxed">
                Affordability metrics and EMI simulations are decision-support models based on standard banking guidelines (such as 50% FOIR). They are illustrative and do not constitute official bank loan approvals.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
