export interface HourlyWeatherPoint {
  time: string;
  temperature: number;
  relativeHumidity: number;
  dewPoint: number;
  windSpeed: number;
  weatherCode: number;
  cloudCover: number;
  lowCloudCover: number;
  midCloudCover: number;
  highCloudCover: number;
}

export interface WeatherApiResponse {
  timezone: string;
  timezone_abbreviation: string;
  utc_offset_seconds: number;
  hourly: {
    time: string[];
    temperature_2m: number[];
    relative_humidity_2m: number[];
    dew_point_2m: number[];
    windspeed_10m: number[];
    weathercode: number[];
    cloudcover: number[];
    cloudcover_low: number[];
    cloudcover_mid: number[];
    cloudcover_high: number[];
  };
}

export interface LocationConfig {
  name: string;
  latitude: number;
  longitude: number;
}
