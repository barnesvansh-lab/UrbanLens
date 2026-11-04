"""
UrbanLens Housing Affordability Engine (Milestone 7)
"""

from .financial_engine import (
    calculate_reducing_balance_emi,
    generate_amortization_schedule,
    calculate_upfront_purchase_costs,
    evaluate_rent_vs_buy_trajectory,
    calculate_household_affordability,
)

__all__ = [
    "calculate_reducing_balance_emi",
    "generate_amortization_schedule",
    "calculate_upfront_purchase_costs",
    "evaluate_rent_vs_buy_trajectory",
    "calculate_household_affordability",
]
