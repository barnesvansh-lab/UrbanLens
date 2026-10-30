import { useState, useEffect, useCallback } from 'react';
import { apiClient } from './client';
import {
  ApiDataSource,
  ApiObservation,
  ApiQualityReport,
  ApiSummary,
  ApiAmenity,
  ApiError,
  ApiForecastResponse,
  ApiNeighborhoodsResponse,
  ApiBoundariesResponse,
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
  ApiNeighborhoodRegionDetail,
} from './types';

export function useDataSources(): {
  sources: ApiDataSource[];
  loading: boolean;
  error: ApiError | null;
  refetch: () => void;
} {
  const [sources, setSources] = useState<ApiDataSource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchSources = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await apiClient.getDataSources();
    if (err) {
      setError(err);
    } else if (data) {
      setSources(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  return { sources, loading, error, refetch: fetchSources };
}

export function useDataSeries(params?: Record<string, string>): {
  series: ApiObservation[];
  loading: boolean;
  error: ApiError | null;
  refetch: () => void;
} {
  const [series, setSeries] = useState<ApiObservation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  const serializedParams = JSON.stringify(params || {});

  const fetchSeries = useCallback(async () => {
    setLoading(true);
    setError(null);
    const parsedParams = JSON.parse(serializedParams);
    const { data, error: err } = await apiClient.getDataSeries(parsedParams);
    if (err) {
      setError(err);
    } else if (data) {
      setSeries(data);
    }
    setLoading(false);
  }, [serializedParams]);

  useEffect(() => {
    fetchSeries();
  }, [fetchSeries]);

  return { series, loading, error, refetch: fetchSeries };
}

export function useDataQuality(): {
  reports: ApiQualityReport[];
  loading: boolean;
  error: ApiError | null;
  refetch: () => void;
} {
  const [reports, setReports] = useState<ApiQualityReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchQuality = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await apiClient.getDataQuality();
    if (err) {
      setError(err);
    } else if (data) {
      setReports(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchQuality();
  }, [fetchQuality]);

  return { reports, loading, error, refetch: fetchQuality };
}

export function useApiSummary(): {
  summary: ApiSummary | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => void;
} {
  const [summary, setSummary] = useState<ApiSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await apiClient.getDataSummary();
    if (err) {
      setError(err);
    } else if (data) {
      setSummary(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { summary, loading, error, refetch: fetchSummary };
}

export function useAmenities(params?: Record<string, string>): {
  amenities: ApiAmenity[];
  loading: boolean;
  error: ApiError | null;
  refetch: () => void;
} {
  const [amenities, setAmenities] = useState<ApiAmenity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  const serializedParams = JSON.stringify(params || {});

  const fetchAmenities = useCallback(async () => {
    setLoading(true);
    setError(null);
    const parsedParams = JSON.parse(serializedParams);
    const { data, error: err } = await apiClient.getAmenities(parsedParams);
    if (err) {
      setError(err);
    } else if (data) {
      setAmenities(data);
    }
    setLoading(false);
  }, [serializedParams]);

  useEffect(() => {
    fetchAmenities();
  }, [fetchAmenities]);

  return { amenities, loading, error, refetch: fetchAmenities };
}

export function useForecast(params: {
  geography?: string;
  metric?: string;
  horizon?: number;
  mode?: 'demo' | 'real';
}): {
  forecast: ApiForecastResponse | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => void;
} {
  const [forecast, setForecast] = useState<ApiForecastResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  const serializedParams = JSON.stringify(params || {});

  const fetchForecast = useCallback(async () => {
    setLoading(true);
    setError(null);
    const parsedParams = JSON.parse(serializedParams);
    const { data, error: err } = await apiClient.getForecast(parsedParams);
    if (err) {
      setError(err);
    } else if (data) {
      setForecast(data);
    }
    setLoading(false);
  }, [serializedParams]);

  useEffect(() => {
    fetchForecast();
  }, [fetchForecast]);

  return { forecast, loading, error, refetch: fetchForecast };
}

export function useNeighborhoods(): {
  data: ApiNeighborhoodsResponse | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => void;
} {
  const [data, setData] = useState<ApiNeighborhoodsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchNeighborhoods = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data: res, error: err } = await apiClient.getNeighborhoods();
    if (err) {
      setError(err);
    } else if (res) {
      setData(res);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNeighborhoods();
  }, [fetchNeighborhoods]);

  return { data, loading, error, refetch: fetchNeighborhoods };
}

export function useNeighborhoodBoundaries(): {
  boundaries: ApiBoundariesResponse | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => void;
} {
  const [boundaries, setBoundaries] = useState<ApiBoundariesResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchBoundaries = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data: res, error: err } = await apiClient.getNeighborhoodBoundaries();
    if (err) {
      setError(err);
    } else if (res) {
      setBoundaries(res);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBoundaries();
  }, [fetchBoundaries]);

  return { boundaries, loading, error, refetch: fetchBoundaries };
}

export function useNeighborhoodAnalytics(id: string): {
  data: ApiNeighborhoodAnalyticsResponse | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => void;
} {
  const [data, setData] = useState<ApiNeighborhoodAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    const { data: res, error: err } = await apiClient.getNeighborhoodAnalytics(id);
    if (err) {
      setError(err);
    } else if (res) {
      setData(res);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { data, loading, error, refetch: fetchAnalytics };
}

export function useNeighborhoodCompare(ids: string[]): {
  data: ApiNeighborhoodCompareResponse | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => void;
} {
  const [data, setData] = useState<ApiNeighborhoodCompareResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  const serializedIds = JSON.stringify(ids);

  const fetchCompare = useCallback(async () => {
    const parsedIds: string[] = JSON.parse(serializedIds);
    if (!parsedIds || parsedIds.length === 0) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data: res, error: err } = await apiClient.compareNeighborhoods(parsedIds);
    if (err) {
      setError(err);
    } else if (res) {
      setData(res);
    }
    setLoading(false);
  }, [serializedIds]);

  useEffect(() => {
    fetchCompare();
  }, [fetchCompare]);

  return { data, loading, error, refetch: fetchCompare };
}

export function useTransformationSummary(): {
  data: ApiTransformationSummaryResponse | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => void;
} {
  const [data, setData] = useState<ApiTransformationSummaryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data: res, error: err } = await apiClient.getTransformationSummary();
    if (err) {
      setError(err);
    } else if (res) {
      setData(res);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { data, loading, error, refetch: fetchSummary };
}

export function useTransformationIndicators(params?: { category?: string; data_status?: string }): {
  data: ApiTransformationIndicatorsResponse | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => void;
} {
  const [data, setData] = useState<ApiTransformationIndicatorsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  const serializedParams = JSON.stringify(params || {});

  const fetchIndicators = useCallback(async () => {
    setLoading(true);
    setError(null);
    const parsedParams = JSON.parse(serializedParams);
    const { data: res, error: err } = await apiClient.getTransformationIndicators(parsedParams);
    if (err) {
      setError(err);
    } else if (res) {
      setData(res);
    }
    setLoading(false);
  }, [serializedParams]);

  useEffect(() => {
    fetchIndicators();
  }, [fetchIndicators]);

  return { data, loading, error, refetch: fetchIndicators };
}



export function useTransformationOverview(): {
  data: ApiTransformationOverviewResponse | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => void;
} {
  const [data, setData] = useState<ApiTransformationOverviewResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data: res, error: err } = await apiClient.getTransformationOverview();
    if (err) {
      setError(err);
    } else if (res) {
      setData(res);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return { data, loading, error, refetch: fetchOverview };
}

export function useTransformationTrends(): {
  data: ApiTransformationTrendsResponse | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => void;
} {
  const [data, setData] = useState<ApiTransformationTrendsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchTrends = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data: res, error: err } = await apiClient.getTransformationTrends();
    if (err) {
      setError(err);
    } else if (res) {
      setData(res);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTrends();
  }, [fetchTrends]);

  return { data, loading, error, refetch: fetchTrends };
}

export function useTransformationAnomalies(): {
  data: ApiTransformationAnomaliesResponse | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => void;
} {
  const [data, setData] = useState<ApiTransformationAnomaliesResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchAnomalies = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data: res, error: err } = await apiClient.getTransformationAnomalies();
    if (err) {
      setError(err);
    } else if (res) {
      setData(res);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAnomalies();
  }, [fetchAnomalies]);

  return { data, loading, error, refetch: fetchAnomalies };
}

export function useTransformationEvidence(): {
  data: ApiTransformationEvidenceResponse | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => void;
} {
  const [data, setData] = useState<ApiTransformationEvidenceResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchEvidence = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data: res, error: err } = await apiClient.getTransformationEvidence();
    if (err) {
      setError(err);
    } else if (res) {
      setData(res);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEvidence();
  }, [fetchEvidence]);

  return { data, loading, error, refetch: fetchEvidence };
}

export function useTransformationQuality(): {
  data: ApiTransformationQualityResponse | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => void;
} {
  const [data, setData] = useState<ApiTransformationQualityResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchQuality = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data: res, error: err } = await apiClient.getTransformationQuality();
    if (err) {
      setError(err);
    } else if (res) {
      setData(res);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchQuality();
  }, [fetchQuality]);

  return { data, loading, error, refetch: fetchQuality };
}

export function useTransformationDataSources(): {
  data: ApiTransformationDataSourcesResponse | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => void;
} {
  const [data, setData] = useState<ApiTransformationDataSourcesResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchSources = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data: res, error: err } = await apiClient.getTransformationDataSources();
    if (err) {
      setError(err);
    } else if (res) {
      setData(res);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  return { data, loading, error, refetch: fetchSources };
}

export function useTransformationAreas(): {
  data: ApiTransformationAreasResponse | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => void;
} {
  const [data, setData] = useState<ApiTransformationAreasResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchAreas = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data: res, error: err } = await apiClient.getTransformationAreas();
    if (err) {
      setError(err);
    } else if (res) {
      setData(res);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAreas();
  }, [fetchAreas]);

  return { data, loading, error, refetch: fetchAreas };
}

export function useTransformationAreaDetail(id: string): {
  data: ApiTransformationAreaDetailResponse | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => void;
} {
  const [data, setData] = useState<ApiTransformationAreaDetailResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    const { data: res, error: err } = await apiClient.getTransformationAreaDetail(id);
    if (err) {
      setError(err);
    } else if (res) {
      setData(res);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return { data, loading, error, refetch: fetchDetail };
}

export function useTransformationComparison(ids: string[]): {
  data: { requested_ids: string[]; found_count: number; areas: ApiNeighborhoodRegionDetail[]; comparison_disclaimer: string } | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => void;
} {
  const [data, setData] = useState<{ requested_ids: string[]; found_count: number; areas: ApiNeighborhoodRegionDetail[]; comparison_disclaimer: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  const serialized = JSON.stringify(ids);

  const fetchCompare = useCallback(async () => {
    const parsed: string[] = JSON.parse(serialized);
    if (!parsed || parsed.length === 0) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data: res, error: err } = await apiClient.compareTransformationAreas(parsed);
    if (err) {
      setError(err);
    } else if (res) {
      setData(res);
    }
    setLoading(false);
  }, [serialized]);

  useEffect(() => {
    fetchCompare();
  }, [fetchCompare]);

  return { data, loading, error, refetch: fetchCompare };
}
