import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AccessControl.css";

const API = "http://localhost:5000/api";

export default function AccessControl() {
  const user = JSON.parse(localStorage.getItem("user"));
  const managerEmail = user?.email || "";
  const managerName = user?.name || user?.email || "Project Manager";

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");

  const [joinedMembers, setJoinedMembers] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);

  const [showAdd, setShowAdd] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const [form, setForm] = useState({
    name: "",
    role: "",
    email: "",
  });

  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const resetForm = () => {
    setForm({
      name: "",
      role: "",
      email: "",
    });
  };

  const fetchManagerProjects = async () => {
    try {
      if (!managerEmail) return;

      setLoadingProjects(true);

      const res = await axios.get(`${API}/projects/manager/${managerEmail}`);

      const managerProjects = Array.isArray(res.data) ? res.data : [];

      const activeProjects = managerProjects.filter(
        (project) =>
          project &&
          project._id &&
          (project.status || "Active").toLowerCase() !== "deleted"
      );

      setProjects(activeProjects);

      if (activeProjects.length > 0) {
        const existingSelected = activeProjects.find(
          (project) => project._id === selectedProject
        );

        if (!existingSelected) {
          setSelectedProject(activeProjects[0]._id);
          localStorage.setItem("projectId", activeProjects[0]._id);
        }
      } else {
        setSelectedProject("");
        localStorage.removeItem("projectId");
      }
    } catch (error) {
      console.error("Fetch manager projects error:", error);
      setProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  };

  const fetchProjectMembers = async (projectId) => {
    try {
      if (!projectId) {
        setJoinedMembers([]);
        setPendingInvites([]);
        return;
      }

      setLoadingMembers(true);

      const res = await axios.get(`${API}/projects/${projectId}`);

      setJoinedMembers(res.data?.joinedMembers || []);
      setPendingInvites(res.data?.pendingInvites || []);
    } catch (error) {
      console.error("Fetch project members error:", error);
      setJoinedMembers([]);
      setPendingInvites([]);
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    fetchManagerProjects();
  }, [managerEmail]);

  useEffect(() => {
    if (selectedProject) {
      localStorage.setItem("projectId", selectedProject);
      fetchProjectMembers(selectedProject);
    } else {
      setJoinedMembers([]);
      setPendingInvites([]);
    }
  }, [selectedProject]);

  const handleProjectChange = (e) => {
    const projectId = e.target.value;

    setSelectedProject(projectId);
    setSelectedTeam("");

    if (projectId) {
      localStorage.setItem("projectId", projectId);
    } else {
      localStorage.removeItem("projectId");
    }
  };

  const handleAdd = async () => {
    const email = form.email.trim().toLowerCase();

    if (!selectedProject) {
      alert("Please select a project first.");
      return;
    }

    if (!form.name.trim()) {
      alert("Please enter member name.");
      return;
    }

    if (!form.role) {
      alert("Please select member role.");
      return;
    }

    if (!email) {
      alert("Please enter member email.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    setActionLoading(true);

    try {
      await axios.post(`${API}/invite`, {
        email,
        projectId: selectedProject,
        managerName,
        invitedBy: managerEmail,
        role: form.role,
        name: form.name.trim(),
      });

      alert("✅ Invitation sent successfully.");

      resetForm();
      setShowAdd(false);

      await fetchProjectMembers(selectedProject);
      await fetchManagerProjects();
    } catch (error) {
      console.error("Add member error:", error);

      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to add member.";

      alert(`❌ ${msg}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    const email = form.email.trim().toLowerCase();

    if (!selectedProject) {
      alert("Please select a project first.");
      return;
    }

    if (!email) {
      alert("Please enter or select member email.");
      return;
    }

    if (!window.confirm(`Do you want to remove ${email} from this project?`)) {
      return;
    }

    setActionLoading(true);

    try {
      await axios.delete(`${API}/projects/${selectedProject}/member`, {
        data: {
          email,
        },
      });

      alert("✅ Member removed successfully.");

      resetForm();
      setShowDelete(false);

      await fetchProjectMembers(selectedProject);
      await fetchManagerProjects();
    } catch (error) {
      console.error("Delete member error:", error);

      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to delete member.";

      alert(`❌ ${msg}`);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredJoinedMembers = selectedTeam
    ? joinedMembers.filter((member) => {
        const memberRole = (
          member.empType ||
          member.role ||
          ""
        ).toLowerCase();

        const selected = selectedTeam.toLowerCase();

        return (
          memberRole.includes(selected) ||
          (selected === "qa" && memberRole.includes("test")) ||
          (selected === "designer" && memberRole.includes("design"))
        );
      })
    : joinedMembers;

  const allDeleteOptions = [
    ...joinedMembers.map((member) => ({
      name: member.name || "Team Member",
      email: member.email,
      role: member.empType || member.role || "Employee",
      status: "Joined",
    })),
    ...pendingInvites.map((invite) => ({
      name: invite.email,
      email: invite.email,
      role: "Pending",
      status: "Pending",
    })),
  ];

  const selectedProjectTitle =
    projects.find((project) => project._id === selectedProject)?.title || "";

  return (
    <div className="ac-wrap">
      <div className="ac-topPanel">
        <div className="ac-team">
          <h3>Team Management</h3>

          <select value={selectedProject} onChange={handleProjectChange}>
            <option value="">
              {loadingProjects ? "Loading projects..." : "Select Project"}
            </option>

            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.title || project.projectName || "Untitled Project"}
              </option>
            ))}
          </select>

          {selectedProject && (
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
            >
              <option value="">All Members</option>
              <option value="Frontend">Frontend</option>
              <option value="Backend">Backend</option>
              <option value="QA">QA / Testing</option>
              <option value="Designer">Designer</option>
            </select>
          )}

          {selectedProject && (
            <div className="ac-selectedInfo">
              Selected Project: <strong>{selectedProjectTitle}</strong>
            </div>
          )}

          <div className="ac-membersSection">
            <h4>Team Members</h4>

            {loadingMembers ? (
              <p className="ac-emptyText">Loading members...</p>
            ) : filteredJoinedMembers.length > 0 ? (
              <div className="ac-memberList">
                {filteredJoinedMembers.map((member, index) => (
                  <div key={member.email || index} className="ac-memberCard">
                    <div className="ac-memberAvatar">
                      {(member.name || member.email || "U")[0].toUpperCase()}
                    </div>

                    <div className="ac-memberInfo">
                      <strong>{member.name || "Team Member"}</strong>
                      <span>{member.email}</span>
                      <small>{member.empType || member.role || "Employee"}</small>
                    </div>

                    <span className="ac-joinedBadge">Joined</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="ac-emptyText">No joined members yet.</p>
            )}

            <h4>Pending Invitations</h4>

            {pendingInvites.length > 0 ? (
              <div className="ac-memberList">
                {pendingInvites.map((invite, index) => (
                  <div key={invite.email || index} className="ac-memberCard">
                    <div className="ac-memberAvatar ac-pendingAvatar">
                      {(invite.email || "P")[0].toUpperCase()}
                    </div>

                    <div className="ac-memberInfo">
                      <strong>{invite.email}</strong>
                      <span>Invitation sent</span>
                      <small>Waiting for signup/login</small>
                    </div>

                    <span className="ac-pendingBadge">Pending</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="ac-emptyText">No pending invitations.</p>
            )}
          </div>
        </div>

        <div
          className="ac-miniCard"
          onClick={() => {
            if (!selectedProject) {
              alert("Please select a project first.");
              return;
            }
            resetForm();
            setShowAdd(true);
          }}
        >
          Add Member
        </div>

        <div
          className="ac-miniCard"
          onClick={() => {
            if (!selectedProject) {
              alert("Please select a project first.");
              return;
            }
            resetForm();
            setShowDelete(true);
          }}
        >
          Delete Member
        </div>
      </div>

      {showAdd && (
        <div className="ac-modalOverlay">
          <div className="ac-modal">
            <h2>Add Member</h2>

            <p className="ac-modalHint">
              This will send an invitation and the member will appear as pending
              until they join.
            </p>

            <input
              placeholder="Member Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <select
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              value={form.role}
            >
              <option value="">Select Role</option>
              <option value="Frontend">Frontend</option>
              <option value="Backend">Backend</option>
              <option value="QA">QA / Testing</option>
              <option value="Designer">Designer</option>
            </select>

            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <div className="ac-modalActions">
              <button onClick={handleAdd} disabled={actionLoading}>
                {actionLoading ? "Sending..." : "Send Invitation"}
              </button>

              <button
                onClick={() => {
                  setShowAdd(false);
                  resetForm();
                }}
                disabled={actionLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showDelete && (
        <div className="ac-modalOverlay">
          <div className="ac-modal">
            <h2>Delete Member</h2>

            <p className="ac-modalHint">
              Remove joined members or cancel pending invitations from this
              project.
            </p>

            <select
              value={form.email}
              onChange={(e) => {
                const selected = allDeleteOptions.find(
                  (item) => item.email === e.target.value
                );

                setForm({
                  name: selected?.name || "",
                  role: selected?.role || "",
                  email: selected?.email || "",
                });
              }}
            >
              <option value="">Select Member</option>

              {allDeleteOptions.map((member) => (
                <option key={`${member.email}-${member.status}`} value={member.email}>
                  {member.name} - {member.email} ({member.status})
                </option>
              ))}
            </select>

            <input
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              readOnly
            />

            <input
              placeholder="Role / Status"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              readOnly
            />

            <input
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <div className="ac-modalActions">
              <button onClick={handleDelete} disabled={actionLoading}>
                {actionLoading ? "Deleting..." : "Delete"}
              </button>

              <button
                onClick={() => {
                  setShowDelete(false);
                  resetForm();
                }}
                disabled={actionLoading}
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