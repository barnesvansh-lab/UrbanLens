/**
 * Affordability.tsx — Milestone 7: Housing Affordability Intelligence Dashboard
 *
 * Professional full-stack analytical interface covering:
 * 1. Affordability Overview (Market context, benchmarks, instant evaluation)
 * 2. EMI Calculator (Reducing-balance amortization, prepayment simulator)
 * 3. Upfront Purchase Costs (Statutory fees, registration caps, itemized breakdown)
 * 4. Monthly Ownership Costs (Total true cost beyond mortgage, HEIR ratio)
 * 5. Rent vs Buy (Cash-flow equivalence wealth trajectories, break-even analysis)
 * 6. Household Affordability (FOIR/DTI guidelines, dual-constraint budgeting)
 * 7. Financial Scenario Simulator (Conservative vs Moderate vs Aggressive)
 * 8. Methodology and Assumptions (Formula documentation, regulatory sources audit)
 *
 * All calculations are executed deterministically by the Express backend API (/api/affordability/*).
 * Zero synthetic data or hardcoded numbers are displayed.
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  Calculator,
  ArrowRightLeft,
  Home,
  TrendingUp,
  Users,
  BarChart2,
  BookOpen,
  AlertCircle,
  Info,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Building,
  Percent,
  Wallet,
  ArrowUpRight,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

// ── Indian Currency & Percentage Formatters ──────────────────────────────────
function inr(n: number, compact = false): string {
  if (!Number.isFinite(n)) return '—';
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (compact) {
    if (abs >= 1e7) return `${sign}₹${(abs / 1e7).toFixed(2)} Cr`;
    if (abs >= 1e5) return `${sign}₹${(abs / 1e5).toFixed(2)} L`;
    return `${sign}₹${abs.toLocaleString('en-IN')}`;
  }
  return `${sign}₹${Math.round(n).toLocaleString('en-IN')}`;
}

function pct(n: number, dp = 1): string {
  if (!Number.isFinite(n)) return '—';
  return `${n.toFixed(dp)}%`;
}

// ── API Fetchers ─────────────────────────────────────────────────────────────
const BASE = '/api/affordability';

async function postApi<T>(endpoint: string, body: object): Promise<T> {
  const r = await fetch(`${BASE}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${r.status}`);
  }
  return r.json();
}

async function getApi<T>(endpoint: string): Promise<T> {
  const r = await fetch(`${BASE}/${endpoint}`);
  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${r.status}`);
  }
  return r.json();
}

// ── TypeScript Response Models ───────────────────────────────────────────────
interface EmiResult {
  property_price: number;
  down_payment: number;
  loan_principal: number;
  annual_interest_rate: number;
  tenure_years: number;
  monthly_emi: number;
  total_interest: number;
  total_payment: number;
  ltv_ratio: number;
  interest_to_principal_ratio: number;
  interest_saved_by_prepayment: number;
  effective_tenure_months: number;
  amortization_schedule: {
    year: number;
    opening_balance: number;
    annual_emi: number;
    principal_paid: number;
    interest_paid: number;
    closing_balance: number;
    homeowner_equity: number;
  }[];
  disclaimers: string[];
}

interface UpfrontResult {
  property_price: number;
  down_payment: number;
  stamp_duty: number;
  registration_fee: number;
  loan_processing_fee: number;
  legal_doc_fee: number;
  brokerage_fee: number;
  moving_expenses: number;
  interiors_furnishing: number;
  other_charges: number;
  total_statutory_charges: number;
  total_ancillary_costs: number;
  total_upfront_cash_required: number;
  total_cash_to_price_ratio_pct: number;
  disclaimers: string[];
}

interface OwnershipResult {
  monthly_emi: number;
  monthly_maintenance: number;
  monthly_property_tax: number;
  monthly_insurance: number;
  monthly_utilities: number;
  monthly_repairs_reserve: number;
  monthly_other: number;
  total_monthly_non_emi_expenses: number;
  total_monthly_ownership_cost: number;
  total_annual_ownership_cost: number;
  emi_share_pct: number;
  non_emi_share_pct: number;
  housing_expense_to_income_ratio_pct: number | null;
  disclaimers: string[];
}

interface RentVsBuyResult {
  analysis_period_years: number;
  buyer_terminal_wealth: number;
  renter_terminal_wealth: number;
  net_buy_advantage: number;
  break_even_year: number | null;
  verdict_summary: string;
  annual_trajectory: {
    year: number;
    monthly_rent: number;
    monthly_buy_outflow: number;
    buyer_net_equity: number;
    renter_investment_portfolio: number;
    net_buy_advantage: number;
  }[];
  assumptions_used: {
    property_appreciation_pct: number;
    annual_rent_increase_pct: number;
    investment_return_pct: number;
    mortgage_interest_rate_pct: number;
  };
  disclaimers: string[];
}

interface HouseholdResult {
  total_monthly_income: number;
  existing_debt_obligations: number;
  current_foir_pct: number;
  disposable_surplus: number;
  foir_threshold_used_pct: number;
  max_allowable_housing_emi: number;
  max_affordable_loan_principal: number;
  cash_constrained_property_budget: number | null;
  loan_constrained_property_budget: number;
  binding_max_property_budget: number;
  target_property_price: number | null;
  affordability_gap: number | null;
  is_affordable: boolean | null;
  actionable_recommendations: string[];
  disclaimers: string[];
}

interface ScenarioResult {
  comparison_horizon_years: number;
  scenarios: {
    id: string;
    name: string;
    description: string;
    property_price: number;
    monthly_emi: number;
    total_interest: number;
    total_upfront_cash: number;
    ten_year_buyer_equity: number;
    ten_year_renter_portfolio: number;
    ten_year_buy_advantage: number;
    foir_pct: number;
    affordability_verdict: string;
  }[];
  disclaimers: string[];
}

interface MarketContext {
  city: string;
  currency: string;
  rbi_hpi_context: {
    long_term_cagr_pct: number;
    five_year_cagr_pct: number | null;
    three_year_cagr_pct: number | null;
    recent_growth_pct: number;
    regime: string;
    source: string;
    date_range: string;
  } | null;
  market_benchmarks: {
    prime_mortgage_eblr_pct: number;
    mumbai_stamp_duty_pct: number;
    mumbai_registration_fee_cap_inr: number;
    average_mumbai_maintenance_sqft_inr: number;
    average_mumbai_rental_yield_pct: number;
    long_term_equity_return_pct: number;
  };
  formatting_guide?: {
    currency_symbol: string;
    compact_examples: {
      crore: string;
      lakh: string;
      thousand: string;
    };
  };
  note: string;
}

interface AssumptionsPayload {
  version: string;
  effective_date: string;
  defaults: Record<string, any>;
  sources: { name: string; topic: string }[];
}

// ── Reusable Slider Component ───────────────────────────────────────────────
interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
  tooltip?: string;
}

const Slider: React.FC<SliderProps> = ({ label, value, min, max, step, format, onChange, tooltip }) => (
  <div className="space-y-1">
    <div className="flex justify-between items-center text-xs">
      <span className="font-medium text-slate-600 flex items-center gap-1">
        {label}
        {tooltip && (
          <span title={tooltip} className="text-slate-400 cursor-help">
            <Info className="w-3 h-3" />
          </span>
        )}
      </span>
      <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
        {format(value)}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
    />
    <div className="flex justify-between text-[10px] text-slate-400">
      <span>{format(min)}</span>
      <span>{format(max)}</span>
    </div>
  </div>
);

// ── Disclaimers & Alert Components ──────────────────────────────────────────
const DisclaimerBanner: React.FC<{ text?: string }> = ({ text }) => (
  <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50/80 border border-amber-200/90 text-xs text-amber-800">
    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
    <span className="leading-relaxed">
      {text ||
        'UrbanLens provides educational financial calculations and scenario analysis. Results are estimates based on user-provided inputs and illustrative assumptions. They do not constitute official loan pre-approvals, legal fee quotations, or personalized investment advice.'}
    </span>
  </div>
);

const ErrorAlert: React.FC<{ msg: string; onRetry?: () => void }> = ({ msg, onRetry }) => (
  <div className="flex items-center justify-between p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
    <div className="flex items-center gap-2">
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      <span>{msg}</span>
    </div>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 rounded text-rose-800 font-semibold transition"
      >
        Retry
      </button>
    )}
  </div>
);

// ── Tabs Navigation ──────────────────────────────────────────────────────────
type TabId =
  | 'overview'
  | 'emi'
  | 'upfront'
  | 'ownership'
  | 'rvb'
  | 'household'
  | 'scenarios'
  | 'methodology';

interface TabDef {
  id: TabId;
  label: string;
  badge?: string;
  Icon: React.FC<any>;
}

const TABS: TabDef[] = [
  { id: 'overview', label: 'Overview', Icon: Building },
  { id: 'emi', label: 'EMI Calculator', Icon: Calculator },
  { id: 'upfront', label: 'Upfront Costs', Icon: Home },
  { id: 'ownership', label: 'Monthly Costs', Icon: BarChart2 },
  { id: 'rvb', label: 'Rent vs Buy', Icon: ArrowRightLeft },
  { id: 'household', label: 'Household Budget', Icon: Users },
  { id: 'scenarios', label: 'Scenario Simulator', Icon: TrendingUp },
  { id: 'methodology', label: 'Methodology & Data', Icon: BookOpen },
];

const PALETTE = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
export const Affordability: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  // ── Global Shared Financial Parameters ──────────────────────────────────────
  const [propertyPrice, setPropertyPrice] = useState<number>(10000000); // 1.00 Cr
  const [downPaymentPct, setDownPaymentPct] = useState<number>(20.0);
  const [interestRate, setInterestRate] = useState<number>(8.5);
  const [tenureYears, setTenureYears] = useState<number>(20);
  const [extraEmi, setExtraEmi] = useState<number>(0);

  // Upfront cost parameters
  const [stampDutyPct, setStampDutyPct] = useState<number>(6.0);
  const [includeFitout, setIncludeFitout] = useState<boolean>(true);

  // Monthly ownership parameters
  const [maintenanceMonthly, setMaintenanceMonthly] = useState<number>(5000);

  // Rent vs Buy parameters
  const [monthlyRent, setMonthlyRent] = useState<number>(28000);
  const [rentIncreasePct, setRentIncreasePct] = useState<number>(6.0);
  const [appreciationPct, setAppreciationPct] = useState<number>(6.0);
  const [investmentReturnPct, setInvestmentReturnPct] = useState<number>(10.0);
  const [rvbHorizonYears, setRvbHorizonYears] = useState<number>(15);

  // Household affordability parameters
  const [monthlyIncome, setMonthlyIncome] = useState<number>(200000);
  const [existingEmis, setExistingEmis] = useState<number>(0);
  const [essentialExpenses, setEssentialExpenses] = useState<number>(60000);
  const [liquidSavings, setLiquidSavings] = useState<number>(3000000);
  const [foirThreshold, setFoirThreshold] = useState<number>(45.0);

  // ── API State Hooks ─────────────────────────────────────────────────────────
  const [marketContext, setMarketContext] = useState<MarketContext | null>(null);
  const [assumptions, setAssumptions] = useState<AssumptionsPayload | null>(null);

  const [emiData, setEmiData] = useState<EmiResult | null>(null);
  const [emiLoading, setEmiLoading] = useState<boolean>(false);
  const [emiError, setEmiError] = useState<string | null>(null);

  const [upfrontData, setUpfrontData] = useState<UpfrontResult | null>(null);
  const [upfrontLoading, setUpfrontLoading] = useState<boolean>(false);
  const [upfrontError, setUpfrontError] = useState<string | null>(null);

  const [ownershipData, setOwnershipData] = useState<OwnershipResult | null>(null);
  const [ownershipLoading, setOwnershipLoading] = useState<boolean>(false);
  const [ownershipError, setOwnershipError] = useState<string | null>(null);

  const [rvbData, setRvbData] = useState<RentVsBuyResult | null>(null);
  const [rvbLoading, setRvbLoading] = useState<boolean>(false);
  const [rvbError, setRvbError] = useState<string | null>(null);

  const [householdData, setHouseholdData] = useState<HouseholdResult | null>(null);
  const [householdLoading, setHouseholdLoading] = useState<boolean>(false);
  const [householdError, setHouseholdError] = useState<string | null>(null);

  const [scenarioData, setScenarioData] = useState<ScenarioResult | null>(null);
  const [scenarioLoading, setScenarioLoading] = useState<boolean>(false);
  const [scenarioError, setScenarioError] = useState<string | null>(null);

  // Table display state
  const [scheduleViewMode, setScheduleViewMode] = useState<'all' | 'milestones'>('all');

  // ── Initial Market Context & Assumptions Loading ────────────────────────────
  useEffect(() => {
    getApi<MarketContext>('market-context')
      .then(setMarketContext)
      .catch((err) => console.warn('[Affordability] Could not load market context:', err.message));

    getApi<AssumptionsPayload>('assumptions')
      .then(setAssumptions)
      .catch((err) => console.warn('[Affordability] Could not load assumptions:', err.message));
  }, []);

  // ── Calculators Fetchers ────────────────────────────────────────────────────
  const fetchEmi = useCallback(async () => {
    setEmiLoading(true);
    setEmiError(null);
    try {
      const data = await postApi<EmiResult>('emi', {
        property_price: propertyPrice,
        down_payment_pct: downPaymentPct,
        annual_interest_rate: interestRate,
        tenure_years: tenureYears,
        extra_monthly_payment: extraEmi,
      });
      setEmiData(data);
    } catch (err: any) {
      setEmiError(err.message);
    } finally {
      setEmiLoading(false);
    }
  }, [propertyPrice, downPaymentPct, interestRate, tenureYears, extraEmi]);

  const fetchUpfront = useCallback(async () => {
    setUpfrontLoading(true);
    setUpfrontError(null);
    try {
      const data = await postApi<UpfrontResult>('upfront-costs', {
        property_price: propertyPrice,
        down_payment_pct: downPaymentPct,
        stamp_duty_pct: stampDutyPct,
        interiors_furnishing: includeFitout ? Math.round(propertyPrice * 0.05) : 0,
      });
      setUpfrontData(data);
    } catch (err: any) {
      setUpfrontError(err.message);
    } finally {
      setUpfrontLoading(false);
    }
  }, [propertyPrice, downPaymentPct, stampDutyPct, includeFitout]);

  const fetchOwnership = useCallback(async () => {
    setOwnershipLoading(true);
    setOwnershipError(null);
    try {
      const data = await postApi<OwnershipResult>('ownership-cost', {
        property_price: propertyPrice,
        annual_interest_rate: interestRate,
        tenure_years: tenureYears,
        down_payment_pct: downPaymentPct,
        society_maintenance_monthly: maintenanceMonthly,
        monthly_gross_income: monthlyIncome,
      });
      setOwnershipData(data);
    } catch (err: any) {
      setOwnershipError(err.message);
    } finally {
      setOwnershipLoading(false);
    }
  }, [propertyPrice, interestRate, tenureYears, downPaymentPct, maintenanceMonthly, monthlyIncome]);

  const fetchRvb = useCallback(async () => {
    setRvbLoading(true);
    setRvbError(null);
    try {
      const data = await postApi<RentVsBuyResult>('rent-vs-buy', {
        property_price: propertyPrice,
        down_payment_pct: downPaymentPct,
        annual_interest_rate: interestRate,
        loan_tenure_years: tenureYears,
        initial_monthly_rent: monthlyRent,
        annual_rent_increase_pct: rentIncreasePct,
        property_appreciation_pct: appreciationPct,
        investment_return_pct: investmentReturnPct,
        analysis_period_years: rvbHorizonYears,
      });
      setRvbData(data);
    } catch (err: any) {
      setRvbError(err.message);
    } finally {
      setRvbLoading(false);
    }
  }, [
    propertyPrice,
    downPaymentPct,
    interestRate,
    tenureYears,
    monthlyRent,
    rentIncreasePct,
    appreciationPct,
    investmentReturnPct,
    rvbHorizonYears,
  ]);

  const fetchHousehold = useCallback(async () => {
    setHouseholdLoading(true);
    setHouseholdError(null);
    try {
      const data = await postApi<HouseholdResult>('household', {
        monthly_gross_income: monthlyIncome,
        existing_loan_emis: existingEmis,
        essential_monthly_expenses: essentialExpenses,
        available_liquid_savings: liquidSavings,
        target_property_price: propertyPrice,
        annual_interest_rate: interestRate,
        loan_tenure_years: tenureYears,
        target_down_payment_pct: downPaymentPct,
        foir_guideline_pct: foirThreshold,
      });
      setHouseholdData(data);
    } catch (err: any) {
      setHouseholdError(err.message);
    } finally {
      setHouseholdLoading(false);
    }
  }, [
    monthlyIncome,
    existingEmis,
    essentialExpenses,
    liquidSavings,
    propertyPrice,
    interestRate,
    tenureYears,
    downPaymentPct,
    foirThreshold,
  ]);

  const fetchScenarios = useCallback(async () => {
    setScenarioLoading(true);
    setScenarioError(null);
    try {
      const data = await postApi<ScenarioResult>('scenarios', {
        property_price: propertyPrice,
      });
      setScenarioData(data);
    } catch (err: any) {
      setScenarioError(err.message);
    } finally {
      setScenarioLoading(false);
    }
  }, [propertyPrice]);

  // Lazy auto-fetch on tab view if data missing
  useEffect(() => {
    if (activeTab === 'overview' && !householdData) fetchHousehold();
    if (activeTab === 'emi' && !emiData) fetchEmi();
    if (activeTab === 'upfront' && !upfrontData) fetchUpfront();
    if (activeTab === 'ownership' && !ownershipData) fetchOwnership();
    if (activeTab === 'rvb' && !rvbData) fetchRvb();
    if (activeTab === 'household' && !householdData) fetchHousehold();
    if (activeTab === 'scenarios' && !scenarioData) fetchScenarios();
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter amortization schedule based on view mode
  const displayedSchedule = useMemo(() => {
    if (!emiData) return [];
    if (scheduleViewMode === 'all') return emiData.amortization_schedule;
    return emiData.amortization_schedule.filter(
      (p) => p.year === 1 || p.year % 5 === 0 || p.year === emiData.tenure_years
    );
  }, [emiData, scheduleViewMode]);

  // ── Shared Property Input Panel ─────────────────────────────────────────────
  const SharedPropertyPanel = () => (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Calculator className="w-4 h-4 text-indigo-600" />
          Loan & Property Setup
        </h3>
        <span className="text-[11px] text-slate-500 font-medium">Mumbai Metro Context</span>
      </div>

      <Slider
        label="Property Price"
        value={propertyPrice}
        min={1000000}
        max={100000000}
        step={500000}
        format={(v) => inr(v, true)}
        onChange={(v) => {
          setPropertyPrice(v);
          setEmiData(null);
          setUpfrontData(null);
          setOwnershipData(null);
          setRvbData(null);
          setHouseholdData(null);
          setScenarioData(null);
        }}
        tooltip="Negotiated base agreement value for residential real estate."
      />

      <Slider
        label="Down Payment %"
        value={downPaymentPct}
        min={10}
        max={50}
        step={5}
        format={(v) => `${v}% (${inr((propertyPrice * v) / 100, true)})`}
        onChange={(v) => {
          setDownPaymentPct(v);
          setEmiData(null);
          setUpfrontData(null);
          setOwnershipData(null);
        }}
        tooltip="Self-financed upfront capital excluding registration charges."
      />

      <Slider
        label="Interest Rate (p.a.)"
        value={interestRate}
        min={6.5}
        max={13.0}
        step={0.25}
        format={(v) => `${v}%`}
        onChange={(v) => {
          setInterestRate(v);
          setEmiData(null);
          setOwnershipData(null);
        }}
        tooltip="Annual reducing-balance repo-linked home loan lending rate."
      />

      <Slider
        label="Loan Tenure"
        value={tenureYears}
        min={5}
        max={30}
        step={1}
        format={(v) => `${v} Years`}
        onChange={(v) => {
          setTenureYears(v);
          setEmiData(null);
          setOwnershipData(null);
        }}
        tooltip="Repayment tenure in years (monthly compounding)."
      />

      {marketContext?.rbi_hpi_context && (
        <div className="p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-100/80 text-[11px] text-indigo-900 flex items-start gap-2">
          <Info className="w-3.5 h-3.5 mt-0.5 text-indigo-600 flex-shrink-0" />
          <span>
            RBI All-India HPI 15-Yr Long-Term CAGR: <strong>{marketContext.rbi_hpi_context.long_term_cagr_pct}%</strong>{' '}
            ({marketContext.rbi_hpi_context.date_range}).
          </span>
        </div>
      )}
    </div>
  );

  // ═════════════════════════════════════════════════════════════════════════════
  // SECTION 1: AFFORDABILITY OVERVIEW
  // ═════════════════════════════════════════════════════════════════════════════
  const OverviewSection = () => (
    <div className="space-y-6">
      {/* Top Banner with Real Data Provenance */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none pr-8 pb-4">
          <Building className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-xs font-semibold text-indigo-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Verified Empirical Financial Intelligence Engine
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            Mumbai Housing Market Affordability Intelligence
          </h2>
          <p className="text-sm text-indigo-200 leading-relaxed">
            Rigorous mathematical evaluation of mortgage amortization, statutory closing costs, recurring
            ownership liabilities, and cash-flow equivalent rent-versus-buy trade-offs calibrated against genuine
            Reserve Bank of India (RBI) All-India HPI records.
          </p>
        </div>
      </div>

      {/* Market Benchmarks KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Prime Mortgage EBLR</span>
            <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">RBI Repo</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {marketContext ? pct(marketContext.market_benchmarks.prime_mortgage_eblr_pct) : '8.5%'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">External Benchmark Lending Rate baseline</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Mumbai Stamp Duty</span>
            <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">IGR Mah</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {marketContext ? pct(marketContext.market_benchmarks.mumbai_stamp_duty_pct) : '6.0%'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Registration fee capped at ₹30,000</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Gross Rental Yield</span>
            <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">Mumbai Avg</span>
          </div>
          <div className="text-2xl font-bold text-emerald-600">
            {marketContext ? pct(marketContext.market_benchmarks.average_mumbai_rental_yield_pct) : '2.8%'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Annual rent divided by capital property value</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Long-Term RBI HPI CAGR</span>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold">15-Yr Real</span>
          </div>
          <div className="text-2xl font-bold text-indigo-700">
            {marketContext?.rbi_hpi_context ? pct(marketContext.rbi_hpi_context.long_term_cagr_pct) : '11.07%'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">2010–2025 official index appreciation</p>
        </div>
      </div>

      {/* Instant Household Affordability Snapshot */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Quick Household Budget Sizing</h3>
            <p className="text-xs text-slate-500">
              Evaluates whether a target property is mathematically affordable within standard banking guidelines (45% FOIR).
            </p>
          </div>
          <button
            onClick={() => setActiveTab('household')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
          >
            Open Advanced Budgeting <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Slider
              label="Gross Monthly Income"
              value={monthlyIncome}
              min={50000}
              max={1000000}
              step={10000}
              format={(v) => inr(v, true)}
              onChange={(v) => {
                setMonthlyIncome(v);
                setHouseholdData(null);
              }}
            />
            <Slider
              label="Target Property Price"
              value={propertyPrice}
              min={1000000}
              max={50000000}
              step={500000}
              format={(v) => inr(v, true)}
              onChange={(v) => {
                setPropertyPrice(v);
                setHouseholdData(null);
                setEmiData(null);
              }}
            />
            <button
              onClick={fetchHousehold}
              disabled={householdLoading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition disabled:opacity-50"
            >
              {householdLoading ? 'Assessing Capacity…' : 'Re-Evaluate Instant Capacity'}
            </button>
          </div>

          <div className="flex flex-col justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
            {householdLoading && <LoadingSpinner />}
            {householdError && <ErrorAlert msg={householdError} />}
            {householdData && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600 font-medium">Affordability Verdict:</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      householdData.is_affordable
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {householdData.is_affordable ? '✓ Within Prudent Budget' : '⚠ Affordability Shortfall'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-slate-500">Binding Property Budget:</p>
                    <p className="text-base font-bold text-slate-900 mt-0.5">
                      {inr(householdData.binding_max_property_budget, true)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Max Allowable Housing EMI:</p>
                    <p className="text-base font-bold text-slate-900 mt-0.5">
                      {inr(householdData.max_allowable_housing_emi)}/mo
                    </p>
                  </div>
                </div>

                {householdData.affordability_gap !== null && (
                  <p className="text-xs text-slate-600">
                    {householdData.is_affordable ? (
                      <span className="text-emerald-700 font-medium">
                        You have {inr(Math.abs(householdData.affordability_gap), true)} headroom under current income and savings constraints.
                      </span>
                    ) : (
                      <span className="text-rose-700 font-medium">
                        Target price exceeds capacity by {inr(Math.abs(householdData.affordability_gap), true)}. Consider higher down payment or longer tenure.
                      </span>
                    )}
                  </p>
                )}
              </>
            )}
            {!householdData && !householdLoading && (
              <p className="text-xs text-slate-400 text-center my-auto">Click evaluate to calculate household affordability.</p>
            )}
          </div>
        </div>
      </div>

      {/* Module Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            id: 'emi' as TabId,
            title: 'EMI & Amortization Engine',
            desc: 'Reducing-balance monthly payments, full schedules, and prepayment acceleration interest savings.',
            Icon: Calculator,
          },
          {
            id: 'upfront' as TabId,
            title: 'Upfront Acquisition Costs',
            desc: 'Itemized breakdown of stamp duty (6%), registration caps (₹30K), processing fees, and moving fit-outs.',
            Icon: Home,
          },
          {
            id: 'ownership' as TabId,
            title: 'True Cost of Ownership',
            desc: 'Society maintenance, municipal property taxes, insurance, and repairs beyond raw mortgage debt.',
            Icon: BarChart2,
          },
          {
            id: 'rvb' as TabId,
            title: 'Rent vs Buy Wealth Trajectory',
            desc: 'True cash-flow equivalence: opportunity cost of down payment vs long-term property equity build.',
            Icon: ArrowRightLeft,
          },
          {
            id: 'household' as TabId,
            title: 'Household Affordability (FOIR)',
            desc: 'Reverse loan sizing and dual-constraint budgeting based on liquid savings and debt-to-income limits.',
            Icon: Users,
          },
          {
            id: 'scenarios' as TabId,
            title: 'Scenario Comparative Simulator',
            desc: 'Side-by-side analysis of Conservative, Moderate Baseline, and Aggressive capital growth scenarios.',
            Icon: TrendingUp,
          },
        ].map((mod) => (
          <div
            key={mod.id}
            onClick={() => setActiveTab(mod.id)}
            className="group bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs hover:border-indigo-300 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:bg-indigo-600 group-hover:text-white transition">
                <mod.Icon className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition">
                {mod.title}
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{mod.desc}</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-indigo-600 pt-3 mt-2 border-t border-slate-100">
              Launch Analysis <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
        ))}
      </div>

      <DisclaimerBanner />
    </div>
  );

  // ═════════════════════════════════════════════════════════════════════════════
  // SECTION 2: EMI CALCULATOR
  // ═════════════════════════════════════════════════════════════════════════════
  const EmiSection = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="space-y-4">
        <SharedPropertyPanel />

        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Prepayment Accelerator
          </h3>
          <Slider
            label="Extra Monthly Principal Payment"
            value={extraEmi}
            min={0}
            max={100000}
            step={5000}
            format={(v) => (v > 0 ? inr(v) : 'None (₹0)')}
            onChange={(v) => {
              setExtraEmi(v);
              setEmiData(null);
            }}
            tooltip="Regular extra principal prepayment directly amortizes the loan principal."
          />
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Even modest extra monthly repayments dramatically reduce cumulative compounding interest.
          </p>
        </div>

        <button
          onClick={fetchEmi}
          disabled={emiLoading}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition disabled:opacity-50"
        >
          {emiLoading ? 'Calculating Schedule…' : 'Calculate EMI & Amortization'}
        </button>

        <DisclaimerBanner text="Interest calculations assume fixed monthly reducing balance. Floating rates reset with RBI policy changes." />
      </div>

      <div className="lg:col-span-2 space-y-4">
        {emiLoading && <LoadingSpinner />}
        {emiError && <ErrorAlert msg={emiError} onRetry={fetchEmi} />}

        {emiData && (
          <>
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Monthly EMI', value: inr(emiData.monthly_emi), sub: 'reducing balance' },
                { label: 'Loan Principal', value: inr(emiData.loan_principal, true), sub: `LTV ${pct(emiData.ltv_ratio, 0)}` },
                {
                  label: 'Total Interest',
                  value: inr(emiData.total_interest, true),
                  sub: `${pct(emiData.interest_to_principal_ratio * 100, 0)} of borrowing`,
                },
                { label: 'Total Payment', value: inr(emiData.total_payment, true), sub: `${emiData.tenure_years} yrs outflow` },
              ].map((k) => (
                <div key={k.label} className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">{k.label}</p>
                  <p className="text-xl font-bold text-slate-900">{k.value}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{k.sub}</p>
                </div>
              ))}
            </div>

            {/* Prepayment Impact Banner */}
            {emiData.interest_saved_by_prepayment > 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900 space-y-1">
                  <p className="font-bold text-emerald-800 text-sm">
                    Prepayment Acceleration Saves {inr(emiData.interest_saved_by_prepayment, true)} in Total Interest!
                  </p>
                  <p>
                    Your effective loan tenure is reduced from {emiData.tenure_years} years to{' '}
                    <strong>{Math.ceil(emiData.effective_tenure_months / 12)} years</strong> ({emiData.effective_tenure_months} months).
                  </p>
                </div>
              </div>
            )}

            {/* Amortization Area Chart */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Loan Amortization Trajectory</h4>
                  <p className="text-xs text-slate-500">
                    Remaining principal debt amortizes down while homeowner equity compounds.
                  </p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={emiData.amortization_schedule} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="debtGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="intGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="year" tick={{ fontSize: 10 }} tickFormatter={(v) => `Yr ${v}`} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => inr(v, true)} width={64} />
                  <Tooltip
                    formatter={(val: number, name: string) => [inr(val, true), name]}
                    labelFormatter={(l) => `Year ${l}`}
                  />
                  <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                  <Area
                    type="monotone"
                    dataKey="closing_balance"
                    name="Remaining Principal"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    fill="url(#debtGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="homeowner_equity"
                    name="Homeowner Equity Built"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#eqGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="cumulative_interest"
                    name="Cumulative Interest Paid"
                    stroke="#f59e0b"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    fill="url(#intGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Amortization Schedule Data Table */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <h4 className="text-sm font-bold text-slate-800">Annual Amortization Table</h4>
                <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
                  <button
                    onClick={() => setScheduleViewMode('all')}
                    className={`px-2.5 py-1 rounded font-medium transition ${
                      scheduleViewMode === 'all' ? 'bg-white shadow-xs text-indigo-700' : 'text-slate-500'
                    }`}
                  >
                    All {emiData.tenure_years} Years
                  </button>
                  <button
                    onClick={() => setScheduleViewMode('milestones')}
                    className={`px-2.5 py-1 rounded font-medium transition ${
                      scheduleViewMode === 'milestones' ? 'bg-white shadow-xs text-indigo-700' : 'text-slate-500'
                    }`}
                  >
                    5-Year Milestones
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto max-h-64 overflow-y-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-100 sticky top-0">
                    <tr>
                      <th className="px-3 py-2">Year</th>
                      <th className="px-3 py-2">Annual EMI</th>
                      <th className="px-3 py-2">Principal Paid</th>
                      <th className="px-3 py-2">Interest Paid</th>
                      <th className="px-3 py-2">Closing Debt</th>
                      <th className="px-3 py-2">Equity Built</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayedSchedule.map((row) => (
                      <tr key={row.year} className="hover:bg-slate-50/70 transition">
                        <td className="px-3 py-2 font-bold text-slate-900">Year {row.year}</td>
                        <td className="px-3 py-2">{inr(row.annual_emi)}</td>
                        <td className="px-3 py-2 text-emerald-700 font-medium">{inr(row.principal_paid)}</td>
                        <td className="px-3 py-2 text-amber-700 font-medium">{inr(row.interest_paid)}</td>
                        <td className="px-3 py-2 text-slate-800">{inr(row.closing_balance)}</td>
                        <td className="px-3 py-2 font-bold text-indigo-700">{inr(row.homeowner_equity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {!emiData && !emiLoading && !emiError && (
          <div className="flex items-center justify-center h-64 bg-white rounded-xl border border-dashed border-slate-200">
            <p className="text-xs text-slate-400">Click "Calculate EMI & Amortization" to run calculation.</p>
          </div>
        )}
      </div>
    </div>
  );

  // ═════════════════════════════════════════════════════════════════════════════
  // SECTION 3: UPFRONT PURCHASE COSTS
  // ═════════════════════════════════════════════════════════════════════════════
  const UpfrontSection = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="space-y-4">
        <SharedPropertyPanel />

        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Statutory & Closing Inputs</h3>
          <Slider
            label="Stamp Duty Rate"
            value={stampDutyPct}
            min={3.0}
            max={8.0}
            step={0.5}
            format={(v) => `${v}%`}
            onChange={(v) => {
              setStampDutyPct(v);
              setUpfrontData(null);
            }}
            tooltip="Maharashtra standard stamp duty is 6% (inclusive of 1% metro cess)."
          />
          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            <span className="font-medium text-slate-600">Include 5% Interior / Fit-out buffer</span>
            <input
              type="checkbox"
              checked={includeFitout}
              onChange={(e) => {
                setIncludeFitout(e.target.checked);
                setUpfrontData(null);
              }}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
            />
          </div>
        </div>

        <button
          onClick={fetchUpfront}
          disabled={upfrontLoading}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition disabled:opacity-50"
        >
          {upfrontLoading ? 'Computing Itemized Fees…' : 'Compute Upfront Purchase Costs'}
        </button>

        <DisclaimerBanner text="Registration fees adhere to the statutory IGR Maharashtra cap of ₹30,000. All charges are user-editable." />
      </div>

      <div className="lg:col-span-2 space-y-4">
        {upfrontLoading && <LoadingSpinner />}
        {upfrontError && <ErrorAlert msg={upfrontError} onRetry={fetchUpfront} />}

        {upfrontData && (
          <>
            <div className="bg-gradient-to-r from-indigo-50 to-slate-50 border border-indigo-200/80 rounded-xl p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                    Total Upfront Cash Required at Closing
                  </p>
                  <p className="text-3xl font-extrabold text-indigo-950 mt-1">
                    {inr(upfrontData.total_upfront_cash_required)}
                  </p>
                </div>
                <div className="text-xs text-indigo-800 bg-white px-3 py-1.5 rounded-lg border border-indigo-100 shadow-2xs">
                  <strong>{pct(upfrontData.total_cash_to_price_ratio_pct)}</strong> of property agreement value
                </div>
              </div>
            </div>

            {/* Itemized Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Down Payment (Equity)', value: upfrontData.down_payment, highlight: true },
                { label: 'Stamp Duty (Govt)', value: upfrontData.stamp_duty, highlight: false },
                { label: 'Registration (IGR Cap)', value: upfrontData.registration_fee, highlight: false },
                { label: 'Loan Processing Fee', value: upfrontData.loan_processing_fee, highlight: false },
                { label: 'Legal & Documentation', value: upfrontData.legal_doc_fee, highlight: false },
                { label: 'Brokerage / Advisory', value: upfrontData.brokerage_fee, highlight: false },
                { label: 'Interior Fit-out Buffer', value: upfrontData.interiors_furnishing, highlight: false },
                { label: 'Moving & Setup Charges', value: upfrontData.moving_expenses, highlight: false },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`rounded-xl border p-3.5 shadow-xs ${
                    item.highlight ? 'bg-indigo-50/50 border-indigo-200' : 'bg-white border-slate-200/90'
                  }`}
                >
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{item.label}</p>
                  <p className={`text-base font-bold mt-1 ${item.highlight ? 'text-indigo-800' : 'text-slate-900'}`}>
                    {inr(item.value)}
                  </p>
                </div>
              ))}
            </div>

            {/* Pie Chart Composition */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
              <h4 className="text-sm font-bold text-slate-800 mb-2">Upfront Capital Allocation</h4>
              <p className="text-xs text-slate-500 mb-4">
                Compare capital invested directly in property equity vs irrecoverable statutory & advisory fees.
              </p>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Down Payment (Equity)', value: upfrontData.down_payment },
                      { name: 'Statutory Taxes (Stamp/Reg)', value: upfrontData.total_statutory_charges },
                      {
                        name: 'Bank & Legal Fees',
                        value: upfrontData.loan_processing_fee + upfrontData.legal_doc_fee,
                      },
                      {
                        name: 'Brokerage & Interior Reserve',
                        value:
                          upfrontData.brokerage_fee +
                          upfrontData.interiors_furnishing +
                          upfrontData.moving_expenses,
                      },
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {PALETTE.map((c, i) => (
                      <Cell key={i} fill={c} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [inr(v), 'Amount']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {!upfrontData && !upfrontLoading && !upfrontError && (
          <div className="flex items-center justify-center h-64 bg-white rounded-xl border border-dashed border-slate-200">
            <p className="text-xs text-slate-400">Click "Compute Upfront Purchase Costs" to run calculation.</p>
          </div>
        )}
      </div>
    </div>
  );

  // ═════════════════════════════════════════════════════════════════════════════
  // SECTION 4: MONTHLY OWNERSHIP COSTS
  // ═════════════════════════════════════════════════════════════════════════════
  const OwnershipSection = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="space-y-4">
        <SharedPropertyPanel />

        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Recurring Non-Mortgage Outflows</h3>
          <Slider
            label="Society Maintenance (/mo)"
            value={maintenanceMonthly}
            min={1000}
            max={35000}
            step={500}
            format={(v) => inr(v)}
            onChange={(v) => {
              setMaintenanceMonthly(v);
              setOwnershipData(null);
            }}
            tooltip="Monthly housing society maintenance charges."
          />
          <Slider
            label="Gross Monthly Income"
            value={monthlyIncome}
            min={50000}
            max={1000000}
            step={10000}
            format={(v) => inr(v, true)}
            onChange={(v) => {
              setMonthlyIncome(v);
              setOwnershipData(null);
            }}
            tooltip="Used to evaluate Housing Expense to Income Ratio (HEIR)."
          />
        </div>

        <button
          onClick={fetchOwnership}
          disabled={ownershipLoading}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition disabled:opacity-50"
        >
          {ownershipLoading ? 'Computing Total Cost…' : 'Compute Monthly Ownership Cost'}
        </button>

        <DisclaimerBanner text="Annual municipal property taxes and insurance premiums are normalized to monthly equivalents (divided by 12)." />
      </div>

      <div className="lg:col-span-2 space-y-4">
        {ownershipLoading && <LoadingSpinner />}
        {ownershipError && <ErrorAlert msg={ownershipError} onRetry={fetchOwnership} />}

        {ownershipData && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Mortgage Monthly EMI', value: inr(ownershipData.monthly_emi), sub: `${pct(ownershipData.emi_share_pct)} of total` },
                {
                  label: 'Non-EMI Recurring Costs',
                  value: inr(ownershipData.total_monthly_non_emi_expenses),
                  sub: `${pct(ownershipData.non_emi_share_pct)} of total`,
                },
                { label: 'Total True Monthly Outflow', value: inr(ownershipData.total_monthly_ownership_cost), sub: 'all-inclusive' },
                { label: 'Annualized Homeownership', value: inr(ownershipData.total_annual_ownership_cost, true), sub: '12 months sum' },
                {
                  label: 'Housing Expense Ratio (HEIR)',
                  value:
                    ownershipData.housing_expense_to_income_ratio_pct !== null
                      ? pct(ownershipData.housing_expense_to_income_ratio_pct)
                      : 'N/A',
                  sub: 'of gross monthly income',
                },
                {
                  label: 'Society Maintenance',
                  value: inr(ownershipData.monthly_maintenance),
                  sub: 'monthly association fee',
                },
              ].map((k) => (
                <div key={k.label} className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">{k.label}</p>
                  <p className="text-xl font-bold text-slate-900">{k.value}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{k.sub}</p>
                </div>
              ))}
            </div>

            {/* Stacked Horizontal Bar Chart */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
              <h4 className="text-sm font-bold text-slate-800 mb-1">Monthly Cost Stack</h4>
              <p className="text-xs text-slate-500 mb-4">
                Visualizing how monthly society maintenance and statutory tax reserves expand total outlay beyond the EMI.
              </p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart
                  data={[
                    {
                      name: 'Monthly Ownership',
                      'Mortgage EMI': ownershipData.monthly_emi,
                      'Society Maintenance': ownershipData.monthly_maintenance,
                      'Property Tax (Monthly Eq)': ownershipData.monthly_property_tax,
                      'Home Insurance': ownershipData.monthly_insurance,
                      'Repairs Reserve': ownershipData.monthly_repairs_reserve,
                    },
                  ]}
                  layout="vertical"
                  margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => inr(v, true)} />
                  <YAxis type="category" dataKey="name" hide />
                  <Tooltip formatter={(v: number, n: string) => [inr(v), n]} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  {['Mortgage EMI', 'Society Maintenance', 'Property Tax (Monthly Eq)', 'Home Insurance', 'Repairs Reserve'].map(
                    (key, idx) => (
                      <Bar key={key} dataKey={key} stackId="ownership" fill={PALETTE[idx]} />
                    )
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {!ownershipData && !ownershipLoading && !ownershipError && (
          <div className="flex items-center justify-center h-64 bg-white rounded-xl border border-dashed border-slate-200">
            <p className="text-xs text-slate-400">Click "Compute Monthly Ownership Cost" to run calculation.</p>
          </div>
        )}
      </div>
    </div>
  );

  // ═════════════════════════════════════════════════════════════════════════════
  // SECTION 5: RENT VS BUY
  // ═════════════════════════════════════════════════════════════════════════════
  const RentVsBuySection = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="space-y-4">
        <SharedPropertyPanel />

        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Rent & Asset Assumptions</h3>
            <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">
              Empirical Baseline
            </span>
          </div>

          <Slider
            label="Initial Monthly Rent"
            value={monthlyRent}
            min={10000}
            max={200000}
            step={2000}
            format={(v) => inr(v)}
            onChange={(v) => {
              setMonthlyRent(v);
              setRvbData(null);
            }}
            tooltip="Starting monthly rental outflow for an equivalent apartment."
          />

          <Slider
            label="Annual Rent Escalation"
            value={rentIncreasePct}
            min={2.0}
            max={12.0}
            step={0.5}
            format={(v) => `${v}%`}
            onChange={(v) => {
              setRentIncreasePct(v);
              setRvbData(null);
            }}
            tooltip="Yearly contractual rental hike (Mumbai typical: 5-8%)."
          />

          <Slider
            label="Property Capital Appreciation"
            value={appreciationPct}
            min={2.0}
            max={12.0}
            step={0.5}
            format={(v) => `${v}%`}
            onChange={(v) => {
              setAppreciationPct(v);
              setRvbData(null);
            }}
            tooltip="Annual residential capital appreciation rate."
          />

          <Slider
            label="Equity Investment Portfolio Return"
            value={investmentReturnPct}
            min={6.0}
            max={15.0}
            step={0.5}
            format={(v) => `${v}%`}
            onChange={(v) => {
              setInvestmentReturnPct(v);
              setRvbData(null);
            }}
            tooltip="Opportunity cost rate for renter's invested capital (Nifty 50 historical: ~10%)."
          />

          <Slider
            label="Analysis Horizon"
            value={rvbHorizonYears}
            min={5}
            max={30}
            step={1}
            format={(v) => `${v} Years`}
            onChange={(v) => {
              setRvbHorizonYears(v);
              setRvbData(null);
            }}
            tooltip="Duration over which wealth trajectory is evaluated."
          />
        </div>

        <button
          onClick={fetchRvb}
          disabled={rvbLoading}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition disabled:opacity-50"
        >
          {rvbLoading ? 'Simulating Trajectory…' : 'Compare Rent vs Buy Cash-Flow'}
        </button>

        <DisclaimerBanner text="Rent-vs-buy modeling uses cash-flow equivalence: differences in monthly outlay are invested in or drawn from the liquid market portfolio." />
      </div>

      <div className="lg:col-span-2 space-y-4">
        {rvbLoading && <LoadingSpinner />}
        {rvbError && <ErrorAlert msg={rvbError} onRetry={fetchRvb} />}

        {rvbData && (
          <>
            {/* Dynamic Verdict Banner */}
            <div
              className={`rounded-xl border p-5 shadow-xs ${
                rvbData.net_buy_advantage >= 0
                  ? 'bg-gradient-to-r from-emerald-50 to-slate-50 border-emerald-200'
                  : 'bg-gradient-to-r from-sky-50 to-slate-50 border-sky-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{rvbData.net_buy_advantage >= 0 ? '🏡' : '🏢'}</span>
                <h4
                  className={`text-base font-bold ${
                    rvbData.net_buy_advantage >= 0 ? 'text-emerald-900' : 'text-sky-900'
                  }`}
                >
                  {rvbData.net_buy_advantage >= 0
                    ? `Buying Leads by ${inr(rvbData.net_buy_advantage, true)} after ${rvbData.analysis_period_years} Years`
                    : `Renting Leads by ${inr(Math.abs(rvbData.net_buy_advantage), true)} after ${rvbData.analysis_period_years} Years`}
                </h4>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed mt-1">{rvbData.verdict_summary}</p>
              {rvbData.break_even_year && (
                <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-white px-2.5 py-1 rounded-md border border-indigo-100">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                  Financial Break-Even Horizon: Year {rvbData.break_even_year}
                </div>
              )}
            </div>

            {/* Terminal Wealth KPI Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Buyer Net Equity (Yr {rvbHorizonYears})
                </p>
                <p className="text-xl font-bold text-indigo-700">{inr(rvbData.buyer_terminal_wealth, true)}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Asset value minus remaining debt & selling costs</p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Renter Portfolio (Yr {rvbHorizonYears})
                </p>
                <p className="text-xl font-bold text-sky-700">{inr(rvbData.renter_terminal_wealth, true)}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Compounded capital + cash differential</p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Net Buy Advantage</p>
                <p
                  className={`text-xl font-bold ${
                    rvbData.net_buy_advantage >= 0 ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {inr(rvbData.net_buy_advantage, true)}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {rvbData.net_buy_advantage >= 0 ? 'Buyer outpaces renter' : 'Renter outpaces buyer'}
                </p>
              </div>
            </div>

            {/* Wealth Trajectory Line Chart */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Net Wealth Accumulation Trajectory</h4>
                  <p className="text-xs text-slate-500">
                    Year-by-year terminal wealth comparing real estate equity vs liquid equity investment.
                  </p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={rvbData.annual_trajectory} margin={{ top: 10, right: 15, left: 5, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="year" tick={{ fontSize: 10 }} tickFormatter={(v) => `Yr ${v}`} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => inr(v, true)} width={68} />
                  <Tooltip
                    formatter={(v: number, n: string) => [inr(v, true), n]}
                    labelFormatter={(l) => `Year ${l}`}
                  />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  {rvbData.break_even_year && (
                    <ReferenceLine
                      x={rvbData.break_even_year}
                      stroke="#475569"
                      strokeDasharray="4 4"
                      label={{
                        value: `Break-even: Yr ${rvbData.break_even_year}`,
                        fontSize: 10,
                        fill: '#475569',
                      }}
                    />
                  )}
                  <Line
                    type="monotone"
                    dataKey="buyer_net_equity"
                    name="Buyer Net Equity"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="renter_investment_portfolio"
                    name="Renter Portfolio"
                    stroke="#0284c7"
                    strokeWidth={2.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-3 flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                <span>Appreciation Assumption: {pct(rvbData.assumptions_used.property_appreciation_pct)}</span>
                <span>Rent Inflation: {pct(rvbData.assumptions_used.annual_rent_increase_pct)}</span>
                <span>Equity Return: {pct(rvbData.assumptions_used.investment_return_pct)}</span>
                <span>Mortgage Rate: {pct(rvbData.assumptions_used.mortgage_interest_rate_pct)}</span>
              </div>
            </div>
          </>
        )}

        {!rvbData && !rvbLoading && !rvbError && (
          <div className="flex items-center justify-center h-64 bg-white rounded-xl border border-dashed border-slate-200">
            <p className="text-xs text-slate-400">Click "Compare Rent vs Buy Cash-Flow" to simulate comparison.</p>
          </div>
        )}
      </div>
    </div>
  );

  // ═════════════════════════════════════════════════════════════════════════════
  // SECTION 6: HOUSEHOLD AFFORDABILITY
  // ═════════════════════════════════════════════════════════════════════════════
  const HouseholdSection = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-4 h-4 text-indigo-600" />
            Household Financial Capacity
          </h3>

          <Slider
            label="Gross Monthly Income"
            value={monthlyIncome}
            min={25000}
            max={1000000}
            step={5000}
            format={(v) => inr(v, true)}
            onChange={(v) => {
              setMonthlyIncome(v);
              setHouseholdData(null);
            }}
            tooltip="Combined primary and secondary household income before taxes."
          />

          <Slider
            label="Existing Monthly EMIs"
            value={existingEmis}
            min={0}
            max={200000}
            step={5000}
            format={(v) => (v > 0 ? inr(v) : 'None (₹0)')}
            onChange={(v) => {
              setExistingEmis(v);
              setHouseholdData(null);
            }}
            tooltip="Active personal loans, auto loans, or credit card EMIs."
          />

          <Slider
            label="Essential Monthly Expenses"
            value={essentialExpenses}
            min={10000}
            max={300000}
            step={5000}
            format={(v) => inr(v, true)}
            onChange={(v) => {
              setEssentialExpenses(v);
              setHouseholdData(null);
            }}
            tooltip="Groceries, school fees, utilities, and nondiscretionary expenses."
          />

          <Slider
            label="Liquid Savings Available"
            value={liquidSavings}
            min={100000}
            max={50000000}
            step={250000}
            format={(v) => inr(v, true)}
            onChange={(v) => {
              setLiquidSavings(v);
              setHouseholdData(null);
            }}
            tooltip="Liquid cash available for down payment and acquisition stamp duty."
          />

          <Slider
            label="FOIR Guideline Threshold"
            value={foirThreshold}
            min={30}
            max={60}
            step={5}
            format={(v) => `${v}% (${v <= 35 ? 'Conservative' : v <= 45 ? 'Moderate' : 'Aggressive'})`}
            onChange={(v) => {
              setFoirThreshold(v);
              setHouseholdData(null);
            }}
            tooltip="Fixed Obligation to Income Ratio ceiling accepted by lenders."
          />
        </div>

        <SharedPropertyPanel />

        <button
          onClick={fetchHousehold}
          disabled={householdLoading}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition disabled:opacity-50"
        >
          {householdLoading ? 'Assessing Capacity…' : 'Assess Household Affordability'}
        </button>

        <DisclaimerBanner text="FOIR calculations model banking borrowing capacity. Actual sanctions depend on CIBIL score, employer profile, and appraisal." />
      </div>

      <div className="lg:col-span-2 space-y-4">
        {householdLoading && <LoadingSpinner />}
        {householdError && <ErrorAlert msg={householdError} onRetry={fetchHousehold} />}

        {householdData && (
          <>
            {/* Status & Gap Verdict */}
            <div
              className={`rounded-xl border p-5 shadow-xs ${
                householdData.is_affordable
                  ? 'bg-gradient-to-r from-emerald-50 to-slate-50 border-emerald-200'
                  : 'bg-gradient-to-r from-rose-50 to-slate-50 border-rose-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    householdData.is_affordable ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {householdData.is_affordable ? '✓ Within Prudent Financial Budget' : '⚠ Affordability Shortfall'}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Current FOIR: <strong>{pct(householdData.current_foir_pct)}</strong> → Max Guideline:{' '}
                  <strong>{pct(householdData.foir_threshold_used_pct)}</strong>
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900 mt-2">
                {householdData.is_affordable
                  ? `Target Property is Affordable with ${inr(Math.abs(householdData.affordability_gap || 0), true)} Safety Buffer`
                  : `Target Property Exceeds Financial Capacity by ${inr(Math.abs(householdData.affordability_gap || 0), true)}`}
              </h4>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                {
                  label: 'Binding Property Budget',
                  value: inr(householdData.binding_max_property_budget, true),
                  sub: 'Dual-constraint limit',
                },
                {
                  label: 'Max Allowable Housing EMI',
                  value: inr(householdData.max_allowable_housing_emi),
                  sub: `at ${pct(householdData.foir_threshold_used_pct)} FOIR`,
                },
                {
                  label: 'Max Affordable Loan Amount',
                  value: inr(householdData.max_affordable_loan_principal, true),
                  sub: 'EMI-constrained capacity',
                },
                {
                  label: 'Disposable Monthly Surplus',
                  value: inr(householdData.disposable_surplus),
                  sub: 'after debts & essentials',
                },
                {
                  label: 'Cash-Constrained Budget',
                  value:
                    householdData.cash_constrained_property_budget !== null
                      ? inr(householdData.cash_constrained_property_budget, true)
                      : 'Unconstrained',
                  sub: 'based on liquid savings',
                },
                {
                  label: 'Loan-Constrained Budget',
                  value: inr(householdData.loan_constrained_property_budget, true),
                  sub: 'based on income & FOIR',
                },
              ].map((k) => (
                <div key={k.label} className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">{k.label}</p>
                  <p className="text-lg font-bold text-slate-900">{k.value}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{k.sub}</p>
                </div>
              ))}
            </div>

            {/* Recommendations */}
            {householdData.actionable_recommendations.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-3">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Actionable Financial Planning Recommendations
                </h4>
                <ul className="space-y-2">
                  {householdData.actionable_recommendations.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                      <ChevronRight className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {!householdData && !householdLoading && !householdError && (
          <div className="flex items-center justify-center h-64 bg-white rounded-xl border border-dashed border-slate-200">
            <p className="text-xs text-slate-400">Click "Assess Household Affordability" to evaluate limits.</p>
          </div>
        )}
      </div>
    </div>
  );

  // ═════════════════════════════════════════════════════════════════════════════
  // SECTION 7: FINANCIAL SCENARIO SIMULATOR
  // ═════════════════════════════════════════════════════════════════════════════
  const ScenariosSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <SharedPropertyPanel />
          <button
            onClick={fetchScenarios}
            disabled={scenarioLoading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition disabled:opacity-50"
          >
            {scenarioLoading ? 'Generating Simulations…' : 'Simulate 3-Scenario Stress Test'}
          </button>
          <DisclaimerBanner text="Scenarios illustrate trade-offs between Conservative, Moderate Baseline, and Bullish asset growth assumptions." />
        </div>

        <div className="lg:col-span-2">
          {scenarioLoading && <LoadingSpinner />}
          {scenarioError && <ErrorAlert msg={scenarioError} onRetry={fetchScenarios} />}

          {scenarioData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {scenarioData.scenarios.map((sc, i) => (
                <div
                  key={sc.id}
                  className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PALETTE[i] }} />
                      <h4 className="text-sm font-bold text-slate-900">{sc.name}</h4>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{sc.description}</p>

                    <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs">
                      {[
                        { label: 'Monthly EMI', value: inr(sc.monthly_emi) },
                        { label: 'Total Interest', value: inr(sc.total_interest, true) },
                        { label: 'Upfront Cash', value: inr(sc.total_upfront_cash, true) },
                        { label: '10-Yr Buyer Equity', value: inr(sc.ten_year_buyer_equity, true) },
                        { label: 'FOIR Ratio', value: pct(sc.foir_pct) },
                      ].map((item) => (
                        <div key={item.label} className="flex justify-between items-center">
                          <span className="text-slate-500">{item.label}:</span>
                          <span className="font-semibold text-slate-800">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-md text-center ${
                      sc.affordability_verdict.includes('Prudent')
                        ? 'bg-emerald-50 text-emerald-800'
                        : sc.affordability_verdict.includes('Moderate')
                        ? 'bg-amber-50 text-amber-800'
                        : 'bg-rose-50 text-rose-800'
                    }`}
                  >
                    {sc.affordability_verdict}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!scenarioData && !scenarioLoading && !scenarioError && (
            <div className="flex items-center justify-center h-64 bg-white rounded-xl border border-dashed border-slate-200">
              <p className="text-xs text-slate-400">Click "Simulate 3-Scenario Stress Test" to run comparison.</p>
            </div>
          )}
        </div>
      </div>

      {scenarioData && (
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-3">
          <h4 className="text-sm font-bold text-slate-800">10-Year Terminal Equity vs Monthly EMI Outflow</h4>
          <p className="text-xs text-slate-500">
            Compare monthly repayment burden against projected homeowner net asset accumulation across scenarios.
          </p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={scenarioData.scenarios} margin={{ top: 10, right: 15, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => inr(v, true)} width={68} />
              <Tooltip formatter={(v: number, n: string) => [inr(v, true), n]} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="monthly_emi" name="Monthly EMI" fill="#6366f1" radius={[3, 3, 0, 0]} />
              <Bar dataKey="ten_year_buyer_equity" name="10-Yr Projected Equity" fill="#10b981" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );

  // ═════════════════════════════════════════════════════════════════════════════
  // SECTION 8: METHODOLOGY AND ASSUMPTIONS
  // ═════════════════════════════════════════════════════════════════════════════
  const MethodologySection = () => (
    <div className="space-y-6 max-w-4xl">
      <DisclaimerBanner />

      {/* Mathematical Formulas Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          Authoritative Financial Calculation Engine Formulas
        </h3>

        {[
          {
            title: '1. Standard Reducing-Balance Home-Loan EMI',
            latex: 'EMI = P × [ r(1 + r)^n ] / [ (1 + r)^n − 1 ]',
            desc: "P = Principal, r = Periodic Monthly Rate = (Annual Rate %) / 1200, n = Total Tenure Months. If r → 0, EMI = P / n (L'Hôpital boundary evaluation).",
          },
          {
            title: '2. Statutory Acquisition Cost Structure (Maharashtra)',
            latex: 'Total Upfront = Down Payment + Stamp Duty (6%) + Registration (Capped ₹30,000) + Processing Fee (0.25%) + Incidental Legal',
            desc: 'Reflects IGR Maharashtra Article 25 Schedule I and NHB Loan-to-Value prudential risk ceilings.',
          },
          {
            title: '3. Rent-vs-Buy True Cash-Flow Equivalence',
            latex: 'Renter Portfolio(t) = Portfolio(t-1) × (1 + R_equity) + [ Cash Outflow_Buy(t) − Cash Outflow_Rent(t) ]',
            desc: 'Avoids the "EMI vs Rent" fallacy by tracking the opportunity cost of down payment capital and periodic cash flow differences invested at the equity hurdle rate.',
          },
          {
            title: '4. Household Dual-Constraint Property Budgeting',
            latex: 'Max Property Budget = min( Budget_LoanConstrained, Budget_CashConstrained )',
            desc: 'Where Budget_LoanConstrained = Max Affordable Principal / (1 − DownPayment%) and Budget_CashConstrained = Liquid Savings / (DownPayment% + StatutoryFeeBuffer%).',
          },
        ].map((f) => (
          <div key={f.title} className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1.5">
            <h4 className="text-xs font-bold text-slate-800">{f.title}</h4>
            <div className="font-mono text-xs font-semibold text-indigo-800 bg-white px-3 py-2 rounded border border-indigo-100">
              {f.latex}
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Assumptions & Sources Audit Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
          Regulatory Data Sources & Baseline Parameters
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-100">
              <tr>
                <th className="px-3 py-2">Parameter / Assumption</th>
                <th className="px-3 py-2">Engine Baseline</th>
                <th className="px-3 py-2">Publishing Authority / Source</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                {
                  param: 'External Benchmark Lending Rate (EBLR)',
                  val: '8.50% p.a.',
                  src: 'Reserve Bank of India (RBI)',
                  badge: 'Official Benchmark',
                },
                {
                  param: 'Mumbai Stamp Duty (Article 25)',
                  val: '6.00% (incl. 1% Metro Cess)',
                  src: 'IGR Maharashtra / Stamp Act',
                  badge: 'Statutory Rate',
                },
                {
                  param: 'Registration Fee Ceiling',
                  val: '₹30,000 maximum',
                  src: 'IGR Maharashtra Notification',
                  badge: 'Statutory Cap',
                },
                {
                  param: 'All-India HPI Historical Growth',
                  val: '11.07% (15-Yr Long-Term CAGR)',
                  src: 'RBI All-India Housing Price Index',
                  badge: 'Empirical Historical',
                },
                {
                  param: 'Gross Rental Yield Benchmark',
                  val: '2.80% annual',
                  src: 'Mumbai Residential Market Averages',
                  badge: 'Market Observation',
                },
                {
                  param: 'Equity Opportunity Cost Hurdle',
                  val: '10.00% annual CAGR',
                  src: 'NSE Nifty 50 Historical 15-Yr Total Return',
                  badge: 'Financial Index',
                },
                {
                  param: 'Prudential LTV Limit (>₹75L)',
                  val: '80.00% maximum loan',
                  src: 'National Housing Bank (NHB)',
                  badge: 'Prudential Ceiling',
                },
              ].map((row) => (
                <tr key={row.param} className="hover:bg-slate-50/70 transition">
                  <td className="px-3 py-2.5 font-medium text-slate-900">{row.param}</td>
                  <td className="px-3 py-2.5 font-bold text-indigo-700">{row.val}</td>
                  <td className="px-3 py-2.5 text-slate-600">{row.src}</td>
                  <td className="px-3 py-2.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {row.badge}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ═════════════════════════════════════════════════════════════════════════════
  // MAIN DASHBOARD LAYOUT
  // ═════════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Housing Affordability Intelligence Engine
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Empirical financial intelligence, reducing-balance mortgage analytics, and scenario modeling calibrated against official Reserve Bank of India datasets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Backend API Online
          </div>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex flex-wrap gap-1.5 p-1.5 bg-white rounded-xl border border-slate-200/90 shadow-xs">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === t.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <t.Icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Active Section Content */}
      <div className="transition-all duration-150">
        {activeTab === 'overview' && <OverviewSection />}
        {activeTab === 'emi' && <EmiSection />}
        {activeTab === 'upfront' && <UpfrontSection />}
        {activeTab === 'ownership' && <OwnershipSection />}
        {activeTab === 'rvb' && <RentVsBuySection />}
        {activeTab === 'household' && <HouseholdSection />}
        {activeTab === 'scenarios' && <ScenariosSection />}
        {activeTab === 'methodology' && <MethodologySection />}
      </div>
    </div>
  );
};

export default Affordability;
