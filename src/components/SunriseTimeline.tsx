import { useMemo, useState } from 'react';
import { formatTime } from '../utils/astronomy';

export interface TimelineSegment {
  id: string;
  label: string;
  start: Date;
  end: Date;
  color: string;
  description: string;
}

interface Props {
  segments: TimelineSegment[];
  sunrise: Date | null;
  timeZone: string;
}

const formatRange = (start: Date, end: Date, timeZone: string) =>
  `${formatTime(start, timeZone)} - ${formatTime(end, timeZone)}`;

export const SunriseTimeline = ({ segments, sunrise, timeZone }: Props) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const timeline = useMemo(() => {
    if (!segments.length) return null;
    const sorted = [...segments].sort((a, b) => a.start.getTime() - b.start.getTime());
    const start = sorted[0].start.getTime();
    const end = sorted[sorted.length - 1].end.getTime();
    const total = Math.max(end - start, 1);
    return {
      sorted,
      start,
      total,
    };
  }, [segments]);

  if (!timeline) {
    return null;
  }

  const activeSegment = timeline.sorted.find((segment) => segment.id === hoveredId) ?? timeline.sorted[0];

  return (
    <div className="rounded-xl border border-slate-200 bg-white/70 p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold text-slate-700">日出摄影时段</h3>
          <p className="text-sm text-slate-500">鼠标悬停查看蓝调时刻、金色时刻等关键时间段。</p>
        </div>
        {sunrise && (
          <div className="rounded-lg bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
            日出 {formatTime(sunrise, timeZone)}
          </div>
        )}
      </div>
      <div className="relative mt-6 h-12 rounded-full bg-slate-100">
        {timeline.sorted.map((segment) => {
          const width = ((segment.end.getTime() - segment.start.getTime()) / timeline.total) * 100;
          const left = ((segment.start.getTime() - timeline.start) / timeline.total) * 100;
          return (
            <div
              key={segment.id}
              className={`absolute top-0 h-full rounded-full transition-transform ${segment.color}`}
              style={{ width: `${width}%`, left: `${left}%` }}
              onMouseEnter={() => setHoveredId(segment.id)}
            />
          );
        })}
        {sunrise && (
          <div
            className="absolute top-0 h-full w-0.5 bg-amber-500"
            style={{ left: `${((sunrise.getTime() - timeline.start) / timeline.total) * 100}%` }}
          />
        )}
      </div>
      {activeSegment && (
        <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="font-semibold text-slate-700">{activeSegment.label}</div>
            <div>{formatRange(activeSegment.start, activeSegment.end, timeZone)}</div>
          </div>
          <p className="mt-2 leading-relaxed">{activeSegment.description}</p>
        </div>
      )}
    </div>
  );
};
