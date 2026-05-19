import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie } from "react-chartjs-2";
import axios from "axios";
import "./Performance.css";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Performance() {
  const user = JSON.parse(localStorage.getItem("user"));
  const managerEmail = user?.email || "";

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [view, setView] = useState("daily");

  const [stats, setStats] = useState({
    completed: 0,
    pending: 0,
    errors: 0,
  });

  useEffect(() => {
    const fetchManagerProjects = async () => {
      try {
        if (!managerEmail) return;

        const res = await axios.get(
          `http://localhost:5000/api/projects/manager/${managerEmail}`
        );

        const managerProjects = Array.isArray(res.data) ? res.data : [];
        setProjects(managerProjects);

        if (managerProjects.length > 0) {
          setSelectedProjectId(managerProjects[0]._id);
        }
      } catch (err) {
        console.error("Fetch manager projects error:", err);
      }
    };

    fetchManagerProjects();
  }, [managerEmail]);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        if (!selectedProjectId) return;

        const res = await axios.get(
          `http://localhost:5000/api/tasks/performance/${selectedProjectId}`
        );

        setStats({
          completed: res.data.completed || 0,
          pending: res.data.pending || 0,
          errors: res.data.errors || 0,
        });
      } catch (err) {
        console.error("Fetch performance error:", err);
        setStats({
          completed: 0,
          pending: 0,
          errors: 0,
        });
      }
    };

    fetchPerformance();
  }, [selectedProjectId, view]);

  const chartData = {
    labels: ["Completed", "Pending", "Errors"],
    datasets: [
      {
        data: [stats.completed, stats.pending, stats.errors],
        backgroundColor: ["#00c853", "#ffab00", "#ff1744"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="perf-page">
      <div className="perf-proj">
        <h1 className="perf-title">Project Performance</h1>

        <select
          className="perf-select"
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
        >
          {projects.length === 0 ? (
            <option value="">No projects found</option>
          ) : (
            projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.title}
              </option>
            ))
          )}
        </select>
      </div>

      <div className="perf-chart">
        <div className="perf-tabs">
          <button
            className={view === "daily" ? "active" : ""}
            onClick={() => setView("daily")}
          >
            Daily
          </button>

          <button
            className={view === "weekly" ? "active" : ""}
            onClick={() => setView("weekly")}
          >
            Weekly
          </button>

          <button
            className={view === "monthly" ? "active" : ""}
            onClick={() => setView("monthly")}
          >
            Monthly
          </button>
        </div>

        <Pie data={chartData} />

        <div className="perf-grid">
          <div className="perf-card">✅ Completed: {stats.completed}</div>
          <div className="perf-card">⏳ Pending: {stats.pending}</div>
          <div className="perf-card">❌ Errors: {stats.errors}</div>
        </div>
      </div>
    </div>
  );
}