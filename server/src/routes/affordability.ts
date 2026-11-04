import { Router, Request, Response } from 'express';
import { affordabilityService, formatInr } from '../services/affordabilityService';
import { transformationAnalysisService } from '../services/transformationAnalysisService';
import {
  EmiCalculationRequest,
  UpfrontCostRequest,
  OwnershipCostRequest,
  RentVsBuyRequest,
  HouseholdAffordabilityRequest,
  FinancialScenarioConfig,
} from '../types/api';

const router = Router();

// ── 1. POST /api/affordability/emi ─────────────────────────────────────────────
router.post('/emi', (req: Request, res: Response) => {
  try {
    const property_price = req.body.property_price;
    const annual_interest_rate = req.body.annual_interest_rate ?? req.body.annual_interest_rate_pct;
    const tenure_years = req.body.tenure_years;

    if (property_price === undefined || annual_interest_rate === undefined || tenure_years === undefined) {
      return res.status(400).json({
        error: 'Missing required parameters: property_price, annual_interest_rate, tenure_years',
        code: 'MISSING_REQUIRED_PARAMS',
      });
    }

    const priceNum = Number(property_price);
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      return res.status(400).json({
        error: 'property_price must be a positive number',
        code: 'INVALID_PROPERTY_PRICE',
      });
    }

    const rateNum = Number(annual_interest_rate);
    if (!Number.isFinite(rateNum) || rateNum < 0 || rateNum > 30) {
      return res.status(400).json({
        error: 'annual_interest_rate must be between 0 and 30',
        code: 'INVALID_INTEREST_RATE',
      });
    }

    const tenureNum = Number(tenure_years);
    if (!Number.isFinite(tenureNum) || tenureNum <= 0 || tenureNum > 40) {
      return res.status(400).json({
        error: 'tenure_years must be between 1 and 40',
        code: 'INVALID_TENURE',
      });
    }

    // Down payment validation
    if (req.body.down_payment_pct !== undefined) {
      const dpPct = Number(req.body.down_payment_pct);
      if (!Number.isFinite(dpPct) || dpPct < 0 || dpPct >= 100) {
        return res.status(400).json({
          error: 'down_payment_pct must be between 0 and 100',
          code: 'INVALID_DOWN_PAYMENT',
        });
      }
    }

    if (req.body.down_payment_amount !== undefined) {
      const dpAmount = Number(req.body.down_payment_amount);
      if (!Number.isFinite(dpAmount) || dpAmount < 0 || dpAmount >= priceNum) {
        return res.status(400).json({
          error: 'down_payment_amount must be non-negative and strictly less than property_price',
          code: 'INVALID_DOWN_PAYMENT',
        });
      }
    }

    if (req.body.extra_monthly_payment !== undefined) {
      const extra = Number(req.body.extra_monthly_payment);
      if (!Number.isFinite(extra) || extra < 0) {
        return res.status(400).json({
          error: 'extra_monthly_payment must be a non-negative number',
          code: 'INVALID_EXTRA_PAYMENT',
        });
      }
    }

    const normalizedBody: EmiCalculationRequest = {
      ...req.body,
      property_price: priceNum,
      annual_interest_rate: rateNum,
      tenure_years: tenureNum,
    };
    const result = affordabilityService.calculateEmi(normalizedBody);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({
      error: err.message || 'Error calculating EMI',
      code: 'EMI_CALCULATION_ERROR',
    });
  }
});

// ── 2. POST /api/affordability/upfront-costs ──────────────────────────────────
router.post('/upfront-costs', (req: Request, res: Response) => {
  try {
    const { property_price } = req.body;
    if (property_price === undefined) {
      return res.status(400).json({
        error: 'Missing required parameter: property_price',
        code: 'MISSING_REQUIRED_PARAMS',
      });
    }

    const priceNum = Number(property_price);
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      return res.status(400).json({
        error: 'property_price must be a positive number',
        code: 'INVALID_PROPERTY_PRICE',
      });
    }

    if (req.body.stamp_duty_pct !== undefined) {
      const sdp = Number(req.body.stamp_duty_pct);
      if (!Number.isFinite(sdp) || sdp < 0 || sdp > 30) {
        return res.status(400).json({
          error: 'stamp_duty_pct must be between 0 and 30',
          code: 'INVALID_STAMP_DUTY_PCT',
        });
      }
    }

    const result = affordabilityService.calculateUpfrontCosts({
      ...req.body,
      property_price: priceNum,
    } as UpfrontCostRequest);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({
      error: err.message || 'Error calculating upfront costs',
      code: 'UPFRONT_COST_CALCULATION_ERROR',
    });
  }
});

// ── 3. POST /api/affordability/ownership-cost ─────────────────────────────────
router.post('/ownership-cost', (req: Request, res: Response) => {
  try {
    const annual_interest_rate = req.body.annual_interest_rate ?? req.body.annual_interest_rate_pct;
    const { property_price, tenure_years, monthly_emi: suppliedEmi } = req.body;

    if (suppliedEmi === undefined && (property_price === undefined || annual_interest_rate === undefined || tenure_years === undefined)) {
      return res.status(400).json({
        error: 'Missing required parameters: property_price, annual_interest_rate, tenure_years',
        code: 'MISSING_REQUIRED_PARAMS',
      });
    }

    if (property_price !== undefined) {
      const priceNum = Number(property_price);
      if (!Number.isFinite(priceNum) || priceNum <= 0) {
        return res.status(400).json({
          error: 'property_price must be a positive number',
          code: 'INVALID_PROPERTY_PRICE',
        });
      }
    }

    if (suppliedEmi !== undefined) {
      const emiNum = Number(suppliedEmi);
      if (!Number.isFinite(emiNum) || emiNum < 0) {
        return res.status(400).json({
          error: 'monthly_emi must be a non-negative number',
          code: 'INVALID_MONTHLY_EMI',
        });
      }
    }

    // Compute EMI if not directly supplied
    let emi = suppliedEmi !== undefined ? Number(suppliedEmi) : undefined;
    if (emi === undefined) {
      const emiResult = affordabilityService.calculateEmi({
        property_price: Number(property_price),
        down_payment_pct: req.body.down_payment_pct !== undefined ? Number(req.body.down_payment_pct) : 20,
        annual_interest_rate: Number(annual_interest_rate),
        tenure_years: Number(tenure_years),
      } as EmiCalculationRequest);
      emi = emiResult.monthly_emi;
    }

    const ownershipReq: OwnershipCostRequest = {
      ...req.body,
      monthly_emi: emi,
    };

    const result = affordabilityService.calculateOwnershipCost(ownershipReq);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({
      error: err.message || 'Error calculating ownership costs',
      code: 'OWNERSHIP_COST_CALCULATION_ERROR',
    });
  }
});

// ── 4. POST /api/affordability/rent-vs-buy ────────────────────────────────────
router.post('/rent-vs-buy', (req: Request, res: Response) => {
  try {
    const { property_price, initial_monthly_rent, horizon_years, analysis_period_years } = req.body;
    if (property_price === undefined || initial_monthly_rent === undefined) {
      return res.status(400).json({
        error: 'Missing required parameters: property_price, initial_monthly_rent',
        code: 'MISSING_REQUIRED_PARAMS',
      });
    }

    const priceNum = Number(property_price);
    const rentNum = Number(initial_monthly_rent);

    if (!Number.isFinite(priceNum) || priceNum <= 0 || !Number.isFinite(rentNum) || rentNum <= 0) {
      return res.status(400).json({
        error: 'property_price and initial_monthly_rent must be positive numbers',
        code: 'INVALID_INPUT_VALUES',
      });
    }

    const horizon = horizon_years ?? analysis_period_years;
    if (horizon !== undefined) {
      const hNum = Number(horizon);
      if (!Number.isFinite(hNum) || hNum < 1 || hNum > 40) {
        return res.status(400).json({
          error: 'horizon_years must be between 1 and 40',
          code: 'INVALID_HORIZON_YEARS',
        });
      }
    }

    const result = affordabilityService.calculateRentVsBuy({
      ...req.body,
      property_price: priceNum,
      initial_monthly_rent: rentNum,
      analysis_period_years: horizon ? Number(horizon) : 10,
    } as RentVsBuyRequest);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({
      error: err.message || 'Error calculating Rent vs Buy comparison',
      code: 'RENT_VS_BUY_ERROR',
    });
  }
});

// ── 5. POST /api/affordability/household ──────────────────────────────────────
router.post('/household', (req: Request, res: Response) => {
  try {
    const income = req.body.monthly_gross_income ?? req.body.gross_monthly_income;
    if (income === undefined) {
      return res.status(400).json({
        error: 'Missing required parameter: monthly_gross_income',
        code: 'INVALID_GROSS_INCOME',
      });
    }

    const incomeNum = Number(income);
    if (!Number.isFinite(incomeNum) || incomeNum <= 0) {
      return res.status(400).json({
        error: 'monthly_gross_income must be a positive number',
        code: 'INVALID_GROSS_INCOME',
      });
    }

    if (req.body.existing_loan_emis !== undefined) {
      const debt = Number(req.body.existing_loan_emis);
      if (!Number.isFinite(debt) || debt < 0) {
        return res.status(400).json({
          error: 'existing_loan_emis must be a non-negative number',
          code: 'INVALID_EXISTING_EMIS',
        });
      }
    }

    if (req.body.foir_guideline_pct !== undefined) {
      const foir = Number(req.body.foir_guideline_pct);
      if (!Number.isFinite(foir) || foir < 5 || foir > 90) {
        return res.status(400).json({
          error: 'foir_guideline_pct must be between 5% and 90%',
          code: 'INVALID_FOIR_GUIDELINE',
        });
      }
    }

    const normalizedBody: HouseholdAffordabilityRequest = {
      ...req.body,
      monthly_gross_income: incomeNum,
    };

    const result = affordabilityService.calculateHouseholdAffordability(normalizedBody);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({
      error: err.message || 'Error evaluating household affordability',
      code: 'HOUSEHOLD_AFFORDABILITY_ERROR',
    });
  }
});

// ── 6. POST /api/affordability/scenarios ──────────────────────────────────────
router.post('/scenarios', (req: Request, res: Response) => {
  try {
    const { property_price, scenarios } = req.body;
    if (property_price === undefined) {
      return res.status(400).json({
        error: 'Missing required parameter: property_price',
        code: 'INVALID_PROPERTY_PRICE',
      });
    }

    const price = Number(property_price);
    if (!Number.isFinite(price) || price <= 0) {
      return res.status(400).json({
        error: 'property_price must be a positive number',
        code: 'INVALID_PROPERTY_PRICE',
      });
    }

    let scenarioConfigs: FinancialScenarioConfig[] = [];
    if (scenarios && Array.isArray(scenarios) && scenarios.length > 0) {
      scenarioConfigs = scenarios;
    } else {
      // Build standard Conservative / Moderate Baseline / Aggressive scenarios
      const estimatedRent = Math.round((price * 0.028) / 12);
      const estimatedIncome = Math.round(price * 0.02);

      scenarioConfigs = [
        {
          id: 'conservative',
          name: 'Conservative',
          description: 'Higher down payment (25%), shorter tenure (15 yrs), modest appreciation (5%).',
          property_price: price,
          down_payment_pct: 25.0,
          annual_interest_rate: 8.75,
          loan_tenure_years: 15,
          monthly_rent: estimatedRent,
          rent_increase_pct: 5.0,
          property_appreciation_pct: 5.0,
          investment_return_pct: 9.0,
          monthly_income: estimatedIncome,
          existing_emis: 0,
        },
        {
          id: 'moderate',
          name: 'Moderate Baseline',
          description: 'Standard 20% down payment, 20-year tenure, historical benchmark appreciation (6%).',
          property_price: price,
          down_payment_pct: 20.0,
          annual_interest_rate: 8.5,
          loan_tenure_years: 20,
          monthly_rent: estimatedRent,
          rent_increase_pct: 6.0,
          property_appreciation_pct: 6.0,
          investment_return_pct: 10.0,
          monthly_income: estimatedIncome,
          existing_emis: 0,
        },
        {
          id: 'aggressive',
          name: 'Aggressive / High Growth',
          description: 'Lower down payment (15%), 25-year tenure, bullish asset growth (7.5%).',
          property_price: price,
          down_payment_pct: 15.0,
          annual_interest_rate: 8.25,
          loan_tenure_years: 25,
          monthly_rent: estimatedRent,
          rent_increase_pct: 7.0,
          property_appreciation_pct: 7.5,
          investment_return_pct: 11.0,
          monthly_income: estimatedIncome,
          existing_emis: 0,
        },
      ];
    }

    const result = affordabilityService.compareScenarios(scenarioConfigs);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({
      error: err.message || 'Error running scenario comparison',
      code: 'SCENARIO_COMPARISON_ERROR',
    });
  }
});

// ── 7. GET /api/affordability/assumptions ─────────────────────────────────────
router.get('/assumptions', (_req: Request, res: Response) => {
  try {
    const assumptions = affordabilityService.getAssumptions();
    res.json(assumptions);
  } catch (err: any) {
    res.status(500).json({
      error: 'Failed to retrieve financial assumptions',
      code: 'ASSUMPTIONS_ERROR',
      details: err.message,
    });
  }
});

// ── 8. GET /api/affordability/market-context ─────────────────────────────────
router.get('/market-context', (_req: Request, res: Response) => {
  try {
    const trends = transformationAnalysisService.getTrends();
    const hpiSummary = trends?.summary || null;

    res.json({
      city: 'Mumbai',
      currency: 'INR',
      rbi_hpi_context: hpiSummary
        ? {
            long_term_cagr_pct: hpiSummary.annualized_cagr_pct,
            five_year_cagr_pct: hpiSummary.five_year_cagr_pct,
            three_year_cagr_pct: hpiSummary.three_year_cagr_pct,
            recent_growth_pct: hpiSummary.recent_annual_growth_pct,
            regime: hpiSummary.recent_market_regime,
            source: 'Reserve Bank of India (RBI) All-India Housing Price Index',
            date_range: `${hpiSummary.start_date} to ${hpiSummary.end_date}`,
          }
        : null,
      market_benchmarks: {
        prime_mortgage_eblr_pct: 8.5,
        mumbai_stamp_duty_pct: 6.0,
        mumbai_registration_fee_cap_inr: 30000,
        average_mumbai_maintenance_sqft_inr: 5.0,
        average_mumbai_rental_yield_pct: 2.8,
        long_term_equity_return_pct: 10.0,
      },
      formatting_guide: {
        currency_symbol: '₹',
        compact_examples: {
          crore: formatInr(12500000, true),
          lakh: formatInr(7500000, true),
          thousand: formatInr(45000, true),
        },
      },
      note: 'RBI HPI provides empirical historical growth context to help users set realistic property appreciation assumptions.',
    });
  } catch (err: any) {
    res.status(500).json({
      error: 'Failed to load market context',
      code: 'MARKET_CONTEXT_ERROR',
      details: err.message,
    });
  }
});

export default router;
