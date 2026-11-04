"""
test_affordability.py — Housing Affordability Engine Mathematical Unit Tests (Milestone 7)

Validates:
- Reducing-balance EMI formula against independently calculated hand benchmarks
- Zero-interest loan edge-case handling (L'Hopital limit P / n)
- Amortization schedule precision (balance reaches 0 at end of tenure)
- Prepayment acceleration mechanics and interest savings
- Upfront purchase cost aggregation and statutory fee calculations
- Rent vs. Buy cash-flow equivalence and opportunity cost handling
- Household affordability sizing, FOIR constraints, and budget dual-limits
"""

import math
import os
import sys
import unittest

SRC_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if SRC_DIR not in sys.path:
    sys.path.insert(0, SRC_DIR)

from affordability.financial_engine import (
    calculate_reducing_balance_emi,
    generate_amortization_schedule,
    calculate_upfront_purchase_costs,
    evaluate_rent_vs_buy_trajectory,
    calculate_household_affordability,
)


class TestEmiCalculations(unittest.TestCase):
    """Unit tests for the standard reducing-balance EMI formula."""

    def test_standard_benchmark_emi(self):
        # Principal: 80 Lakh, Rate: 8.5% p.a., Tenure: 20 years (240 months)
        # Expected EMI: ₹69,426 (exact float: 69425.86)
        emi = calculate_reducing_balance_emi(8000000.0, 8.5, 20)
        self.assertAlmostEqual(emi, 69425.86, places=1)
        self.assertEqual(round(emi), 69426)

    def test_zero_interest_rate_lhopital_edge_case(self):
        # Principal: 12 Lakh, Rate: 0.0%, Tenure: 10 years (120 months)
        # Expected EMI: 12,00,000 / 120 = ₹10,000
        emi = calculate_reducing_balance_emi(1200000.0, 0.0, 10)
        self.assertEqual(emi, 10000.0)

    def test_zero_principal_or_tenure_returns_zero(self):
        self.assertEqual(calculate_reducing_balance_emi(0.0, 8.5, 20), 0.0)
        self.assertEqual(calculate_reducing_balance_emi(5000000.0, 8.5, 0), 0.0)

    def test_thirty_year_tenure(self):
        # Principal: 50 Lakh, Rate: 9.0%, Tenure: 30 years (360 months)
        # Expected EMI: ₹40,231
        emi = calculate_reducing_balance_emi(5000000.0, 9.0, 30)
        self.assertEqual(round(emi), 40231)


class TestAmortizationSchedule(unittest.TestCase):
    """Unit tests for amortization schedules and prepayment acceleration."""

    def test_schedule_closing_balance_reaches_zero(self):
        res = generate_amortization_schedule(8000000.0, 8.5, 20)
        schedule = res["annual_schedule"]
        self.assertEqual(len(schedule), 20)
        self.assertEqual(schedule[-1]["closing_balance"], 0)
        self.assertEqual(schedule[-1]["cumulative_principal"], 8000000)

    def test_prepayment_shortens_tenure_and_saves_interest(self):
        # Base: 240 months
        base_res = generate_amortization_schedule(8000000.0, 8.5, 20, extra_monthly_payment=0.0)
        # With ₹10,000 extra monthly prepayment
        prepay_res = generate_amortization_schedule(8000000.0, 8.5, 20, extra_monthly_payment=10000.0)

        self.assertLess(prepay_res["effective_tenure_months"], base_res["effective_tenure_months"])
        self.assertGreater(prepay_res["interest_saved"], 1000000)  # Saves > ₹10 Lakhs in interest


class TestUpfrontCosts(unittest.TestCase):
    """Unit tests for initial home purchase capital requirements."""

    def test_upfront_costs_calculation(self):
        # Property: 1.25 Crore, Down payment: 20% (25 Lakh), Stamp Duty: 6% (7.5 Lakh)
        # Maharashtra registration cap: ₹30,000
        res = calculate_upfront_purchase_costs(12500000.0, down_payment_pct=20.0, stamp_duty_pct=6.0)
        self.assertEqual(res["down_payment"], 2500000)
        self.assertEqual(res["stamp_duty"], 750000)
        self.assertEqual(res["registration_fee"], 30000)
        self.assertGreater(res["total_upfront_cash"], 3250000)
        self.assertGreater(res["cash_to_price_ratio_pct"], 25.0)


class TestRentVsBuyTrajectory(unittest.TestCase):
    """Unit tests for cash-flow equivalence rent vs buy analysis."""

    def test_rent_vs_buy_trajectory_consistency(self):
        res = evaluate_rent_vs_buy_trajectory(
            property_price=12500000.0,
            initial_monthly_rent=38000.0,
            down_payment_pct=20.0,
            interest_rate=8.5,
            tenure_years=20,
            rent_growth_pct=6.0,
            property_growth_pct=6.0,
            investment_return_pct=10.0,
            horizon_years=15,
        )
        self.assertEqual(res["analysis_period_years"], 15)
        self.assertEqual(len(res["annual_data"]), 15)
        self.assertGreater(res["buyer_terminal_wealth"], 0)
        self.assertGreater(res["renter_terminal_wealth"], 0)

    def test_high_property_appreciation_leads_to_buy_advantage(self):
        # 10% property appreciation vs 6% investment return
        res = evaluate_rent_vs_buy_trajectory(
            property_price=10000000.0,
            initial_monthly_rent=35000.0,
            property_growth_pct=10.0,
            investment_return_pct=6.0,
            horizon_years=10,
        )
        self.assertGreater(res["net_buy_advantage"], 0)
        self.assertIsNotNone(res["break_even_year"])


class TestHouseholdAffordability(unittest.TestCase):
    """Unit tests for household income budgeting and FOIR constraints."""

    def test_household_affordability_standard_case(self):
        # Income: ₹2,50,000, Existing debts: ₹35,000, FOIR: 45%
        # Max allowable total debt = 45% of 2.5L = ₹1,12,500
        # Max housing EMI = 1,12,500 - 35,000 = ₹77,500
        res = calculate_household_affordability(
            monthly_gross_income=250000.0,
            existing_loan_emis=35000.0,
            available_liquid_savings=3500000.0,
            target_property_price=15000000.0,
            foir_threshold_pct=45.0,
            interest_rate=8.5,
            tenure_years=20,
        )
        self.assertEqual(res["max_allowable_housing_emi"], 77500)
        self.assertGreater(res["max_affordable_loan"], 8500000)
        self.assertEqual(res["is_affordable"], False)  # Shortfall on 1.5 Cr target
        self.assertGreater(res["affordability_gap"], 0)

    def test_zero_or_negative_income_returns_error(self):
        res = calculate_household_affordability(monthly_gross_income=0.0)
        self.assertIn("error", res)


if __name__ == "__main__":
    unittest.main(verbosity=2)
