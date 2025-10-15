import { CloudFog, Wind } from 'lucide-react';
import type { FogAssessment } from '../utils/fog';

interface Props {
  assessment: FogAssessment | null;
}

const getColorByProbability = (value: number) => {
  if (value >= 70) return 'text-emerald-600';
  if (value >= 40) return 'text-amber-500';
  return 'text-slate-500';
};

export const ProbabilitySummary = ({ assessment }: Props) => {
  if (!assessment) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white/60 p-6 text-center text-sm text-slate-500">
        等待获取气象数据...
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-slate-600">
          <CloudFog className="h-5 w-5 text-indigo-500" />
          <span className="text-sm font-semibold">晨雾（辐射雾）概率</span>
        </div>
        <div className="mt-4 text-4xl font-bold tracking-tight">
          <span className={getColorByProbability(assessment.radiationProbability)}>
            {assessment.radiationProbability}%
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-500">
          高湿度、温度接近露点、微风及夜间冷却趋势是晨雾形成的关键。
        </p>
      </div>
      <div className="rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-slate-600">
          <Wind className="h-5 w-5 text-sky-500" />
          <span className="text-sm font-semibold">平流雾概率</span>
        </div>
        <div className="mt-4 text-4xl font-bold tracking-tight">
          <span className={getColorByProbability(assessment.advectionProbability)}>
            {assessment.advectionProbability}%
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-500">
          当湿润空气被适度风速输送至较冷地表时，平流雾更易形成。
        </p>
      </div>
      {assessment.notes.length > 0 && (
        <div className="md:col-span-2 rounded-xl border border-blue-100 bg-blue-50/70 p-4 text-sm text-slate-700">
          <h3 className="font-semibold text-blue-700">关键指标提示</h3>
          <ul className="mt-2 space-y-1">
            {assessment.notes.map((note) => (
              <li key={note} className="flex gap-2">
                <span className="text-blue-500">•</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
