export interface HourlyUnits {
  time: string;
  temperature_2m: string;
}

export interface HourlyRawData {
  time: string[];
  temperature_2m: number[];
}

export interface WeatherApiResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  hourly_units: HourlyUnits;
  hourly: HourlyRawData;
}

export interface HourlyWeatherItem {
  time: string;
  temperature_2m: number;
  formattedDate: string;
  formattedTime: string;
}

export interface WeatherForecastData {
  latitude: number;
  longitude: number;
  timezone: string;
  elevation: number;
  temperatureUnit: string;
  items: HourlyWeatherItem[];
}
