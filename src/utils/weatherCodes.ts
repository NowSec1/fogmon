const WEATHER_CODE_MAP: Record<number, string> = {
  0: '晴朗',
  1: '以晴为主',
  2: '多云',
  3: '阴天',
  45: '雾',
  48: '霜雾',
  51: '毛毛雨：轻',
  53: '毛毛雨：中',
  55: '毛毛雨：强',
  56: '冻雨毛毛雨：轻',
  57: '冻雨毛毛雨：强',
  61: '小雨',
  63: '中雨',
  65: '大雨',
  66: '冻雨：小',
  67: '冻雨：大',
  71: '小雪',
  73: '中雪',
  75: '大雪',
  80: '阵雨：小',
  81: '阵雨：中',
  82: '阵雨：大',
  85: '阵雪：小',
  86: '阵雪：大',
  95: '雷阵雨：轻',
  96: '雷阵雨伴小冰雹',
  99: '雷阵雨伴大冰雹',
};

export const describeWeatherCode = (code: number) => WEATHER_CODE_MAP[code] ?? '未知天气';

export const isFogCode = (code: number) => code === 45 || code === 48;
