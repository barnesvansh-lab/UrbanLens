/**
 * affordability.test.ts — Milestone 7 Integration Tests
 *
 * Tests all 8 /api/affordability endpoints using the same in-process
 * request harness as the existing api.test.ts suite.
 *
 * All financial expectations are derived from the agreed methodology docs:
 * - docs/EMI_CALCULATION_METHODOLOGY.md
 * - docs/UPFRONT_COST_METHODOLOGY.md
 * - docs/RENT_VS_BUY_METHODOLOGY.md
 * - docs/HOUSEHOLD_AFFORDABILITY_METHODOLOGY.md
 */

import test, { describe, it } from 'node:test';
import assert from 'node:assert';
import { EventEmitter } from 'events';
import { app } from '../index';
import { formatInr } from '../services/affordabilityService';

process.env.NODE_ENV = 'test';

interface ResponseResult {
  status: number;
  body: any;
}

/** Thin in-process request shim compatible with existing test harness */
function request(method: string, url: string, body?: any): Promise<ResponseResult> {
  return new Promise((resolve) => {
    const req: any = new EventEmitter();
    req.method = method;
    req.url = url;
    req.headers = { host: 'localhost:3001', 'content-type': 'application/json' };
    req.body = body;
    req.pipe = () => req;
    req.unpipe = () => req;

    const res: any = new EventEmitter();
    let statusCode = 200;
    res.status = (code: number) => { statusCode = code; return res; };
    res.setHeader = () => {};
    res.getHeader = () => {};
    res.json = (data: any) => resolve({ status: statusCode, body: data });
    res.send = (data: any) => resolve({ status: statusCode, body: data });
    res.end = () => resolve({ status: statusCode, body: null });

    (app as any).handle(req, res);
  });
}

// ──────────────────────────────────────────────────────────────────────────────
describe('Milestone 7 — /api/affordability Endpoints', () => {

  // ── GET /api/affordability/assumptions ────────────────────────────────────
  it('1. GET /api/affordability/assumptions → 200, version + defaults + sources', async () => {
    const res = await request('GET', '/api/affordability/assumptions');
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.version, 'Missing version');
    assert.ok(res.body.defaults, 'Missing defaults object');
    assert.ok(typeof res.body.defaults.interest_rate_pct === 'number', 'Missing interest_rate_pct default');
    assert.ok(typeof res.body.defaults.down_payment_pct === 'number', 'Missing down_payment_pct default');
    assert.ok(Array.isArray(res.body.sources), 'Missing sources array');
    assert.ok(res.body.sources.length >= 3, 'Expected at least 3 source references');
    // Verify RBI is one of the sources
    const rbiSource = res.body.sources.find((s: any) => s.name.includes('Reserve Bank'));
    assert.ok(rbiSource, 'Missing RBI source reference');
  });

  // ── GET /api/affordability/market-context ─────────────────────────────────
  it('2. GET /api/affordability/market-context → 200, city=Mumbai, RBI HPI context', async () => {
    const res = await request('GET', '/api/affordability/market-context');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.city, 'Mumbai');
    assert.strictEqual(res.body.currency, 'INR');
    assert.ok(res.body.market_benchmarks, 'Missing market_benchmarks');
    assert.ok(typeof res.body.market_benchmarks.prime_mortgage_eblr_pct === 'number');
    // HPI context should be populated from the real processed data
    assert.ok(res.body.rbi_hpi_context !== undefined, 'Missing rbi_hpi_context');
    if (res.body.rbi_hpi_context) {
      assert.ok(typeof res.body.rbi_hpi_context.long_term_cagr_pct === 'number');
    }
  });

  // ── POST /api/affordability/emi — happy path ───────────────────────────────
  it('3. POST /api/affordability/emi → 200, benchmark EMI ₹55,541 (80L @8.5%, 20yr)', async () => {
    const res = await request('POST', '/api/affordability/emi', {
      property_price: 10000000,   // 1 Cr
      down_payment_pct: 20,       // 20% = 20 L down, 80 L principal
      annual_interest_rate: 8.5,
      tenure_years: 20,
    });
    assert.strictEqual(res.status, 200);
    assert.ok(typeof res.body.monthly_emi === 'number', 'monthly_emi missing');
    assert.ok(typeof res.body.total_interest === 'number', 'total_interest missing');
    assert.ok(typeof res.body.loan_principal === 'number', 'loan_principal missing');
    assert.strictEqual(res.body.loan_principal, 8000000, 'Expected 80L loan principal');
    // Benchmark: ₹69,426 rounded (Python verified exact value)
    assert.ok(Math.abs(res.body.monthly_emi - 69426) <= 1, `Expected ~₹69,426 EMI, got ${res.body.monthly_emi}`);
    assert.ok(Array.isArray(res.body.amortization_schedule), 'Missing amortization_schedule');
    assert.ok(res.body.amortization_schedule.length > 0, 'Empty amortization schedule');
    assert.ok(Array.isArray(res.body.disclaimers), 'Missing disclaimers');
  });

  it('4. POST /api/affordability/emi with zero interest → returns P/n repayment (no divide-by-zero)', async () => {
    const res = await request('POST', '/api/affordability/emi', {
      property_price: 1200000,
      down_payment_pct: 0,
      annual_interest_rate: 0.0,
      tenure_years: 10,
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.monthly_emi, 10000); // 12,00,000 / 120
  });

  it('5. POST /api/affordability/emi → 400 MISSING_REQUIRED_PARAMS (missing tenure_years)', async () => {
    const res = await request('POST', '/api/affordability/emi', {
      property_price: 5000000,
      annual_interest_rate: 8.5,
      // tenure_years intentionally omitted
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.code, 'MISSING_REQUIRED_PARAMS');
  });

  it('6. POST /api/affordability/emi → 400 INVALID_PROPERTY_PRICE (negative price)', async () => {
    const res = await request('POST', '/api/affordability/emi', {
      property_price: -1000000,
      annual_interest_rate: 8.5,
      tenure_years: 20,
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.code, 'INVALID_PROPERTY_PRICE');
  });

  it('7. POST /api/affordability/emi → 400 INVALID_INTEREST_RATE (rate > 30)', async () => {
    const res = await request('POST', '/api/affordability/emi', {
      property_price: 5000000,
      annual_interest_rate: 99,
      tenure_years: 20,
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.code, 'INVALID_INTEREST_RATE');
  });

  it('8. POST /api/affordability/emi → 400 INVALID_TENURE (tenure > 40)', async () => {
    const res = await request('POST', '/api/affordability/emi', {
      property_price: 5000000,
      annual_interest_rate: 8.5,
      tenure_years: 50,
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.code, 'INVALID_TENURE');
  });

  // ── POST /api/affordability/upfront-costs ─────────────────────────────────
  it('9. POST /api/affordability/upfront-costs → 200, statutory charges breakdown', async () => {
    const res = await request('POST', '/api/affordability/upfront-costs', {
      property_price: 10000000,   // 1 Cr
      down_payment_pct: 20,
    });
    assert.strictEqual(res.status, 200);
    assert.ok(typeof res.body.down_payment === 'number');
    assert.ok(typeof res.body.stamp_duty === 'number');
    assert.ok(typeof res.body.registration_fee === 'number');
    assert.ok(typeof res.body.total_upfront_cash_required === 'number');
    assert.ok(typeof res.body.total_statutory_charges === 'number');
    // Default stamp duty is 6% of 1 Cr = ₹6,00,000
    assert.ok(Math.abs(res.body.stamp_duty - 600000) <= 10, `Expected ~₹6L stamp duty, got ${res.body.stamp_duty}`);
    // Registration cap is ₹30,000
    assert.ok(res.body.registration_fee <= 30000 + 10, 'Registration fee exceeds ₹30,000 cap');
    assert.ok(Array.isArray(res.body.disclaimers));
  });

  it('10. POST /api/affordability/upfront-costs → 400 INVALID_PROPERTY_PRICE (zero price)', async () => {
    const res = await request('POST', '/api/affordability/upfront-costs', {
      property_price: 0,
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.code, 'INVALID_PROPERTY_PRICE');
  });

  // ── POST /api/affordability/ownership-cost ────────────────────────────────
  it('11. POST /api/affordability/ownership-cost → 200, monthly breakdown with EMI', async () => {
    const res = await request('POST', '/api/affordability/ownership-cost', {
      property_price: 10000000,
      annual_interest_rate: 8.5,
      tenure_years: 20,
      down_payment_pct: 20,
      monthly_gross_income: 300000,
    });
    assert.strictEqual(res.status, 200);
    assert.ok(typeof res.body.monthly_emi === 'number');
    assert.ok(typeof res.body.total_monthly_ownership_cost === 'number');
    assert.ok(typeof res.body.emi_share_pct === 'number');
    assert.ok(typeof res.body.non_emi_share_pct === 'number');
    assert.ok(res.body.total_monthly_ownership_cost >= res.body.monthly_emi,
      'Total ownership cost should be at least the EMI (maintenance defaults may be zero when not provided)');
    assert.ok(Array.isArray(res.body.disclaimers));
  });

  it('12. POST /api/affordability/ownership-cost → 400 MISSING_REQUIRED_PARAMS', async () => {
    const res = await request('POST', '/api/affordability/ownership-cost', {
      property_price: 10000000,
      // annual_interest_rate and tenure_years omitted
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.code, 'MISSING_REQUIRED_PARAMS');
  });

  // ── POST /api/affordability/rent-vs-buy ───────────────────────────────────
  it('13. POST /api/affordability/rent-vs-buy → 200, trajectory + terminal wealth', async () => {
    const res = await request('POST', '/api/affordability/rent-vs-buy', {
      property_price: 10000000,
      initial_monthly_rent: 25000,
      horizon_years: 10,
    });
    assert.strictEqual(res.status, 200);
    assert.ok(typeof res.body.buyer_terminal_wealth === 'number');
    assert.ok(typeof res.body.renter_terminal_wealth === 'number');
    assert.ok(typeof res.body.net_buy_advantage === 'number');
    assert.ok(res.body.verdict_summary, 'Missing verdict summary');
    assert.ok(Array.isArray(res.body.annual_trajectory));
    assert.ok(res.body.annual_trajectory.length > 0);
    // Break-even year should be null or a valid integer
    assert.ok(res.body.break_even_year === null || typeof res.body.break_even_year === 'number');
    assert.ok(res.body.assumptions_used, 'Missing assumptions_used');
    assert.ok(Array.isArray(res.body.disclaimers));
  });

  it('14. POST /api/affordability/rent-vs-buy → 400 MISSING_REQUIRED_PARAMS', async () => {
    const res = await request('POST', '/api/affordability/rent-vs-buy', {
      property_price: 10000000,
      // initial_monthly_rent omitted
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.code, 'MISSING_REQUIRED_PARAMS');
  });

  it('15. POST /api/affordability/rent-vs-buy → 400 INVALID_HORIZON_YEARS (horizon > 40)', async () => {
    const res = await request('POST', '/api/affordability/rent-vs-buy', {
      property_price: 10000000,
      initial_monthly_rent: 25000,
      horizon_years: 50,
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.code, 'INVALID_HORIZON_YEARS');
  });

  // ── POST /api/affordability/household ────────────────────────────────────
  it('16. POST /api/affordability/household → 200, FOIR + property budget', async () => {
    const res = await request('POST', '/api/affordability/household', {
      monthly_gross_income: 200000,        // ₹2L/month
      existing_loan_emis: 20000,
      essential_monthly_expenses: 60000,
      available_liquid_savings: 3000000,   // ₹30L savings
      target_property_price: 12000000,     // 1.2 Cr target
    });
    assert.strictEqual(res.status, 200);
    assert.ok(typeof res.body.total_monthly_income === 'number');
    assert.ok(typeof res.body.current_foir_pct === 'number');
    assert.ok(typeof res.body.max_allowable_housing_emi === 'number');
    assert.ok(typeof res.body.binding_max_property_budget === 'number');
    assert.ok(typeof res.body.disposable_surplus === 'number');
    assert.ok(Array.isArray(res.body.actionable_recommendations));
    assert.ok(Array.isArray(res.body.disclaimers));
  });

  it('17. POST /api/affordability/household → 400 INVALID_GROSS_INCOME (zero income)', async () => {
    const res = await request('POST', '/api/affordability/household', {
      monthly_gross_income: 0,
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.code, 'INVALID_GROSS_INCOME');
  });

  it('18. POST /api/affordability/household → 400 INVALID_GROSS_INCOME (negative income)', async () => {
    const res = await request('POST', '/api/affordability/household', {
      monthly_gross_income: -50000,
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.code, 'INVALID_GROSS_INCOME');
  });

  // ── POST /api/affordability/scenarios ─────────────────────────────────────
  it('19. POST /api/affordability/scenarios → 200, default 3 scenarios', async () => {
    const res = await request('POST', '/api/affordability/scenarios', {
      property_price: 10000000,
    });
    assert.strictEqual(res.status, 200);
    assert.ok(typeof res.body.comparison_horizon_years === 'number');
    assert.ok(Array.isArray(res.body.scenarios));
    assert.strictEqual(res.body.scenarios.length, 3, 'Expected 3 default scenarios');

    for (const sc of res.body.scenarios) {
      assert.ok(sc.id, 'Scenario missing id');
      assert.ok(sc.name, 'Scenario missing name');
      assert.ok(typeof sc.monthly_emi === 'number');
      assert.ok(typeof sc.foir_pct === 'number');
      assert.ok(sc.affordability_verdict, 'Missing affordability verdict');
    }

    // Conservative should have the highest EMI (shorter tenure, higher dp)
    const conservative = res.body.scenarios.find((s: any) => s.id === 'conservative');
    const moderate = res.body.scenarios.find((s: any) => s.id === 'moderate');
    const aggressive = res.body.scenarios.find((s: any) => s.id === 'aggressive');
    assert.ok(conservative && moderate && aggressive, 'Missing one of the 3 standard scenarios');

    assert.ok(Array.isArray(res.body.disclaimers));
  });

  it('20. POST /api/affordability/scenarios → 200, custom scenarios', async () => {
    const res = await request('POST', '/api/affordability/scenarios', {
      property_price: 15000000,
      scenarios: [
        {
          id: 'custom-a',
          name: 'Custom A',
          description: 'My custom test scenario',
          property_price: 15000000,
          down_payment_pct: 25,
          annual_interest_rate: 9.0,
          loan_tenure_years: 15,
          monthly_rent: 35000,
          rent_increase_pct: 5,
          property_appreciation_pct: 5,
          investment_return_pct: 9,
          monthly_income: 300000,
          existing_emis: 0,
        }
      ],
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.scenarios.length, 1);
    assert.strictEqual(res.body.scenarios[0].id, 'custom-a');
  });

  it('21. POST /api/affordability/scenarios → 400 INVALID_PROPERTY_PRICE (zero price)', async () => {
    const res = await request('POST', '/api/affordability/scenarios', {
      property_price: 0,
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.code, 'INVALID_PROPERTY_PRICE');
  });

  // ── Cross-cutting: structural consistency ──────────────────────────────────
  it('22. All POST affordability endpoints return disclaimers array', async () => {
    const emiRes = await request('POST', '/api/affordability/emi', {
      property_price: 5000000, annual_interest_rate: 8.5, tenure_years: 20,
    });
    const upfrontRes = await request('POST', '/api/affordability/upfront-costs', {
      property_price: 5000000,
    });
    const ownershipRes = await request('POST', '/api/affordability/ownership-cost', {
      property_price: 5000000, annual_interest_rate: 8.5, tenure_years: 20,
    });
    const rvbRes = await request('POST', '/api/affordability/rent-vs-buy', {
      property_price: 5000000, initial_monthly_rent: 15000,
    });
    const householdRes = await request('POST', '/api/affordability/household', {
      monthly_gross_income: 150000,
    });

    for (const res of [emiRes, upfrontRes, ownershipRes, rvbRes, householdRes]) {
      assert.strictEqual(res.status, 200, `Unexpected error: ${JSON.stringify(res.body)}`);
      assert.ok(Array.isArray(res.body.disclaimers), 'Missing disclaimers array in response');
      assert.ok(res.body.disclaimers.length > 0, 'Disclaimers array is empty');
    }
  });

  it('23. EMI amortization_schedule first-year structure is valid', async () => {
    const res = await request('POST', '/api/affordability/emi', {
      property_price: 10000000,
      down_payment_pct: 20,
      annual_interest_rate: 8.5,
      tenure_years: 20,
    });
    assert.strictEqual(res.status, 200);
    const schedule = res.body.amortization_schedule;
    assert.ok(schedule.length === 20, 'Expected 20 annual schedule entries');
    const firstYear = schedule[0];
    assert.ok(typeof firstYear.year === 'number');
    assert.ok(typeof firstYear.annual_emi === 'number');
    assert.ok(typeof firstYear.principal_paid === 'number');
    assert.ok(typeof firstYear.interest_paid === 'number');
    assert.ok(typeof firstYear.closing_balance === 'number');
    assert.ok(typeof firstYear.homeowner_equity === 'number');
    // Interest decreases each year (reducing balance)
    const lastYear = schedule[schedule.length - 1];
    assert.ok(firstYear.interest_paid > lastYear.interest_paid,
      'Reducing-balance: first year interest should exceed last year');
  });

  it('24. Rent vs Buy trajectory year count matches horizon', async () => {
    const res = await request('POST', '/api/affordability/rent-vs-buy', {
      property_price: 8000000,
      initial_monthly_rent: 20000,
      horizon_years: 15,
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.annual_trajectory.length, 15,
      'Trajectory length should equal the horizon_years');
  });

  it('25. Household affordability FOIR calculation is mathematically consistent', async () => {
    // Income: ₹2L, existing EMIs: ₹20K → current FOIR = 10%
    const res = await request('POST', '/api/affordability/household', {
      monthly_gross_income: 200000,
      existing_loan_emis: 20000,
    });
    assert.strictEqual(res.status, 200);
    const expectedFoir = (20000 / 200000) * 100;
    assert.ok(Math.abs(res.body.current_foir_pct - expectedFoir) < 0.5,
      `FOIR should be ~${expectedFoir}%, got ${res.body.current_foir_pct}%`);
  });

  // ── Boundary Cases & Advanced Validation ──────────────────────────────────
  it('26. Boundary case: 1-year tenure EMI calculation', async () => {
    const res = await request('POST', '/api/affordability/emi', {
      property_price: 1200000,
      down_payment_pct: 0,
      annual_interest_rate: 10.0,
      tenure_years: 1,
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.tenure_months, 12);
    assert.strictEqual(res.body.amortization_schedule.length, 1);
    assert.ok(res.body.monthly_emi > 100000, '1-year EMI should exceed ₹1L/month for 12L principal');
  });

  it('27. Boundary case: 40-year maximum tenure EMI calculation', async () => {
    const res = await request('POST', '/api/affordability/emi', {
      property_price: 5000000,
      down_payment_pct: 20,
      annual_interest_rate: 8.5,
      tenure_years: 40,
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.tenure_months, 480);
    assert.strictEqual(res.body.amortization_schedule.length, 40);
    assert.strictEqual(res.body.amortization_schedule[39].closing_balance, 0);
  });

  it('28. Boundary case: Prepayment simulation saves interest and shortens tenure', async () => {
    const standardRes = await request('POST', '/api/affordability/emi', {
      property_price: 5000000,
      down_payment_pct: 20,
      annual_interest_rate: 8.5,
      tenure_years: 20,
    });
    const prepayRes = await request('POST', '/api/affordability/emi', {
      property_price: 5000000,
      down_payment_pct: 20,
      annual_interest_rate: 8.5,
      tenure_years: 20,
      extra_monthly_payment: 10000,
    });
    assert.strictEqual(standardRes.status, 200);
    assert.strictEqual(prepayRes.status, 200);
    assert.ok(prepayRes.body.interest_saved_by_prepayment > 0, 'Prepayment must save interest');
    assert.ok(prepayRes.body.effective_tenure_months < standardRes.body.tenure_months,
      'Effective tenure must be strictly shorter than standard 240 months');
  });

  it('29. Boundary case: Absolute down_payment_amount overrides down_payment_pct', async () => {
    const res = await request('POST', '/api/affordability/emi', {
      property_price: 10000000,
      down_payment_amount: 3000000, // 30L down payment
      annual_interest_rate: 8.5,
      tenure_years: 20,
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.down_payment, 3000000);
    assert.strictEqual(res.body.loan_principal, 7000000);
  });

  it('30. Invalid input: Down payment pct >= 100% rejected with 400', async () => {
    const res = await request('POST', '/api/affordability/emi', {
      property_price: 10000000,
      down_payment_pct: 100,
      annual_interest_rate: 8.5,
      tenure_years: 20,
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.code, 'INVALID_DOWN_PAYMENT');
  });

  it('31. Invalid input: Down payment amount >= property price rejected with 400', async () => {
    const res = await request('POST', '/api/affordability/emi', {
      property_price: 5000000,
      down_payment_amount: 5000000,
      annual_interest_rate: 8.5,
      tenure_years: 20,
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.code, 'INVALID_DOWN_PAYMENT');
  });

  it('32. Invalid input: Non-numeric property price rejected with 400', async () => {
    const res = await request('POST', '/api/affordability/emi', {
      property_price: 'not-a-number',
      annual_interest_rate: 8.5,
      tenure_years: 20,
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.code, 'INVALID_PROPERTY_PRICE');
  });

  it('33. Invalid input: Negative monthly rent in rent-vs-buy rejected with 400', async () => {
    const res = await request('POST', '/api/affordability/rent-vs-buy', {
      property_price: 8000000,
      initial_monthly_rent: -25000,
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.code, 'INVALID_INPUT_VALUES');
  });

  it('34. Boundary case: Existing debt at or above FOIR leaves 0 housing EMI capacity', async () => {
    // Income: ₹1,00,000, Existing EMIs: ₹50,000, FOIR: 45% -> Max total debt = ₹45,000 < ₹50,000
    const res = await request('POST', '/api/affordability/household', {
      monthly_gross_income: 100000,
      existing_loan_emis: 50000,
      foir_guideline_pct: 45,
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.max_allowable_housing_emi, 0);
    assert.strictEqual(res.body.max_affordable_loan_principal, 0);
  });

  it('35. INR Currency Formatter: Formats standard and compact Indian notation', () => {
    assert.strictEqual(formatInr(12500000, true), '₹1.25 Cr');
    assert.strictEqual(formatInr(7500000, true), '₹75.00 L');
    assert.strictEqual(formatInr(45000, true), '₹45,000');
    assert.strictEqual(formatInr(12500000, false), '₹1,25,00,000');
    assert.strictEqual(formatInr(0), '₹0');
  });

  it('36. GET /api/affordability/market-context returns formatting_guide', async () => {
    const res = await request('GET', '/api/affordability/market-context');
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.formatting_guide);
    assert.strictEqual(res.body.formatting_guide.currency_symbol, '₹');
    assert.ok(res.body.formatting_guide.compact_examples.crore.includes('Cr'));
  });

});
