import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ClientProfile.css";

const API = "http://localhost:5000/api";

const fallbackImages = [
  "https://picsum.photos/300/220?random=21",
  "https://picsum.photos/300/220?random=22",
  "https://picsum.photos/300/220?random=23",
  "https://picsum.photos/300/220?random=24",
  "https://picsum.photos/300/220?random=25",
];

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [messagesCount, setMessagesCount] = useState(0);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const activeProjectId = localStorage.getItem("projectId");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      const nameParts = (parsedUser.name || "").split(" ");
      setFirstName(nameParts[0] || "");
      setLastName(nameParts.slice(1).join(" ") || "");
      setEmail(parsedUser.email || "");
      setPhone(parsedUser.phone || "");
    }
  }, []);

  useEffect(() => {
    const fetchClientProjects = async () => {
      try {
        setLoadingProjects(true);

        const storedUser = JSON.parse(localStorage.getItem("user"));
        const token = localStorage.getItem("token");
        const projectIds = storedUser?.projectIds || [];
        const userProjectId = storedUser?.projectId || "";
        const localProjectId = localStorage.getItem("projectId") || "";

        const ids = Array.from(
          new Set([localProjectId, userProjectId, ...projectIds].filter(Boolean))
        );

        let fetchedProjects = [];

        try {
          const res = await fetch(`${API}/projects/client`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });

          const data = await res.json();

          fetchedProjects = Array.isArray(data.projects)
            ? data.projects
            : Array.isArray(data)
            ? data
            : [];
        } catch (err) {
          console.warn("Client projects API failed, fallback by IDs:", err);
        }

        for (const id of ids) {
          const alreadyExists = fetchedProjects.some(
            (project) => String(project._id) === String(id)
          );

          if (!alreadyExists) {
            try {
              const singleRes = await fetch(`${API}/projects/${id}`);
              const singleProject = await singleRes.json();

              if (singleProject && singleProject._id) {
                fetchedProjects.push(singleProject);
              }
            } catch (err) {
              console.error("Single project fetch failed:", err);
            }
          }
        }

        const uniqueProjects = Array.from(
          new Map(fetchedProjects.map((project) => [project._id, project])).values()
        );

        const sortedProjects = uniqueProjects.sort((a, b) => {
          if (String(a._id) === String(activeProjectId)) return -1;
          if (String(b._id) === String(activeProjectId)) return 1;
          return 0;
        });

        setProjects(sortedProjects);
      } catch (error) {
        console.error("Fetch client projects failed:", error);
        setProjects([]);
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchClientProjects();
  }, [activeProjectId]);

  useEffect(() => {
    const fetchMessagesCount = async () => {
      try {
        if (!activeProjectId) {
          setMessagesCount(0);
          return;
        }

        const res = await fetch(`${API}/messages?projectId=${activeProjectId}`);
        const data = await res.json();

        const clientMessages = Array.isArray(data)
          ? data.filter((msg) => msg.sender === user?.email)
          : [];

        setMessagesCount(clientMessages.length);
      } catch (error) {
        console.error("Messages count fetch failed:", error);
        setMessagesCount(0);
      }
    };

    if (user?.email) {
      fetchMessagesCount();
    }
  }, [activeProjectId, user?.email]);

  const totalProjects = projects.length;

  const activeProjects = useMemo(() => {
    return projects.filter(
      (project) => (project.status || "Active").toLowerCase() === "active"
    ).length;
  }, [projects]);

  const saveProfileChanges = async () => {
    if (!user?._id) {
      alert("User not found. Please login again.");
      return;
    }

    const fullName = `${firstName} ${lastName}`.trim();

    if (!fullName) {
      alert("Name is required.");
      return;
    }

    try {
      const response = await fetch(`${API}/users/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: fullName,
          email,
          phone,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const updatedUserDB = await response.json();

      const updatedUser = {
        ...user,
        ...updatedUserDB,
        name: updatedUserDB.name || fullName,
        email: updatedUserDB.email || email,
        phone: updatedUserDB.phone || phone,
      };

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setIsEditing(false);

      alert("✅ Profile updated successfully");
    } catch (error) {
      console.error("Profile update failed:", error);
      alert("Error updating profile. Please try again.");
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  const openProject = (projectId) => {
    localStorage.setItem("projectId", projectId);
    navigate(`/client/project/${projectId}`);
  };

  return (
    <div className="client-profile-page pf-wrap">
      <div className="pf-grid">
        <section className="pf-card pf-profile">
          <div className="pf-avatarRing">
            <img
              className="pf-avatar"
              src="https://i.pravatar.cc/220?img=5"
              alt="profile"
            />
          </div>

          <h2 className="pf-name">{user?.name || "Client Name"}</h2>
          <p className="pf-loc">Client</p>

          <div className="pf-info">
            <div className="pf-row">
              <span className="pf-ico">👤</span>
              <span>Client</span>
            </div>

            <div className="pf-row">
              <span className="pf-ico">✉️</span>
              <span>{user?.email || "client@email.com"}</span>
            </div>

            <div className="pf-row">
              <span className="pf-ico">📞</span>
              <span>{user?.phone || "Not added"}</span>
            </div>

            <div className="pf-row">
              <span className="pf-ico">📁</span>
              <span>{totalProjects} Projects</span>
            </div>
          </div>

          <div className="pf-actions">
            <button className="pf-editBtn" onClick={() => setIsEditing(true)}>
              ✏️ Edit Profile
            </button>

            <button className="pf-logoutBtn" onClick={logout}>
              Logout
            </button>
          </div>
        </section>

        <section className="pf-card pf-center-card">
          <div className="pf-breadcrumb">Client &gt; Profile</div>

          <h1 className="pf-title">Welcome, {user?.name || "Client"}</h1>

          <div className="pf-quote">
            You can monitor your project progress, share feedback, and communicate
            with the project team from one place.
          </div>

          <div className="pf-sectionHead">
            <h3 className="pf-sectionTitle">Activity Summary</h3>
          </div>

          <div className="pf-summaryGrid">
            <div className="pf-summaryCard">
              <span className="pf-summaryIcon">📁</span>
              <strong>{totalProjects}</strong>
              <p>Total Projects</p>
            </div>

            <div className="pf-summaryCard">
              <span className="pf-summaryIcon">✅</span>
              <strong>{activeProjects}</strong>
              <p>Active Projects</p>
            </div>

            <div className="pf-summaryCard">
              <span className="pf-summaryIcon">💬</span>
              <strong>{messagesCount}</strong>
              <p>Messages Sent</p>
            </div>

            <div className="pf-summaryCard">
              <span className="pf-summaryIcon">⏱️</span>
              <strong>Today</strong>
              <p>Last Active</p>
            </div>
          </div>
        </section>

        <section className="pf-card pf-projects">
          <div className="pf-rightHead">
            <h2 className="pf-rightTitle">Your Projects</h2>

            <button
              className="pf-viewAllBtn"
              onClick={() => navigate("/client/perprojects")}
            >
              View All
            </button>
          </div>

          {loadingProjects ? (
            <div className="pf-emptyText">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="pf-emptyText">No projects found.</div>
          ) : (
            <div className="pf-projectList">
              {projects.slice(0, 5).map((project, index) => {
                const progress =
                  project?.performance?.frontend?.progress ||
                  project?.progress ||
                  0;

                return (
                  <div
                    key={project._id}
                    className="pf-projectCard"
                    onClick={() => openProject(project._id)}
                  >
                    <img
                      className="pf-projectThumb"
                      src={fallbackImages[index % fallbackImages.length]}
                      alt={project.title || "Project"}
                    />

                    <div className="pf-projectContent">
                      <div className="pf-projectTop">
                        <h4>{project.title || project.name || "Untitled Project"}</h4>
                        <span>{project.status || "Active"}</span>
                      </div>

                      <p>{project.desc || "No description added."}</p>

                      <div className="pf-progressTop">
                        <span>Progress</span>
                        <strong>{progress}%</strong>
                      </div>

                      <div className="pf-progressTrack">
                        <div
                          className="pf-progressFill"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {isEditing && (
        <div className="pf-modalOverlay">
          <div className="pf-editModal">
            <div className="pf-modalHead">
              <div>
                <p className="pf-breadcrumb">Client &gt; Edit Profile</p>
                <h2>Edit Profile</h2>
              </div>

              <button className="pf-closeBtn" onClick={() => setIsEditing(false)}>
                ✕
              </button>
            </div>

            <div className="pf-formGrid">
              <div className="pf-field">
                <label>First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter first name"
                />
              </div>

              <div className="pf-field">
                <label>Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter last name"
                />
              </div>

              <div className="pf-field">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                />
              </div>

              <div className="pf-field">
                <label>Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div className="pf-modalActions">
              <button className="pf-cancelBtn" onClick={() => setIsEditing(false)}>
                Cancel
              </button>

              <button className="pf-saveBtn" onClick={saveProfileChanges}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}