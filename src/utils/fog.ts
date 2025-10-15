import type { HourlyWeatherPoint } from '../types';
import { isFogCode } from './weatherCodes';

const clamp = (value: number, min = 0, max = 1) => Math.min(Math.max(value, min), max);

const average = (values: number[]) => (values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : 0);

export interface FogAssessment {
  radiationProbability: number;
  advectionProbability: number;
  notes: string[];
}

export const assessFogRisk = (records: HourlyWeatherPoint[]): FogAssessment => {
  if (!records.length) {
    return { radiationProbability: 0, advectionProbability: 0, notes: [] };
  }

  const humidities = records.map((r) => r.relativeHumidity);
  const windSpeeds = records.map((r) => r.windSpeed);
  const spreads = records.map((r) => r.temperature - r.dewPoint);
  const fogIndicators = records.some((r) => isFogCode(r.weatherCode));

  const avgHumidity = average(humidities);
  const avgWind = average(windSpeeds);
  const avgSpread = average(spreads);

  const humidityScore = clamp((avgHumidity - 80) / 20); // >80% boosts score
  const spreadScore = clamp((3 - avgSpread) / 3); // spread <3°C ideal
  const calmWindScore = clamp(1 - avgWind / 4); // calm winds favour辐射雾
  const moderateWindScore = clamp(1 - Math.abs(avgWind - 5) / 5); // 3-8 m/s ideal for平流雾

  const trend = records[records.length - 1].temperature - records[0].temperature;
  const coolingScore = trend < 0 ? clamp(-trend / 4) : 0;

  let radiation = 0.35 * humidityScore + 0.35 * spreadScore + 0.2 * calmWindScore + 0.1 * coolingScore;
  if (fogIndicators) {
    radiation += 0.1;
  }

  let advection = 0.4 * humidityScore + 0.4 * spreadScore + 0.2 * moderateWindScore;
  if (avgWind >= 3 && avgWind <= 8 && fogIndicators) {
    advection += 0.1;
  }

  const notes: string[] = [];
  if (avgHumidity >= 90) {
    notes.push('相对湿度在 90% 以上，极易形成雾。');
  } else if (avgHumidity >= 85) {
    notes.push('相对湿度保持在 85% 以上，雾霾条件充足。');
  }

  if (avgSpread <= 2) {
    notes.push('温度与露点温差小于 2°C，空气近乎饱和。');
  }

  if (avgWind <= 3) {
    notes.push('地面风速小于 3 m/s，利于近地层冷却。');
  } else if (avgWind >= 3 && avgWind <= 8) {
    notes.push('风速在 3-8 m/s 之间，利于湿润空气平流。');
  }

  if (trend < 0) {
    notes.push(`温度在观测窗口内下降了 ${Math.abs(trend).toFixed(1)}°C。`);
  }

  if (fogIndicators) {
    notes.push('天气现象编码提示存在雾或霜雾。');
  }

  return {
    radiationProbability: Math.round(clamp(radiation) * 100),
    advectionProbability: Math.round(clamp(advection) * 100),
    notes,
  };
};
