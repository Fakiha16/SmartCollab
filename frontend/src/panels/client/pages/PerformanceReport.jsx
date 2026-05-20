import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./PerformanceReport.css";

const months = [
  "Oct 2021",
  "Nov 2021",
  "Dec 2021",
  "Jan 2022",
  "Feb 2022",
  "Mar 2022",
  "Apr 2022",
  "May 2022",
  "Jun 2022",
  "Jul 2022",
  "Aug 2022",
];

function makePath(points) {
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
}

const STATUS_STYLE = {
  "In Progress": { bg: "#fef9c3", color: "#b45309" },
  Completed: { bg: "#dcfce7", color: "#16a34a" },
  "Not Started": { bg: "#f3f4f6", color: "#6b7280" },
};

const mapStatusToPerformance = (update) => {
  if (!update) return {};

  const parsePercent = (str) => {
    if (!str) return 0;

    const match = String(str).match(/\d+/);
    if (!match) return 0;

    const num = parseInt(match[0], 10);
    return isNaN(num) ? 0 : Math.min(num, 100);
  };

  const getStatus = (percent) => {
    if (percent >= 100) return "Completed";
    if (percent > 0) return "In Progress";
    return "Not Started";
  };

  const fePercent = parsePercent(update.frontendProgress);
  const bePercent = parsePercent(update.backendProgress);

  return {
    frontend: {
      status: getStatus(fePercent),
      progress: fePercent,
    },

    backend: {
      status: getStatus(bePercent),
      progress: bePercent,
    },

    testing: {
      status: update.testingStatus || "Not Started",
    },

    deadline: update.nextWork || "Not set",

    demoLink: update.demoLink || "",

    chartData: {
      achieved: [fePercent, bePercent],
      target: [100, 100],
    },
  };
};

export default function PerformanceReport() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    setLoading(true);

    fetch(`http://localhost:5000/api/update-status?projectId=${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((updates) => {
        const updateList = Array.isArray(updates) ? updates : [];

        const sortedUpdates = updateList.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.date || 0);
          const dateB = new Date(b.createdAt || b.date || 0);
          return dateB - dateA;
        });

        const latest = sortedUpdates[0] || {};

        setData({
          title: latest.projectTitle || latest.title || "",
          performance: mapStatusToPerformance(latest),
        });

        setLoading(false);
      })
      .catch((err) => {
        console.error("Performance report fetch error:", err);
        setLoading(false);
      });
  }, [id]);

  const perf = data?.performance || {};

  const W = 680;
  const H = 220;

  const pad = {
    l: 48,
    r: 20,
    t: 20,
    b: 36,
  };

  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const achieved = perf.chartData?.achieved || [
    2, 3, 3.5, 4, 5, 6, 7, 8, 9, 9.5, 9.8,
  ];

  const target = perf.chartData?.target || [
    1, 2, 2.5, 3, 4, 5, 6, 7, 8, 8.5, 9,
  ];

  const { aPts, yTicks } = useMemo(() => {
    const safeAchieved = achieved.length > 1 ? achieved : [0, achieved[0] || 0];
    const max = Math.max(12, Math.ceil(Math.max(...safeAchieved, ...target) + 2));

    const toX = (i) =>
      pad.l + (innerW * i) / Math.max(safeAchieved.length - 1, 1);

    const toY = (v) => pad.t + innerH - (innerH * v) / max;

    return {
      aPts: safeAchieved.map((v, i) => ({
        x: toX(i),
        y: toY(v),
      })),

      yTicks: [0, 2, 4, 6, 8, 10, 12].filter((x) => x <= max),
    };
  }, [achieved, target, innerW, innerH]);

  const stStyle = (s) => STATUS_STYLE[s] || STATUS_STYLE["Not Started"];

  if (loading) {
    return <div className="pr-loading">Loading performance report…</div>;
  }

  return (
    <div className="prr-wrap">
      <div className="prr-header">
        <button
          className="prr-backBtn"
          onClick={() => navigate(-1)}
          type="button"
        >
          ←
        </button>

        <h1 className="prr-title">Performance Report</h1>

        {data?.title && <span className="prr-projectName">{data.title}</span>}
      </div>

      <div className="prr-chartCard">
        <svg className="prr-svg" viewBox={`0 0 ${W} ${H}`}>
          {yTicks.map((t) => {
            const y = pad.t + innerH - (innerH * t) / 12;

            return (
              <g key={t}>
                <line
                  x1={pad.l}
                  y1={y}
                  x2={W - pad.r}
                  y2={y}
                  className="prr-grid"
                />

                <text x={10} y={y + 4} className="prr-yLabel">
                  {t * 10}%
                </text>
              </g>
            );
          })}

          <path d={makePath(aPts)} className="prr-line prr-line--ach" />

          {months.slice(0, achieved.length).map((m, i) => {
            const x =
              pad.l + (innerW * i) / Math.max(achieved.length - 1, 1);

            return (
              <text
                key={m}
                x={x}
                y={H - 8}
                textAnchor="middle"
                className="prr-xLabel"
              >
                {m}
              </text>
            );
          })}
        </svg>

        <div className="prr-table">
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

          <div className="prr-col">
            <div className="prr-colLabel">Backend</div>

            <span className="prr-tag" style={stStyle(perf.backend?.status)}>
              {perf.backend?.status || "Not Started"}
            </span>

            <div className="prr-progressBar">
              <div
                className="prr-progressFill"
                style={{ width: `${perf.backend?.progress || 0}%` }}
              />
            </div>

            <div className="prr-percent">{perf.backend?.progress || 0}%</div>
          </div>

          <div className="prr-dividerV" />

          <div className="prr-col">
            <div className="prr-colLabel">Testing</div>
            <div className="prr-naText">
              {perf.testing?.status || "Not Started"}
            </div>
          </div>

          <div className="prr-dividerV" />

          <div className="prr-col">
            <div className="prr-colLabel">Deadline</div>
            <div className="prr-naText">{perf.deadline || "Not set"}</div>
          </div>

          <div className="prr-dividerV" />

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