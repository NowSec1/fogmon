export const AlgorithmDetails = () => (
  <div className="space-y-6 text-sm leading-relaxed text-slate-600">
    <section className="rounded-xl border border-slate-200 bg-white/70 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-700">晨雾 / 平流雾概率模型</h2>
      <p className="mt-2">
        系统依据 Open-Meteo API 提供的温度、露点、相对湿度、风速及天气现象编码，对日出前后两小时内的逐小时气象数据进行分析：
      </p>
      <p className="mt-2 text-xs text-slate-500">
        （请求参数已将风速单位固定为 m/s，使启发式阈值如 3 m/s、5 m/s 等与实际数据保持一致。）
      </p>
      <ul className="mt-3 list-inside list-disc space-y-2">
        <li>
          <span className="font-medium text-slate-700">晨雾（辐射雾）</span> 评估强调高湿度、温度接近露点、微风以及温度下降趋势，结合天气编码触发的雾象提示。
        </li>
        <li>
          <span className="font-medium text-slate-700">平流雾</span> 评估关注湿度与露点差的饱和程度及 3-8 m/s 的适中风速，以模拟暖湿空气输送到冷地表时的凝结条件。
        </li>
        <li>
          结果以 0-100% 的概率呈现，并给出触发条件说明（如“温度与露点温差小于 2°C”）。
        </li>
      </ul>
    </section>

    <section className="rounded-xl border border-slate-200 bg-white/70 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-700">日出与摄影黄金时刻计算</h2>
      <p className="mt-2">
        依据天文算法计算真实日出时间，并扩展摄影常用时段：
      </p>
      <ol className="mt-3 list-inside list-decimal space-y-2">
        <li>根据年积日计算地球日地位置角（<span className="font-mono">γ</span>），推导太阳赤纬与时间方程。</li>
        <li>以 WGS-84 坐标推算地方时太阳时角，结合 UTC 与时区偏移得到日出 UTC 时间。</li>
        <li>在此基础上定义蓝调时刻（-30 至 +20 分钟）与金色时刻（-10 至 +60 分钟），并以交互式时间轴展示。</li>
      </ol>
      <p className="mt-2 text-xs text-slate-500">
        注：若所在地出现极昼 / 极夜，则会提示无法计算日出。
      </p>
    </section>

    <section className="rounded-xl border border-slate-200 bg-white/70 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-700">交互式可视化与云层剖面</h2>
      <ul className="mt-3 list-inside list-disc space-y-2">
        <li>时间轴支持悬停查看各时段的具体时间与说明。</li>
        <li>逐小时详情表对高湿度、微风、温差小等关键指标给予高亮提示。</li>
        <li>云层剖面图以分层面积图展示 0-2000 m、2000-6000 m、6000 m 以上云量的变化趋势。</li>
        <li>目前云层高度基于海平面，未来计划接入海拔修正与云底 / 云顶高度 API。</li>
      </ul>
    </section>

    <section className="rounded-xl border border-slate-200 bg-white/70 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-700">模型精度与局限</h2>
      <ul className="mt-3 list-inside list-disc space-y-2">
        <li>概率模型基于启发式评分，适用于摄影 / 观测的快速判断，不等同于气象部门的雾预报。</li>
        <li>未考虑地形、地表类型、实际海拔等局地影响因素。</li>
        <li>气象数据时间分辨率为 1 小时，细尺度变化（如 10-15 分钟内的突变）可能未被捕捉。</li>
        <li>未来可引入更高时空分辨率的数据源以及机器学习模型提升准确度。</li>
      </ul>
    </section>
  </div>
);
