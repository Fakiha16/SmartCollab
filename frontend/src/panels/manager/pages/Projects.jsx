import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Projects.css";

export default function Projects() {

  const navigate = useNavigate();
  const manager = JSON.parse(localStorage.getItem("user"));

  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [teamInviteLink, setTeamInviteLink] = useState("");
  const [emailInputs, setEmailInputs] = useState([""]);
  const [showAddMembersScreen, setShowAddMembersScreen] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [isSending, setIsSending] = useState(false);

  const [form, setForm] = useState({
    title: "", desc: "", frontend: "", backend: "", tester: "", designer: ""
  });

  useEffect(() => {
    fetch("http://localhost:5000/api/projects")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProjects(data);
      })
      .catch(() => {
        const saved = localStorage.getItem("projects");
        if (saved) setProjects(JSON.parse(saved));
      });
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleEmailChange = (index, value) => {
    const updated = [...emailInputs];
    updated[index] = value;
    setEmailInputs(updated);
  };

  const handleSubmit = async () => {
    if (!form.title) return alert("Project name required");

    if (isEdit) {
      try {
        const res = await fetch(`http://localhost:5000/api/projects/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: form.title, desc: form.desc })
        });
        // FIX 2: fallback to form values if backend returns different field names
        const raw = await res.json();
        const updated = {
          ...raw,
          title: raw.title || form.title,
          desc:  raw.desc || raw.description || form.desc,
        };
        setProjects(prev => prev.map(p => (p._id || p.id) === editId ? updated : p));
      } catch (err) { alert("Update failed"); }

    } else {
      try {
        const res = await fetch("http://localhost:5000/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.title,
            desc: form.desc,
            managerId: manager?._id || manager?.id || "",
            team: {
              Frontend: form.frontend ? [form.frontend] : [],
              Backend:  form.backend  ? [form.backend]  : [],
              QA:       form.tester   ? [form.tester]   : [],
              Designer: form.designer ? [form.designer] : []
            }
          })
        });
        // FIX 1: fallback to form values if backend returns different field names
        const data = await res.json();
        const newProject = {
          ...data,
          title: data.title || form.title,
          desc:  data.desc  || data.description || form.desc,
        };
        setProjects(prev => [...prev, newProject]);

        const pid = newProject._id;
        setTeamInviteLink(`${window.location.origin}/signup?projectId=${pid}`);
        setCurrentProjectId(pid);
      } catch (err) {
        alert("Could not save project. Check backend.");
        return;
      }
    }

    setShowForm(false);
    setIsEdit(false);
    setEditId(null);
    setForm({ title: "", desc: "", frontend: "", backend: "", tester: "", designer: "" });
  };

  const handleEdit = (p) => {
    setIsEdit(true);
    setEditId(p._id || p.id);
    setShowForm(true);
    setForm({ title: p.title, desc: p.desc || p.description || "", frontend: "", backend: "", tester: "", designer: "" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    try {
      await fetch(`http://localhost:5000/api/projects/${id}`, { method: "DELETE" });
    } catch (err) { console.error(err); }
    setProjects(prev => prev.filter(p => (p._id || p.id) !== id));
  };

  const openTeamModal = (p) => {
    const pid = p._id || p.id;
    setTeamInviteLink(`${window.location.origin}/signup?projectId=${pid}`);
    setCurrentProjectId(pid);
    setEmailInputs([""]);
    setShowAddMembersScreen(true);
  };

  const closeAddMembersScreen = () => {
    setShowAddMembersScreen(false);
    setEmailInputs([""]);
  };

  const sendInvites = async () => {
    const validEmails = emailInputs.filter(e => e.trim() !== "");
    if (validEmails.length === 0) return alert("Please enter at least one email.");

    setIsSending(true);
    let successCount = 0;

    for (const email of validEmails) {
      try {
        const res = await fetch("http://localhost:5000/api/invite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), projectId: currentProjectId })
        });
        if (res.ok) successCount++;
        else {
          const err = await res.json();
          console.error("Failed for:", email, err);
        }
      } catch (err) {
        console.error("Network error for:", email, err);
      }
    }

    setIsSending(false);

    if (successCount > 0) {
      alert(`✅ Invitation sent to ${successCount} member(s)!`);
      closeAddMembersScreen();
    } else {
      alert("❌ Failed to send. Check backend console for errors.");
    }
  };

  return (
    <div className="pr-wrap">

      <div className="pr-header">
        <h1 className="pr-title">Projects</h1>
        {projects.length > 0 && (
          <button className="pr-createBtn" onClick={() => { setShowForm(true); setIsEdit(false); }}>
            + Create New Project
          </button>
        )}
      </div>

      {projects.length === 0 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
          <button className="pr-createCenterBtn" onClick={() => setShowForm(true)}>
            + Create Project
          </button>
        </div>
      )}

      {projects.length > 0 && (
        <div className="pr-grid">
          {projects.map((p) => {
            const pid = p._id || p.id;
            return (
              <div
                key={String(pid)}
                className="pr-card"
                onClick={() => navigate(`/manager/project/${pid}`)}
                style={{ cursor: "pointer" }}
              >
                <div className="pr-cardTop">
                  <div className="pr-cardTitle">{p.title}</div>
                  <div className="pr-status">{p.status || "Active"}</div>
                  <button className="pr-status" onClick={(e) => { e.stopPropagation(); openTeamModal(p); }}>
                    Create Team
                  </button>
                </div>
                <div className="pr-divider" />
                {/* FIX 3: fallback to p.description if p.desc is undefined */}
                <p className="pr-desc">{p.desc || p.description}</p>
                <div className="pr-bottom">
                  <div className="pr-date">{p.date || new Date().toDateString()}</div>
                </div>
                <div className="pr-actions">
                  <button className="pr-editBtn" onClick={(e) => { e.stopPropagation(); handleEdit(p); }}>✏️ Edit</button>
                  <button className="pr-editBtn" onClick={(e) => { e.stopPropagation(); handleDelete(pid); }}>Delete</button>
                </div>
              </div>
            );
          })}
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
              <button className="pr-btn primary" onClick={handleSubmit}>{isEdit ? "Update" : "Create"}</button>
              <button className="pr-btn secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* INVITE MODAL */}
      {showAddMembersScreen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: "20px", padding: "28px", width: "100%", maxWidth: "480px", margin: "0 16px", boxShadow: "0 12px 40px rgba(0,0,0,0.2)" }}>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>Create Team</h2>
              <span onClick={closeAddMembersScreen} style={{ cursor: "pointer", fontSize: "20px", color: "#999" }}>✕</span>
            </div>

            <p style={{ margin: "0 0 8px", fontSize: "13px", color: "#666", fontWeight: 600 }}>Project invite link</p>
            <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
              <input type="text" value={teamInviteLink} readOnly
                style={{ flex: 1, borderRadius: "999px", border: "1px solid #e0e0e0", padding: "10px 16px", fontSize: "13px", background: "#f7f7f7", color: "#555", outline: "none" }} />
              <button onClick={() => { navigator.clipboard.writeText(teamInviteLink); alert("Link copied!"); }}
                style={{ borderRadius: "999px", border: "1px solid #e0e0e0", background: "#fff", padding: "10px 18px", fontSize: "13px", cursor: "pointer", fontWeight: 500 }}>
                Copy
              </button>
            </div>

            <p style={{ margin: "0 0 12px", fontSize: "13px", color: "#666", fontWeight: 600 }}>Add members via email</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "12px" }}>
              {emailInputs.map((email, index) => (
                <input key={index} type="email" value={email}
                  onChange={(e) => handleEmailChange(index, e.target.value)}
                  placeholder="Enter email address"
                  style={{ borderRadius: "999px", border: "1px solid #e0e0e0", padding: "10px 18px", fontSize: "14px", outline: "none", width: "100%", boxSizing: "border-box" }} />
              ))}
            </div>

            <button onClick={() => setEmailInputs([...emailInputs, ""])}
              style={{ width: "100%", borderRadius: "999px", border: "1px solid #e0e0e0", background: "#fff", padding: "10px 0", fontSize: "14px", cursor: "pointer", marginBottom: "20px", fontWeight: 500 }}>
              + Add another email
            </button>

            <div style={{ display: "flex", gap: "10px" }}>
              <button disabled={isSending} onClick={sendInvites}
                style={{ flex: 1, borderRadius: "999px", border: "none", background: isSending ? "#888" : "#111", color: "#fff", padding: "12px 0", fontSize: "14px", cursor: isSending ? "not-allowed" : "pointer", fontWeight: 600 }}>
                {isSending ? "Sending..." : "Send invitation"}
              </button>
              <button onClick={closeAddMembersScreen}
                style={{ flex: 1, borderRadius: "999px", border: "1px solid #e0e0e0", background: "#fff", color: "#111", padding: "12px 0", fontSize: "14px", cursor: "pointer", fontWeight: 500 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}