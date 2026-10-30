import {
  ApiDataSource,
  ApiObservation,
  ApiQualityReport,
  ApiSummary,
  ApiAmenity,
  ApiHealthResponse,
  ApiError,
  ApiForecastResponse,
  ApiNeighborhoodsResponse,
  ApiBoundariesResponse,
  ApiNeighborhoodRegionDetail,
  ApiNeighborhoodAnalyticsResponse,
  ApiNeighborhoodCompareResponse,
  ApiTransformationSummaryResponse,
  ApiTransformationIndicatorsResponse,
  ApiTransformationOverviewResponse,
  ApiTransformationTrendsResponse,
  ApiTransformationAnomaliesResponse,
  ApiTransformationEvidenceResponse,
  ApiTransformationQualityResponse,
  ApiTransformationDataSourcesResponse,
  ApiTransformationAreasResponse,
  ApiTransformationAreaDetailResponse,
} from './types';

const API_BASE = '/api';

async function apiFetch<T>(path: string): Promise<{ data: T | null; error: ApiError | null }> {
  try {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({
        error: `HTTP error ${res.status}: ${res.statusText}`,
        code: `HTTP_${res.status}`,
      }));
      return { data: null, error: err };
    }
    const data = await res.json();
    return { data, error: null };
  } catch (e: any) {
    return {
      data: null,
      error: {
        error: e.message || 'Network error connecting to UrbanLens backend API',
        code: 'NETWORK_ERROR',
      },
    };
  }
}

function cleanParams(params?: Record<string, string | undefined>): string {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      searchParams.append(key, value);
    }
  }
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

export const apiClient = {
  getHealth: () => apiFetch<ApiHealthResponse>('/health'),
  getDataSources: () => apiFetch<ApiDataSource[]>('/data/sources'),
  getDataSeries: (params?: Record<string, string>) =>
    apiFetch<ApiObservation[]>(`/data/series${cleanParams(params)}`),
  getDataQuality: () => apiFetch<ApiQualityReport[]>('/data/quality'),
  getDataSummary: () => apiFetch<ApiSummary>('/data/summary'),
  getAmenities: (params?: Record<string, string>) =>
    apiFetch<ApiAmenity[]>(`/neighborhoods/amenities${cleanParams(params)}`),
  getForecast: (params: { geography?: string; metric?: string; horizon?: number; mode?: string }) =>
    apiFetch<ApiForecastResponse>(`/forecasting/predict?${new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]))
    )}`),
  getNeighborhoods: () => apiFetch<ApiNeighborhoodsResponse>('/neighborhoods'),
  getNeighborhoodBoundaries: () => apiFetch<ApiBoundariesResponse>('/neighborhoods/boundaries'),
  getNeighborhoodDetail: (id: string) => apiFetch<ApiNeighborhoodRegionDetail>(`/neighborhoods/${encodeURIComponent(id)}`),
  getNeighborhoodAnalytics: (id: string) => apiFetch<ApiNeighborhoodAnalyticsResponse>(`/neighborhoods/${encodeURIComponent(id)}/analytics`),
  compareNeighborhoods: (ids: string[]) => apiFetch<ApiNeighborhoodCompareResponse>(`/neighborhoods/compare?ids=${encodeURIComponent(ids.join(','))}`),
  getTransformationIndicators: (params?: { category?: string; data_status?: string }) =>
    apiFetch<ApiTransformationIndicatorsResponse>(`/transformation/indicators${cleanParams(params)}`),
  getTransformationSummary: () => apiFetch<ApiTransformationSummaryResponse>('/transformation/summary'),
  getTransformationOverview: () => apiFetch<ApiTransformationOverviewResponse>('/transformation/overview'),
  getTransformationTrends: () => apiFetch<ApiTransformationTrendsResponse>('/transformation/trends'),
  getTransformationAnomalies: () => apiFetch<ApiTransformationAnomaliesResponse>('/transformation/anomalies'),
  getTransformationEvidence: () => apiFetch<ApiTransformationEvidenceResponse>('/transformation/evidence'),
  getTransformationQuality: () => apiFetch<ApiTransformationQualityResponse>('/transformation/quality'),
  getTransformationDataSources: () => apiFetch<ApiTransformationDataSourcesResponse>('/transformation/data-sources'),
  getTransformationAreas: () => apiFetch<ApiTransformationAreasResponse>('/transformation/areas'),
  getTransformationAreaDetail: (id: string) => apiFetch<ApiTransformationAreaDetailResponse>(`/transformation/areas/${encodeURIComponent(id)}`),
  compareTransformationAreas: (ids: string[]) => apiFetch<{ requested_ids: string[]; found_count: number; areas: ApiNeighborhoodRegionDetail[]; comparison_disclaimer: string }>(
    `/transformation/comparison?ids=${encodeURIComponent(ids.join(','))}`
  ),
};

