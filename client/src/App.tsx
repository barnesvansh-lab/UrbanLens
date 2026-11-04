import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import clsx from 'clsx';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
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
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
        {/* Persistent Collapsible Sidebar */}
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />

        {/* Main Content Viewport */}
        <div
          className={clsx(
            'flex-1 flex flex-col transition-all duration-300 ease-in-out min-h-screen',
            collapsed ? 'md:pl-18' : 'md:pl-64'
          )}
        >
          {/* Top Sticky Header */}
          <Header onOpenMobile={() => setMobileOpen(true)} />

          {/* Main Content Area */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
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

          {/* Footer Note */}
          <footer className="py-4 px-6 border-t border-slate-200 text-center text-xs text-slate-500 bg-white/50">
            <span>UrbanLens &copy; {new Date().getFullYear()} — Urban Market Intelligence &amp; Housing Affordability Analytics Platform. </span>
            <span className="text-indigo-600 font-medium">Empirical RBI HPI &amp; OSM Data Integrated &middot; Documented Demarcation for Synthetic Testing</span>
          </footer>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
