import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ProjectDetails.css";

const STATUS_COLORS = {
  Completed:     { bg: "#e6f9f0", color: "#16a34a" },
  Offtrack:      { bg: "#fbeaea", color: "#d45858" },
  "On Progress": { bg: "#fef9c3", color: "#b45309" },
  Pending:       { bg: "#f3f4f6", color: "#6b7280" },
  "On Hold":     { bg: "#ede9fe", color: "#7c3aed" },
};

export default function ProjectDetails() {
  const { projectId } = useParams();
  const navigate      = useNavigate();

  const [project, setProject]   = useState(null);
  const [updates, setUpdates]   = useState([]);
  const [files, setFiles]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // overview | updates | files | team

  useEffect(() => {
    if (!projectId) return;
    const token = localStorage.getItem("token");

    const fetchAll = async () => {
      try {
        // Fetch project details
        const pRes = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const pData = await pRes.json();
        setProject(pData);

        // Fetch status updates
        try {
          const uRes = await fetch(
            `http://localhost:5000/api/update-status?projectId=${projectId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const uData = await uRes.json();
          setUpdates(Array.isArray(uData) ? uData : []);
        } catch { setUpdates([]); }

        // Fetch shared files
        try {
          const fRes = await fetch(`http://localhost:5000/api/upload/${projectId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const fData = await fRes.json();
          const sorted = (Array.isArray(fData) ? fData : []).sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setFiles(sorted);
        } catch { setFiles([]); }

      } catch (err) {
        console.error("Error fetching project detail:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [projectId]);

  if (loading) {
    return (
      <div className="cpd-loading">
        <div className="cpd-spinner" />
        <p>Loading project…</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="cpd-loading">
        <p>Project not found.</p>
        <button onClick={() => navigate(-1)} className="cpd-backBtn">← Go Back</button>
      </div>
    );
  }

  const members  = project.members || project.teamMembers || [];
  const st       = STATUS_COLORS[project.status] || { bg: "#f3f4f6", color: "#6b7280" };
  const deadline = project.deadline
    ? new Date(project.deadline).toLocaleDateString("en-GB", {
        day: "2-digit", month: "long", year: "numeric",
      })
    : project.date || "No deadline set";

  const tabs = [
    { key: "overview", label: "📊 Overview" },
    { key: "updates",  label: `📋 Updates ${updates.length > 0 ? `(${updates.length})` : ""}` },
    { key: "files",    label: `📁 Files ${files.length > 0 ? `(${files.length})` : ""}` },
    { key: "team",     label: `👥 Team ${members.length > 0 ? `(${members.length})` : ""}` },
  ];

  return (
    <div className="cpd-wrap">

      {/* ── HEADER ── */}
      <div className="cpd-header">
        <button className="cpd-backBtn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div className="cpd-headerInfo">
          <h1 className="cpd-projectName">{project.name || project.title}</h1>
          <span
            className="cpd-statusBadge"
            style={{ background: st.bg, color: st.color }}
          >
            {project.status || "Pending"}
          </span>
        </div>
        <div className="cpd-deadline">
          <span className="cpd-deadlineIcon">⏳</span>
          <span>{deadline}</span>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="cpd-tabs">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`cpd-tab ${activeTab === t.key ? "cpd-tab--active" : ""}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB CONTENT ── */}
      <div className="cpd-body">

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div className="cpd-overview">
            <div className="cpd-infoCard">
              <h3>About this Project</h3>
              <p>{project.description || project.desc || "No description provided."}</p>
            </div>

            <div className="cpd-statsRow">
              <div className="cpd-stat">
                <div className="cpd-statNum">{members.length}</div>
                <div className="cpd-statLabel">Team Members</div>
              </div>
              <div className="cpd-stat">
                <div className="cpd-statNum">{updates.length}</div>
                <div className="cpd-statLabel">Status Updates</div>
              </div>
              <div className="cpd-stat">
                <div className="cpd-statNum">{files.length}</div>
                <div className="cpd-statLabel">Shared Files</div>
              </div>
              <div className="cpd-stat">
                <div className="cpd-statNum">{project.issues ?? project.taskCount ?? 0}</div>
                <div className="cpd-statLabel">Issues</div>
              </div>
            </div>

            {/* Manager info */}
            {project.managerId && (
              <div className="cpd-infoCard">
                <h3>Project Manager</h3>
                <div className="cpd-managerRow">
                  <div className="cpd-managerAvatar">
                    {(project.managerName || project.managerId || "M")[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="cpd-managerName">
                      {project.managerName || "Project Manager"}
                    </div>
                    <div className="cpd-managerEmail">{project.managerId}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Latest update preview */}
            {updates.length > 0 && (
              <div className="cpd-infoCard">
                <h3>Latest Update</h3>
                <div className="cpd-latestUpdate">
                  <div className="cpd-updateTitle">{updates[0].title}</div>
                  <div className="cpd-updateDate">
                    {updates[0].date
                      ? new Date(updates[0].date).toLocaleDateString("en-GB", {
                          day: "2-digit", month: "short", year: "numeric",
                        })
                      : ""}
                  </div>
                  <p className="cpd-updateDesc">{updates[0].description}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* UPDATES */}
        {activeTab === "updates" && (
          <div className="cpd-updatesList">
            {updates.length === 0 ? (
              <div className="cpd-empty">No status updates yet.</div>
            ) : (
              updates.map((u, i) => (
                <div key={u._id || i} className="cpd-updateCard">
                  <div className="cpd-updateCardTop">
                    <div className="cpd-updateCardTitle">{u.title || "Update"}</div>
                    <div className="cpd-updateCardDate">
                      {u.date
                        ? new Date(u.date).toLocaleDateString("en-GB", {
                            day: "2-digit", month: "short", year: "numeric",
                          })
                        : ""}
                    </div>
                  </div>
                  {u.manager && (
                    <div className="cpd-updateCardManager">by {u.manager}</div>
                  )}
                  <p className="cpd-updateCardDesc">{u.description}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* FILES */}
        {activeTab === "files" && (
          <div className="cpd-filesList">
            {files.length === 0 ? (
              <div className="cpd-empty">No files shared yet.</div>
            ) : (
              files.map((f, i) => {
                const fileName = f.name || f.filename || "file";
                const ext      = fileName.split(".").pop().toUpperCase();
                return (
                  <div key={f._id || i} className="cpd-fileCard">
                    <div className="cpd-fileIcon">
                      <span>{ext}</span>
                    </div>
                    <div className="cpd-fileInfo">
                      <div className="cpd-fileFileName">{fileName}</div>
                      {f.uploadedBy && (
                        <div className="cpd-fileUploader">Uploaded by {f.uploadedBy}</div>
                      )}
                      {f.createdAt && (
                        <div className="cpd-fileDate">
                          {new Date(f.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit", month: "short", year: "numeric",
                          })}
                        </div>
                      )}
                    </div>
                    <a
                      href={`http://localhost:5000/uploads/${fileName}`}
                      download={fileName}
                      className="cpd-downloadBtn"
                    >
                      ⬇ Download
                    </a>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TEAM */}
        {activeTab === "team" && (
          <div className="cpd-teamGrid">
            {members.length === 0 ? (
              <div className="cpd-empty">No team members yet.</div>
            ) : (
              members.map((m, i) => {
                const name  = m.name || m.username || m.email || "Member";
                const email = m.email || "";
                const role  = m.role || "Member";
                return (
                  <div key={i} className="cpd-memberCard">
                    <div className="cpd-memberAvatar">
                      {name[0].toUpperCase()}
                    </div>
                    <div className="cpd-memberInfo">
                      <div className="cpd-memberName">{name}</div>
                      {email && <div className="cpd-memberEmail">{email}</div>}
                      <span className="cpd-memberRole">{role}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

      </div>
    </div>
  );
}