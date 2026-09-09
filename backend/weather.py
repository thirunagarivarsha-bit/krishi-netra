"""
KRISHI-NETRA Weather Context Engine
Free weather intelligence using Open-Meteo.
No API key required.
"""

from typing import Any, Dict
import httpx


OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"


def get_weather_context(latitude: float, longitude: float) -> Dict[str, Any]:
    """
    Fetch current weather + short forecast for a field location.

    Returns a normalized dictionary that the KRISHI-NETRA
    Context/Rule Engine can consume.
    """

    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": (
            "temperature_2m,"
            "relative_humidity_2m,"
            "precipitation,"
            "rain,"
            "weather_code"
        ),
        "hourly": (
            "temperature_2m,"
            "relative_humidity_2m,"
            "precipitation_probability,"
            "precipitation"
        ),
        "forecast_days": 7,
        "timezone": "auto",
    }

    try:
        response = httpx.get(
            OPEN_METEO_URL,
            params=params,
            timeout=10.0,
        )
        response.raise_for_status()

        data = response.json()

        current = data.get("current", {})
        hourly = data.get("hourly", {})

        precipitation_probability = hourly.get(
            "precipitation_probability", []
        )

        precipitation = hourly.get(
            "precipitation", []
        )

        # Next 24 hours
        next_24_rain_probability = precipitation_probability[:24]
        next_24_precipitation = precipitation[:24]

        max_rain_probability = (
            max(next_24_rain_probability)
            if next_24_rain_probability
            else 0
        )

        rainfall_next_24h_mm = round(
            sum(next_24_precipitation),
            2,
        )

        humidity = float(
            current.get("relative_humidity_2m", 0)
        )

        temperature = float(
            current.get("temperature_2m", 0)
        )

        return {
            "available": True,
            "source": "Open-Meteo",
            "latitude": latitude,
            "longitude": longitude,

            "temperature_c": temperature,
            "humidity_percent": humidity,

            "current_rain_mm": float(
                current.get("rain", 0) or 0
            ),

            "current_precipitation_mm": float(
                current.get("precipitation", 0) or 0
            ),

            "rain_probability_24h_percent": max_rain_probability,
            "rainfall_next_24h_mm": rainfall_next_24h_mm,

            "weather_code": current.get(
                "weather_code"
            ),

            "humidity_risk": (
                "high" if humidity >= 80
                else "moderate" if humidity >= 65
                else "low"
            ),

            "rain_risk": (
                "high" if max_rain_probability >= 70
                else "moderate" if max_rain_probability >= 40
                else "low"
            ),

            "raw": data,
        }

    except Exception as exc:
        return {
            "available": False,
            "source": "Open-Meteo",
            "latitude": latitude,
            "longitude": longitude,
            "error": str(exc),
        }