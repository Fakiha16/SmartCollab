import React, { useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie } from "react-chartjs-2";
import "./Performance.css";

ChartJS.register(ArcElement, Tooltip, Legend);

const mockProjects = [
  {
    name: "SmartCollab",
    stats: {
      daily: { done: 12, pending: 5, errors: 2 },
      weekly: { done: 70, pending: 20, errors: 5 },
      monthly: { done: 280, pending: 60, errors: 15 },
    },
  },
  {
    name: "Auth System",
    stats: {
      daily: { done: 5, pending: 3, errors: 1 },
      weekly: { done: 30, pending: 10, errors: 2 },
      monthly: { done: 120, pending: 25, errors: 6 },
    },
  },
];

export default function Performance() {
  const [selectedProject, setSelectedProject] = useState(mockProjects[0]);
  const [view, setView] = useState("daily");

  const data = selectedProject.stats[view];

  const chartData = {
    labels: ["Completed", "Pending", "Errors"],
    datasets: [
      {
        data: [data.done, data.pending, data.errors],
        backgroundColor: ["#00c853", "#ffab00", "#ff1744"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="perf-page">
      <div className="perf-proj">
        <h1 className="perf-title">Project Performance</h1>
        {/* 🔽 PROJECT SELECT */}
        <select
          className="perf-select"
          onChange={(e) =>
            setSelectedProject(
              mockProjects.find((p) => p.name === e.target.value)
            )
          }
        >
          {mockProjects.map((p) => (
            <option key={p.name}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* 🥧 PIE CHART */}
      <div className="perf-chart">
        {/* 🔘 TABS */}
        <div className="perf-tabs">
          <button onClick={() => setView("daily")}>Daily</button>
          <button onClick={() => setView("weekly")}>Weekly</button>
          <button onClick={() => setView("monthly")}>Monthly</button>
        </div>
        <Pie data={chartData} />
        {/* 📊 DETAILS */}
      <div className="perf-grid">
        <div className="perf-card">✅ Completed: {data.done}</div>
        <div className="perf-card">⏳ Pending: {data.pending}</div>
        <div className="perf-card">❌ Errors: {data.errors}</div>
      </div>
      </div>

      
    </div>
  );
}