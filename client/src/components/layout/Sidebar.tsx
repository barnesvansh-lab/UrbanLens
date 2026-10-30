import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  LineChart,
  MapPin,
  Calculator,
  Database,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Building2,
  ShieldAlert,
  Scale,
  Sparkles,
} from 'lucide-react';
import clsx from 'clsx';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS = [
  { path: '/', label: 'Market Overview', icon: LayoutDashboard },
  { path: '/market-trends', label: 'Market Trends', icon: TrendingUp },
  { path: '/forecasting', label: 'Forecasting & ML', icon: LineChart },
  { path: '/neighborhood', label: 'Neighborhood Intel', icon: MapPin },
  { path: '/neighborhood/compare', label: 'Area Comparison', icon: Scale },
  { path: '/transformation', label: 'Transformation', icon: Sparkles },
  { path: '/affordability', label: 'Affordability & EMI', icon: Calculator },
  { path: '/data-sources', label: 'Data Sources', icon: Database },
  { path: '/methodology', label: 'Methodology', icon: BookOpen },
];

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-slate-900 text-slate-200 border-r border-slate-800 transition-all duration-300 ease-in-out',
          collapsed ? 'w-18' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-indigo-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-base font-bold tracking-tight text-white truncate">
                  UrbanLens
                </span>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium truncate">
                  Market Intelligence
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden md:flex items-center justify-center w-7 h-7 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                end={item.path === '/'}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative',
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70',
                    collapsed && 'justify-center px-0'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={clsx(
                        'w-5 h-5 shrink-0 transition-colors',
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                      )}
                    />
                    {!collapsed && <span className="truncate">{item.label}</span>}

                    {/* Tooltip on collapsed desktop view */}
                    {collapsed && (
                      <div className="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-white text-xs font-semibold rounded shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                        {item.label}
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Demo Mode Badge */}
        <div className="p-3 border-t border-slate-800 shrink-0">
          <div
            className={clsx(
              'rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-center transition-all',
              collapsed ? 'p-2 justify-center' : 'px-3 py-2.5 gap-2.5'
            )}
            title="Demo Mode: Synthetic Data"
          >
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-amber-300 truncate">Demo Mode Active</span>
                <span className="text-[10px] text-amber-400/80 truncate">Synthetic Analytics</span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
