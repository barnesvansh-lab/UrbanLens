import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navigation } from './components/layout/Navigation';
import { LoadingSpinner } from './components/ui/LoadingSpinner';

const Overview = lazy(() => import('./pages/Overview').then(m => ({ default: m.Overview })));
const MarketTrends = lazy(() => import('./pages/MarketTrends').then(m => ({ default: m.MarketTrends })));
const Forecasting = lazy(() => import('./pages/Forecasting').then(m => ({ default: m.Forecasting })));
const NeighborhoodIntelligence = lazy(() => import('./pages/NeighborhoodIntelligence').then(m => ({ default: m.NeighborhoodIntelligence })));
const NeighborhoodComparison = lazy(() => import('./pages/NeighborhoodComparison').then(m => ({ default: m.NeighborhoodComparison })));
const UrbanTransformation = lazy(() => import('./pages/UrbanTransformation').then(m => ({ default: m.UrbanTransformation })));
const Affordability = lazy(() => import('./pages/Affordability').then(m => ({ default: m.Affordability })));
const DataSources = lazy(() => import('./pages/DataSources').then(m => ({ default: m.DataSources })));
const Methodology = lazy(() => import('./pages/Methodology').then(m => ({ default: m.Methodology })));

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-ivory font-sans text-charcoal antialiased flex flex-col">
        {/* Editorial Top Navigation */}
        <Navigation />

        {/* Main Content */}
        <main className="flex-1 w-full">
          <Suspense fallback={<LoadingSpinner size="lg" label="Loading module..." className="min-h-[50vh]" />}>
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/market-trends" element={<MarketTrends />} />
              <Route path="/forecasting" element={<Forecasting />} />
              <Route path="/neighborhood" element={<NeighborhoodIntelligence />} />
              <Route path="/neighborhoods" element={<NeighborhoodIntelligence />} />
              <Route path="/neighborhood/compare" element={<NeighborhoodComparison />} />
              <Route path="/neighborhoods/compare" element={<NeighborhoodComparison />} />
              <Route path="/transformation" element={<UrbanTransformation />} />
              <Route path="/urban-transformation" element={<UrbanTransformation />} />
              <Route path="/affordability" element={<Affordability />} />
              <Route path="/data-sources" element={<DataSources />} />
              <Route path="/methodology" element={<Methodology />} />
              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>

        {/* Minimal Editorial Footer */}
        <footer className="border-t border-stone bg-paper">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-serif font-semibold text-forest text-sm">UrbanLens</span>
                <span className="text-sage text-xs">© {new Date().getFullYear()}</span>
              </div>
              <p className="text-xs text-sage text-center sm:text-right max-w-md leading-relaxed">
                Urban Intelligence Atlas · RBI HPI & OSM data integrated with documented synthetic test demarcation
              </p>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
};

export default App;
