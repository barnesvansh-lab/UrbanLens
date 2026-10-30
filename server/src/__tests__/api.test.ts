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

  it('18. GET /api/forecasting/predict?mode=real&geography=All%20India → 200 status:ok data_status:real', async () => {
    const res = await request('GET', '/api/forecasting/predict?mode=real&geography=All%20India');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'ok');
    assert.strictEqual(res.body.data_status, 'real');
    assert.strictEqual(res.body.unit, 'index_points');
    assert.strictEqual(res.body.geography_level, 'city');
    assert.ok(Array.isArray(res.body.forecast));
    assert.ok(Array.isArray(res.body.observations));
    assert.ok(res.body.evaluation);
  });

  it('19. GET /api/data/sources → RBI-HPI and OSM status is "integrated"', async () => {
    const res = await request('GET', '/api/data/sources');
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body));
    const rbiSource = res.body.find((s: any) => s.id === 'rbi-hpi');
    assert.ok(rbiSource, 'rbi-hpi source not found');
    assert.strictEqual(rbiSource.status, 'integrated');
    const osmSource = res.body.find((s: any) => s.id === 'osm-amenities');
    assert.ok(osmSource, 'osm-amenities source not found');
    assert.strictEqual(osmSource.status, 'integrated');
  });

  it('20. GET /api/data/series?geography=Mumbai&metric=hpi_assessment → returns real observations', async () => {
    const res = await request('GET', '/api/data/series?geography=Mumbai&metric=hpi_assessment');
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body));
    assert.ok(res.body.length > 0);
    const realObs = res.body.filter((o: any) => o.data_status === 'real');
    assert.ok(realObs.length >= 50, 'Expected at least 50 real observations for Mumbai');
    for (const obs of realObs) {
      assert.strictEqual(obs.unit, 'index_points');
      assert.strictEqual(obs.geography_level, 'city');
    }
  });

  it('21. GET /api/neighborhoods → 200, array of regions with analytics', async () => {
    const res = await request('GET', '/api/neighborhoods');
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body.regions), 'regions must be an array');
    assert.ok(res.body.regions.length >= 1, 'Expected at least 1 region');
    assert.ok(res.body.data_status, 'Missing data_status');
    assert.ok(res.body.boundary_warning, 'Missing boundary_warning');
    for (const r of res.body.regions) {
      assert.ok(r.id, 'Region missing id');
      assert.ok(r.name, 'Region missing name');
      assert.ok(typeof r.total_amenities === 'number', 'Region missing total_amenities');
    }
  });

  it('22. GET /api/neighborhoods/boundaries → 200, GeoJSON FeatureCollection', async () => {
    const res = await request('GET', '/api/neighborhoods/boundaries');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.type, 'FeatureCollection');
    assert.ok(Array.isArray(res.body.features));
    assert.ok(res.body.metadata, 'Missing metadata');
    // Each feature should have GeoJSON polygon geometry
    for (const feature of res.body.features) {
      assert.strictEqual(feature.type, 'Feature');
      assert.strictEqual(feature.geometry.type, 'Polygon');
      assert.ok(feature.properties.id, 'Feature missing id property');
    }
  });

  it('23. GET /api/neighborhoods/south-mumbai-colaba/analytics → 200', async () => {
    const res = await request('GET', '/api/neighborhoods/south-mumbai-colaba/analytics');
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.region, 'Missing region object');
    assert.strictEqual(res.body.region.id, 'south-mumbai-colaba');
    assert.ok(typeof res.body.region.total_amenities === 'number');
    assert.ok(typeof res.body.region.amenity_density_per_km2 === 'number');
    assert.ok(res.body.context, 'Missing context');
  });

  it('24. GET /api/neighborhoods/compare?ids=south-mumbai-colaba,south-mumbai-fort → 200', async () => {
    const res = await request('GET', '/api/neighborhoods/compare?ids=south-mumbai-colaba,south-mumbai-fort');
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body.regions));
    assert.ok(res.body.regions.length >= 1);
    assert.ok(res.body.comparison_note, 'Missing comparison_note');
  });

  it('25. GET /api/transformation/indicators → 200, array with defined fields', async () => {
    const res = await request('GET', '/api/transformation/indicators');
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body.indicators), 'indicators must be an array');
    assert.ok(res.body.indicators.length >= 4, 'Expected at least 4 indicators');
    assert.ok(res.body.data_integrity_statement, 'Missing data_integrity_statement');
    for (const ind of res.body.indicators) {
      assert.ok(ind.id, 'Indicator missing id');
      assert.ok(ind.name, 'Indicator missing name');
      assert.ok(['real', 'unavailable', 'synthetic_test'].includes(ind.data_status),
        `Unexpected data_status: ${ind.data_status}`);
    }
    // Must have at least one real indicator
    const realInds = res.body.indicators.filter((i: any) => i.data_status === 'real');
    assert.ok(realInds.length >= 1, 'Expected at least 1 real indicator');
  });

  it('26. GET /api/transformation/summary → 200', async () => {
    const res = await request('GET', '/api/transformation/summary');
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.summary, 'Missing summary');
    assert.ok(typeof res.body.summary.total_indicators === 'number');
    assert.ok(res.body.hpi_city_trend, 'Missing hpi_city_trend');
    assert.ok(typeof res.body.hpi_city_trend.total_change_pct === 'number');
    assert.ok(res.body.data_integrity_statement, 'Missing data_integrity_statement');
    assert.ok(Array.isArray(res.body.indicator_categories));
  });
});
