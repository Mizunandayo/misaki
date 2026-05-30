"use client";

import { motion } from "framer-motion";





interface Props {
  score: number;           // 0–100
  industryAvg: number;
  grade: string;
  animated?: boolean;
}






function scoreToAngle(score: number): number {
  // Arc from -140deg to +140deg (280deg total sweep)
  return -140 + (score / 100) * 280;
}

export function ReadinessGauge({ score, industryAvg, grade, animated = true }: Props) {
  const R = 80;
  const cx = 100;
  const cy = 100;
  const startAngle = -140;
  const endAngle = 140;
  const sweepAngle = endAngle - startAngle;

  function polarToXY(angleDeg: number, r: number) {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  }

  function arcPath(fromDeg: number, toDeg: number, r: number) {
    const s = polarToXY(fromDeg, r);
    const e = polarToXY(toDeg, r);
    const large = toDeg - fromDeg > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
  }

  const scoreAngle = scoreToAngle(score);
  const avgAngle = scoreToAngle(industryAvg);

  const gradeColor =
    grade === "A"
      ? "#22c55e"
      : grade === "B"
        ? "#84cc16"
        : grade === "C"
          ? "#f59e0b"
          : grade === "D"
            ? "#f97316"
            : "#ef4444";

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 160" className="w-full max-w-[220px]">
        {/* Background track */}
        <path
          d={arcPath(startAngle, endAngle, R)}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="14"
          strokeLinecap="round"
        />

        {/* Score arc */}
        <motion.path
          d={arcPath(startAngle, scoreAngle, R)}
          fill="none"
          stroke="white"
          strokeWidth="14"
          strokeLinecap="round"
          initial={animated ? { pathLength: 0 } : { pathLength: 1 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        />

        {/* Industry average marker */}
        {(() => {
          const p = polarToXY(avgAngle, R);
          return (
            <circle
              cx={p.x}
              cy={p.y}
              r="5"
              fill="none"
              stroke="rgba(255,255,255,0.45)"
              strokeWidth="2"
            />
          );
        })()}

        {/* Center content */}
        <text
          x={cx}
          y={cy - 6}
          textAnchor="middle"
          fill="white"
          fontSize="36"
          fontWeight="900"
          fontFamily="Poppins, sans-serif"
        >
          {score}
        </text>
        <text
          x={cx}
          y={cy + 16}
          textAnchor="middle"
          fill="rgba(255,255,255,0.45)"
          fontSize="12"
          fontFamily="Poppins, sans-serif"
        >
          / 100
        </text>
        <text
          x={cx}
          y={cy + 34}
          textAnchor="middle"
          fill={gradeColor}
          fontSize="14"
          fontWeight="700"
          fontFamily="Poppins, sans-serif"
        >
          Grade {grade}
        </text>
      </svg>

      <div className="mt-1 text-[13px] text-white/40">
        Industry avg: <span className="text-white/65 font-medium">{industryAvg}%</span>
        &nbsp;·&nbsp;
        {score >= industryAvg
          ? <span className="text-emerald-400 font-medium">Above average</span>
          : <span className="text-amber-400 font-medium">Below average</span>
        }
      </div>
    </div>
  );
}
