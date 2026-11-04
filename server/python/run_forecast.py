#!/usr/bin/env python3
"""
UrbanLens Forecast Runner — called by Express via spawnSync.
Outputs a single JSON object to stdout. All errors go to stderr.
Never prints non-JSON to stdout.

Usage:
    python3 run_forecast.py --mode demo --metric hpi_assessment --horizon 12
    python3 run_forecast.py --mode demo --geography mumbai-central --horizon 6
    python3 run_forecast.py --mode real --geography Mumbai --horizon 4
"""
import argparse
import csv
import json
import os
import sys

# Ensure server/python is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


def main():
    parser = argparse.ArgumentParser(description="UrbanLens Forecast Runner")
    parser.add_argument("--mode", choices=["demo", "real"], default="demo")
    parser.add_argument("--geography", default=None)
    parser.add_argument("--metric", default="hpi_assessment")
    parser.add_argument("--horizon", type=int, default=12)
    args = parser.parse_args()

    try:
        if args.mode == "demo":
            from forecasting.demo_engine import run_demo_forecast
            sector = args.geography or "mumbai-central"
            result = run_demo_forecast(sector_id=sector, horizon=args.horizon)
        else:
            if not args.geography:
                print(json.dumps({
                    "status": "unavailable",
                    "reason": f"No real-data observations available for unspecified geography and metric '{args.metric}'. Please specify a valid geography.",
                    "geography": "unknown",
                    "metric": args.metric,
                    "unit": "index_points",
                    "geography_level": "city",
                    "data_status": "unavailable",
                    "source_names": [],
                    "training_period": None,
                    "validation_period": None,
                    "n_training": 0,
                    "n_validation": 0,
                    "model_name": "none",
                    "model_version": "none",
                    "horizon": args.horizon,
                    "forecast_dates": [],
                    "point_forecasts": [],
                    "lower_bounds": None,
                    "upper_bounds": None,
                    "observations": [],
                    "forecast": [],
                    "evaluation": None,
                    "warnings": ["Forecasting unavailable: Real data required but not found in ingested datasets."],
                    "limitations": ["Real RBI / NHB data pipeline pending live ingestion."],
                    "generated_at": "",
                }))
                sys.exit(0)

            # mode == 'real': read processed CSV and run engine requiring data_status='real'
            from forecasting.engine import run_forecast
            processed_path = os.path.join(
                os.path.dirname(os.path.abspath(__file__)),
                "data", "processed", "processed_hpi.csv"
            )
            observations = []
            if os.path.exists(processed_path):
                with open(processed_path, mode="r", newline="", encoding="utf-8") as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        observations.append(dict(row))

            geography = args.geography
            result = run_forecast(
                observations=observations,
                geography=geography,
                metric=args.metric,
                horizon=args.horizon,
                data_status_required="real",
            )

        print(json.dumps(result))
        sys.exit(0)
    except Exception as e:
        print(f"[run_forecast] Error: {e}", file=sys.stderr)
        # Output a valid JSON response so Express can parse it
        print(json.dumps({
            "status": "unavailable",
            "reason": str(e),
            "geography": args.geography or "unknown",
            "metric": args.metric,
            "unit": "index_points",
            "geography_level": "city",
            "data_status": "unavailable",
            "source_names": [],
            "training_period": None,
            "validation_period": None,
            "n_training": 0,
            "n_validation": 0,
            "model_name": "none",
            "model_version": "none",
            "horizon": args.horizon,
            "forecast_dates": [],
            "point_forecasts": [],
            "lower_bounds": None,
            "upper_bounds": None,
            "observations": [],
            "forecast": [],
            "evaluation": None,
            "warnings": ["Forecast computation failed"],
            "limitations": [],
            "generated_at": "",
        }))
        sys.exit(0)


if __name__ == "__main__":
    main()
