import type { HourlyWeatherPoint } from '../types';
import { describeWeatherCode, isFogCode } from '../utils/weatherCodes';
import { formatDateTime } from '../utils/astronomy';

interface Props {
  records: HourlyWeatherPoint[];
  timeZone: string;
}

const highlightClass = (condition: boolean, base = '') =>
  condition ? `${base} bg-emerald-50 text-emerald-700 font-semibold` : base;

export const WeatherDetailsTable = ({ records, timeZone }: Props) => (
  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white/70 shadow-sm">
    <table className="min-w-full divide-y divide-slate-200 text-sm">
      <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
        <tr>
          <th className="px-4 py-3">时间</th>
          <th className="px-4 py-3">气温 (°C)</th>
          <th className="px-4 py-3">相对湿度 (%)</th>
          <th className="px-4 py-3">露点 (°C)</th>
          <th className="px-4 py-3">温差 (°C)</th>
          <th className="px-4 py-3">风速 (m/s)</th>
          <th className="px-4 py-3">总云量 (%)</th>
          <th className="px-4 py-3">低云</th>
          <th className="px-4 py-3">中云</th>
          <th className="px-4 py-3">高云</th>
          <th className="px-4 py-3">天气现象</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {records.map((record) => {
          const spread = record.temperature - record.dewPoint;
          return (
            <tr key={record.time} className="hover:bg-slate-50/70">
              <td className="px-4 py-3 text-slate-600">{formatDateTime(new Date(record.time), timeZone)}</td>
              <td className="px-4 py-3 text-slate-700">{record.temperature.toFixed(1)}</td>
              <td className={`px-4 py-3 ${highlightClass(record.relativeHumidity >= 90, 'text-slate-700')}`}>
                {record.relativeHumidity.toFixed(0)}
              </td>
              <td className="px-4 py-3 text-slate-700">{record.dewPoint.toFixed(1)}</td>
              <td className={`px-4 py-3 ${highlightClass(spread <= 2, 'text-slate-700')}`}>{spread.toFixed(1)}</td>
              <td className={`px-4 py-3 ${highlightClass(record.windSpeed <= 3, 'text-slate-700')}`}>
                {record.windSpeed.toFixed(1)}
              </td>
              <td className="px-4 py-3 text-slate-700">{record.cloudCover.toFixed(0)}</td>
              <td className={`px-4 py-3 ${highlightClass(record.lowCloudCover >= 70)}`}>{record.lowCloudCover.toFixed(0)}</td>
              <td className="px-4 py-3 text-slate-700">{record.midCloudCover.toFixed(0)}</td>
              <td className="px-4 py-3 text-slate-700">{record.highCloudCover.toFixed(0)}</td>
              <td className={`px-4 py-3 ${isFogCode(record.weatherCode) ? 'text-amber-600 font-semibold' : 'text-slate-600'}`}>
                {describeWeatherCode(record.weatherCode)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);
