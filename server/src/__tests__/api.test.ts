import test, { describe, it } from 'node:test';
import assert from 'node:assert';
import { EventEmitter } from 'events';
import { app } from '../index';

process.env.NODE_ENV = 'test';

interface ResponseResult {
  status: number;
  headers: Record<string, string>;
  body: any;
}

function request(method: string, url: string): Promise<ResponseResult> {
  return new Promise((resolve) => {
    const req: any = new EventEmitter();
    req.method = method;
    req.url = url;
    req.headers = { host: 'localhost:3001' };

    const res: any = new EventEmitter();
    let statusCode = 200;
    const resHeaders: Record<string, string> = {};

    res.status = (code: number) => {
      statusCode = code;
      return res;
    };
    res.setHeader = (k: string, v: string) => {
      resHeaders[k.toLowerCase()] = v;
    };
    res.getHeader = (k: string) => resHeaders[k.toLowerCase()];

    res.json = (data: any) => {
      resolve({ status: statusCode, headers: resHeaders, body: data });
    };
    res.send = (data: any) => {
      try {
        resolve({ status: statusCode, headers: resHeaders, body: JSON.parse(data) });
      } catch {
        resolve({ status: statusCode, headers: resHeaders, body: data });
      }
    };
    res.end = (chunk?: any) => {
      if (chunk) {
        try {
          resolve({ status: statusCode, headers: resHeaders, body: JSON.parse(chunk) });
        } catch {
          resolve({ status: statusCode, headers: resHeaders, body: chunk });
        }
      } else {
        resolve({ status: statusCode, headers: resHeaders, body: null });
      }
    };

    (app as any).handle(req, res);
  });
}

describe('UrbanLens Express API Endpoints', () => {
  it('1. GET /api/health → 200, status: ok', async () => {
    const res = await request('GET', '/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'ok');
    assert.strictEqual(res.body.service, 'UrbanLens API');
    assert.ok(res.body.timestamp);
  });

  it('2. GET /api/data/sources → 200, array of DataSource', async () => {
    const res = await request('GET', '/api/data/sources');
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body));
    assert.ok(res.body.length >= 3);
    const rbi = res.body.find((s: any) => s.id === 'rbi-hpi');
    assert.ok(rbi);
    assert.strictEqual(rbi.unit, 'index_points');
  });

  it('3. GET /api/data/series → 200 (array of observations)', async () => {
    const res = await request('GET', '/api/data/series');
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body));
  });

  it('4. GET /api/data/series?start_date=bad → 400 with error object', async () => {
    const res = await request('GET', '/api/data/series?start_date=bad');
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.code, 'INVALID_DATE_FORMAT');
    assert.ok(res.body.error);
  });

  it('5. GET /api/data/series?geography=../../etc/passwd → 400 (path traversal rejected)', async () => {
    const res = await request('GET', '/api/data/series?geography=../../etc/passwd');
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.code, 'INVALID_QUERY_PARAM');
  });

  it('6. GET /api/data/quality → 200 (array of quality reports)', async () => {
    const res = await request('GET', '/api/data/quality');
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body));
  });

  it('7. GET /api/data/summary → 200 (summary object)', async () => {
    const res = await request('GET', '/api/data/summary');
    assert.strictEqual(res.status, 200);
    assert.ok(typeof res.body.total_observations === 'number');
    assert.ok(Array.isArray(res.body.geographies));
    assert.ok(res.body.data_status_breakdown);
  });

  it('8. GET /api/neighborhoods/amenities → 200 (array)', async () => {
    const res = await request('GET', '/api/neighborhoods/amenities');
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body));
  });

  it('9. GET /api/neighborhoods/amenities?amenity_type=school → 200', async () => {
    const res = await request('GET', '/api/neighborhoods/amenities?amenity_type=school');
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body));
    for (const item of res.body) {
      assert.strictEqual(item.amenity_type.toLowerCase(), 'school');
    }
  });

  it('10. GET /api/data/series?start_date=2020-01-01&end_date=2019-01-01 → 400 (end before start)', async () => {
    const res = await request('GET', '/api/data/series?start_date=2020-01-01&end_date=2019-01-01');
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.code, 'INVALID_DATE_RANGE');
  });

  it('11. GET /api/forecasting/predict?mode=demo → 200, status: ok, data_status: synthetic_demo', async () => {
    const res = await request('GET', '/api/forecasting/predict?mode=demo');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'ok');
    assert.strictEqual(res.body.data_status, 'synthetic_demo');
    assert.ok(Array.isArray(res.body.observations));
    assert.ok(Array.isArray(res.body.forecast));
    assert.ok(res.body.evaluation);
  });

  it('12. GET /api/forecasting/predict?mode=demo&geography=mumbai-central&horizon=6 → 200', async () => {
    const res = await request('GET', '/api/forecasting/predict?mode=demo&geography=mumbai-central&horizon=6');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'ok');
    assert.strictEqual(res.body.horizon, 6);
    assert.strictEqual(res.body.forecast.length, 6);
  });

  it('13. GET /api/forecasting/predict?mode=real → 200, status: unavailable (no real data)', async () => {
    const res = await request('GET', '/api/forecasting/predict?mode=real');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'unavailable');
    assert.ok(res.body.reason);
  });

  it('14. GET /api/forecasting/predict?horizon=99 → 400 INVALID_HORIZON', async () => {
    const res = await request('GET', '/api/forecasting/predict?horizon=99');
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.code, 'INVALID_HORIZON');
  });

  it('15. GET /api/forecasting/predict?mode=bad → 400 INVALID_MODE', async () => {
    const res = await request('GET', '/api/forecasting/predict?mode=bad');
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.code, 'INVALID_MODE');
  });

  it('16. GET /api/forecasting/predict?geography=../../etc → 400 INVALID_GEOGRAPHY', async () => {
    const res = await request('GET', '/api/forecasting/predict?geography=../../etc');
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.code, 'INVALID_GEOGRAPHY');
  });

  it('17. GET /api/forecasting/predict?metric=price_per_sqft → 400 INVALID_METRIC', async () => {
    const res = await request('GET', '/api/forecasting/predict?metric=price_per_sqft');
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.code, 'INVALID_METRIC');
  });
});
