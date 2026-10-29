import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, Clock, AlertTriangle, ChevronRight } from 'lucide-react';

interface HeaderProps {
  onOpenMobile: () => void;
}

const ROUTE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/': {
    title: 'Market Overview',
    subtitle: 'High-level real estate dynamics & macro benchmarks',
  },
  '/market-trends': {
    title: 'Market Trends & History',
    subtitle: '5-year price evolution, volume, and seasonality dynamics',
  },
  '/forecasting': {
    title: 'Predictive Price Forecasting',
    subtitle: '12-month forward SARIMA simulation & anomaly tracking',
  },
  '/neighborhood': {
    title: 'Neighborhood Spatial Intelligence',
    subtitle: 'Geospatial mapping, infrastructure, and amenity density',
  },
  '/affordability': {
    title: 'Affordability & Mortgage Modeling',
    subtitle: 'EMI computation, Rent vs. Buy analysis, and income ratios',
  },
  '/data-sources': {
    title: 'Data Sources & Transparency',
    subtitle: 'Synthetic generation architecture & planned integrations',
  },
  '/methodology': {
    title: 'Methodology & Statistical Models',
    subtitle: 'Mathematical formulations, valuation models, and disclaimers',
  },
};

export const Header: React.FC<HeaderProps> = ({ onOpenMobile }) => {
  const location = useLocation();
  const current = ROUTE_TITLES[location.pathname] || {
    title: 'UrbanLens Analytics',
    subtitle: 'Urban Market Intelligence',
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white/95 backdrop-blur-xs border-b border-slate-200 shadow-2xs">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobile}
          className="p-2 text-slate-500 rounded-lg md:hidden hover:bg-slate-100 focus:outline-hidden"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-0.5">
            <Link to="/" className="hover:text-slate-600 transition">
              UrbanLens
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-600 font-medium">{current.title}</span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
            {current.title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Synthetic Data Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-full">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span className="hidden sm:inline">Synthetic Data</span>
          <span className="sm:hidden">Demo</span>
        </div>

        {/* Timestamp */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-500 bg-slate-100 rounded-md">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Last Updated: Q4 2024 (Simulated)</span>
        </div>
      </div>
    </header>
  );
};
