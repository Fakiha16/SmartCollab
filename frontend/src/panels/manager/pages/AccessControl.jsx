import React, { useState } from "react";
import "./AccessControl.css";

export default function AccessControl() {

  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem("projects");
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedProject, setSelectedProject] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const [form, setForm] = useState({
    name: "",
    role: "",
    email: ""
  });

  const selectedProjectData = projects.find(
    (p) => p.title === selectedProject
  );

  const teamMembers =
    selectedProjectData?.team?.[selectedTeam] || [];

  // ================= ADD =================
  const handleAdd = () => {
    if (!form.name || !form.role || !form.email)
      return alert("Fill all fields");

    const updated = projects.map((p) => {
      if (p.title === selectedProject) {

        // ✅ SAFE TEAM STRUCTURE
        const safeTeam = p.team || {
          Frontend: [],
          Backend: [],
          QA: [],
          Designer: []
        };

        return {
          ...p,
          team: {
            ...safeTeam,
            [form.role]: [
              ...(safeTeam[form.role] || []),
              { name: form.name, email: form.email }
            ]
          }
        };
      }
      return p;
    });

    setProjects(updated);
    localStorage.setItem("projects", JSON.stringify(updated));

    setShowAdd(false);
    setForm({ name: "", role: "", email: "" });
  };

  // ================= DELETE =================
  const handleDelete = () => {
    const updated = projects.map((p) => {
      if (p.title === selectedProject) {

        const safeTeam = p.team || {};

        return {
          ...p,
          team: {
            ...safeTeam,
            [form.role]: (safeTeam[form.role] || []).filter(
              (m) => m.name !== form.name
            )
          }
        };
      }
      return p;
    });

    setProjects(updated);
    localStorage.setItem("projects", JSON.stringify(updated));

    setShowDelete(false);
    setForm({ name: "", role: "", email: "" });
  };

  // 🔥 FIXED ROLE FUNCTION
  const getRolesForMember = () => {
    if (!selectedProjectData || !selectedProjectData.team) return [];

    return Object.keys(selectedProjectData.team).filter((role) =>
      (selectedProjectData.team[role] || []).some(
        (m) => m.name === form.name
      )
    );
  };

  return (
    <div className="ac-wrap">

      <div className="ac-topPanel">

        <div className="ac-team">

          <h3>Team Management</h3>

          {/* PROJECT */}
          <select onChange={(e) => setSelectedProject(e.target.value)}>
            <option>Select Project</option>
            {projects.map((p) => (
              <option key={p.id}>{p.title}</option>
            ))}
          </select>

          {/* TEAM */}
          {selectedProject && (
            <select onChange={(e) => setSelectedTeam(e.target.value)}>
              <option>Select Team</option>
              <option>Frontend</option>
              <option>Backend</option>
              <option>QA</option>
              <option>Designer</option>
            </select>
          )}

          {/* MEMBERS */}
          <div className="ac-teamGrid">
            {teamMembers.map((m, i) => (
              <div key={i} className="ac-avatar">
                {m.name}
              </div>
            ))}
          </div>

        </div>

        <div className="ac-miniCard" onClick={() => setShowAdd(true)}>
          Add Member
        </div>

        <div className="ac-miniCard" onClick={() => setShowDelete(true)}>
          Delete Member
        </div>

      </div>

      {/* ADD MODAL */}
      {showAdd && (
        <div className="ac-modalOverlay">
          <div className="ac-modal">

            <h2>Add Member</h2>

            <input
              placeholder="Name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />

            <select
              onChange={(e) =>
                setForm({ ...form, role: e.target.value })
              }
            >
              <option>Select Role</option>
              <option>Frontend</option>
              <option>Backend</option>
              <option>QA</option>
              <option>Designer</option>
            </select>

            <input
              placeholder="Email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />

            <button onClick={handleAdd}>Add</button>
            <button onClick={() => setShowAdd(false)}>Cancel</button>

          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDelete && (
        <div className="ac-modalOverlay">
          <div className="ac-modal">

            <h2>Delete Member</h2>

            <input
              placeholder="Enter Name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />

            <select
              onChange={(e) =>
                setForm({ ...form, role: e.target.value })
              }
            >
              <option>Select Role</option>
              {getRolesForMember().map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>

            <input
              placeholder="Email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />

            <button onClick={handleDelete}>Delete</button>
            <button onClick={() => setShowDelete(false)}>Cancel</button>

          </div>
        </div>
      )}

    </div>
  );
}