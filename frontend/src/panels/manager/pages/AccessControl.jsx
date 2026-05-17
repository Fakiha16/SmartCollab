import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AccessControl.css";

export default function AccessControl() {
  // 1. Start with an empty array. We will populate this from the database.
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const [form, setForm] = useState({ name: "", role: "", email: "" });

  // 2. Fetch real projects when the component mounts
  useEffect(() => {
    const fetchBackendProjects = async () => {
      try {
        // Change URL to match your backend port configuration
        const response = await axios.get("http://localhost:5000/api/projects");
        
        // Ensure data is parsed correctly depending on your API structure
        setProjects(response.data || []);
      } catch (error) {
        console.error("Could not fetch projects from database:", error);
      }
    };
    fetchBackendProjects();
  }, []);

  // Safe matching (using MongoDB _id instead of title strings reduces matching bugs)
  const selectedProjectData = projects.find((p) => p._id === selectedProject);
  const teamMembers = selectedProjectData?.team?.[selectedTeam] || [];

  // ================= ADD MEMBER =================
  const handleAdd = async () => {
    if (!form.name || !form.role || !form.email) return alert("Fill all fields");

    // Optimized for Local-First fallback UI, but ideal location for an API call:
    // await axios.post(`/api/projects/${selectedProject}/members`, form);
    const updated = projects.map((p) => {
      if (p._id === selectedProject) {
        const safeTeam = p.team || { Frontend: [], Backend: [], QA: [], Designer: [] };
        return {
          ...p,
          team: {
            ...safeTeam,
            [form.role]: [...(safeTeam[form.role] || []), { name: form.name, email: form.email }]
          }
        };
      }
      return p;
    });

    setProjects(updated);
    setShowAdd(false);
    setForm({ name: "", role: "", email: "" });
  };

  // ================= DELETE MEMBER =================
  const handleDelete = () => {
    const updated = projects.map((p) => {
      if (p._id === selectedProject) {
        const safeTeam = p.team || {};
        return {
          ...p,
          team: {
            ...safeTeam,
            [form.role]: (safeTeam[form.role] || []).filter((m) => m.name !== form.name)
          }
        };
      }
      return p;
    });

    setProjects(updated);
    setShowDelete(false);
    setForm({ name: "", role: "", email: "" });
  };

  const getRolesForMember = () => {
    if (!selectedProjectData || !selectedProjectData.team) return [];
    return Object.keys(selectedProjectData.team).filter((role) =>
      (selectedProjectData.team[role] || []).some((m) => m.name === form.name)
    );
  };

  return (
    <div className="ac-wrap">
      <div className="ac-topPanel">
        <div className="ac-team">
          <h3>Team Management</h3>

          {/* PROJECT SELECT dropdown fixed with clear value attributes */}
          <select 
            value={selectedProject} 
            onChange={(e) => {
              setSelectedProject(e.target.value);
              setSelectedTeam(""); // Reset selected team when project changes
            }}
          >
            <option value="">Select Project</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.title || p.projectName}
              </option>
            ))}
          </select>

          {/* TEAM SELECT */}
          {selectedProject && (
            <select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)}>
              <option value="">Select Team</option>
              <option value="Frontend">Frontend</option>
              <option value="Backend">Backend</option>
              <option value="QA">QA</option>
              <option value="Designer">Designer</option>
            </select>
          )}

          {/* MEMBERS DISPLAY */}
          <div className="ac-teamGrid">
            {teamMembers.length === 0 && selectedTeam && <p style={{color: '#999'}}>No members assigned.</p>}
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

      {/* --- ADD MODAL --- */}
      {showAdd && (
        <div className="ac-modalOverlay">
          <div className="ac-modal">
            <h2>Add Member</h2>
            <input
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <select onChange={(e) => setForm({ ...form, role: e.target.value })} value={form.role}>
              <option value="">Select Role</option>
              <option value="Frontend">Frontend</option>
              <option value="Backend">Backend</option>
              <option value="QA">QA</option>
              <option value="Designer">Designer</option>
            </select>
            <input
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <button onClick={handleAdd}>Add</button>
            <button onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* --- DELETE MODAL --- */}
      {showDelete && (
        <div className="ac-modalOverlay">
          <div className="ac-modal">
            <h2>Delete Member</h2>
            <input
              placeholder="Enter Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <select onChange={(e) => setForm({ ...form, role: e.target.value })} value={form.role}>
              <option value="">Select Role</option>
              {getRolesForMember().map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <input
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <button onClick={handleDelete}>Delete</button>
            <button onClick={() => setShowDelete(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}