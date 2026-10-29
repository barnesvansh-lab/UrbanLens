import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import clsx from 'clsx';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';

import { Overview } from './pages/Overview';
import { MarketTrends } from './pages/MarketTrends';
import { Forecasting } from './pages/Forecasting';
import { NeighborhoodIntelligence } from './pages/NeighborhoodIntelligence';
import { Affordability } from './pages/Affordability';
import { DataSources } from './pages/DataSources';
import { Methodology } from './pages/Methodology';

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
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/market-trends" element={<MarketTrends />} />
              <Route path="/forecasting" element={<Forecasting />} />
              <Route path="/neighborhood" element={<NeighborhoodIntelligence />} />
              <Route path="/affordability" element={<Affordability />} />
              <Route path="/data-sources" element={<DataSources />} />
              <Route path="/methodology" element={<Methodology />} />
              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Footer Note */}
          <footer className="py-4 px-6 border-t border-slate-200 text-center text-xs text-slate-400 bg-white/50">
            <span>UrbanLens &copy; {new Date().getFullYear()} — Enterprise Urban Intelligence Platform. </span>
            <span className="text-amber-600 font-medium">Demo Mode (Synthetic Data).</span>
          </footer>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
