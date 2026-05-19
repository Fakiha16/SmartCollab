import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./EmpProfile.css";

export default function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef();

  const [user, setUser] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [workedWithUsers, setWorkedWithUsers] = useState([]);

  const [editData, setEditData] = useState({
    name: "",
    email: "",
    empType: "",
    team: "",
    isMember: true,
    avatar: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) return;

        const parsed = JSON.parse(storedUser);
        const email = parsed.email;

        const res = await fetch(
          `http://localhost:5000/api/users/profile/${encodeURIComponent(email)}`
        );

        const data = await res.json();

        if (!res.ok) {
          console.error("Profile fetch failed:", data.message);

          setUser(parsed);
          setEditData({
            name: parsed.name || "",
            email: parsed.email || "",
            empType: parsed.empType || parsed.role || "",
            team: parsed.team || "",
            isMember: parsed.isMember ?? true,
            avatar: parsed.avatar || "",
          });

          await loadAssignedTasks(email);
          return;
        }

        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));

        setEditData({
          name: data.name || "",
          email: data.email || "",
          empType: data.empType || data.role || "",
          team: data.team || "",
          isMember: data.isMember ?? true,
          avatar: data.avatar || "",
        });

        await loadAssignedTasks(data.email);
      } catch (err) {
        console.error("Profile load error:", err);

        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);

          setUser(parsed);
          setEditData({
            name: parsed.name || "",
            email: parsed.email || "",
            empType: parsed.empType || parsed.role || "",
            team: parsed.team || "",
            isMember: parsed.isMember ?? true,
            avatar: parsed.avatar || "",
          });

          await loadAssignedTasks(parsed.email);
        }
      }
    };

    loadProfile();
  }, []);

  const loadAssignedTasks = async (email) => {
    try {
      if (!email) return;

      const res = await fetch(
        `http://localhost:5000/api/tasks/assigned/${encodeURIComponent(email)}`
      );

      const data = await res.json();

      if (res.ok && Array.isArray(data)) {
        setAssignedTasks(data);
      } else {
        setAssignedTasks([]);
      }
    } catch (err) {
      console.error("Assigned tasks load error:", err);
      setAssignedTasks([]);
    }
  };

  useEffect(() => {
  const loadWorkedWithManagers = async () => {
    try {
      if (!user?.email) {
        setWorkedWithUsers([]);
        return;
      }

      const res = await fetch(
        `http://localhost:5000/api/users/worked-with-managers/${encodeURIComponent(user.email)}`
      );

      const data = await res.json();

      if (!res.ok || !Array.isArray(data)) {
        console.error("Worked with managers fetch failed:", data.message);
        setWorkedWithUsers([]);
        return;
      }

      const filteredManagers = data.filter(
        (manager) => manager.email !== user.email
      );

      setWorkedWithUsers(filteredManagers);
    } catch (err) {
      console.error("Worked with managers load error:", err);
      setWorkedWithUsers([]);
    }
  };

  loadWorkedWithManagers();
}, [user?.email]);

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
      const updated = {
        ...editData,
        avatar: reader.result,
      };

      setEditData(updated);
      setUser((prev) => ({
        ...prev,
        avatar: reader.result,
      }));
    };

    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    try {
      const payload = {
        name: editData.name,
        empType: editData.empType,
        team: editData.team,
        isMember: editData.isMember,
        avatar: editData.avatar,
      };

      const res = await fetch(
        `http://localhost:5000/api/users/profile/${encodeURIComponent(editData.email)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Profile update failed");
        return;
      }

      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      setShowEdit(false);

      await loadAssignedTasks(data.email);
    } catch (err) {
      console.error("Profile save error:", err);
      alert("Something went wrong while updating profile");
    }
  };

  const getInitial = (name = "", email = "") => {
    if (name) return name.charAt(0).toUpperCase();
    if (email) return email.charAt(0).toUpperCase();
    return "U";
  };

  const getTaskTitle = (task) => {
    return task.title || task.taskTitle || task.name || "Untitled Task";
  };

  const getTaskDesc = (task) => {
    return task.description || task.desc || task.details || "No description";
  };

  const displayRole = user?.empType || user?.role || "Employee";

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

          <div className="pf-loc">{displayRole}</div>

          <div className="pf-info">
            <div className="pf-row">
              <span className="pf-ico">👤</span>
              <span>{displayRole}</span>
            </div>

            <div className="pf-row">
              <span className="pf-ico">✉️</span>
              <span>{user?.email}</span>
            </div>

            <div className="pf-row">
              <span className="pf-ico">👥</span>
              <span>{user?.team || "No Team"}</span>
            </div>

            <div className="pf-row">
              <span className="pf-ico">📄</span>
              <span>{user?.isMember ? "SmartCollab Member" : "Not a Member"}</span>
            </div>
          </div>

          <div className="pf-actions">
            <button className="pf-editBtn" onClick={() => setShowEdit(true)}>
              ✏️ Edit Profile
            </button>

            <button className="pf-logoutBtn" onClick={logout}>
              Logout
            </button>
          </div>
        </section>

        {/* CENTER - WORKED WITH */}
        <section className="pf-card pf-center">
          <div className="pf-breadcrumb">SmartCollab &gt; Profile</div>

          <div className="pf-title">{displayRole}</div>

          <div className="pf-quote">Welcome to your SmartCollab workspace</div>

          <div className="pf-sectionHead">
            <div className="pf-sectionTitle">Worked with</div>
          </div>

          <div className="pf-peopleGrid">
            {workedWithUsers.length === 0 ? (
              <div className="pf-emptyText">
                {user?.team ? "No manager found yet" : "No team assigned yet"}
              </div>
            ) : (
              workedWithUsers.map((member, i) => (
                <div key={member._id || i} className="pf-person">
                  {member.avatar ? (
                    <img
                      className="pf-personImg"
                      src={member.avatar}
                      alt={member.name || "team member"}
                    />
                  ) : (
                    <div className="pf-personImg pf-personAvatar">
                      {getInitial(member.name, member.email)}
                    </div>
                  )}

                  <div className="pf-personName">{member.name || member.email}</div>

                  <div className="pf-personRole">
                    {member.empType || member.role || "Employee"}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* RIGHT - ASSIGNED TASKS */}
        <section className="pf-card pf-projects">
          <div className="pf-rightHead">
            <div className="pf-rightTitle">Assigned Tasks</div>
          </div>

          <div className="pf-taskList">
            {assignedTasks.length === 0 ? (
              <div className="pf-emptyText">No assigned tasks yet</div>
            ) : (
              assignedTasks.map((task, i) => (
                <div key={task._id || i} className="pf-taskItem">
                  <div className="pf-taskTop">
                    <span className="pf-taskTitle">{getTaskTitle(task)}</span>
                    <span className="pf-taskStatus">
                      {task.status || task.column || "Backlog"}
                    </span>
                  </div>

                  <div className="pf-taskDesc">{getTaskDesc(task)}</div>

                  {task.priority && (
                    <div className="pf-taskMeta">Priority: {task.priority}</div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
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
              placeholder="Enter Name"
            />

            <input
              name="email"
              value={editData.email}
              readOnly
              placeholder="Email"
            />

            <select
              name="empType"
              value={editData.empType}
              onChange={handleChange}
            >
              <option value="">Select Employee Type</option>
              <option value="Developer">Developer</option>
              <option value="Tester">Tester</option>
              <option value="Designer">Designer</option>
              <option value="QA">QA</option>
            </select>

            <input
              name="team"
              value={editData.team}
              onChange={handleChange}
              placeholder="Enter Team Name"
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