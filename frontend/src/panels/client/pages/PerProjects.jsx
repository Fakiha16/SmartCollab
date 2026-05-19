import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PerProjects.css";


const STATUS_COLORS = {
  Completed: { bg: "#e6f9f0", color: "#16a34a" },
  Offtrack: { bg: "#fbeaea", color: "#d45858" },
  "On Progress": { bg: "#fef9c3", color: "#b45309" },
  Pending: { bg: "#f3f4f6", color: "#6b7280" },
  "On Hold": { bg: "#ede9fe", color: "#7c3aed" },
  Active: { bg: "#dcfce7", color: "#166534" },
};

const FILTERS = [
  "All",
  "Completed",
  "Offtrack",
  "On Progress",
  "Pending",
  "On Hold",
  "Active",
];

export default function PerProjects() {
  const navigate = useNavigate();
  const pageSize = 6;

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [dropOpen, setDropOpen] = useState(false);

  const getProjectIdFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const queryProjectId = params.get("projectId");

    if (queryProjectId) return queryProjectId;

    const pathParts = window.location.pathname.split("/").filter(Boolean);
    const lastPart = pathParts[pathParts.length - 1];

    if (/^[a-f\d]{24}$/i.test(lastPart)) return lastPart;

    return "";
  };

  const urlProjectId = getProjectIdFromUrl();
  const storedProjectId = localStorage.getItem("projectId");
  const priorityId = urlProjectId || storedProjectId || "";

  useEffect(() => {
    if (urlProjectId) {
      localStorage.setItem("projectId", urlProjectId);
    }
  }, [urlProjectId]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchProjects = async () => {
      try {
        setLoading(true);

        let clientProjects = [];

        try {
          const res = await fetch("http://localhost:5000/api/projects/client", {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });

          const data = await res.json();
          clientProjects = Array.isArray(data.projects)
            ? data.projects
            : Array.isArray(data)
            ? data
            : [];
        } catch (err) {
          console.warn("Client projects API failed, fallback will run:", err);
        }

        if (priorityId) {
          const alreadyExists = clientProjects.some(
            (project) => String(project._id) === String(priorityId)
          );

          if (!alreadyExists) {
            try {
              const singleRes = await fetch(
                `http://localhost:5000/api/projects/${priorityId}`
              );

              const singleProject = await singleRes.json();

              if (singleProject && singleProject._id) {
                clientProjects = [singleProject, ...clientProjects];
              }
            } catch (err) {
              console.error("Failed to fetch invited project:", err);
            }
          }
        }

        const uniqueProjects = Array.from(
          new Map(clientProjects.map((project) => [project._id, project])).values()
        );

        const sorted = uniqueProjects.sort((a, b) => {
          if (String(a._id) === String(priorityId)) return -1;
          if (String(b._id) === String(priorityId)) return 1;
          return 0;
        });

        setProjects(sorted);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [priorityId]);

  const filtered = useMemo(() => {
    if (filter === "All") return projects;

    return projects.filter(
      (project) => (project.status || "Pending") === filter
    );
  }, [projects, filter]);

  const totalPages = Math.ceil(filtered.length / pageSize);

  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const handleFilterSelect = (selectedFilter) => {
    setFilter(selectedFilter);
    setPage(1);
    setDropOpen(false);
  };

  const statusStyle = (status) =>
    STATUS_COLORS[status] || { bg: "#f3f4f6", color: "#6b7280" };

  const handleCardClick = (projectId) => {
    localStorage.setItem("projectId", projectId);
    navigate(`/client/project/${projectId}`);
  };

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

        <div className="pr-filterWrap">
          <button
            className="pr-filterBtn"
            type="button"
            onClick={() => setDropOpen((open) => !open)}
          >
            {filter} ▾
          </button>

          {dropOpen && (
            <div className="pr-dropdown">
              {FILTERS.map((filterItem) => (
                <button
                  key={filterItem}
                  type="button"
                  className={`pr-dropItem ${
                    filter === filterItem ? "is-active" : ""
                  }`}
                  onClick={() => handleFilterSelect(filterItem)}
                >
                  {filterItem}
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
          {pageData.map((project) => {
            const isPriority = String(project._id) === String(priorityId);
            const projectStatus = project.status || "Pending";
            const st = statusStyle(projectStatus);
            const members =
              project.members ||
              project.teamMembers ||
              project.joinedMembers ||
              [];

            return (
              <div
                key={project._id}
                className={`pr-card ${isPriority ? "pr-card--priority" : ""}`}
                onClick={() => handleCardClick(project._id)}
              >
                {isPriority && (
                  <div className="pr-priorityBadge">⭐ Recently Joined</div>
                )}

                <div className="pr-cardTop">
                  <div className="pr-cardTitleRow">
                    <div className="pr-cardTitle">
                      {project.name || project.title || "Untitled Project"}
                    </div>
                  </div>

                  <span
                    className="pr-status"
                    style={{ background: st.bg, color: st.color }}
                  >
                    {projectStatus}
                  </span>
                </div>

                <div className="pr-divider" />

                <p className="pr-desc">
                  {project.description ||
                    project.desc ||
                    "No description provided."}
                </p>

                <div className="pr-bottom">
                  <div className="pr-date">
                    <span className="pr-dateIcon">⏳</span>
                    <span>
                      {project.deadline
                        ? new Date(project.deadline).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            }
                          )
                        : project.date || "No deadline"}
                    </span>
                  </div>

                  <div className="pr-meta">
                    <div className="pr-avatars">
                      {members.slice(0, 3).map((member, index) => (
                        <div key={index} className="pr-avatar">
                          {(member.name || member.username || member.email || "?")
                            [0]
                            .toUpperCase()}
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
                      <span>{project.issues ?? project.taskCount ?? 0} issues</span>
                    </div>
                  </div>
                </div>

                <div className="pr-viewHint">View Details →</div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pr-pagination">
          <button
            className="pr-pageBtn"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1}
          >
            Previous
          </button>

          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index + 1}
              className={`pr-pageNum ${index + 1 === page ? "is-active" : ""}`}
              onClick={() => setPage(index + 1)}
            >
              {index + 1}
            </button>
          ))}

          <button
            className="pr-pageBtn"
            onClick={() =>
              setPage((current) => Math.min(totalPages, current + 1))
            }
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}