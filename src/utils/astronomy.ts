const deg2rad = (deg: number) => (deg * Math.PI) / 180;
const rad2deg = (rad: number) => (rad * 180) / Math.PI;

const ZENITH = 90.833; // official sunrise/sunset

const dayOfYearFromComponents = (year: number, month: number, day: number) => {
  const start = Date.UTC(year, 0, 0);
  const current = Date.UTC(year, month, day);
  return Math.round((current - start) / 86400000);
};

const formatterParts = (
  timeZone: string,
  date: Date,
): Record<string, number> => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const parts = formatter.formatToParts(date);
  const values: Record<string, number> = {};
  for (const part of parts) {
    if (part.type !== 'literal') {
      values[part.type] = Number.parseInt(part.value, 10);
    }
  }
  return values;
};

const getTimezoneOffsetMinutes = (timeZone: string, date: Date) => {
  const values = formatterParts(timeZone, date);
  const utcTime = Date.UTC(
    values.year,
    (values.month ?? 1) - 1,
    values.day ?? 1,
    values.hour ?? 0,
    values.minute ?? 0,
    values.second ?? 0,
  );
  return (utcTime - date.getTime()) / 60000;
};

const calculateSolarDeclination = (gamma: number) =>
  0.006918 -
  0.399912 * Math.cos(gamma) +
  0.070257 * Math.sin(gamma) -
  0.006758 * Math.cos(2 * gamma) +
  0.000907 * Math.sin(2 * gamma) -
  0.002697 * Math.cos(3 * gamma) +
  0.00148 * Math.sin(3 * gamma);

const calculateEquationOfTime = (gamma: number) =>
  229.18 *
  (
    0.000075 +
    0.001868 * Math.cos(gamma) -
    0.032077 * Math.sin(gamma) -
    0.014615 * Math.cos(2 * gamma) -
    0.040849 * Math.sin(2 * gamma)
  );

const calculateSunriseForDate = (
  year: number,
  month: number,
  day: number,
  latitude: number,
  longitude: number,
  timeZone: string,
): Date | null => {
  const gamma = (2 * Math.PI) / 365 * (dayOfYearFromComponents(year, month, day) - 1);
  const eqTime = calculateEquationOfTime(gamma);
  const decl = calculateSolarDeclination(gamma);
  const latRad = deg2rad(latitude);
  const cosH =
    (Math.cos(deg2rad(ZENITH)) - Math.sin(latRad) * Math.sin(decl)) /
    (Math.cos(latRad) * Math.cos(decl));

  if (cosH > 1 || cosH < -1) {
    return null; // polar regions
  }

  const hourAngleDeg = rad2deg(Math.acos(cosH));
  const sunriseUTCMinutes = 720 - 4 * (longitude + hourAngleDeg) - eqTime;

  const middayUTC = Date.UTC(year, month, day, 12, 0, 0);
  const offsetMinutes = getTimezoneOffsetMinutes(timeZone, new Date(middayUTC));
  const localMidnightUTC = Date.UTC(year, month, day, 0, 0, 0) - offsetMinutes * 60000;
  const sunriseUTC = localMidnightUTC + sunriseUTCMinutes * 60000;

  return new Date(sunriseUTC);
};

export interface SunriseBundle {
  sunrise: Date;
  blueHourStart: Date;
  blueHourEnd: Date;
  goldenHourStart: Date;
  goldenHourEnd: Date;
}

export const buildSunriseBundle = (
  now: Date,
  latitude: number,
  longitude: number,
  timeZone: string,
): SunriseBundle | null => {
  const offsetNowMinutes = getTimezoneOffsetMinutes(timeZone, now);
  const localNow = new Date(now.getTime() + offsetNowMinutes * 60000);
  const year = localNow.getUTCFullYear();
  const month = localNow.getUTCMonth();
  const day = localNow.getUTCDate();

  let sunrise = calculateSunriseForDate(year, month, day, latitude, longitude, timeZone);

  if (!sunrise || Number.isNaN(sunrise.getTime())) {
    return null;
  }

  if (sunrise.getTime() <= now.getTime()) {
    const next = new Date(Date.UTC(year, month, day) + 86400000);
    sunrise = calculateSunriseForDate(
      next.getUTCFullYear(),
      next.getUTCMonth(),
      next.getUTCDate(),
      latitude,
      longitude,
      timeZone,
    ) ?? sunrise;
  }

  const blueHourStart = new Date(sunrise.getTime() - 30 * 60000);
  const blueHourEnd = new Date(sunrise.getTime() + 20 * 60000);
  const goldenHourStart = new Date(sunrise.getTime() - 10 * 60000);
  const goldenHourEnd = new Date(sunrise.getTime() + 60 * 60000);

  return {
    sunrise,
    blueHourStart,
    blueHourEnd,
    goldenHourStart,
    goldenHourEnd,
  };
};

export const formatTime = (date: Date, timeZone: string) =>
  new Intl.DateTimeFormat('zh-CN', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);

export const formatDateTime = (date: Date, timeZone: string) =>
  new Intl.DateTimeFormat('zh-CN', {
    timeZone,
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);

export const parseTimeInTimeZone = (isoString: string, timeZone: string): Date => {
  const [datePart, timePart = ''] = isoString.split('T');
  const [year, month, day] = datePart.split('-').map((part) => Number.parseInt(part, 10));
  const [hourStr = '0', minuteStr = '0'] = timePart.split(':');
  const hour = Number.parseInt(hourStr, 10);
  const minute = Number.parseInt(minuteStr, 10);
  const baseUTC = Date.UTC(year, month - 1, day, Number.isFinite(hour) ? hour : 0, Number.isFinite(minute) ? minute : 0);
  const offsetMinutes = getTimezoneOffsetMinutes(timeZone, new Date(baseUTC));
  return new Date(baseUTC - offsetMinutes * 60000);
};
