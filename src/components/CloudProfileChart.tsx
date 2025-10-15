import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatTime } from '../utils/astronomy';

export interface CloudProfilePoint {
  time: number;
  low: number;
  mid: number;
  high: number;
}

interface Props {
  data: CloudProfilePoint[];
  timeZone: string;
}

const tooltipFormatter = (value: number) => `${value.toFixed(0)}%`;

export const CloudProfileChart = ({ data, timeZone }: Props) => (
  <div className="rounded-xl border border-slate-200 bg-white/70 p-5 shadow-sm">
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-slate-700">日出时段大气云层剖面</h3>
      <p className="text-sm text-slate-500">
        数据基于海平面高度，未来将支持海拔修正及更精细的云底高度。
      </p>
    </div>
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 16, right: 24, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="lowCloud" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#818cf8" stopOpacity={0.9} />
              <stop offset="95%" stopColor="#c7d2fe" stopOpacity={0.2} />
            </linearGradient>
            <linearGradient id="midCloud" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.9} />
              <stop offset="95%" stopColor="#bae6fd" stopOpacity={0.2} />
            </linearGradient>
            <linearGradient id="highCloud" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.9} />
              <stop offset="95%" stopColor="#e9d5ff" stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="time"
            tickFormatter={(value: number) => formatTime(new Date(value), timeZone)}
            stroke="#94a3b8"
          />
          <YAxis domain={[0, 100]} stroke="#94a3b8" tickFormatter={(value) => `${value}%`} />
          <Tooltip
            formatter={tooltipFormatter}
            labelFormatter={(value) => formatTime(new Date(value as number), timeZone)}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="low"
            name="低云 (0-2000m)"
            stroke="#6366f1"
            fill="url(#lowCloud)"
            fillOpacity={1}
          />
          <Area
            type="monotone"
            dataKey="mid"
            name="中云 (2000-6000m)"
            stroke="#0ea5e9"
            fill="url(#midCloud)"
            fillOpacity={1}
          />
          <Area
            type="monotone"
            dataKey="high"
            name="高云 (6000m+)"
            stroke="#a855f7"
            fill="url(#highCloud)"
            fillOpacity={1}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);
