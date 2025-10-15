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

const toFormState = (config: LocationConfig): FormState => ({
  name: config.name,
  latitude: config.latitude.toString(),
  longitude: config.longitude.toString(),
});

export const LocationForm = ({ value, onChange }: Props) => {
  const [formState, setFormState] = useState<FormState>(() => toFormState(value));
  const [error, setError] = useState<string | null>(null);
  const [invalidFields, setInvalidFields] = useState<{ latitude: boolean; longitude: boolean }>({
    latitude: false,
    longitude: false,
  });

  const errorMessageId = 'coordinate-error';

  useEffect(() => {
    setFormState(toFormState(value));
    setError(null);
    setInvalidFields({ latitude: false, longitude: false });
  }, [value]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = formState.name.trim() || value.name;
    const latitudeValue = Number.parseFloat(formState.latitude.trim());
    const longitudeValue = Number.parseFloat(formState.longitude.trim());

    const latitudeValid = Number.isFinite(latitudeValue) && latitudeValue >= -90 && latitudeValue <= 90;
    const longitudeValid = Number.isFinite(longitudeValue) && longitudeValue >= -180 && longitudeValue <= 180;

    if (!latitudeValid || !longitudeValid) {
      setInvalidFields({ latitude: !latitudeValid, longitude: !longitudeValid });
      if (!latitudeValid && !longitudeValid) {
        setError('纬度需在 -90° 至 90° 之间，经度需在 -180° 至 180° 之间。');
      } else if (!latitudeValid) {
        setError('请输入有效的纬度（-90° 至 90°）。');
      } else {
        setError('请输入有效的经度（-180° 至 180°）。');
      }
      return;
    }

    setInvalidFields({ latitude: false, longitude: false });
    setError(null);

    onChange({
      name,
      latitude: latitudeValue,
      longitude: longitudeValue,
    });
  };

  const buttonClassName =
    'w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 ' +
    'focus:outline-none focus:ring-2 focus:ring-blue-400';

  const inputClassName = (invalid: boolean) =>
    `rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 ${
      invalid
        ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
        : 'border-slate-200 focus:border-blue-500 focus:ring-blue-200'
    }`;

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
            className={inputClassName(invalidFields.latitude)}
            value={formState.latitude}
            type="number"
            step="0.000001"
            onChange={(event) => {
              setFormState((prev) => ({ ...prev, latitude: event.target.value }));
              if (invalidFields.latitude) {
                setInvalidFields((prev) => ({ ...prev, latitude: false }));
              }
              if (error) {
                setError(null);
              }
            }}
            aria-invalid={invalidFields.latitude}
            aria-describedby={invalidFields.latitude ? errorMessageId : undefined}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-slate-500">经度（°）</span>
          <input
            className={inputClassName(invalidFields.longitude)}
            value={formState.longitude}
            type="number"
            step="0.000001"
            onChange={(event) => {
              setFormState((prev) => ({ ...prev, longitude: event.target.value }));
              if (invalidFields.longitude) {
                setInvalidFields((prev) => ({ ...prev, longitude: false }));
              }
              if (error) {
                setError(null);
              }
            }}
            aria-invalid={invalidFields.longitude}
            aria-describedby={invalidFields.longitude ? errorMessageId : undefined}
          />
        </label>
        <div className="md:col-span-3">
          <button type="submit" className={buttonClassName}>
            更新地点
          </button>
          {error && (
            <p id={errorMessageId} className="mt-2 text-xs text-rose-600">
              {error}
            </p>
          )}
        </div>
      </form>
    </div>
  );
};
