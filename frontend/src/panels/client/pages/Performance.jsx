// src/pages/Performance.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./Performance.css";
import Card from "../components/Card";
import PerformanceCard from "../components/PerformanceCard";

const tasksMock = [
  { title: "Make an Automatic Payment System...", tag: "Completed" },
  { title: "Design UI Animation Pack", tag: "On Progress" },
  { title: "Fix Auth Flow Edge Cases", tag: "Pending" },
  { title: "Client Panel Review", tag: "Completed" },
  { title: "Reports Module", tag: "On Hold" },
  { title: "Dashboard UI Polish", tag: "Completed" },
  { title: "WorkLogs Board Improvements", tag: "On Progress" },
];

export default function Performance() {
  const navigate = useNavigate();

  const goPerProject = () => {
    navigate("/performance/project/smartcollab", {
      state: { projectName: "SmartCollab" },
    });
  };

  const goWorkLogs = () => navigate("/work-logs");
  const goTasks = () => navigate("/tasks");

  return (
    <div className="sc-dashboardRoot">
      <div className="sc-pageHead">
        <div>
          <h1 className="sc-title">Performance</h1>
          <p className="sc-subtitle">Track project performance and leadership.</p>
        </div>
      </div>

      <div className="sc-dashLayout">
        {/* LEFT SIDE */}
        <div className="sc-dashLeft">
          <div className="sc-grid2">
            {/* Projects */}
            <Card
              className="sc-card-project"
              role="button"
              tabIndex={0}
              title="Open project performance"
              style={{ cursor: "pointer" }}
              onClick={goPerProject}
              onKeyDown={(e) => (e.key === "Enter" ? goPerProject() : null)}
            >
              <div className="sc-cardHead">
                <div>
                  <div className="sc-cardTitle">Projects</div>
                  <div className="sc-muted">Files & assets overview</div>
                </div>
                <span className="sc-badge">52 files</span>
              </div>

              <div className="sc-projectThumb">
                <div className="sc-thumbOverlay">
                  <div className="sc-thumbTitle">SmartCollab</div>
                  <div className="sc-thumbMeta">UI • Components • Pages</div>
                </div>
              </div>

              
            </Card>

            {/* Chart card */}
            <PerformanceCard />
          </div>

          {/* Work Logs Card (replaces Leadership panel) */}
          <Card
            className="sc-leadership sc-leadershipCompact"
            role="button"
            tabIndex={0}
            style={{ cursor: "pointer" }}
            onClick={goWorkLogs}
            onKeyDown={(e) => (e.key === "Enter" ? goWorkLogs() : null)}
            title="Open Work Logs"
          >
            <div className="sc-cardHead sc-cardHeadRow">
              <div>
                <div className="sc-cardTitle">Work Logs</div>
                <div className="sc-muted">Open the board & manage tasks</div>
              </div>

              <button
                className="sc-linkBtn"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goWorkLogs();
                }}
              >
                View all
              </button>
            </div>

            {/* simple preview row */}
            <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
              {["Backlog", "In progress", "Review", "Completed"].map((x) => (
                <div
                  key={x}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 14,
                    border: "1px solid var(--stroke)",
                    background: "rgba(255,255,255,.02)",
                    fontWeight: 800,
                    fontSize: 12,
                  }}
                >
                  {x}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* RIGHT SIDE (Tasks card replaces Done & Delivered) */}
        <Card
          className="sc-doneDelivered"
          role="button"
          tabIndex={0}
          style={{ cursor: "pointer" }}
          onClick={goTasks}
          onKeyDown={(e) => (e.key === "Enter" ? goTasks() : null)}
          title="Open Tasks"
        >
          <div className="sc-cardHead">
            <div>
              <div className="sc-cardTitle">Tasks</div>
              <div className="sc-muted">Recent tasks overview</div>
            </div>

            <button
              className="sc-linkBtn"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goTasks();
              }}
            >
              View all
            </button>
          </div>

          {/* scroll inside only */}
          <div className="sc-deliveredList sc-deliveredScroll">
            {tasksMock.map((it, i) => (
              <div key={`${it.title}-${i}`} className="sc-deliveredItem">
                <div className="sc-deliveredThumb" />
                <div className="sc-deliveredInfo">
                  <div className="sc-deliveredTitle">{it.title}</div>
                  <div className="sc-tag">{it.tag}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}