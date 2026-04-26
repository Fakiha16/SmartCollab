import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import emailjs from '@emailjs/browser';
import "./Projects.css";

// ============================================================
// EMAILJS SETUP — apni values yahan paste karo
// emailjs.com → Account → API Keys se milegi
// ============================================================
const EMAILJS_SERVICE_ID  = "service_1091na5";
const EMAILJS_TEMPLATE_ID = "template_axi9jh6";
const EMAILJS_PUBLIC_KEY  = "ZrGLymzCmQZPzFQKk";
// ============================================================

export default function Projects() {

  const navigate = useNavigate();

  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem("projects");
    return saved ? JSON.parse(saved) : [];
  });

  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [teamInviteLink, setTeamInviteLink] = useState("");
  const [isTeamCreated, setIsTeamCreated] = useState(false);
  const [emailInputs, setEmailInputs] = useState([""]);
  const [showAddMembersScreen, setShowAddMembersScreen] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [isSending, setIsSending] = useState(false);

  const [form, setForm] = useState({
    title: "",
    desc: "",
    frontend: "",
    backend: "",
    tester: "",
    designer: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEmailChange = (index, value) => {
    const updated = [...emailInputs];
    updated[index] = value;
    setEmailInputs(updated);
  };

  // ================= CREATE / EDIT =================
  const handleSubmit = () => {
    if (!form.title) return alert("Project name required");

    if (isEdit) {
      const updated = projects.map(p =>
        p.id === editId
          ? { ...p, title: form.title, desc: form.desc }
          : p
      );
      setProjects(updated);
      localStorage.setItem("projects", JSON.stringify(updated));

    } else {
      const newProject = {
        id: Date.now(),
        title: form.title,
        desc: form.desc,
        status: "Active",
        date: new Date().toDateString(),
        team: {
          Frontend: form.frontend ? [form.frontend] : [],
          Backend: form.backend ? [form.backend] : [],
          QA: form.tester ? [form.tester] : [],
          Designer: form.designer ? [form.designer] : []
        }
      };

      const updated = [...projects, newProject];
      setProjects(updated);
      localStorage.setItem("projects", JSON.stringify(updated));

      const projectLink = `${window.location.origin}/project/${newProject.id}/invite`;
      setTeamInviteLink(projectLink);
    }

    setShowForm(false);
    setIsEdit(false);
    setEditId(null);
    setForm({ title: "", desc: "", frontend: "", backend: "", tester: "", designer: "" });
  };

  // ================= EDIT =================
  const handleEdit = (p) => {
    setIsEdit(true);
    setEditId(p.id);
    setShowForm(true);
    setForm({ title: p.title, desc: p.desc, frontend: "", backend: "", tester: "", designer: "" });
  };

  // ================= DELETE PROJECT =================
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      const updatedProjects = projects.filter(p => p.id !== id);
      setProjects(updatedProjects);
      localStorage.setItem("projects", JSON.stringify(updatedProjects));
      alert("Project deleted successfully");
      setShowForm(false);
    }
  };

  // ================= OPEN TEAM MODAL =================
  const openTeamModal = (p) => {
    const projectLink = `${window.location.origin}/project/${p.id}/invite`;
    setTeamInviteLink(projectLink);
    setCurrentProjectId(p.id);
    setEmailInputs([""]);
    setShowAddMembersScreen(true);
  };

  // ================= NAVIGATION TO PROJECT DETAILS =================
  const handleProjectClick = (p) => {
    if (!isTeamCreated) {
      setShowAddMembersScreen(true);
    } else {
      navigate(`/manager/project/${p.id}`);
    }
  };

  // ================= CLOSE ADD MEMBERS SCREEN =================
  const closeAddMembersScreen = () => {
    setShowAddMembersScreen(false);
    setEmailInputs([""]);
  };

  return (
    <div className="pr-wrap">

      {/* HEADER */}
      <div className="pr-header">
        <h1 className="pr-title">Projects</h1>
        {projects.length > 0 && (
          <button
            className="pr-createBtn"
            onClick={() => { setShowForm(true); setIsEdit(false); }}
          >
            + Create New Project
          </button>
        )}
      </div>

      {/* EMPTY STATE */}
      {projects.length === 0 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
          <button className="pr-createCenterBtn" onClick={() => setShowForm(true)}>
            + Create Project
          </button>
        </div>
      )}

      {/* PROJECT LIST */}
      {projects.length > 0 && (
        <div className="pr-grid">
          {projects.map((p) => (
            <div
              key={p.id}
              className="pr-card"
              onClick={() => handleProjectClick(p)}
              style={{ cursor: "pointer" }}
            >
              <div className="pr-cardTop">
                <div className="pr-cardTitle">{p.title}</div>
                <div className="pr-status">{p.status}</div>
                <button
                  className="pr-status"
                  onClick={(e) => { e.stopPropagation(); openTeamModal(p); }}
                >
                  Create Team
                </button>
              </div>

              <div className="pr-divider" />
              <p className="pr-desc">{p.desc}</p>

              <div className="pr-bottom">
                <div className="pr-date">{p.date}</div>
              </div>

              <div className="pr-actions">
                <button
                  className="pr-editBtn"
                  onClick={(e) => { e.stopPropagation(); handleEdit(p); }}
                >
                  ✏️ Edit
                </button>
                <button
                  className="pr-editBtn"
                  onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                >
                  Delete Project
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {showForm && (
        <div className="pr-modalOverlay">
          <div className="pr-modal">
            <div className="pr-modalHeader">
              <h2>{isEdit ? "Edit Project" : "Create Project"}</h2>
              <span className="pr-close" onClick={() => setShowForm(false)}>✕</span>
            </div>

            <div className="pr-modalBody">
              <input name="title" placeholder="Project Name" value={form.title} onChange={handleChange} />
              <textarea name="desc" placeholder="Description" value={form.desc} onChange={handleChange} />
              {!isEdit && (
                <>
                  <input name="frontend" placeholder="Frontend" value={form.frontend} onChange={handleChange} />
                  <input name="backend" placeholder="Backend" value={form.backend} onChange={handleChange} />
                  <input name="tester" placeholder="QA" value={form.tester} onChange={handleChange} />
                  <input name="designer" placeholder="Designer" value={form.designer} onChange={handleChange} />
                </>
              )}
            </div>

            <div className="pr-modalFooter">
              <button className="pr-btn primary" onClick={handleSubmit}>
                {isEdit ? "Update" : "Create"}
              </button>
              <button className="pr-btn secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TEAM INVITE MODAL */}
      {showAddMembersScreen && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.55)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: "20px",
            padding: "28px",
            width: "100%",
            maxWidth: "480px",
            margin: "0 16px",
            boxShadow: "0 12px 40px rgba(0, 0, 0, 0.2)"
          }}>

            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 600, color: "#111" }}>
                Create Team
              </h2>
              <span
                onClick={closeAddMembersScreen}
                style={{ cursor: "pointer", fontSize: "20px", color: "#999", lineHeight: 1, padding: "4px 8px" }}
              >
                ✕
              </span>
            </div>

            {/* Project Link Section */}
            <p style={{ margin: "0 0 8px", fontSize: "13px", color: "#666", fontWeight: 600 }}>
              Project link
            </p>
            <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
              <input
                type="text"
                value={teamInviteLink}
                readOnly
                style={{
                  flex: 1,
                  borderRadius: "999px",
                  border: "1px solid #e0e0e0",
                  padding: "10px 16px",
                  fontSize: "13px",
                  background: "#f7f7f7",
                  color: "#555",
                  outline: "none",
                  minWidth: 0
                }}
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(teamInviteLink);
                  alert("Link copied to clipboard!");
                }}
                style={{
                  borderRadius: "999px",
                  border: "1px solid #e0e0e0",
                  background: "#ffffff",
                  padding: "10px 18px",
                  fontSize: "13px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  fontWeight: 500,
                  color: "#111"
                }}
              >
                Copy link
              </button>
            </div>

            {/* Add Members via Email Section */}
            <p style={{ margin: "0 0 12px", fontSize: "13px", color: "#666", fontWeight: 600 }}>
              Add members via email
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "12px" }}>
              {emailInputs.map((email, index) => (
                <input
                  key={index}
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(index, e.target.value)}
                  placeholder="Enter email address"
                  style={{
                    borderRadius: "999px",
                    border: "1px solid #e0e0e0",
                    padding: "10px 18px",
                    fontSize: "14px",
                    outline: "none",
                    width: "100%",
                    boxSizing: "border-box",
                    color: "#111"
                  }}
                />
              ))}
            </div>

            {/* Add Another Email Button */}
            <button
              onClick={() => setEmailInputs([...emailInputs, ""])}
              style={{
                width: "100%",
                borderRadius: "999px",
                border: "1px solid #e0e0e0",
                background: "#ffffff",
                padding: "10px 0",
                fontSize: "14px",
                cursor: "pointer",
                marginBottom: "20px",
                fontWeight: 500,
                color: "#111"
              }}
            >
              + Add another member's email
            </button>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                disabled={isSending}
                onClick={async () => {
                  const validEmails = emailInputs.filter(e => e.trim() !== "");
                  if (validEmails.length === 0) {
                    alert("Please enter at least one email address.");
                    return;
                  }

                  setIsSending(true);

                  try {
                    emailjs.init(EMAILJS_PUBLIC_KEY);

                    for (const email of validEmails) {
                      await emailjs.send(
                        EMAILJS_SERVICE_ID,
                        EMAILJS_TEMPLATE_ID,
                        {
                          to_email: email.trim(),
                          project_link: teamInviteLink,
                        }
                      );
                    }
                    alert(`Invitation sent successfully to ${validEmails.length} member(s)!`);
                    setIsTeamCreated(true);
                    closeAddMembersScreen();
                  } catch (error) {
                    console.error("EmailJS Error:", error);
                    alert(`Failed: ${error?.text || error?.message || "Unknown error - check console"}`);
                  } finally {
                    setIsSending(false);
                  }
                }}
                style={{
                  flex: 1,
                  borderRadius: "999px",
                  border: "none",
                  background: isSending ? "#888888" : "#111111",
                  color: "#ffffff",
                  padding: "12px 0",
                  fontSize: "14px",
                  cursor: isSending ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  transition: "background 0.2s"
                }}
              >
                {isSending ? "Sending..." : "Send invitation"}
              </button>
              <button
                onClick={closeAddMembersScreen}
                style={{
                  flex: 1,
                  borderRadius: "999px",
                  border: "1px solid #e0e0e0",
                  background: "#ffffff",
                  color: "#111111",
                  padding: "12px 0",
                  fontSize: "14px",
                  cursor: "pointer",
                  fontWeight: 500
                }}
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}