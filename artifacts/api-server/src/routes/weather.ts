import { Router, type IRouter } from "express";
import { GetWeatherQueryParams, GetWeatherForecastQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

const WTTR_BASE = "https://wttr.in";

interface WttrCurrentCondition {
  temp_C: string;
  FeelsLikeC: string;
  humidity: string;
  windspeedKmph: string;
  weatherDesc: Array<{ value: string }>;
  weatherIconUrl: Array<{ value: string }>;
  uvIndex: string;
  visibility: string;
  weatherCode: string;
  time: string;
}

interface WttrHourly {
  humidity: string;
  windspeedKmph: string;
  weatherDesc: Array<{ value: string }>;
  weatherIconUrl: Array<{ value: string }>;
  chanceofrain: string;
  time: string;
}

interface WttrWeatherDay {
  date: string;
  maxtempC: string;
  mintempC: string;
  hourly: WttrHourly[];
}

interface WttrResponse {
  current_condition: WttrCurrentCondition[];
  nearest_area: Array<{
    areaName: Array<{ value: string }>;
    country: Array<{ value: string }>;
  }>;
  weather: WttrWeatherDay[];
}

function normalizeIconUrl(url: string): string {
  if (url.startsWith("//")) return `https:${url}`;
  return url;
}

async function fetchWttr(city: string): Promise<WttrResponse> {
  const encoded = encodeURIComponent(city);
  const url = `${WTTR_BASE}/${encoded}?format=j1`;
  const res = await fetch(url, {
    headers: { "User-Agent": "weather-dashboard/1.0" },
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) {
    if (res.status === 404 || res.status === 400) {
      throw { status: 404, message: "City not found" };
    }
    throw { status: 502, message: "Weather service unavailable" };
  }

  const text = await res.text();
  if (text.includes("Unknown location")) {
    throw { status: 404, message: "City not found" };
  }

  return JSON.parse(text) as WttrResponse;
}

router.get("/weather", async (req, res): Promise<void> => {
  const parsed = GetWeatherQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "city parameter is required" });
    return;
  }

  const { city } = parsed.data;

  try {
    const data = await fetchWttr(city);
    const current = data.current_condition[0];
    const area = data.nearest_area[0];

    const timeNum = parseInt(current.time, 10);
    const isDay = timeNum >= 600 && timeNum <= 1800;

    res.json({
      city: area.areaName[0].value,
      country: area.country[0].value,
      tempC: parseFloat(current.temp_C),
      feelsLikeC: parseFloat(current.FeelsLikeC),
      humidity: parseInt(current.humidity, 10),
      windKph: parseFloat(current.windspeedKmph),
      description: current.weatherDesc[0].value,
      icon: normalizeIconUrl(current.weatherIconUrl[0].value),
      isDay,
      uvIndex: parseFloat(current.uvIndex),
      visibilityKm: parseFloat(current.visibility),
    });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e.status === 404) {
      res.status(404).json({ error: e.message ?? "City not found" });
    } else {
      req.log.error({ err }, "Failed to fetch weather");
      res.status(502).json({ error: "Failed to fetch weather data" });
    }
  }
});

router.get("/weather/forecast", async (req, res): Promise<void> => {
  const parsed = GetWeatherForecastQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "city parameter is required" });
    return;
  }

  const { city } = parsed.data;

  try {
    const data = await fetchWttr(city);
    const area = data.nearest_area[0];

    const days = data.weather.map((day) => {
      const noonHour =
        day.hourly.find((h) => parseInt(h.time, 10) >= 1200) ??
        day.hourly[Math.floor(day.hourly.length / 2)] ??
        day.hourly[0];

      const avgHumidity = Math.round(
        day.hourly.reduce((sum, h) => sum + parseInt(h.humidity, 10), 0) /
          day.hourly.length,
      );
      const maxWindKph = Math.max(
        ...day.hourly.map((h) => parseFloat(h.windspeedKmph)),
      );
      const chanceOfRain = Math.max(
        ...day.hourly.map((h) => parseInt(h.chanceofrain, 10)),
      );

      return {
        date: day.date,
        maxTempC: parseFloat(day.maxtempC),
        minTempC: parseFloat(day.mintempC),
        avgHumidity,
        maxWindKph,
        description: noonHour.weatherDesc[0].value,
        icon: normalizeIconUrl(noonHour.weatherIconUrl[0].value),
        chanceOfRain,
      };
    });

    res.json({
      city: area.areaName[0].value,
      country: area.country[0].value,
      days,
    });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e.status === 404) {
      res.status(404).json({ error: e.message ?? "City not found" });
    } else {
      req.log.error({ err }, "Failed to fetch weather forecast");
      res.status(502).json({ error: "Failed to fetch weather forecast" });
    }
  }
});

export default router;
