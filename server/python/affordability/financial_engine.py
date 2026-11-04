"""
financial_engine.py — Housing Affordability & Finance Calculation Engine (Milestone 7)

Provides deterministic financial calculations:
1. Reducing-balance Home Loan EMI & Amortization Scheduling
2. Prepayment acceleration analysis
3. Upfront acquisition costs & statutory fee modeling
4. Monthly true cost of homeownership & expense normalization
5. Rent vs Buy cash-flow equivalence & terminal wealth evaluation
6. Household financial affordability, FOIR, and dual-constraint budgeting
7. Multi-scenario comparative simulation
"""

import math
from typing import Dict, Any, List, Optional


def calculate_reducing_balance_emi(
    principal: float,
    annual_interest_rate: float,
    tenure_years: int,
) -> float:
    """
    Standard reducing-balance monthly EMI calculation:
    EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
    Handles zero-interest case with L'Hopital limit (P / n).
    """
    if principal <= 0 or tenure_years <= 0:
        return 0.0

    total_months = tenure_years * 12
    monthly_rate = annual_interest_rate / (12.0 * 100.0)

    if monthly_rate <= 1e-7:
        return principal / float(total_months)

    compound_factor = math.pow(1.0 + monthly_rate, total_months)
    emi = (principal * monthly_rate * compound_factor) / (compound_factor - 1.0)
    return emi


def generate_amortization_schedule(
    principal: float,
    annual_interest_rate: float,
    tenure_years: int,
    extra_monthly_payment: float = 0.0,
) -> Dict[str, Any]:
    """Generates annual amortization trajectory with optional prepayment simulation."""
    if principal <= 0 or tenure_years <= 0:
        return {"schedule": [], "total_interest": 0.0, "effective_months": 0}

    total_months = tenure_years * 12
    monthly_rate = annual_interest_rate / (12.0 * 100.0)
    emi = calculate_reducing_balance_emi(principal, annual_interest_rate, tenure_years)

    balance = principal
    balance_prepay = principal
    cum_principal = 0.0
    cum_interest = 0.0
    total_interest_prepay = 0.0
    effective_months = 0
    annual_schedule = []

    for y in range(1, tenure_years + 1):
        year_principal = 0.0
        year_interest = 0.0
        year_outflow = 0.0

        for m in range(1, 13):
            if balance > 0:
                int_month = balance * monthly_rate
                princ_month = min(balance, emi - int_month)
                balance = max(0.0, balance - princ_month)
                cum_principal += princ_month
                cum_interest += int_month
                year_principal += princ_month
                year_interest += int_month
                year_outflow += princ_month + int_month

            if balance_prepay > 0:
                effective_months += 1
                int_prepay = balance_prepay * monthly_rate
                total_interest_prepay += int_prepay
                princ_prepay = min(balance_prepay, (emi - int_prepay) + extra_monthly_payment)
                balance_prepay = max(0.0, balance_prepay - princ_prepay)

        annual_schedule.append({
            "year": y,
            "annual_emi": round(year_outflow),
            "principal_paid": round(year_principal),
            "interest_paid": round(year_interest),
            "closing_balance": round(balance),
            "cumulative_principal": round(cum_principal),
            "cumulative_interest": round(cum_interest),
        })

    return {
        "monthly_emi": round(emi),
        "total_payment": round(emi * total_months),
        "total_interest": round(cum_interest),
        "annual_schedule": annual_schedule,
        "effective_tenure_months": effective_months if extra_monthly_payment > 0 else total_months,
        "interest_saved": round(max(0.0, cum_interest - total_interest_prepay)) if extra_monthly_payment > 0 else 0,
    }


def calculate_upfront_purchase_costs(
    property_price: float,
    down_payment_pct: float = 20.0,
    stamp_duty_pct: float = 6.0,
    registration_fee: Optional[float] = None,
    legal_fee: float = 25000.0,
    interiors_reserve: float = 250000.0,
    moving_expenses: float = 25000.0,
) -> Dict[str, Any]:
    """Computes all mandatory initial out-of-pocket acquisition capital requirements."""
    down_payment = (property_price * down_payment_pct) / 100.0
    principal = max(0.0, property_price - down_payment)

    stamp_duty = (property_price * stamp_duty_pct) / 100.0
    if registration_fee is None:
        registration_fee = min(30000.0, property_price * 0.01)

    loan_processing = min(25000.0, principal * 0.0025) * 1.18

    total_ancillary = stamp_duty + registration_fee + loan_processing + legal_fee + interiors_reserve + moving_expenses
    total_upfront = down_payment + total_ancillary

    return {
        "down_payment": round(down_payment),
        "stamp_duty": round(stamp_duty),
        "registration_fee": round(registration_fee),
        "loan_processing_fee": round(loan_processing),
        "total_ancillary_costs": round(total_ancillary),
        "total_upfront_cash": round(total_upfront),
        "cash_to_price_ratio_pct": round((total_upfront / property_price) * 100.0, 2),
    }


def evaluate_rent_vs_buy_trajectory(
    property_price: float,
    initial_monthly_rent: float,
    down_payment_pct: float = 20.0,
    interest_rate: float = 8.5,
    tenure_years: int = 20,
    rent_growth_pct: float = 6.0,
    property_growth_pct: float = 6.0,
    investment_return_pct: float = 10.0,
    horizon_years: int = 15,
) -> Dict[str, Any]:
    """
    Consistent cash-flow equivalence rent vs buy analysis:
    Tracks ongoing cash-flow differentials and terminal wealth without double-counting.
    """
    down_payment = (property_price * down_payment_pct) / 100.0
    principal = property_price - down_payment
    monthly_rate = interest_rate / 1200.0
    total_months = tenure_years * 12
    emi = calculate_reducing_balance_emi(principal, interest_rate, tenure_years)

    # Initial capital: Down Payment + 10% acquisition costs
    upfront_costs = property_price * 0.10
    total_initial_capital = down_payment + upfront_costs

    deposit = initial_monthly_rent * 3.0
    portfolio = max(0.0, total_initial_capital - deposit)

    loan_balance = principal
    prop_value = property_price
    break_even_year: Optional[int] = None
    annual_data = []

    base_maint = property_price * 0.0004
    base_tax = (property_price * 0.0015) / 12.0

    for y in range(1, horizon_years + 1):
        year_rent = initial_monthly_rent * math.pow(1.0 + (rent_growth_pct / 100.0), y - 1)
        year_maint = base_maint * math.pow(1.05, y - 1)
        year_tax = base_tax * math.pow(1.03, y - 1)
        year_buy_outflow = emi + year_maint + year_tax

        annual_rent = year_rent * 12.0
        annual_buy = year_buy_outflow * 12.0

        for m in range(12):
            if loan_balance > 0:
                int_month = loan_balance * monthly_rate
                princ_month = min(loan_balance, emi - int_month)
                loan_balance = max(0.0, loan_balance - princ_month)

        annual_cf_delta = annual_buy - annual_rent
        portfolio = (portfolio * (1.0 + (investment_return_pct / 100.0))) + annual_cf_delta

        prop_value = prop_value * (1.0 + (property_growth_pct / 100.0))
        selling_costs = prop_value * 0.02
        buyer_equity = max(0.0, prop_value - loan_balance - selling_costs)
        renter_wealth = max(0.0, portfolio + deposit)
        buy_advantage = buyer_equity - renter_wealth

        if break_even_year is None and buy_advantage >= 0:
            break_even_year = y

        annual_data.append({
            "year": y,
            "property_value": round(prop_value),
            "remaining_loan": round(loan_balance),
            "buyer_equity": round(buyer_equity),
            "renter_portfolio": round(renter_wealth),
            "buy_advantage": round(buy_advantage),
        })

    last = annual_data[-1]
    return {
        "analysis_period_years": horizon_years,
        "buyer_terminal_wealth": last["buyer_equity"],
        "renter_terminal_wealth": last["renter_portfolio"],
        "net_buy_advantage": last["buy_advantage"],
        "break_even_year": break_even_year,
        "annual_data": annual_data,
    }


def calculate_household_affordability(
    monthly_gross_income: float,
    existing_loan_emis: float = 0.0,
    available_liquid_savings: float = 0.0,
    target_property_price: Optional[float] = None,
    foir_threshold_pct: float = 45.0,
    interest_rate: float = 8.5,
    tenure_years: int = 20,
    target_down_payment_pct: float = 20.0,
    ancillary_costs_pct: float = 8.0,
) -> Dict[str, Any]:
    """Calculates maximum affordable loan, dual-constraint property budget, and gap."""
    if monthly_gross_income <= 0:
        return {"error": "Income must be positive"}

    max_total_debt = (monthly_gross_income * foir_threshold_pct) / 100.0
    max_housing_emi = max(0.0, max_total_debt - existing_loan_emis)

    monthly_rate = interest_rate / 1200.0
    total_months = tenure_years * 12
    compound_factor = math.pow(1.0 + monthly_rate, total_months)
    max_loan = (max_housing_emi * (compound_factor - 1.0)) / (monthly_rate * compound_factor)

    loan_constrained_budget = max_loan / (1.0 - (target_down_payment_pct / 100.0))

    cash_constrained_budget = None
    binding_budget = loan_constrained_budget

    if available_liquid_savings > 0:
        cash_constrained_budget = available_liquid_savings / ((target_down_payment_pct + ancillary_costs_pct) / 100.0)
        binding_budget = min(cash_constrained_budget, loan_constrained_budget)

    affordability_gap = None
    is_affordable = None
    if target_property_price is not None and target_property_price > 0:
        affordability_gap = target_property_price - binding_budget
        is_affordable = affordability_gap <= 0

    return {
        "max_allowable_housing_emi": round(max_housing_emi),
        "max_affordable_loan": round(max_loan),
        "loan_constrained_budget": round(loan_constrained_budget),
        "cash_constrained_budget": round(cash_constrained_budget) if cash_constrained_budget is not None else None,
        "binding_max_property_budget": round(binding_budget),
        "target_property_price": round(target_property_price) if target_property_price is not None else None,
        "affordability_gap": round(affordability_gap) if affordability_gap is not None else None,
        "is_affordable": is_affordable,
    }
