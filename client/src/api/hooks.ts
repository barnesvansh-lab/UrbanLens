import { useState, useEffect, useCallback } from 'react';
import { apiClient } from './client';
import {
  ApiDataSource,
  ApiObservation,
  ApiQualityReport,
  ApiSummary,
  ApiAmenity,
  ApiError,
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
