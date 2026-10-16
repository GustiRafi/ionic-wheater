import type { WeatherApiResponse, WeatherForecastData, HourlyWeatherItem } from '@/types/weather';

export const OPEN_METEO_API_URL =
  'https://api.open-meteo.com/v1/forecast?latitude=-6.2&longitude=106.8&hourly=temperature_2m';

export const formatDate = (isoString: string): { formattedDate: string; formattedTime: string } => {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      return { formattedDate: isoString, formattedTime: '' };
    }

    const formattedDate = date.toLocaleDateString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const formattedTime = date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    return { formattedDate, formattedTime };
  } catch {
    return { formattedDate: isoString, formattedTime: '' };
  }
};

export async function fetchWeatherForecast(): Promise<WeatherForecastData> {
  const response = await fetch(OPEN_METEO_API_URL);

  if (!response.ok) {
    throw new Error(`Gagal memuat data cuaca: HTTP status ${response.status} (${response.statusText})`);
  }

  const data: WeatherApiResponse = await response.json();

  const times = data.hourly?.time || [];
  const temperatures = data.hourly?.temperature_2m || [];

  const items: HourlyWeatherItem[] = times.map((timeStr, idx) => {
    const { formattedDate, formattedTime } = formatDate(timeStr);
    return {
      time: timeStr,
      temperature_2m: temperatures[idx],
      formattedDate,
      formattedTime,
    };
  });

  return {
    latitude: data.latitude,
    longitude: data.longitude,
    timezone: data.timezone,
    elevation: data.elevation,
    temperatureUnit: data.hourly_units?.temperature_2m || '°C',
    items,
  };
}
