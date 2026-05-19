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

  const user = JSON.parse(localStorage.getItem("user")) || {};

  const getProjectIdFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const queryProjectId = params.get("projectId");

    if (queryProjectId) return queryProjectId;

    const pathParts = window.location.pathname.split("/").filter(Boolean);
    const lastPart = pathParts[pathParts.length - 1];

    if (/^[a-f\d]{24}$/i.test(lastPart)) return lastPart;

    return "";
  };

  const getStoredProjectIds = () => {
    try {
      const saved = JSON.parse(localStorage.getItem("clientProjectIds")) || [];
      return Array.isArray(saved) ? saved.filter(Boolean).map(String) : [];
    } catch {
      return [];
    }
  };

  const saveProjectIdsToStorage = (ids = []) => {
    const oldIds = getStoredProjectIds();
    const nextIds = Array.from(
      new Set([...ids, ...oldIds].filter(Boolean).map(String))
    );

    localStorage.setItem("clientProjectIds", JSON.stringify(nextIds));

    const currentUser = JSON.parse(localStorage.getItem("user")) || {};
    const existingUserProjectIds = Array.isArray(currentUser.projectIds)
      ? currentUser.projectIds.map(String)
      : [];

    const updatedUser = {
      ...currentUser,
      projectIds: Array.from(
        new Set([...nextIds, ...existingUserProjectIds].filter(Boolean))
      ),
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const saveProjectIdToStorage = (projectId) => {
    if (!projectId) return;

    const cleanProjectId = String(projectId);

    localStorage.setItem("projectId", cleanProjectId);
    saveProjectIdsToStorage([cleanProjectId]);

    const currentUser = JSON.parse(localStorage.getItem("user")) || {};
    const existingUserProjectIds = Array.isArray(currentUser.projectIds)
      ? currentUser.projectIds.map(String)
      : [];

    const updatedUser = {
      ...currentUser,
      projectId: cleanProjectId,
      projectIds: Array.from(
        new Set([cleanProjectId, ...existingUserProjectIds].filter(Boolean))
      ),
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const urlProjectId = getProjectIdFromUrl();
  const storedProjectId = localStorage.getItem("projectId");

  const userProjectIds = Array.isArray(user?.projectIds)
    ? user.projectIds.filter(Boolean).map(String)
    : [];

  const localProjectIds = Array.from(
    new Set(
      [
        urlProjectId,
        storedProjectId,
        user?.projectId,
        ...userProjectIds,
        ...getStoredProjectIds(),
      ]
        .filter(Boolean)
        .map(String)
    )
  );

  const priorityId = urlProjectId || storedProjectId || "";

  useEffect(() => {
    if (urlProjectId) {
      saveProjectIdToStorage(urlProjectId);
    }
  }, [urlProjectId]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const freshUser = JSON.parse(localStorage.getItem("user")) || {};
    const clientEmail = freshUser?.email || user?.email || "";

    const fetchSingleProject = async (projectId) => {
      try {
        const res = await fetch(`http://localhost:5000/api/projects/${projectId}`);

        if (!res.ok) return null;

        const project = await res.json();

        if (project && project._id) {
          return project;
        }

        return null;
      } catch (err) {
        console.error("Failed to fetch project:", projectId, err);
        return null;
      }
    };

    const fetchProjects = async () => {
      try {
        setLoading(true);

        let clientProjects = [];

        try {
          const res = await fetch(
            `http://localhost:5000/api/projects/client?email=${encodeURIComponent(
              clientEmail
            )}`,
            {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            }
          );

          const data = await res.json();

          clientProjects = Array.isArray(data.projects)
            ? data.projects
            : Array.isArray(data)
            ? data
            : [];

          const apiProjectIds = clientProjects
            .map((project) => project?._id)
            .filter(Boolean)
            .map(String);

          if (apiProjectIds.length > 0) {
            saveProjectIdsToStorage(apiProjectIds);
          }
        } catch (err) {
          console.warn("Client projects API failed, local fallback will run:", err);
        }

        const latestLocalIds = Array.from(
          new Set([...localProjectIds, ...getStoredProjectIds()].filter(Boolean))
        );

        const existingIds = new Set(
          clientProjects.map((project) => String(project._id))
        );

        const missingLocalIds = latestLocalIds.filter(
          (id) => !existingIds.has(String(id))
        );

        if (missingLocalIds.length > 0) {
          const fetchedProjects = await Promise.all(
            missingLocalIds.map((id) => fetchSingleProject(id))
          );

          const validFetchedProjects = fetchedProjects.filter(Boolean);
          clientProjects = [...validFetchedProjects, ...clientProjects];
        }

        const uniqueProjects = Array.from(
          new Map(
            clientProjects
              .filter((project) => project && project._id)
              .map((project) => [String(project._id), project])
          ).values()
        );

        saveProjectIdsToStorage(uniqueProjects.map((project) => project._id));

        const sorted = uniqueProjects.sort((a, b) => {
          if (priorityId && String(a._id) === String(priorityId)) return -1;
          if (priorityId && String(b._id) === String(priorityId)) return 1;
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
  }, [urlProjectId]);

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
    saveProjectIdToStorage(projectId);
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
            const isPriority = priorityId && String(project._id) === String(priorityId);
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