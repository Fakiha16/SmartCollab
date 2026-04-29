import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./PerformanceReport.css";

const months = ["Oct 2021","Nov 2021","Dec 2021","Jan 2022","Feb 2022","Mar 2022","Apr 2022","May 2022","Jun 2022","Jul 2022","Aug 2022"];

function makePath(points) {
  return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
}

const STATUS_STYLE = {
  "In Progress": { bg: "#fef9c3", color: "#b45309" },
  "Completed":   { bg: "#dcfce7", color: "#16a34a" },
  "Not Started": { bg: "#f3f4f6", color: "#6b7280" },
};

export default function PerformanceReport() {
  const navigate  = useNavigate();
  const { id }    = useParams();

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`http://localhost:5000/api/projects/${id}/performance`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const perf = data?.performance || {};

  const W = 680, H = 220;
  const pad = { l: 48, r: 20, t: 20, b: 36 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const achieved = perf.chartData?.achieved || [2,3,3.5,4,5,6,7,8,9,9.5,9.8];
  const target   = perf.chartData?.target   || [1,2,2.5,3,4,5,6,7,8,8.5,9];

  const { aPts, tPts, yTicks } = useMemo(() => {
    const max = Math.max(12, Math.ceil(Math.max(...achieved, ...target) + 2));
    const toX = (i) => pad.l + (innerW * i) / (achieved.length - 1);
    const toY = (v) => pad.t + innerH - (innerH * v) / max;
    const ticks = [0, 20, 40, 60, 80, 100, 120].filter(x => x <= max * 10);
    return {
      aPts: achieved.map((v, i) => ({ x: toX(i), y: toY(v) })),
      tPts: target.map((v, i)   => ({ x: toX(i), y: toY(v) })),
      yTicks: [0, 2, 4, 6, 8, 10, 12].filter(x => x <= max),
    };
  }, [achieved, target, innerW, innerH]);

  const stStyle = (s) => STATUS_STYLE[s] || STATUS_STYLE["Not Started"];

  if (loading) return <div className="pr-loading">Loading performance report…</div>;

  return (
    <div className="prr-wrap">
      {/* Header */}
      <div className="prr-header">
        <button className="prr-backBtn" onClick={() => navigate(-1)} type="button">←</button>
        <h1 className="prr-title">Performance Report</h1>
        {data?.title && <span className="prr-projectName">{data.title}</span>}
      </div>

      {/* Chart card */}
      <div className="prr-chartCard">
        <div className="prr-chartTop">
          <button className="prr-viewDetails" type="button">View Details</button>
        </div>

        <svg className="prr-svg" viewBox={`0 0 ${W} ${H}`}>
          {/* Y grid + labels */}
          {yTicks.map((t) => {
            const y = pad.t + innerH - (innerH * t) / 12;
            return (
              <g key={t}>
                <line x1={pad.l} y1={y} x2={W - pad.r} y2={y} className="prr-grid" />
                <text x={10} y={y + 4} className="prr-yLabel">{t * 10}%</text>
              </g>
            );
          })}

          {/* Achieved line */}
          <path d={makePath(aPts)} className="prr-line prr-line--ach" />

          {/* X labels */}
          {months.slice(0, achieved.length).map((m, i) => {
            const x = pad.l + (innerW * i) / (achieved.length - 1);
            return (
              <text key={m} x={x} y={H - 8} textAnchor="middle" className="prr-xLabel">
                {m}
              </text>
            );
          })}
        </svg>

        {/* Stats table */}
        <div className="prr-table">
          {/* Frontend */}
          <div className="prr-col">
            <div className="prr-colLabel">Frontend</div>
            <span className="prr-tag" style={stStyle(perf.frontend?.status)}>
              {perf.frontend?.status || "Not Started"}
            </span>
            <div className="prr-progressBar">
              <div
                className="prr-progressFill"
                style={{ width: `${perf.frontend?.progress || 0}%` }}
              />
            </div>
            <div className="prr-percent">{perf.frontend?.progress || 0}%</div>
          </div>

          <div className="prr-dividerV" />

          {/* Backend */}
          <div className="prr-col">
            <div className="prr-colLabel">Backend</div>
            <span className="prr-tag" style={stStyle(perf.backend?.status)}>
              {perf.backend?.status || "Not Started"}
            </span>
          </div>

          <div className="prr-dividerV" />

          {/* Testing */}
          <div className="prr-col">
            <div className="prr-colLabel">Testing</div>
            <div className="prr-naText">{perf.testing?.status || "Not Started"}</div>
          </div>

          <div className="prr-dividerV" />

          {/* Deadline */}
          <div className="prr-col">
            <div className="prr-colLabel">Deadline</div>
            <div className="prr-naText">{perf.deadline || "Not set"}</div>
          </div>

          <div className="prr-dividerV" />

          {/* Demo Link */}
          <div className="prr-col">
            <div className="prr-colLabel">Demo Link</div>
            {perf.demoLink ? (
              <a
                href={perf.demoLink}
                target="_blank"
                rel="noreferrer"
                className="prr-demoLink"
              >
                {perf.demoLink.replace(/^https?:\/\//, "")} ↗
              </a>
            ) : (
              <div className="prr-naText">Not added</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}