import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ IMPORTANT
import "./Projects.css";

export default function Projects() {

  const navigate = useNavigate(); // ✅ navigation enable

  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem("projects");
    return saved ? JSON.parse(saved) : [];
  });

  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);

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
    }

    // reset
    setShowForm(false);
    setIsEdit(false);
    setEditId(null);

    setForm({
      title: "",
      desc: "",
      frontend: "",
      backend: "",
      tester: "",
      designer: ""
    });
  };

  // ================= EDIT =================
  const handleEdit = (p) => {
    setIsEdit(true);
    setEditId(p.id);
    setShowForm(true);

    setForm({
      title: p.title,
      desc: p.desc,
      frontend: "",
      backend: "",
      tester: "",
      designer: ""
    });
  };

  return (
    <div className="pr-wrap">

      {/* HEADER */}
      <div className="pr-header">
        <h1 className="pr-title">Projects</h1>

        {projects.length > 0 && (
          <button
            className="pr-createBtn"
            onClick={() => {
              setShowForm(true);
              setIsEdit(false);
            }}
          >
            + Create New Project
          </button>
        )}
      </div>

      {/* EMPTY STATE */}
      {projects.length === 0 && (
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh"
        }}>
          <button
            className="pr-createCenterBtn"
            onClick={() => setShowForm(true)}
          >
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
              onClick={() => navigate(`/manager/project/${p.id}`)} // ✅ FIXED
              style={{ cursor: "pointer" }}
            >

              <div className="pr-cardTop">
                <div className="pr-cardTitle">{p.title}</div>
                <span className="pr-status">{p.status}</span>
              </div>

              <div className="pr-divider" />
              <p className="pr-desc">{p.desc}</p>

              <div className="pr-bottom">
                <div className="pr-date">{p.date}</div>
              </div>

              {/* ✅ EDIT BUTTON FIXED */}
              <button
                className="pr-editBtn"
                onClick={(e) => {
                  e.stopPropagation(); // ❗ prevent navigation
                  handleEdit(p);
                }}
              >
                ✏️ Edit
              </button>

            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {showForm && (
        <div className="pr-modalOverlay">
          <div className="pr-modal">

            <div className="pr-modalHeader">
              <h2>{isEdit ? "Edit Project" : "Create Project"}</h2>
              <span
                className="pr-close"
                onClick={() => setShowForm(false)}
              >
                ✕
              </span>
            </div>

            <div className="pr-modalBody">

              <input
                name="title"
                placeholder="Project Name"
                value={form.title}
                onChange={handleChange}
              />

              <textarea
                name="desc"
                placeholder="Description"
                value={form.desc}
                onChange={handleChange}
              />

              {!isEdit && (
                <>
                  <input name="frontend" placeholder="Frontend" value={form.frontend} onChange={handleChange}/>
                  <input name="backend" placeholder="Backend" value={form.backend} onChange={handleChange}/>
                  <input name="tester" placeholder="QA" value={form.tester} onChange={handleChange}/>
                  <input name="designer" placeholder="Designer" value={form.designer} onChange={handleChange}/>
                </>
              )}

            </div>

            <div className="pr-modalFooter">
              <button className="pr-btn primary" onClick={handleSubmit}>
                {isEdit ? "Update" : "Create"}
              </button>

              <button
                className="pr-btn secondary"
                onClick={() => setShowForm(false)}
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