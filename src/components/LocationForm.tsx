import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import type { LocationConfig } from '../types';

interface Props {
  value: LocationConfig;
  onChange: (value: LocationConfig) => void;
}

interface FormState {
  name: string;
  latitude: string;
  longitude: string;
}

const parseNumber = (value: string, fallback: number) => {
  const parsed = Number.parseFloat(value.trim());
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toFormState = (config: LocationConfig): FormState => ({
  name: config.name,
  latitude: config.latitude.toString(),
  longitude: config.longitude.toString(),
});

export const LocationForm = ({ value, onChange }: Props) => {
  const [formState, setFormState] = useState<FormState>(() => toFormState(value));

  useEffect(() => {
    setFormState(toFormState(value));
  }, [value]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = formState.name.trim() || value.name;
    onChange({
      name,
      latitude: parseNumber(formState.latitude, value.latitude),
      longitude: parseNumber(formState.longitude, value.longitude),
    });
  };

  const buttonClassName =
    'w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 ' +
    'focus:outline-none focus:ring-2 focus:ring-blue-400';

  return (
    <div className="rounded-xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur">
      <div className="mb-4 flex items-center gap-2 text-slate-700">
        <MapPin className="h-5 w-5 text-blue-500" />
        <div>
          <h2 className="text-lg font-semibold">监测地点</h2>
          <p className="text-sm text-slate-500">请使用 WGS-84 坐标系填写经纬度。</p>
        </div>
      </div>
      <form className="grid gap-4 md:grid-cols-3" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-slate-500">地点名称</span>
          <input
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            value={formState.name}
            onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="例如：西安丈八一路"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-slate-500">纬度（°）</span>
          <input
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            value={formState.latitude}
            type="number"
            step="0.000001"
            onChange={(event) => setFormState((prev) => ({ ...prev, latitude: event.target.value }))}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-slate-500">经度（°）</span>
          <input
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            value={formState.longitude}
            type="number"
            step="0.000001"
            onChange={(event) => setFormState((prev) => ({ ...prev, longitude: event.target.value }))}
          />
        </label>
        <div className="md:col-span-3">
          <button type="submit" className={buttonClassName}>
            更新地点
          </button>
        </div>
      </form>
    </div>
  );
};
