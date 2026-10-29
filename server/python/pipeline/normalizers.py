"""
Normalization functions for date, geography, and numeric metric fields.
"""

import re
import math
from typing import Any
from datetime import datetime

# Alias map for Indian cities and common variations
GEOGRAPHY_ALIASES: dict[str, str] = {
    "bombay": "Mumbai",
    "mumbai": "Mumbai",
    "delhi": "Delhi",
    "new delhi": "Delhi",
    "ncr": "Delhi",
    "bangalore": "Bengaluru",
    "bengaluru": "Bengaluru",
    "calcutta": "Kolkata",
    "kolkata": "Kolkata",
    "madras": "Chennai",
    "chennai": "Chennai",
    "poona": "Pune",
    "pune": "Pune",
    "hyderabad": "Hyderabad",
    "ahmedabad": "Ahmedabad",
    "jaipur": "Jaipur",
    "kanpur": "Kanpur",
    "kochi": "Kochi",
    "cochin": "Kochi",
    "lucknow": "Lucknow",
    "thane": "Thane",
    "navi mumbai": "Navi Mumbai",
}

def parse_observation_date(raw_date: Any) -> str:
    """
    Parses various Indian date formats and returns an ISO date string (YYYY-MM-DD):
    - Indian FY quarter: 'Q1 2020-21', '2020-21 Q1', 'Q1 FY21', etc.
      FY starts in April:
      Q1 (Apr-Jun) -> 2020-04-01
      Q2 (Jul-Sep) -> 2020-07-01
      Q3 (Oct-Dec) -> 2020-10-01
      Q4 (Jan-Mar) -> 2021-01-01
    - Month spans: 'Apr-Jun 2020', 'Jan-Mar 2021'
    - Calendar quarter: '2020-Q1', 'Q1 2020'
    - ISO formats: 'YYYY-MM-DD', 'YYYY-MM-DDTHH:MM:SSZ'
    - Standard dates: 'DD-MM-YYYY', 'DD/MM/YYYY'
    
    Raises:
        ValueError if the date string cannot be parsed or represents an invalid date.
    """
    if raw_date is None or (isinstance(raw_date, float) and math.isnan(raw_date)):
        raise ValueError("Empty or NaN observation date")

    raw_str = str(raw_date).strip()
    if not raw_str:
        raise ValueError("Empty date string")

    # If it's already ISO format YYYY-MM-DD
    iso_match = re.match(r"^(\d{4})-(\d{2})-(\d{2})", raw_str)
    if iso_match:
        year, month, day = int(iso_match.group(1)), int(iso_match.group(2)), int(iso_match.group(3))
        # Validate through datetime constructor
        try:
            dt = datetime(year, month, day)
            return dt.strftime("%Y-%m-%d")
        except ValueError as e:
            raise ValueError(f"Invalid calendar date: {raw_str}") from e

    # 1. Indian FY Quarter format: e.g. 'Q1 2020-21' or '2020-21 Q1' or 'Q1 2020-2021'
    fy_match = re.search(r"Q([1-4])\s*(?:FY)?\s*(\d{4})[-/](\d{2,4})", raw_str, re.IGNORECASE)
    if not fy_match:
        fy_match = re.search(r"(\d{4})[-/](\d{2,4})\s*Q([1-4])", raw_str, re.IGNORECASE)
        if fy_match:
            # Swap groups to (quarter, start_year)
            q_num = int(fy_match.group(3))
            start_year = int(fy_match.group(1))
        else:
            q_num = None
            start_year = None
    else:
        q_num = int(fy_match.group(1))
        start_year = int(fy_match.group(2))

    if q_num is not None and start_year is not None:
        if q_num == 1:
            return f"{start_year:04d}-04-01"
        elif q_num == 2:
            return f"{start_year:04d}-07-01"
        elif q_num == 3:
            return f"{start_year:04d}-10-01"
        elif q_num == 4:
            return f"{start_year + 1:04d}-01-01"

    # 2. Month-range quarter format: 'Apr-Jun 2020', 'Jan-Mar 2020', etc.
    month_range_match = re.search(
        r"(Jan[-–\s]+Mar|Apr[-–\s]+Jun|Jul[-–\s]+Sep|Oct[-–\s]+Dec)\s*['\"]?(\d{2,4})",
        raw_str,
        re.IGNORECASE,
    )
    if month_range_match:
        m_range = month_range_match.group(1).lower().replace(" ", "").replace("–", "-")
        y_val = int(month_range_match.group(2))
        if y_val < 100:
            y_val += 2000
        if "apr" in m_range:
            return f"{y_val:04d}-04-01"
        elif "jul" in m_range:
            return f"{y_val:04d}-07-01"
        elif "oct" in m_range:
            return f"{y_val:04d}-10-01"
        elif "jan" in m_range:
            return f"{y_val:04d}-01-01"

    # 3. Calendar quarter format: '2020-Q1', '2020 Q1', 'Q1 2020'
    cal_q_match = re.search(r"(\d{4})[-/\s]*Q([1-4])", raw_str, re.IGNORECASE)
    if not cal_q_match:
        cal_q_match = re.search(r"Q([1-4])[-/\s]*(\d{4})", raw_str, re.IGNORECASE)
        if cal_q_match:
            q_num = int(cal_q_match.group(1))
            year = int(cal_q_match.group(2))
        else:
            q_num = None
            year = None
    else:
        year = int(cal_q_match.group(1))
        q_num = int(cal_q_match.group(2))

    if q_num is not None and year is not None:
        quarter_start_months = {1: "01", 2: "04", 3: "07", 4: "10"}
        return f"{year:04d}-{quarter_start_months[q_num]}-01"

    # 4. Standard Date Formats: DD-MM-YYYY or DD/MM/YYYY
    dmy_match = re.match(r"^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$", raw_str)
    if dmy_match:
        day, month, year = int(dmy_match.group(1)), int(dmy_match.group(2)), int(dmy_match.group(3))
        try:
            dt = datetime(year, month, day)
            return dt.strftime("%Y-%m-%d")
        except ValueError as e:
            raise ValueError(f"Invalid calendar date: {raw_str}") from e

    # Fallback to datetime.fromisoformat if applicable
    try:
        dt = datetime.fromisoformat(raw_str.replace("Z", "+00:00"))
        return dt.strftime("%Y-%m-%d")
    except Exception:
        pass

    raise ValueError(f"Unable to parse observation date format: '{raw_str}'")


def normalize_geography_name(name: Any) -> str:
    """
    Normalizes a geography name by trimming, lowercasing for lookup,
    and returning the canonical Indian metropolitan city / neighborhood name.
    """
    if name is None or (isinstance(name, float) and math.isnan(name)):
        return ""
    clean = str(name).strip()
    if not clean:
        return ""
    lower_key = clean.lower()
    if lower_key in GEOGRAPHY_ALIASES:
        return GEOGRAPHY_ALIASES[lower_key]
    # Default to Title Case
    return clean.title()


def normalize_metric_value(val: Any) -> float:
    """
    Normalizes a metric value to a float.
    Strips currency signs, commas, and whitespace.
    Raises ValueError on null, NaN, or non-numeric input.
    """
    if val is None:
        raise ValueError("Metric value is null")
    if isinstance(val, (int, float)):
        if math.isnan(val) or math.isinf(val):
            raise ValueError("Metric value is NaN or infinite")
        return float(val)

    s = str(val).strip().replace(",", "").replace("₹", "").replace("$", "")
    if not s or s.lower() in ("nan", "none", "null", "n/a", "inf", "-inf"):
        raise ValueError(f"Non-numeric metric value: '{val}'")
    try:
        f = float(s)
        if math.isnan(f) or math.isinf(f):
            raise ValueError("Metric value is NaN or infinite")
        return f
    except (ValueError, TypeError) as e:
        raise ValueError(f"Cannot convert '{val}' to numeric float") from e
