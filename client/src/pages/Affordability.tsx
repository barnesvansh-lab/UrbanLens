import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Calculator,
  Scale,
  ArrowRightLeft,
} from 'lucide-react';
import { DemoNotice } from '../components/ui/DemoNotice';
import { AffordabilityChart } from '../components/charts/AffordabilityChart';
import {
  neighborhoods,
  affordabilityBrackets,
  rentalYieldData,
} from '../data/syntheticData';

export const Affordability: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'emi' | 'rent-vs-buy' | 'index'>('emi');

  // --- EMI Calculator State ---
  const [propertyPrice, setPropertyPrice] = useState<number>(12500000); // 1.25 Cr
  const [downPaymentPct, setDownPaymentPct] = useState<number>(20);
  const [loanTenureYears, setLoanTenureYears] = useState<number>(20);
  const [interestRatePct, setInterestRatePct] = useState<number>(8.5);

  // EMI Computations
  const { emi, principalLoan, totalInterest, totalPayment, ltvRatio, amortizationSchedule } =
    useMemo(() => {
      const downPayment = (propertyPrice * downPaymentPct) / 100;
      const principal = propertyPrice - downPayment;
      const monthlyRate = interestRatePct / (12 * 100);
      const totalMonths = loanTenureYears * 12;

      let monthlyEmi = 0;
      if (monthlyRate > 0) {
        monthlyEmi = Math.round(
          (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
            (Math.pow(1 + monthlyRate, totalMonths) - 1)
        );
      } else {
        monthlyEmi = Math.round(principal / totalMonths);
      }

      const totPay = monthlyEmi * totalMonths;
      const totInt = totPay - principal;
      const ltv = ((principal / propertyPrice) * 100).toFixed(0);

      // 20-Year Amortization Schedule (annual aggregates)
      const schedule = [];
      let balance = principal;
      let cumInterest = 0;

      for (let y = 1; y <= loanTenureYears; y++) {
        let yearInterest = 0;
        let yearPrincipal = 0;

        for (let m = 1; m <= 12; m++) {
          if (balance <= 0) break;
          const intForMonth = balance * monthlyRate;
          const princForMonth = monthlyEmi - intForMonth;
          yearInterest += intForMonth;
          yearPrincipal += princForMonth;
          balance = Math.max(0, balance - princForMonth);
        }

        cumInterest += yearInterest;
        schedule.push({
          year: `Yr ${y}`,
          remainingPrincipal: Math.round(balance),
          cumulativeInterest: Math.round(cumInterest),
          equityBuilt: Math.round(downPayment + (principal - balance)),
        });
      }

      return {
        emi: monthlyEmi,
        principalLoan: principal,
        totalInterest: totInt,
        totalPayment: totPay,
        ltvRatio: ltv,
        amortizationSchedule: schedule,
      };
    }, [propertyPrice, downPaymentPct, loanTenureYears, interestRatePct]);

  // --- Rent vs Buy State ---
  const [monthlyRent, setMonthlyRent] = useState<number>(45000);
  const [annualRentHikePct, setAnnualRentHikePct] = useState<number>(6);
  const [propertyAppreciationPct, setPropertyAppreciationPct] = useState<number>(7);
  const [investmentReturnPct, setInvestmentReturnPct] = useState<number>(10);

  // 10-Year Rent vs Buy Comparison
  const rentVsBuyData = useMemo(() => {
    const downPayment = (propertyPrice * downPaymentPct) / 100;
    let currentRent = monthlyRent;
    let cumRentCost = 0;
    let rentersInvestmentPortfolio = downPayment; // Renter invests down payment in market

    let cumHomeCost = downPayment;
    let homeValue = propertyPrice;

    const data = [];
    let breakEvenYear: number | null = null;

    for (let yr = 1; yr <= 10; yr++) {
      // Rent calculations
      const annualRentPaid = currentRent * 12;
      cumRentCost += annualRentPaid;
      rentersInvestmentPortfolio =
        rentersInvestmentPortfolio * (1 + investmentReturnPct / 100) +
        Math.max(0, emi * 12 - annualRentPaid); // difference invested
      currentRent *= 1 + annualRentHikePct / 100;

      // Buy calculations
      const annualMortgagePaid = emi * 12;
      const maintenanceAndTaxes = homeValue * 0.012; // 1.2% maintenance/tax
      cumHomeCost += annualMortgagePaid + maintenanceAndTaxes;
      homeValue *= 1 + propertyAppreciationPct / 100;

      // Net Wealth = Asset Value - Remaining Debt
      const remainingDebt =
        amortizationSchedule[yr - 1]?.remainingPrincipal || 0;
      const buyerNetWealth = Math.round(homeValue - remainingDebt);
      const renterNetWealth = Math.round(rentersInvestmentPortfolio - cumRentCost);

      if (buyerNetWealth > renterNetWealth && breakEvenYear === null) {
        breakEvenYear = yr;
      }

      data.push({
        year: `Year ${yr}`,
        buyerNetWealth: Math.round(buyerNetWealth / 100000), // in Lakhs
        renterNetWealth: Math.round(renterNetWealth / 100000), // in Lakhs
      });
    }

    return {
      series: data,
      breakEvenYear: breakEvenYear || '10+',
    };
  }, [
    propertyPrice,
    downPaymentPct,
    emi,
    amortizationSchedule,
    monthlyRent,
    annualRentHikePct,
    propertyAppreciationPct,
    investmentReturnPct,
  ]);

  return (
    <div className="space-y-6">
      <DemoNotice />

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-xl shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab('emi')}
          className={`flex items-center gap-2 py-4 px-4 text-xs font-semibold border-b-2 transition ${
            activeTab === 'emi'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Mortgage EMI Calculator</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rent-vs-buy')}
          className={`flex items-center gap-2 py-4 px-4 text-xs font-semibold border-b-2 transition ${
            activeTab === 'rent-vs-buy'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>10-Year Rent vs. Buy Model</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('index')}
          className={`flex items-center gap-2 py-4 px-4 text-xs font-semibold border-b-2 transition ${
            activeTab === 'index'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Affordability Index & Demographics</span>
        </button>
      </div>

      {/* TAB 1: EMI CALCULATOR */}
      {activeTab === 'emi' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-5">
            <div>
              <h3 className="text-base font-semibold text-slate-800">
                Loan Underwriting Inputs
              </h3>
              <p className="text-xs text-slate-500">
                Configure property valuation, down payment reserve, and lending rate
              </p>
            </div>

            {/* Property Price Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-600">Property Price:</span>
                <span className="text-indigo-600 font-bold">
                  ₹{(propertyPrice / 10000000).toFixed(2)} Cr (₹{propertyPrice.toLocaleString('en-IN')})
                </span>
              </div>
              <input
                type="range"
                min={3000000}
                max={50000000}
                step={500000}
                value={propertyPrice}
                onChange={(e) => setPropertyPrice(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>₹30 L</span>
                <span>₹2.5 Cr</span>
                <span>₹5.0 Cr</span>
              </div>
            </div>

            {/* Down Payment % Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-600">Down Payment (%):</span>
                <span className="text-slate-900 font-bold">
                  {downPaymentPct}% (₹{((propertyPrice * downPaymentPct) / 100).toLocaleString('en-IN')})
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={50}
                step={5}
                value={downPaymentPct}
                onChange={(e) => setDownPaymentPct(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>10% (Min)</span>
                <span>20% (Std)</span>
                <span>50%</span>
              </div>
            </div>

            {/* Loan Tenure */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-600">Loan Tenure:</span>
                <span className="text-slate-900 font-bold">{loanTenureYears} Years</span>
              </div>
              <input
                type="range"
                min={5}
                max={30}
                step={1}
                value={loanTenureYears}
                onChange={(e) => setLoanTenureYears(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>5 Years</span>
                <span>20 Years</span>
                <span>30 Years</span>
              </div>
            </div>

            {/* Interest Rate */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-600">Home Loan Interest Rate (% p.a.):</span>
                <span className="text-slate-900 font-bold">{interestRatePct}%</span>
              </div>
              <input
                type="range"
                min={6.5}
                max={13.0}
                step={0.25}
                value={interestRatePct}
                onChange={(e) => setInterestRatePct(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>6.5%</span>
                <span>8.5% (Benchmark)</span>
                <span>13.0%</span>
              </div>
            </div>

            {/* Output KPI Callouts */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-indigo-700 font-medium block">
                    Calculated Monthly EMI
                  </span>
                  <span className="text-2xl font-black text-indigo-950">
                    ₹{emi.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-indigo-600 font-semibold block">LTV RATIO</span>
                  <span className="text-sm font-bold text-indigo-900">{ltvRatio}%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block">Total Interest</span>
                  <span className="font-bold text-slate-800 text-sm">
                    ₹{(totalInterest / 100000).toFixed(2)} Lakhs
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block">Total Repayment</span>
                  <span className="font-bold text-slate-800 text-sm">
                    ₹{(totalPayment / 10000000).toFixed(2)} Cr
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Amortization Chart Column (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="text-base font-semibold text-slate-800">
                  Amortization & Equity Build-Up Schedule
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  {loanTenureYears}-Year Horizon
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Year-by-year evolution of remaining debt vs cumulative interest paid
              </p>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={amortizationSchedule}
                  margin={{ top: 10, right: 15, left: 0, bottom: 20 }}
                >
                  <defs>
                    <linearGradient id="principalGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="interestGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val: number) => `₹${(val / 100000).toFixed(0)}L`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Amount']}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                  <Area
                    type="monotone"
                    dataKey="remainingPrincipal"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill="url(#principalGrad)"
                    name="Remaining Principal Loan"
                  />
                  <Area
                    type="monotone"
                    dataKey="cumulativeInterest"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fill="url(#interestGrad)"
                    name="Cumulative Interest Paid"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed">
              Standard Reducing Balance Method applied: Monthly reducing interest calculated on outstanding principal balance at each billing cycle.
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RENT VS BUY */}
      {activeTab === 'rent-vs-buy' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-semibold text-slate-800">
                Opportunity Cost Inputs
              </h3>
              <p className="text-xs text-slate-500">
                Compare buying home equity against renting and investing the difference
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 block">
                Current Monthly Rent: ₹{monthlyRent.toLocaleString('en-IN')}
              </label>
              <input
                type="range"
                min={15000}
                max={150000}
                step={2500}
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 block">
                Annual Rent Escalation: {annualRentHikePct}% / yr
              </label>
              <input
                type="range"
                min={3}
                max={10}
                step={0.5}
                value={annualRentHikePct}
                onChange={(e) => setAnnualRentHikePct(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 block">
                Property Capital Appreciation: {propertyAppreciationPct}% / yr
              </label>
              <input
                type="range"
                min={3}
                max={12}
                step={0.5}
                value={propertyAppreciationPct}
                onChange={(e) => setPropertyAppreciationPct(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 block">
                Renter's Alternate Equity Market Return: {investmentReturnPct}% / yr
              </label>
              <input
                type="range"
                min={6}
                max={14}
                step={0.5}
                value={investmentReturnPct}
                onChange={(e) => setInvestmentReturnPct(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                <span className="text-xs text-emerald-800 font-medium block">
                  Break-Even Horizon
                </span>
                <span className="text-xl font-bold text-emerald-900">
                  {rentVsBuyData.breakEvenYear === '10+'
                    ? '10+ Years (Rent Favored)'
                    : `Year ${rentVsBuyData.breakEvenYear} (Buy Favored)`}
                </span>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Point at which ownership equity surpasses renter's diversified portfolio value.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-800">
                10-Year Cumulative Net Wealth Projection (₹ Lakhs)
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Compares home equity built (net of remaining loan) vs. renter's stock/index investment value
              </p>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={rentVsBuyData.series}
                  margin={{ top: 10, right: 15, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `₹${v}L`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(v: any) => [`₹${v} Lakhs`, 'Net Wealth']}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                  <Line
                    type="monotone"
                    dataKey="buyerNetWealth"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    name="Buyer Net Wealth (Home Equity)"
                  />
                  <Line
                    type="monotone"
                    dataKey="renterNetWealth"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    strokeDasharray="4 4"
                    name="Renter Net Wealth (Equity Portfolio)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
              Assumes 1.2% annual property maintenance, property insurance, and long-term capital gains assumptions.
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AFFORDABILITY INDEX */}
      {activeTab === 'index' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Income Bracket Demographics */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
              <h3 className="text-base font-semibold text-slate-800 mb-1">
                Income Demographics & Price Ceilings
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Synthetic income distribution and maximum prudent housing purchase capability (3.5x annual income)
              </p>

              <div className="space-y-3">
                {affordabilityBrackets.map((bracket) => (
                  <div
                    key={bracket.category}
                    className="p-3 rounded-lg border border-slate-100 bg-slate-50"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-900 mb-1">
                      <span>{bracket.category}</span>
                      <span className="text-indigo-600 font-bold">
                        {bracket.populationPct}% of households
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 flex justify-between">
                      <span>
                        Income: ₹{(bracket.incomeMin / 100000).toFixed(1)}L – ₹
                        {(bracket.incomeMax / 100000).toFixed(1)}L / yr
                      </span>
                      <span className="font-semibold text-slate-700">
                        Max House: ₹{(bracket.affordablePrice / 100000).toFixed(0)}L
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Affordability Radar Component */}
            <AffordabilityChart neighborhoods={neighborhoods} height={320} />
          </div>

          {/* Income-to-Price Benchmark Table */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs overflow-hidden">
            <h3 className="text-base font-semibold text-slate-800 mb-1">
              Affordability Index & Income Multiples by Sector
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Estimated months of median metropolitan income required to purchase a standard 1,000 sq.ft home
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-100">
                  <tr>
                    <th scope="col" className="px-4 py-3">
                      Neighborhood
                    </th>
                    <th scope="col" className="px-4 py-3">
                      1,000 sq.ft Valuation
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Gross Rental Yield
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Price-to-Rent Ratio
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Months of Median Income
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Affordability Rating
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {neighborhoods.map((n) => {
                    const price1000sqft = n.avgPrice * 1000;
                    // synthetic monthly median metro household income ~₹1,15,000
                    const monthsRequired = Math.round(price1000sqft / 115000);
                    const rentalStats = rentalYieldData.find((r) => r.neighborhoodId === n.id);

                    return (
                      <tr key={n.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-4 py-3 font-semibold text-slate-900">{n.name}</td>
                        <td className="px-4 py-3">₹{(price1000sqft / 10000000).toFixed(2)} Cr</td>
                        <td className="px-4 py-3 font-medium text-emerald-600">
                          {n.rentalYield}%
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {rentalStats?.priceToRentRatio || 32}x
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-800">
                          {monthsRequired} Months (~{(monthsRequired / 12).toFixed(1)} yrs)
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              n.affordabilityScore > 65
                                ? 'bg-emerald-50 text-emerald-700'
                                : n.affordabilityScore > 40
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            Score: {n.affordabilityScore}/100
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
