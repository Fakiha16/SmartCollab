import React, { useMemo } from "react";

export default function Sparkline({ points = [] }) {
  const { d, fillD } = useMemo(() => {
    if (!points.length) return { d: "", fillD: "" };

    const w = 420;
    const h = 140;
    const pad = 10;

    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;

    const xStep = (w - pad * 2) / (points.length - 1);

    const xy = points.map((p, i) => {
      const x = pad + i * xStep;
      const y = pad + (h - pad * 2) * (1 - (p - min) / range);
      return { x, y };
    });

    const path = `M ${xy[0].x} ${xy[0].y} ` + xy.slice(1).map((p) => `L ${p.x} ${p.y}`).join(" ");
    const fill = `${path} L ${xy[xy.length - 1].x} ${h - pad} L ${xy[0].x} ${h - pad} Z`;

    return { d: path, fillD: fill };
  }, [points]);

  return (
    <svg className="sc-spark" viewBox="0 0 420 140" role="img" aria-label="Sparkline">
      <path d={fillD} className="sc-sparkFill" />
      <path d={d} className="sc-sparkLine" />
    </svg>
  );
}
