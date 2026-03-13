import React, { useMemo, useState } from "react";
import "./PerformanceCard.css";

const months = ["Oct 2021", "Nov 2021", "Dec 2021", "Jan 2022", "Feb 2022"];

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function makePath(points) {
  if (!points.length) return "";
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  return d;
}

export default function PerformanceCard({
  achieved = [2.5, 4.1, 3.4, 1.8, 4.6, 3.0, 4.2, 3.6],
  target = [1.2, 2.4, 2.7, 0.8, 2.9, 2.6, 2.3, 1.6],
}) {
  const [range, setRange] = useState("This Week");
  const [hoverIdx, setHoverIdx] = useState(null);

  const W = 560;
  const H = 220;

  const pad = { l: 42, r: 18, t: 20, b: 36 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const { achievedPts, targetPts, yTicks } = useMemo(() => {
    const all = [...achieved, ...target];
    const min = 0;
    const max = Math.max(8, Math.ceil(Math.max(...all) + 1));

    const toX = (i) => pad.l + (innerW * i) / (achieved.length - 1);
    const toY = (v) => pad.t + innerH - (innerH * (v - min)) / (max - min);

    const aPts = achieved.map((v, i) => ({ x: toX(i), y: toY(v), v }));
    const tPts = target.map((v, i) => ({ x: toX(i), y: toY(v), v }));

    const ticks = [0, 2, 4, 6, 8].filter((x) => x <= max);

    return { achievedPts: aPts, targetPts: tPts, yTicks: ticks };
  }, [achieved, target, innerW, innerH, pad.l, pad.t, pad.r, pad.b]);

  const handleMove = (e) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const mx = e.clientX - rect.left;

    const idx = clamp(
      Math.round(((mx - pad.l) / innerW) * (achieved.length - 1)),
      0,
      achieved.length - 1
    );
    setHoverIdx(idx);
  };

  const handleLeave = () => setHoverIdx(null);

  const hover = hoverIdx != null
    ? {
        idx: hoverIdx,
        ax: achievedPts[hoverIdx].x,
        ay: achievedPts[hoverIdx].y,
        av: achievedPts[hoverIdx].v,
        tx: targetPts[hoverIdx].x,
        ty: targetPts[hoverIdx].y,
        tv: targetPts[hoverIdx].v,
      }
    : null;

  return (
    <div className="pc-card">
      <div className="pc-head">
        <div className="pc-title">Performance</div>

        <select
          className="pc-select"
          value={range}
          onChange={(e) => setRange(e.target.value)}
        >
          <option>This Week</option>
          <option>This Month</option>
          <option>This Quarter</option>
        </select>
      </div>

      <div className="pc-legend">
        <div className="pc-legItem">
          <span className="pc-dot pc-dot--ach" />
          <span>Achieved</span>
        </div>
        <div className="pc-legItem">
          <span className="pc-dot pc-dot--tar" />
          <span>Target</span>
        </div>
      </div>

      <div className="pc-chartWrap">
        <svg
          className="pc-svg"
          viewBox={`0 0 ${W} ${H}`}
          onMouseMove={handleMove}
          onMouseLeave={handleLeave}
        >
          {/* Grid + Y axis labels */}
          {yTicks.map((t) => {
            const y = pad.t + innerH - (innerH * t) / 8;
            return (
              <g key={t}>
                <line
                  x1={pad.l}
                  y1={y}
                  x2={W - pad.r}
                  y2={y}
                  className="pc-grid"
                />
                <text x={18} y={y + 4} className="pc-yLabel">
                  {t}
                </text>
              </g>
            );
          })}

          {/* Lines */}
          <path d={makePath(achievedPts)} className="pc-line pc-line--ach" />
          <path d={makePath(targetPts)} className="pc-line pc-line--tar" />

          {/* Hover vertical line */}
          {hover && (
            <line
              x1={hover.ax}
              y1={pad.t}
              x2={hover.ax}
              y2={pad.t + innerH}
              className="pc-vline"
            />
          )}

          {/* Hover points */}
          {hover && (
            <>
              <circle cx={hover.ax} cy={hover.ay} r="6" className="pc-pt pc-pt--ach" />
              <circle cx={hover.tx} cy={hover.ty} r="6" className="pc-pt pc-pt--tar" />
            </>
          )}

          {/* Tooltip */}
          {hover && (
            <g className="pc-tip">
              <foreignObject
                x={clamp(hover.ax - 70, pad.l, W - pad.r - 140)}
                y={clamp(hover.ay - 74, 10, H - 100)}
                width="140"
                height="70"
              >
                <div className="pc-tipBox">
                  <div className="pc-tipRow">
                    <span className="pc-dot pc-dot--ach" />
                    <span>{Math.round(hover.av)} Projects</span>
                  </div>
                  <div className="pc-tipRow">
                    <span className="pc-dot pc-dot--tar" />
                    <span>{Math.round(hover.tv)} Projects</span>
                  </div>
                </div>
              </foreignObject>
            </g>
          )}

          {/* X labels (5 labels) */}
          {months.map((m, i) => {
            const x = pad.l + (innerW * i) / (months.length - 1);
            return (
              <text key={m} x={x} y={H - 14} textAnchor="middle" className="pc-xLabel">
                {m}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
