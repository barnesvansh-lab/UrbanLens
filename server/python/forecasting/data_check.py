"""
Checks whether a processed HPI dataset has sufficient observations for forecasting.
Returns a structured assessment dict, not a boolean.
"""
from typing import List, Dict, Any, Optional

# Minimum observations required for each model type
MIN_OBS = {
    "naive_last": 1,
    "seasonal_naive": 4,   # need at least 1 full seasonal period (quarterly)
    "linear_trend": 4,     # need sufficient points for linear regression
    "sarima": 24,          # need ~2 full annual cycles minimum
}


def check_data_sufficiency(
    observations: List[Dict[str, Any]],
    geography: str,
    metric: str,
) -> Dict[str, Any]:
    """
    Evaluates dataset sufficiency for statistical and baseline forecasting models.
    """
    matching: List[Dict[str, Any]] = []
    for obs in observations:
        obs_geo = obs.get("geography_name") or obs.get("geography")
        if obs_geo is not None and str(obs_geo).strip().lower() != geography.strip().lower():
            continue

        obs_metric = obs.get("metric_name") or obs.get("metric")
        if obs_metric is not None and str(obs_metric).strip().lower() != metric.strip().lower():
            continue

        matching.append(obs)

    n_obs = len(matching)

    dates = [
        str(obs.get("observation_date") or obs.get("date"))
        for obs in matching
        if (obs.get("observation_date") or obs.get("date"))
    ]
    date_range = {"min": min(dates), "max": max(dates)} if dates else None

    data_status_set = sorted(list({
        str(obs.get("data_status"))
        for obs in matching
        if obs.get("data_status") is not None
    }))

    has_real_data = "real" in data_status_set

    eligible_models = [m for m, min_n in MIN_OBS.items() if n_obs >= min_n]
    ineligible_models = [m for m, min_n in MIN_OBS.items() if n_obs < min_n]

    blocker: Optional[str] = None
    if n_obs < MIN_OBS["naive_last"]:
        blocker = (
            f"No observations available for geography '{geography}' and metric '{metric}'. "
            f"Minimum {MIN_OBS['naive_last']} observation required for forecasting."
        )

    return {
        "geography": geography,
        "metric": metric,
        "n_observations": n_obs,
        "date_range": date_range,
        "data_status_set": data_status_set,
        "has_real_data": has_real_data,
        "eligible_models": eligible_models,
        "ineligible_models": ineligible_models,
        "blocker": blocker,
    }
