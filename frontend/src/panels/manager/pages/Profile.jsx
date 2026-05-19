import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef();

  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [joinedMembers, setJoinedMembers] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [showEdit, setShowEdit] = useState(false);

  const [editData, setEditData] = useState({
    name: "",
    email: "",
    role: "",
    team: "",
    isMember: true,
    avatar: "",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      setEditData({
        name: parsed.name || "",
        email: parsed.email || "",
        role: parsed.role || "",
        team: parsed.team || "",
        isMember: parsed.isMember ?? true,
        avatar: parsed.avatar || "",
      });
    }
  }, []);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const managerEmail = storedUser?.email || "";
        if (!managerEmail) return;

        const projectsRes = await axios.get(
          `http://localhost:5000/api/projects/manager/${managerEmail}`
        );
        const managerProjects = Array.isArray(projectsRes.data)
          ? projectsRes.data
          : [];
        setProjects(managerProjects);

        let allJoined = [];
        let allPending = [];

        for (const project of managerProjects) {
          const detailRes = await axios.get(
            `http://localhost:5000/api/projects/${project._id}`
          );
          const projectJoined = (detailRes.data?.joinedMembers || []).map(
            (member) => ({ ...member, projectTitle: project.title })
          );
          const projectPending = (detailRes.data?.pendingInvites || []).map(
            (invite) => ({ ...invite, projectTitle: project.title })
          );
          allJoined = [...allJoined, ...projectJoined];
          allPending = [...allPending, ...projectPending];
        }

        setJoinedMembers(allJoined);
        setPendingInvites(allPending);
      } catch (err) {
        console.error("Profile data fetch error:", err);
      }
    };
    fetchProfileData();
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const updated = { ...editData, avatar: reader.result };
      setEditData(updated);
      setUser(updated);
      localStorage.setItem("user", JSON.stringify(updated));
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = () => {
    localStorage.setItem("user", JSON.stringify(editData));
    setUser(editData);
    setShowEdit(false);
  };

  const getInitial = (value) => (value || "U")[0].toUpperCase();

  const activeProjects = projects.filter(
    (project) => (project.status || "Active") === "Active"
  );

  return (
    <div className="pf-wrap">
      <div className="pf-grid">

        {/* LEFT PROFILE */}
        <section className="pf-card pf-profile">
          <div
            className="pf-avatarRing"
            onClick={() => fileInputRef.current.click()}
            style={{ cursor: "pointer" }}
            title="Click to change picture"
          >
            <img
              className="pf-avatar"
              src={user?.avatar || "https://i.pravatar.cc/220?img=5"}
              alt="profile"
            />
          </div>

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleImageChange}
          />

          <div className="pf-name">{user?.name || "User Name"}</div>
          <div className="pf-loc">{user?.role || "Role"}</div>

          <div className="pf-info">
            <div className="pf-row">
              <span className="pf-ico">👤</span>
              <span>{user?.role || "Manager"}</span>
            </div>

            <div className="pf-row">
              <span className="pf-ico">✉️</span>
              <span>{user?.email || "No email"}</span>
            </div>

            <div className="pf-row">
              <span className="pf-ico">👥</span>
              <span>
                {joinedMembers.length > 0
                  ? `${joinedMembers.length} Team Members`
                  : "No Team Members"}
              </span>
            </div>

            <div className="pf-row">
              <span className="pf-ico">📁</span>
              <span>{projects.length} Projects</span>
            </div>

            <div className="pf-row">
              <span className="pf-ico">📄</span>
              <span>
                {user?.isMember === false
                  ? "Not a Member"
                  : "SmartCollab Member"}
              </span>
            </div>
          </div>

          <div style={{ flexGrow: 1 }} />
          <div className="pf-actions">
            <button className="pf-editBtn" onClick={() => setShowEdit(true)}>
              ✏️ Edit Profile
            </button>
            <button className="pf-logoutBtn" onClick={logout}>
              Logout
            </button>
          </div>
        </section>

        {/* CENTER */}
        <section className="pf-card pf-center">
          <div className="pf-breadcrumb">SmartCollab &gt; Profile</div>

          <div className="pf-title">{user?.role || "Manager"}</div>

          <div className="pf-quote">
            Welcome to your SmartCollab workspace
          </div>

          <div className="pf-sectionHead">
            <div className="pf-sectionTitle">Team Members</div>
          </div>

          {joinedMembers.length > 0 ? (
            <div className="pf-realList">
              {joinedMembers.slice(0, 7).map((member, index) => (
                <div key={index} className="pf-realItem">
                  <div className="pf-realAvatar">
                    {getInitial(member.name || member.email)}
                  </div>

                  <div className="pf-realText">
                    <strong>{member.name || "Team Member"}</strong>
                    <span>{member.email}</span>
                    <small>{member.projectTitle}</small>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="pf-empty">No joined team members yet.</div>
          )}

          {pendingInvites.length > 0 && (
            <>
              <div className="pf-sectionHead pf-mt">
                <div className="pf-sectionTitle">Pending Invites</div>
              </div>

              <div className="pf-realList">
                {pendingInvites.slice(0, 5).map((invite, index) => (
                  <div key={index} className="pf-realItem">
                    <div className="pf-realAvatar pf-pendingAvatar">
                      {getInitial(invite.email)}
                    </div>

                    <div className="pf-realText">
                      <strong>{invite.email}</strong>
                      <span>Invitation sent</span>
                      <small>Pending Member</small>
                    </div>

                    <div className="pf-pendingTag">Pending</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        {/* RIGHT COLUMN */}
        <div className="pf-rightColumn">
          {/* MY PROJECTS */}
          <section className="pf-card pf-projects">
            <div className="pf-rightHead">
              <div className="pf-rightTitle">My Projects</div>
            </div>

            {projects.length > 0 ? (
              <div className="pf-projectRealList">
                {projects.map((project) => (
                  <div key={project._id} className="pf-projectRealCard">
                    <div className="pf-projectCardText">
                      <strong>{project.title}</strong>
                      <p>{project.desc || "No description added"}</p>
                    </div>

                    <span className="pf-statusBadge">
                      {project.status || "Active"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="pf-empty">No projects created yet.</div>
            )}
          </section>

          {/* WORKSPACE SUMMARY */}
          <section className="pf-card pf-total">
            <div className="pf-rightHead">
              <div className="pf-rightTitle">Workspace Summary</div>
            </div>

            <div className="pf-statsGrid">
              <div className="pf-statBox">
                <strong>{projects.length}</strong>
                <span>Total Projects</span>
              </div>

              <div className="pf-statBox">
                <strong>{activeProjects.length}</strong>
                <span>Active Projects</span>
              </div>

              <div className="pf-statBox">
                <strong>{joinedMembers.length}</strong>
                <span>Team Members</span>
              </div>

              <div className="pf-statBox">
                <strong>{pendingInvites.length}</strong>
                <span>Pending Invites</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* EDIT MODAL */}
      {showEdit && (
        <div className="pf-modalOverlay">
          <div className="pf-modal">
            <h2>Edit Profile</h2>

            <input
              name="name"
              value={editData.name}
              onChange={handleChange}
            />

            <input
              name="email"
              value={editData.email}
              onChange={handleChange}
            />

            <input
              name="role"
              value={editData.role}
              readOnly
              className="pf-readOnlyInput"
            />

            <label>
              <input
                type="checkbox"
                name="isMember"
                checked={editData.isMember}
                onChange={handleChange}
              />
              SmartCollab Member
            </label>

            <div className="pf-modalActions">
              <button onClick={saveProfile}>Save</button>
              <button onClick={() => setShowEdit(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
