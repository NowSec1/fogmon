import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CloudSun, Info, Loader2, RefreshCcw } from 'lucide-react';
import { LocationForm } from './components/LocationForm';
import { ProbabilitySummary } from './components/ProbabilitySummary';
import { SunriseTimeline } from './components/SunriseTimeline';
import type { TimelineSegment } from './components/SunriseTimeline';
import { WeatherDetailsTable } from './components/WeatherDetailsTable';
import { CloudProfileChart } from './components/CloudProfileChart';
import type { CloudProfilePoint } from './components/CloudProfileChart';
import { AlgorithmDetails } from './components/AlgorithmDetails';
import { useLocalStorage } from './hooks/useLocalStorage';
import { assessFogRisk } from './utils/fog';
import type { FogAssessment } from './utils/fog';
import { buildSunriseBundle, formatDateTime, parseTimeInTimeZone } from './utils/astronomy';
import type { SunriseBundle } from './utils/astronomy';
import type { HourlyWeatherPoint, LocationConfig, WeatherApiResponse } from './types';

const defaultLocation: LocationConfig = {
  name: '西安丈八一路',
  latitude: 34.207013,
  longitude: 108.860019,
};

type TabKey = 'dashboard' | 'algorithm';

const tabButtonClass = (active: boolean) =>
  `rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
    active ? 'bg-blue-600 text-white shadow' : 'bg-white/60 text-slate-600 hover:bg-white'
  }`;

const fetchWeatherData = async (
  location: LocationConfig,
  signal: AbortSignal,
): Promise<{
  records: HourlyWeatherPoint[];
  meta: { timeZone: string };
}> => {
  const params = new URLSearchParams({
    latitude: location.latitude.toString(),
    longitude: location.longitude.toString(),
    timezone: 'auto',
    windspeed_unit: 'ms',
    forecast_days: '3',
    past_days: '1',
    hourly:
      'temperature_2m,relative_humidity_2m,dew_point_2m,windspeed_10m,weathercode,cloudcover,cloudcover_low,cloudcover_mid,cloudcover_high',
  });

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`, {
    signal,
  });

  if (!response.ok) {
    throw new Error('无法获取气象数据，请稍后再试。');
  }

  const data = (await response.json()) as WeatherApiResponse;
  const records: HourlyWeatherPoint[] = data.hourly.time.map((time, index) => ({
    time,
    timestamp: parseTimeInTimeZone(time, data.timezone).getTime(),
    temperature: data.hourly.temperature_2m[index],
    relativeHumidity: data.hourly.relative_humidity_2m[index],
    dewPoint: data.hourly.dew_point_2m[index],
    windSpeed: data.hourly.windspeed_10m[index],
    weatherCode: data.hourly.weathercode[index],
    cloudCover: data.hourly.cloudcover[index],
    lowCloudCover: data.hourly.cloudcover_low[index],
    midCloudCover: data.hourly.cloudcover_mid[index],
    highCloudCover: data.hourly.cloudcover_high[index],
  }));

  return {
    records,
    meta: {
      timeZone: data.timezone,
    },
  };
};

function App() {
  const [location, setLocation] = useLocalStorage<LocationConfig>('fogmon-location', defaultLocation);
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [weatherRecords, setWeatherRecords] = useState<HourlyWeatherPoint[]>([]);
  const [timeZone, setTimeZone] = useState<string>('UTC');
  const [sunriseBundle, setSunriseBundle] = useState<SunriseBundle | null>(null);
  const [fogAssessment, setFogAssessment] = useState<FogAssessment | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      setStatus('loading');
      setError(null);
      try {
        const { records, meta } = await fetchWeatherData(location, controller.signal);
        setWeatherRecords(records);
        setTimeZone(meta.timeZone);
        const bundle = buildSunriseBundle(new Date(), location.latitude, location.longitude, meta.timeZone);
        setSunriseBundle(bundle);
        setLastUpdated(new Date());
        setStatus('idle');
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          return;
        }
        setStatus('error');
        setError((err as Error).message || '请求失败，请检查网络。');
      }
    };

    load();

    return () => controller.abort();
  }, [location, refreshKey]);

  const observationRecords = useMemo(() => {
    if (sunriseBundle) {
      const windowStart = sunriseBundle.sunrise.getTime() - 2 * 3600 * 1000;
      const windowEnd = sunriseBundle.sunrise.getTime() + 2 * 3600 * 1000;
      const selected = weatherRecords.filter(
        (record) => record.timestamp >= windowStart && record.timestamp <= windowEnd,
      );
      if (selected.length) {
        return selected;
      }
    }
    return weatherRecords.slice(0, 5);
  }, [weatherRecords, sunriseBundle]);

  useEffect(() => {
    if (observationRecords.length) {
      setFogAssessment(assessFogRisk(observationRecords));
    } else {
      setFogAssessment(null);
    }
  }, [observationRecords]);

  const cloudProfileData = useMemo<CloudProfilePoint[]>(() => {
    if (!sunriseBundle) return [];
    const start = sunriseBundle.sunrise.getTime() - 60 * 60 * 1000;
    const end = sunriseBundle.sunrise.getTime() + 60 * 60 * 1000;
    return weatherRecords
      .filter((record) => record.timestamp >= start && record.timestamp <= end)
      .map((record) => ({
        time: record.timestamp,
        low: record.lowCloudCover,
        mid: record.midCloudCover,
        high: record.highCloudCover,
      }));
  }, [weatherRecords, sunriseBundle]);

  const timelineSegments = useMemo<TimelineSegment[]>(() => {
    if (!sunriseBundle) return [];
    const sunrise = sunriseBundle.sunrise.getTime();
    return [
      {
        id: 'predawn',
        label: '前置准备（-120 至 -30 分钟）',
        start: new Date(sunrise - 120 * 60 * 1000),
        end: new Date(sunrise - 30 * 60 * 1000),
        color: 'bg-gradient-to-r from-slate-200 via-slate-100 to-slate-50',
        description: '检查设备、评估能见度变化，观察湿度与风速是否符合晨雾标准。',
      },
      {
        id: 'blue-hour',
        label: '蓝调时刻',
        start: sunriseBundle.blueHourStart,
        end: sunriseBundle.blueHourEnd,
        color: 'bg-gradient-to-r from-indigo-300 via-indigo-200 to-indigo-100',
        description: '天空冷暖对比最强烈，适合拍摄剪影及城市灯光与晨雾的层次。',
      },
      {
        id: 'golden-hour',
        label: '金色时刻',
        start: sunriseBundle.goldenHourStart,
        end: sunriseBundle.goldenHourEnd,
        color: 'bg-gradient-to-r from-amber-300 via-amber-200 to-amber-100',
        description: '太阳低角度穿透雾层，形成暖色调与体积光，是拍摄雾凇与逆光景观的黄金时间。',
      },
      {
        id: 'post',
        label: '日出后延展',
        start: sunriseBundle.goldenHourEnd,
        end: new Date(sunrise + 120 * 60 * 1000),
        color: 'bg-gradient-to-r from-slate-100 via-slate-50 to-white',
        description: '跟踪雾层消散、云量变化以及天空亮度，判断是否需要二次补拍。',
      },
    ];
  }, [sunriseBundle]);

  const handleRefresh = () => {
    setRefreshKey((key) => key + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
          <div className="flex items-center gap-3">
            <CloudSun className="h-10 w-10 text-amber-500" />
            <div>
              <h1 className="text-2xl font-bold text-slate-800">晨雾监测系统</h1>
              <p className="text-sm text-slate-500">
                基于 Open-Meteo 数据与天文算法的晨雾 / 平流雾概率分析平台。
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <div className="rounded-lg bg-slate-100 px-3 py-1 text-xs text-slate-500">
                上次更新：{formatDateTime(lastUpdated, timeZone)}
              </div>
            )}
            <button
              type="button"
              onClick={handleRefresh}
              disabled={status === 'loading'}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCcw className={`h-4 w-4 ${status === 'loading' ? 'animate-spin' : ''}`} />
              刷新数据
            </button>
            <nav className="flex gap-2">
              <button type="button" className={tabButtonClass(activeTab === 'dashboard')} onClick={() => setActiveTab('dashboard')}>
                数据面板
              </button>
              <button type="button" className={tabButtonClass(activeTab === 'algorithm')} onClick={() => setActiveTab('algorithm')}>
                算法模型
              </button>
            </nav>
          </div>
        </header>

        {status === 'error' && error && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <p>{error}</p>
              <p className="mt-1 text-xs">请检查网络连接，或稍后使用刷新按钮重新尝试。</p>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' ? (
          <main className="mt-8 space-y-8">
            <LocationForm value={location} onChange={setLocation} />

            <section className="grid gap-6 lg:grid-cols-5">
              <div className="lg:col-span-3">
                <ProbabilitySummary assessment={fogAssessment} />
              </div>
              <div className="lg:col-span-2 rounded-xl border border-blue-100 bg-blue-50/70 p-5 shadow-sm">
                <div className="flex items-center gap-2 text-blue-700">
                  <Info className="h-5 w-5" />
                  <h3 className="text-sm font-semibold">数据来源与提示</h3>
                </div>
                <ul className="mt-3 space-y-2 text-xs text-slate-600">
                  <li>气象数据：Open-Meteo Forecast API（1 小时分辨率）。</li>
                  <li>坐标系：WGS-84，经纬度默认使用小数形式。</li>
                  <li>云层高度按海平面计算，未考虑实际海拔（未来版本将加入修正）。</li>
                  <li>若需要更精确的云底 / 云顶高度，可接入第三方专业 API。</li>
                </ul>
              </div>
            </section>

            {sunriseBundle ? (
              <SunriseTimeline segments={timelineSegments} sunrise={sunriseBundle.sunrise} timeZone={timeZone} />
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-700">
                当前纬度可能处于极昼 / 极夜，无法计算日出时间。
              </div>
            )}

            {cloudProfileData.length > 0 && <CloudProfileChart data={cloudProfileData} timeZone={timeZone} />}

            {observationRecords.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-700">日出前后 2 小时内逐小时气象数据</h2>
                <WeatherDetailsTable records={observationRecords} timeZone={timeZone} />
              </div>
            )}
          </main>
        ) : (
          <main className="mt-8">
            <AlgorithmDetails />
          </main>
        )}

        {status === 'loading' && (
          <div className="fixed inset-0 flex items-center justify-center bg-slate-900/10 backdrop-blur-sm">
            <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm text-slate-600 shadow">
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              正在获取最新天气数据...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
