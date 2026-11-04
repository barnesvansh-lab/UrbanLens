import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import clsx from 'clsx';

const PRIMARY_NAV = [
  { path: '/', label: 'Overview', end: true },
  {
    label: 'Housing Market',
    children: [
      { path: '/market-trends', label: 'Market Trends' },
      { path: '/forecasting', label: 'Price Forecasting' },
    ],
  },
  {
    label: 'Neighbourhoods',
    children: [
      { path: '/neighborhood', label: 'Explore Map' },
      { path: '/neighborhood/compare', label: 'Compare Areas' },
    ],
  },
  { path: '/transformation', label: 'Urban Transformation' },
  { path: '/affordability', label: 'Affordability' },
];

const SECONDARY_NAV = [
  { path: '/methodology', label: 'Methodology' },
  { path: '/data-sources', label: 'About & Data' },
];

/** Dropdown menu for grouped nav items */
const NavDropdown: React.FC<{
  label: string;
  children: { path: string; label: string }[];
  onNavigate?: () => void;
}> = ({ label, children, onNavigate }) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isActive = children.some((c) => location.pathname === c.path);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={clsx(
          'flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors rounded-md',
          isActive
            ? 'text-terracotta'
            : 'text-ivory/80 hover:text-ivory'
        )}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {label}
        <ChevronDown className={clsx('w-3.5 h-3.5 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-48 py-1.5 bg-paper border border-stone rounded-lg shadow-lg z-50">
          {children.map((child) => (
            <NavLink
              key={child.path}
              to={child.path}
              onClick={() => { setOpen(false); onNavigate?.(); }}
              className={({ isActive: active }) =>
                clsx(
                  'block px-4 py-2 text-sm transition-colors',
                  active
                    ? 'text-terracotta font-semibold bg-terracotta/5'
                    : 'text-charcoal hover:bg-ivory-dark hover:text-forest'
                )
              }
            >
              {child.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};

interface NavigationProps {
  className?: string;
}

export const Navigation: React.FC<NavigationProps> = ({ className }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      className={clsx(
        'sticky top-0 z-50 bg-forest border-b border-forest-light',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-8 h-8 rounded-md bg-terracotta flex items-center justify-center text-white font-serif font-bold text-lg leading-none">
              U
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-ivory font-serif font-semibold text-lg leading-tight tracking-tight">
                UrbanLens
              </span>
              <span className="text-sage text-[9px] uppercase tracking-[0.2em] font-medium leading-none">
                Urban Intelligence Atlas
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5" aria-label="Main navigation">
            {PRIMARY_NAV.map((item) =>
              'children' in item && item.children ? (
                <NavDropdown key={item.label} label={item.label} children={item.children} />
              ) : (
                <NavLink
                  key={item.path}
                  to={item.path!}
                  end={item.end}
                  className={({ isActive }) =>
                    clsx(
                      'px-3 py-2 text-sm font-medium transition-colors rounded-md',
                      isActive
                        ? 'text-terracotta'
                        : 'text-ivory/80 hover:text-ivory'
                    )
                  }
                >
                  {item.label}
                </NavLink>
              )
            )}

            <div className="w-px h-5 bg-ivory/15 mx-2" />

            {SECONDARY_NAV.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  clsx(
                    'px-2.5 py-2 text-xs font-medium transition-colors rounded-md',
                    isActive
                      ? 'text-terracotta'
                      : 'text-sage hover:text-ivory/80'
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Mobile Toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-ivory/80 hover:text-ivory rounded-md"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-forest-light bg-forest">
          <nav className="px-4 py-3 space-y-1" aria-label="Mobile navigation">
            {PRIMARY_NAV.map((item) =>
              'children' in item && item.children ? (
                <div key={item.label}>
                  <span className="block px-3 py-1.5 text-[10px] uppercase tracking-wider text-sage font-semibold">
                    {item.label}
                  </span>
                  {item.children.map((child) => (
                    <NavLink
                      key={child.path}
                      to={child.path}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        clsx(
                          'block pl-6 pr-3 py-2 text-sm font-medium rounded-md transition-colors',
                          isActive
                            ? 'text-terracotta bg-terracotta/5'
                            : 'text-ivory/80 hover:text-ivory hover:bg-ivory/5'
                        )
                      }
                    >
                      {child.label}
                    </NavLink>
                  ))}
                </div>
              ) : (
                <NavLink
                  key={item.path}
                  to={item.path!}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    clsx(
                      'block px-3 py-2 text-sm font-medium rounded-md transition-colors',
                      isActive
                        ? 'text-terracotta bg-terracotta/5'
                        : 'text-ivory/80 hover:text-ivory hover:bg-ivory/5'
                    )
                  }
                >
                  {item.label}
                </NavLink>
              )
            )}

            <div className="border-t border-ivory/10 pt-2 mt-2">
              {SECONDARY_NAV.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    clsx(
                      'block px-3 py-2 text-xs font-medium rounded-md transition-colors',
                      isActive
                        ? 'text-terracotta'
                        : 'text-sage hover:text-ivory/80'
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
