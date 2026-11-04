/**
 * affordabilityService.ts — Core Financial Calculation Engine (Milestone 7)
 *
 * Implements deterministic, verified calculations for:
 * 1. Reducing-balance Home-Loan EMI & Amortization Scheduling
 * 2. Prepayment acceleration & interest savings
 * 3. Upfront purchase costs & statutory fee modeling
 * 4. Monthly true cost of homeownership & expense normalization
 * 5. Rent vs Buy cash-flow equivalence & wealth trajectory
 * 6. Household financial affordability, FOIR/DTI, & dual-constraint property budgeting
 * 7. Multi-scenario comparative simulation
 */

import {
  EmiCalculationRequest,
  EmiCalculationResult,
  AmortizationYearPoint,
  UpfrontCostRequest,
  UpfrontCostResult,
  OwnershipCostRequest,
  OwnershipCostResult,
  RentVsBuyRequest,
  RentVsBuyResult,
  RentVsBuyYearPoint,
  HouseholdAffordabilityRequest,
  HouseholdAffordabilityResult,
  FinancialScenarioConfig,
  ScenarioComparisonResult,
} from '../types/api';

const DISCLAIMER_EDUCATIONAL =
  'UrbanLens provides educational financial calculations and scenario analysis. ' +
  'Results are estimates based on user-provided inputs and illustrative assumptions. ' +
  'They are not loan approvals, legal fee quotations, or personalized financial advice.';

export const affordabilityService = {
  /**
   * 1. Reducing-Balance EMI & Amortization Schedule
   */
  calculateEmi(req: EmiCalculationRequest): EmiCalculationResult {
    const price = Number(req.property_price);
    if (!Number.isFinite(price) || price <= 0) {
      throw new Error('Property price must be a positive number.');
    }

    // Determine down payment
    let downPayment = 0;
    if (req.down_payment_amount !== undefined && req.down_payment_amount !== null) {
      downPayment = Number(req.down_payment_amount);
    } else {
      const dpPct = req.down_payment_pct !== undefined ? Number(req.down_payment_pct) : 20.0;
      downPayment = (price * dpPct) / 100.0;
    }

    if (downPayment < 0 || downPayment >= price) {
      throw new Error('Down payment must be non-negative and strictly less than property price.');
    }

    const principal = price - downPayment;
    const annualRate = Number(req.annual_interest_rate);
    if (!Number.isFinite(annualRate) || annualRate < 0 || annualRate > 30) {
      throw new Error('Annual interest rate must be between 0% and 30%.');
    }

    const tenureYears = Math.floor(Number(req.tenure_years));
    if (!Number.isFinite(tenureYears) || tenureYears < 1 || tenureYears > 40) {
      throw new Error('Tenure must be an integer between 1 and 40 years.');
    }

    const totalMonths = tenureYears * 12;
    const monthlyRate = annualRate / (12 * 100);

    // Standard reducing-balance formula with L'Hopital zero-interest guard
    let monthlyEmi = 0;
    if (monthlyRate <= 1e-7) {
      monthlyEmi = principal / totalMonths;
    } else {
      const compoundFactor = Math.pow(1 + monthlyRate, totalMonths);
      monthlyEmi = (principal * monthlyRate * compoundFactor) / (compoundFactor - 1);
    }

    const extraMonthly = req.extra_monthly_payment ? Math.max(0, Number(req.extra_monthly_payment)) : 0;

    // Build Amortization Schedule (annual rollups) & evaluate prepayment impact
    const schedule: AmortizationYearPoint[] = [];
    let balance = principal;
    let balancePrepay = principal;
    let cumPrincipal = 0;
    let cumInterest = 0;
    let totalInterestPrepay = 0;
    let effectiveMonths = 0;
    let isPrepayActive = extraMonthly > 0;

    for (let y = 1; y <= tenureYears; y++) {
      let annualEmiOutflow = 0;
      let annualPrincipal = 0;
      let annualInterest = 0;
      const openingBalance = balance;

      for (let m = 1; m <= 12; m++) {
        if (balance > 0) {
          const interestMonth = balance * monthlyRate;
          const principalMonth = Math.min(balance, monthlyEmi - interestMonth);
          balance = Math.max(0, balance - principalMonth);
          cumPrincipal += principalMonth;
          cumInterest += interestMonth;
          annualPrincipal += principalMonth;
          annualInterest += interestMonth;
          annualEmiOutflow += interestMonth + principalMonth;
        }

        // Track prepayment simulation
        if (balancePrepay > 0) {
          effectiveMonths++;
          const interestMonthPrepay = balancePrepay * monthlyRate;
          totalInterestPrepay += interestMonthPrepay;
          const principalMonthPrepay = Math.min(balancePrepay, (monthlyEmi - interestMonthPrepay) + extraMonthly);
          balancePrepay = Math.max(0, balancePrepay - principalMonthPrepay);
        }
      }

      schedule.push({
        year: y,
        opening_balance: Math.round(openingBalance),
        annual_emi: Math.round(annualEmiOutflow),
        principal_paid: Math.round(annualPrincipal),
        interest_paid: Math.round(annualInterest),
        closing_balance: Math.round(balance),
        cumulative_principal: Math.round(cumPrincipal),
        cumulative_interest: Math.round(cumInterest),
        homeowner_equity: Math.round(downPayment + cumPrincipal),
      });
    }

    const totalPayment = monthlyEmi * totalMonths;
    const totalInterest = Math.max(0, totalPayment - principal);
    const interestSaved = isPrepayActive ? Math.max(0, totalInterest - totalInterestPrepay) : 0;

    return {
      property_price: Math.round(price),
      down_payment: Math.round(downPayment),
      loan_principal: Math.round(principal),
      annual_interest_rate: Number(annualRate.toFixed(2)),
      monthly_interest_rate: Number((monthlyRate * 100).toFixed(4)),
      tenure_years: tenureYears,
      tenure_months: totalMonths,
      monthly_emi: Math.round(monthlyEmi),
      total_interest: Math.round(totalInterest),
      total_payment: Math.round(totalPayment),
      ltv_ratio: Number(((principal / price) * 100).toFixed(2)),
      interest_to_principal_ratio: Number((totalInterest / principal).toFixed(2)),
      extra_monthly_payment: Math.round(extraMonthly),
      effective_tenure_months: isPrepayActive ? effectiveMonths : totalMonths,
      interest_saved_by_prepayment: Math.round(interestSaved),
      amortization_schedule: schedule,
      disclaimers: [
        DISCLAIMER_EDUCATIONAL,
        'Interest calculations assume fixed periodic monthly compounding on a reducing balance.',
        'Floating interest rates fluctuate over time based on RBI repo-linked external benchmark rate resets.'
      ],
    };
  },

  /**
   * 2. Upfront Purchase Costs & Acquisition Capital
   */
  calculateUpfrontCosts(req: UpfrontCostRequest): UpfrontCostResult {
    const price = Number(req.property_price);
    if (!Number.isFinite(price) || price <= 0) {
      throw new Error('Property price must be a positive number.');
    }

    let downPayment = 0;
    if (req.down_payment_amount !== undefined && req.down_payment_amount !== null) {
      downPayment = Number(req.down_payment_amount);
    } else {
      const dpPct = req.down_payment_pct !== undefined ? Number(req.down_payment_pct) : 20.0;
      downPayment = (price * dpPct) / 100.0;
    }

    const stampDutyPct = req.stamp_duty_pct !== undefined ? Number(req.stamp_duty_pct) : 6.0;
    const stampDuty = (price * stampDutyPct) / 100.0;

    // Registration fee: default applies Maharashtra statutory ceiling (min(30000, 1%)) unless specified
    let registrationFee = 0;
    if (req.registration_fee !== undefined && req.registration_fee !== null) {
      registrationFee = Number(req.registration_fee);
    } else {
      registrationFee = Math.min(30000, price * 0.01);
    }

    const principal = Math.max(0, price - downPayment);
    const procRatePct = req.loan_processing_rate_pct !== undefined ? Number(req.loan_processing_rate_pct) : 0.25;
    const procCap = req.loan_processing_cap !== undefined ? Number(req.loan_processing_cap) : 25000;
    const rawProcFee = Math.min(procCap, (principal * procRatePct) / 100.0);
    const loanProcessingFee = rawProcFee * 1.18; // Includes 18% GST

    const legalDocFee = req.legal_doc_fee !== undefined ? Number(req.legal_doc_fee) : 25000;
    const brokerPct = req.brokerage_pct !== undefined ? Number(req.brokerage_pct) : 0.0;
    const brokerageFee = ((price * brokerPct) / 100.0) * 1.18; // Includes 18% GST
    const movingExpenses = req.moving_expenses !== undefined ? Number(req.moving_expenses) : 25000;
    const interiorsFurnishing = req.interiors_furnishing !== undefined ? Number(req.interiors_furnishing) : 250000;
    const otherCharges = req.other_charges !== undefined ? Number(req.other_charges) : 50000;

    const totalStatutory = stampDuty + registrationFee;
    const totalAncillary =
      stampDuty +
      registrationFee +
      loanProcessingFee +
      legalDocFee +
      brokerageFee +
      movingExpenses +
      interiorsFurnishing +
      otherCharges;

    const totalUpfrontCash = downPayment + totalAncillary;

    return {
      property_price: Math.round(price),
      down_payment: Math.round(downPayment),
      stamp_duty: Math.round(stampDuty),
      registration_fee: Math.round(registrationFee),
      loan_processing_fee: Math.round(loanProcessingFee),
      legal_doc_fee: Math.round(legalDocFee),
      brokerage_fee: Math.round(brokerageFee),
      moving_expenses: Math.round(movingExpenses),
      interiors_furnishing: Math.round(interiorsFurnishing),
      other_charges: Math.round(otherCharges),
      total_statutory_charges: Math.round(totalStatutory),
      total_ancillary_costs: Math.round(totalAncillary),
      total_upfront_cash_required: Math.round(totalUpfrontCash),
      down_payment_pct_of_price: Number(((downPayment / price) * 100).toFixed(2)),
      ancillary_pct_of_price: Number(((totalAncillary / price) * 100).toFixed(2)),
      total_cash_to_price_ratio_pct: Number(((totalUpfrontCash / price) * 100).toFixed(2)),
      disclaimers: [
        DISCLAIMER_EDUCATIONAL,
        'Stamp duty and registration rates are illustrative defaults based on standard state acts and subject to local circle rates.',
        'All fees are user-editable and must not be treated as official government or bank quotations.'
      ],
    };
  },

  /**
   * 3. Monthly Cost of Homeownership & Expense Normalization
   */
  calculateOwnershipCost(req: OwnershipCostRequest): OwnershipCostResult {
    const emi = Number(req.monthly_emi);
    if (!Number.isFinite(emi) || emi < 0) {
      throw new Error('Monthly EMI must be a non-negative number.');
    }

    const maintenance = Number(req.society_maintenance_monthly || 0);
    const propTax = Number(req.property_tax_annual || 0) / 12.0;
    const insurance = Number(req.home_insurance_annual || 0) / 12.0;
    const utilities = Number(req.utilities_monthly || 0);
    const repairsReserve = Number(req.repairs_reserve_monthly || 0);
    const other = Number(req.other_recurring_monthly || 0);

    const nonEmiTotal = maintenance + propTax + insurance + utilities + repairsReserve + other;
    const totalMonthlyCost = emi + nonEmiTotal;
    const totalAnnualCost = totalMonthlyCost * 12.0;

    const emiShare = totalMonthlyCost > 0 ? (emi / totalMonthlyCost) * 100.0 : 0;
    const nonEmiShare = totalMonthlyCost > 0 ? (nonEmiTotal / totalMonthlyCost) * 100.0 : 0;

    let heirRatio: number | null = null;
    if (req.monthly_gross_income && Number(req.monthly_gross_income) > 0) {
      heirRatio = Number(((totalMonthlyCost / Number(req.monthly_gross_income)) * 100).toFixed(2));
    }

    return {
      monthly_emi: Math.round(emi),
      monthly_maintenance: Math.round(maintenance),
      monthly_property_tax: Math.round(propTax),
      monthly_insurance: Math.round(insurance),
      monthly_utilities: Math.round(utilities),
      monthly_repairs_reserve: Math.round(repairsReserve),
      monthly_other: Math.round(other),
      total_monthly_non_emi_expenses: Math.round(nonEmiTotal),
      total_monthly_ownership_cost: Math.round(totalMonthlyCost),
      total_annual_ownership_cost: Math.round(totalAnnualCost),
      emi_share_pct: Number(emiShare.toFixed(1)),
      non_emi_share_pct: Number(nonEmiShare.toFixed(1)),
      housing_expense_to_income_ratio_pct: heirRatio,
      disclaimers: [
        DISCLAIMER_EDUCATIONAL,
        'Annual municipal property taxes and insurance premiums are normalized to monthly equivalents (divided by 12).',
        'Ownership expenses do not remain static and typically experience inflation over time.'
      ],
    };
  },

  /**
   * 4. Rent vs. Buy Cash-Flow Equivalence Engine
   */
  calculateRentVsBuy(req: RentVsBuyRequest): RentVsBuyResult {
    const price = Number(req.property_price);
    const initialRent = Number(req.initial_monthly_rent);
    if (!Number.isFinite(price) || price <= 0 || !Number.isFinite(initialRent) || initialRent <= 0) {
      throw new Error('Property price and initial monthly rent must be positive numbers.');
    }

    const dpPct = req.down_payment_pct !== undefined ? Number(req.down_payment_pct) : 20.0;
    const downPayment = (price * dpPct) / 100.0;
    const principal = price - downPayment;

    const rate = req.annual_interest_rate !== undefined ? Number(req.annual_interest_rate) : 8.5;
    const tenureYears = req.loan_tenure_years !== undefined ? Number(req.loan_tenure_years) : 20;
    const monthlyRate = rate / 1200.0;
    const totalMonths = tenureYears * 12;

    const compoundFactor = Math.pow(1 + monthlyRate, totalMonths);
    const emi = monthlyRate <= 1e-7 ? principal / totalMonths : (principal * monthlyRate * compoundFactor) / (compoundFactor - 1);

    const upfrontAcqPct = req.upfront_acquisition_cost_pct !== undefined ? Number(req.upfront_acquisition_cost_pct) : 10.0;
    const upfrontAcquisitionCosts = (price * upfrontAcqPct) / 100.0;
    const totalInitialCapital = downPayment + upfrontAcquisitionCosts;

    const depositMonths = req.rental_deposit_months !== undefined ? Number(req.rental_deposit_months) : 3;
    const rentDeposit = initialRent * depositMonths;
    const initialPortfolio = Math.max(0, totalInitialCapital - rentDeposit);

    const rentGrowthPct = req.annual_rent_increase_pct !== undefined ? Number(req.annual_rent_increase_pct) : 6.0;
    const propGrowthPct = req.property_appreciation_pct !== undefined ? Number(req.property_appreciation_pct) : 6.0;
    const investReturnPct = req.investment_return_pct !== undefined ? Number(req.investment_return_pct) : 10.0;
    const horizonYears = req.analysis_period_years !== undefined ? Math.floor(Number(req.analysis_period_years)) : 15;

    const baseMonthlyMaint = req.maintenance_monthly !== undefined ? Number(req.maintenance_monthly) : (price * 0.0004);
    const baseMonthlyTax = req.property_tax_annual !== undefined ? Number(req.property_tax_annual) / 12.0 : (price * 0.0015) / 12.0;

    let portfolio = initialPortfolio;
    let propValue = price;
    let loanBalance = principal;
    let breakEvenYear: number | null = null;
    const trajectory: RentVsBuyYearPoint[] = [];

    for (let y = 1; y <= horizonYears; y++) {
      // Annual rent and ownership inflation
      const yearRentMonthly = initialRent * Math.pow(1 + rentGrowthPct / 100.0, y - 1);
      const yearMaintMonthly = baseMonthlyMaint * Math.pow(1.05, y - 1);
      const yearTaxMonthly = baseMonthlyTax * Math.pow(1.03, y - 1);
      const yearBuyOutflowMonthly = emi + yearMaintMonthly + yearTaxMonthly;

      const annualRentOutflow = yearRentMonthly * 12.0;
      const annualBuyOutflow = yearBuyOutflowMonthly * 12.0;

      // Amortize loan for the year
      for (let m = 1; m <= 12; m++) {
        if (loanBalance > 0) {
          const intMonth = loanBalance * monthlyRate;
          const princMonth = Math.min(loanBalance, emi - intMonth);
          loanBalance = Math.max(0, loanBalance - princMonth);
        }
      }

      // Cash flow difference: Renter invests or draws the difference
      const annualCashFlowDelta = annualBuyOutflow - annualRentOutflow;
      portfolio = (portfolio * (1 + investReturnPct / 100.0)) + annualCashFlowDelta;

      propValue = propValue * (1 + propGrowthPct / 100.0);
      const sellingCosts = propValue * 0.02; // 2% selling costs
      const buyerNetEquity = Math.max(0, propValue - loanBalance - sellingCosts);
      const renterNetWealth = Math.max(0, portfolio + rentDeposit);
      const netBuyAdvantage = buyerNetEquity - renterNetWealth;

      if (breakEvenYear === null && netBuyAdvantage >= 0) {
        breakEvenYear = y;
      }

      trajectory.push({
        year: y,
        monthly_rent: Math.round(yearRentMonthly),
        monthly_buy_outflow: Math.round(yearBuyOutflowMonthly),
        annual_rent_outflow: Math.round(annualRentOutflow),
        annual_buy_outflow: Math.round(annualBuyOutflow),
        property_value: Math.round(propValue),
        remaining_loan_balance: Math.round(loanBalance),
        buyer_net_equity: Math.round(buyerNetEquity),
        renter_investment_portfolio: Math.round(renterNetWealth),
        net_buy_advantage: Math.round(netBuyAdvantage),
      });
    }

    const lastPoint = trajectory[trajectory.length - 1];
    let verdict = '';
    if (lastPoint.net_buy_advantage > 0) {
      verdict = `Under these assumptions, buying is projected to create ₹${Math.abs(lastPoint.net_buy_advantage).toLocaleString('en-IN')} more net wealth after ${horizonYears} years, breaking even at Year ${breakEvenYear || 'N/A'}.`;
    } else {
      verdict = `Under these assumptions, renting and investing surplus cash is projected to create ₹${Math.abs(lastPoint.net_buy_advantage).toLocaleString('en-IN')} more net wealth after ${horizonYears} years.`;
    }

    return {
      property_price: Math.round(price),
      initial_capital_deployed: Math.round(totalInitialCapital),
      initial_rental_deposit: Math.round(rentDeposit),
      initial_renter_portfolio: Math.round(initialPortfolio),
      analysis_period_years: horizonYears,
      terminal_property_value: Math.round(propValue),
      terminal_loan_balance: Math.round(loanBalance),
      buyer_terminal_wealth: Math.round(lastPoint.buyer_net_equity),
      renter_terminal_wealth: Math.round(lastPoint.renter_investment_portfolio),
      net_buy_advantage: Math.round(lastPoint.net_buy_advantage),
      break_even_year: breakEvenYear,
      verdict_summary: verdict,
      annual_trajectory: trajectory,
      assumptions_used: {
        property_appreciation_pct: propGrowthPct,
        annual_rent_increase_pct: rentGrowthPct,
        investment_return_pct: investReturnPct,
        mortgage_interest_rate_pct: rate,
      },
      disclaimers: [
        DISCLAIMER_EDUCATIONAL,
        'Rent-vs-buy modeling uses a consistent cash-flow equivalence methodology: all cash flow differences are invested in or drawn from the portfolio.',
        'Results are highly sensitive to user assumptions regarding equity portfolio returns and real estate capital appreciation.'
      ],
    };
  },

  /**
   * 5. Household Financial Affordability & Budget Sizing
   */
  calculateHouseholdAffordability(req: HouseholdAffordabilityRequest): HouseholdAffordabilityResult {
    const primaryIncome = Number(req.monthly_gross_income);
    if (!Number.isFinite(primaryIncome) || primaryIncome <= 0) {
      throw new Error('Monthly gross income must be a positive number.');
    }

    const additionalIncome = Number(req.additional_monthly_income || 0);
    const totalIncome = primaryIncome + additionalIncome;

    const existingDebt = Number(req.existing_loan_emis || 0);
    const essentialExpenses = Number(req.essential_monthly_expenses || 0);
    const availableSavings = req.available_liquid_savings !== undefined ? Number(req.available_liquid_savings) : null;
    const targetPrice = req.target_property_price !== undefined ? Number(req.target_property_price) : null;

    const foirThreshold = req.foir_guideline_pct !== undefined ? Number(req.foir_guideline_pct) : 45.0;
    const annualRate = req.annual_interest_rate !== undefined ? Number(req.annual_interest_rate) : 8.5;
    const tenureYears = req.loan_tenure_years !== undefined ? Number(req.loan_tenure_years) : 20;
    const targetDownPaymentPct = req.target_down_payment_pct !== undefined ? Number(req.target_down_payment_pct) : 20.0;
    const ancillaryCostPct = req.ancillary_cost_buffer_pct !== undefined ? Number(req.ancillary_cost_buffer_pct) : 8.0;

    const currentFoir = (existingDebt / totalIncome) * 100.0;
    const disposableSurplus = Math.max(0, totalIncome - existingDebt - essentialExpenses);

    // Max Allowable Housing EMI
    const maxTotalDebt = (totalIncome * foirThreshold) / 100.0;
    const maxHousingEmi = Math.max(0, maxTotalDebt - existingDebt);

    // Reverse loan sizing
    const monthlyRate = annualRate / 1200.0;
    const totalMonths = tenureYears * 12;
    let maxLoan = 0;
    if (monthlyRate <= 1e-7) {
      maxLoan = maxHousingEmi * totalMonths;
    } else {
      const compoundFactor = Math.pow(1 + monthlyRate, totalMonths);
      maxLoan = (maxHousingEmi * (compoundFactor - 1)) / (monthlyRate * compoundFactor);
    }

    const loanConstrainedBudget = maxLoan / (1.0 - targetDownPaymentPct / 100.0);

    let cashConstrainedBudget: number | null = null;
    let bindingBudget = loanConstrainedBudget;

    if (availableSavings !== null && availableSavings > 0) {
      cashConstrainedBudget = availableSavings / ((targetDownPaymentPct + ancillaryCostPct) / 100.0);
      bindingBudget = Math.min(cashConstrainedBudget, loanConstrainedBudget);
    }

    let affordabilityGap: number | null = null;
    let isAffordable: boolean | null = null;
    const recommendations: string[] = [];

    if (targetPrice !== null && targetPrice > 0) {
      affordabilityGap = targetPrice - bindingBudget;
      isAffordable = affordabilityGap <= 0;

      if (!isAffordable) {
        recommendations.push(
          `Target property has an affordability shortfall of ₹${Math.round(affordabilityGap).toLocaleString('en-IN')}.`
        );
        if (cashConstrainedBudget !== null && cashConstrainedBudget < loanConstrainedBudget) {
          const cashShortfall = affordabilityGap * ((targetDownPaymentPct + ancillaryCostPct) / 100.0);
          recommendations.push(
            `Savings constraint active: Accumulating an additional ₹${Math.round(cashShortfall).toLocaleString('en-IN')} in liquid cash will unlock higher loan capacity.`
          );
        } else if (existingDebt > 0) {
          recommendations.push(
            `Clearing existing monthly debt obligations of ₹${Math.round(existingDebt).toLocaleString('en-IN')} will increase maximum borrowing capacity.`
          );
        }
      } else {
        recommendations.push(
          `Target property is within your modeled financial capacity with a ₹${Math.round(Math.abs(affordabilityGap)).toLocaleString('en-IN')} buffer.`
        );
      }
    }

    const postPurchaseFoir = ((existingDebt + maxHousingEmi) / totalIncome) * 100.0;

    return {
      total_monthly_income: Math.round(totalIncome),
      existing_debt_obligations: Math.round(existingDebt),
      current_foir_pct: Number(currentFoir.toFixed(2)),
      disposable_surplus: Math.round(disposableSurplus),
      foir_threshold_used_pct: Number(foirThreshold.toFixed(1)),
      max_allowable_housing_emi: Math.round(maxHousingEmi),
      projected_post_purchase_foir_pct: Number(postPurchaseFoir.toFixed(2)),
      max_affordable_loan_principal: Math.round(maxLoan),
      cash_constrained_property_budget: cashConstrainedBudget !== null ? Math.round(cashConstrainedBudget) : null,
      loan_constrained_property_budget: Math.round(loanConstrainedBudget),
      binding_max_property_budget: Math.round(bindingBudget),
      target_property_price: targetPrice !== null ? Math.round(targetPrice) : null,
      affordability_gap: affordabilityGap !== null ? Math.round(affordabilityGap) : null,
      is_affordable: isAffordable,
      actionable_recommendations: recommendations,
      disclaimers: [
        DISCLAIMER_EDUCATIONAL,
        'Mathematical affordability modeling does NOT constitute credit approval or loan pre-qualification.',
        'Actual bank underwriting considers CIBIL credit scores, employer tiers, age, and property valuation.'
      ],
    };
  },

  /**
   * 6. Multi-Scenario Comparative Simulation
   */
  compareScenarios(scenarios: FinancialScenarioConfig[]): ScenarioComparisonResult {
    if (!scenarios || scenarios.length === 0) {
      throw new Error('At least one scenario configuration is required.');
    }

    const results = scenarios.map((sc) => {
      const emiRes = this.calculateEmi({
        property_price: sc.property_price,
        down_payment_pct: sc.down_payment_pct,
        annual_interest_rate: sc.annual_interest_rate,
        tenure_years: sc.loan_tenure_years,
      });

      const upfrontRes = this.calculateUpfrontCosts({
        property_price: sc.property_price,
        down_payment_pct: sc.down_payment_pct,
      });

      const rentBuyRes = this.calculateRentVsBuy({
        property_price: sc.property_price,
        down_payment_pct: sc.down_payment_pct,
        annual_interest_rate: sc.annual_interest_rate,
        loan_tenure_years: sc.loan_tenure_years,
        initial_monthly_rent: sc.monthly_rent,
        annual_rent_increase_pct: sc.rent_increase_pct,
        property_appreciation_pct: sc.property_appreciation_pct,
        investment_return_pct: sc.investment_return_pct,
        analysis_period_years: 10,
      });

      const foir = sc.monthly_income > 0 ? ((sc.existing_emis + emiRes.monthly_emi) / sc.monthly_income) * 100 : 0;
      let verdict = 'Affordable';
      if (foir > 55) {
        verdict = 'High Debt Burden (>55% FOIR)';
      } else if (foir > 45) {
        verdict = 'Moderate Debt Burden (45-55% FOIR)';
      } else {
        verdict = 'Prudent Debt Burden (<45% FOIR)';
      }

      return {
        id: sc.id,
        name: sc.name,
        description: sc.description,
        property_price: sc.property_price,
        monthly_emi: emiRes.monthly_emi,
        total_interest: emiRes.total_interest,
        total_upfront_cash: upfrontRes.total_upfront_cash_required,
        ten_year_buyer_equity: rentBuyRes.buyer_terminal_wealth,
        ten_year_renter_portfolio: rentBuyRes.renter_terminal_wealth,
        ten_year_buy_advantage: rentBuyRes.net_buy_advantage,
        foir_pct: Number(foir.toFixed(2)),
        affordability_verdict: verdict,
      };
    });

    return {
      comparison_horizon_years: 10,
      scenarios: results,
      disclaimers: [
        DISCLAIMER_EDUCATIONAL,
        'Scenarios illustrate comparative trade-offs between differing interest rate, tenure, and return assumptions.'
      ],
    };
  },

  /**
   * 7. Reference Assumptions & Defaults
   */
  getAssumptions() {
    return {
      version: '1.0.0',
      effective_date: '2026-10-30',
      defaults: {
        interest_rate_pct: 8.5,
        tenure_years: 20,
        down_payment_pct: 20.0,
        stamp_duty_pct: 6.0,
        registration_cap_inr: 30000,
        loan_processing_rate_pct: 0.25,
        legal_fees_inr: 25000,
        society_maintenance_sqft_inr: 5.0,
        annual_rent_increase_pct: 6.0,
        property_appreciation_pct: 6.0,
        investment_return_pct: 10.0,
        rental_deposit_months: 3,
        foir_guidelines: {
          conservative: 35.0,
          moderate: 45.0,
          aggressive: 55.0,
        },
      },
      sources: [
        { name: 'Reserve Bank of India (RBI)', topic: 'Repo-Linked External Benchmark Lending Rates (EBLR)' },
        { name: 'IGR Maharashtra / Stamp Act', topic: 'Stamp Duty & Registration Fee Caps' },
        { name: 'National Housing Bank (NHB)', topic: 'Prudential Loan-to-Value (LTV) Limits' },
        { name: 'National Stock Exchange (NSE)', topic: 'Nifty 50 15-Year Historical Equity CAGR' },
      ],
    };
  },

  /**
   * 8. INR Currency Formatter Helper
   * Standard Indian number system formatting (Lakhs / Crores).
   */
  formatInr(amount: number, compact: boolean = false): string {
    return formatInr(amount, compact);
  },
};

/**
 * Standalone INR Currency Formatter
 * Formats numbers into standard Indian numbering representation (e.g. ₹1,25,00,000 or ₹1.25 Cr).
 */
export function formatInr(amount: number, compact: boolean = false): string {
  if (!Number.isFinite(amount)) return '₹0';
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (compact) {
    if (abs >= 1e7) return `${sign}₹${(abs / 1e7).toFixed(2)} Cr`;
    if (abs >= 1e5) return `${sign}₹${(abs / 1e5).toFixed(2)} L`;
    return `${sign}₹${abs.toLocaleString('en-IN')}`;
  }
  return `${sign}₹${Math.round(amount).toLocaleString('en-IN')}`;
}
