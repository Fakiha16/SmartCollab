import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PerProjects.css";

const STATUS_COLORS = {
  Completed: { bg: "#e6f9f0", color: "#16a34a" },
  Offtrack:  { bg: "#fbeaea", color: "#d45858" },
  "On Progress": { bg: "#fef9c3", color: "#b45309" },
  Pending:   { bg: "#f3f4f6", color: "#6b7280" },
  "On Hold":  { bg: "#ede9fe", color: "#7c3aed" },
};

const FILTERS = ["All", "Completed", "Offtrack", "On Progress", "Pending", "On Hold"];

export default function PerProjects() {
  const navigate = useNavigate();
  const pageSize = 6;

  const [projects, setProjects]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState("All");
  const [page, setPage]           = useState(1);
  const [dropOpen, setDropOpen]   = useState(false);

  // priority projectId from localStorage (set at login from invite link)
  const priorityId = localStorage.getItem("projectId");

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchProjects = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/projects/client", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        // sort: priority project first
        const sorted = [...(data.projects || data)].sort((a, b) => {
          if (String(a._id) === String(priorityId)) return -1;
          if (String(b._id) === String(priorityId)) return 1;
          return 0;
        });

        setProjects(sorted);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [priorityId]);

  const filtered = useMemo(() => {
    if (filter === "All") return projects;
    return projects.filter((p) => p.status === filter);
  }, [projects, filter]);

  const totalPages = Math.ceil(filtered.length / pageSize);

  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const handleFilterSelect = (f) => {
    setFilter(f);
    setPage(1);
    setDropOpen(false);
  };

  const statusStyle = (status) =>
    STATUS_COLORS[status] || { bg: "#f3f4f6", color: "#6b7280" };

  return (
    <div className="pr-wrap">
      <div className="pr-header">
        <div className="pr-headerLeft">
          <button
            className="pr-backBtn"
            type="button"
            onClick={() => navigate(-1)}
          >
            ←
          </button>
          <h1 className="pr-title">Projects</h1>
        </div>

        {/* Filter dropdown */}
        <div className="pr-filterWrap">
          <button
            className="pr-filterBtn"
            type="button"
            onClick={() => setDropOpen((o) => !o)}
          >
            {filter} ▾
          </button>
          {dropOpen && (
            <div className="pr-dropdown">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`pr-dropItem ${filter === f ? "is-active" : ""}`}
                  onClick={() => handleFilterSelect(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="pr-loading">Loading projects…</div>
      ) : pageData.length === 0 ? (
        <div className="pr-empty">No projects found.</div>
      ) : (
        <div className="pr-grid">
          {pageData.map((p) => {
            const isPriority = String(p._id) === String(priorityId);
            const st = statusStyle(p.status);
            const members = p.members || p.teamMembers || [];

            return (
              <div
                key={p._id}
                className={`pr-card ${isPriority ? "pr-card--priority" : ""}`}
              >
                {isPriority && (
                  <div className="pr-priorityBadge">⭐ Recently Joined</div>
                )}

                <div className="pr-cardTop">
                  <div className="pr-cardTitleRow">
                    <div className="pr-cardTitle">{p.name || p.title}</div>
                    <button className="pr-editBtn" title="Edit" type="button">✎</button>
                  </div>
                  <span
                    className="pr-status"
                    style={{ background: st.bg, color: st.color }}
                  >
                    {p.status || "Pending"}
                  </span>
                </div>

                <div className="pr-divider" />

                <p className="pr-desc">
                  {p.description || p.desc || "No description provided."}
                </p>

                <div className="pr-bottom">
                  <div className="pr-date">
                    <span className="pr-dateIcon">⏳</span>
                    <span>
                      {p.deadline
                        ? new Date(p.deadline).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })
                        : p.date || "No deadline"}
                    </span>
                  </div>

                  <div className="pr-meta">
                    <div className="pr-avatars">
                      {members.slice(0, 3).map((m, idx) => (
                        <div key={idx} className="pr-avatar">
                          {(m.name || m.username || "?")[0].toUpperCase()}
                        </div>
                      ))}
                      {members.length > 3 && (
                        <div className="pr-avatar pr-avatarMore">
                          +{members.length - 3}
                        </div>
                      )}
                    </div>

                    <div className="pr-issues">
                      <span className="pr-issueIcon">▣</span>
                      <span>{p.issues ?? p.taskCount ?? 0} issues</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pr-pagination">
          <button
            className="pr-pageBtn"
            onClick={() => setPage((x) => Math.max(1, x - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i + 1}
              className={`pr-pageNum ${i + 1 === page ? "is-active" : ""}`}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="pr-pageBtn"
            onClick={() => setPage((x) => Math.min(totalPages, x + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}