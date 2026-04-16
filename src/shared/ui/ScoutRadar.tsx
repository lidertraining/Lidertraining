import { cn } from '@lib/cn';

const AXES = [
  'Sonho', 'Lista', 'Produto', 'História',
  'Storytelling', 'Prospecção', 'Convite',
  'Apresentação', 'Fechamento', 'Duplicação',
];

interface ScoutRadarProps {
  values: number[];
  className?: string;
}

/**
 * Gráfico radar/spider dos 10 eixos do Scout.
 * values: array de 10 números (0-10). Renderiza como SVG.
 */
export function ScoutRadar({ values, className }: ScoutRadarProps) {
  const cx = 150;
  const cy = 150;
  const maxR = 120;
  const n = AXES.length;
  const angleStep = (2 * Math.PI) / n;
  const startAngle = -Math.PI / 2;

  const point = (i: number, r: number) => {
    const a = startAngle + i * angleStep;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };

  const gridLevels = [2, 4, 6, 8, 10];

  const dataPoints = values.map((v, i) => point(i, (Math.min(v, 10) / 10) * maxR));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <svg viewBox="0 0 300 300" className="h-64 w-64">
        {/* Grid circles */}
        {gridLevels.map((lv) => {
          const r = (lv / 10) * maxR;
          const pts = Array.from({ length: n }, (_, i) => point(i, r));
          const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';
          return (
            <path
              key={lv}
              d={path}
              fill="none"
              stroke="rgba(152,141,158,0.2)"
              strokeWidth={0.5}
            />
          );
        })}

        {/* Axis lines */}
        {Array.from({ length: n }, (_, i) => {
          const p = point(i, maxR);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={p.x}
              y2={p.y}
              stroke="rgba(152,141,158,0.15)"
              strokeWidth={0.5}
            />
          );
        })}

        {/* Data polygon */}
        <path d={dataPath} fill="rgba(110,33,141,0.25)" stroke="#edb1ff" strokeWidth={2} />

        {/* Data points */}
        {dataPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3.5} fill="#edb1ff" />
        ))}

        {/* Labels */}
        {AXES.map((label, i) => {
          const p = point(i, maxR + 22);
          return (
            <text
              key={i}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-on-3 text-[8px] font-semibold"
            >
              {label}
            </text>
          );
        })}
      </svg>

      {/* Scores list */}
      <div className="grid w-full grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
        {AXES.map((label, i) => {
          const v = values[i] ?? 0;
          return (
            <div key={i} className="flex items-center justify-between">
              <span className="text-on-3">{label}</span>
              <span className={cn('font-bold', v >= 7 ? 'text-em' : v >= 4 ? 'text-gd' : 'text-rb')}>
                {v}/10
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
