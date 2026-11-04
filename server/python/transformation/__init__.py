"""
UrbanLens Transformation Engine (Milestone 6)
"""

from .temporal_analysis import (
    compute_percentage_change,
    compute_cagr,
    compute_rolling_std,
    analyze_hpi_series,
)
from .anomaly_detection import (
    compute_zscore,
    compute_iqr_thresholds,
    detect_anomalies,
)
from .data_sources import (
    DATA_SOURCES_CATALOG,
    get_data_sources_summary,
)
from .indicator_analysis import (
    build_comprehensive_indicator_framework,
)
from .evidence_engine import (
    evaluate_transformation_evidence,
)
from .normalization import (
    min_max_scale,
    z_score_standardize,
    robust_scale_iqr,
    validate_composite_normalization,
)
from .compatibility import (
    evaluate_series_completeness,
    check_quarterly_continuity,
    validate_cross_dataset_compatibility,
)

__all__ = [
    "compute_percentage_change",
    "compute_cagr",
    "compute_rolling_std",
    "analyze_hpi_series",
    "compute_zscore",
    "compute_iqr_thresholds",
    "detect_anomalies",
    "DATA_SOURCES_CATALOG",
    "get_data_sources_summary",
    "build_comprehensive_indicator_framework",
    "evaluate_transformation_evidence",
    "min_max_scale",
    "z_score_standardize",
    "robust_scale_iqr",
    "validate_composite_normalization",
    "evaluate_series_completeness",
    "check_quarterly_continuity",
    "validate_cross_dataset_compatibility",
]
