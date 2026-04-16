import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const workedWith = [
  { name: "Addodle", img: "https://i.pravatar.cc/80?img=12" },
  { name: "Marketplace.", img: "https://i.pravatar.cc/80?img=21" },
  { name: "Von Dracula", img: "https://i.pravatar.cc/80?img=32" },
  { name: "Von Dracula", img: "https://i.pravatar.cc/80?img=35" },
  { name: "John Joestar", img: "https://i.pravatar.cc/80?img=41" },
  { name: "Akali Jin", img: "https://i.pravatar.cc/80?img=45" }
];

const projects = [
  { title: "Emo stuff", img: "https://picsum.photos/90/90?random=11" },
  { title: "Tim Burton", img: "https://picsum.photos/90/90?random=12" },
  { title: "Halloween!", img: "https://picsum.photos/90/90?random=13" },
  { title: "Spooky Art", img: "https://picsum.photos/90/90?random=14" }
];

export default function Profile() {

  const navigate = useNavigate();

  const [user,setUser] = useState(null);

  // ✅ modal state
  const [showEdit,setShowEdit] = useState(false);

  const [editData,setEditData] = useState({
    name:"",
    email:"",
    role:"",
    team:"",
    isMember:true
  });

  useEffect(()=>{
    const storedUser = localStorage.getItem("user");

    if(storedUser){
      const parsed = JSON.parse(storedUser);
      setUser(parsed);

      setEditData({
        name: parsed.name || "",
        email: parsed.email || "",
        role: parsed.role || "",
        team: parsed.team || "",
        isMember: parsed.isMember ?? true
      });
    }
  },[]);

  const logout = () => {
    localStorage.clear();
    navigate("/login",{replace:true});
  };

  const handleChange = (e)=>{
    const {name,value,type,checked} = e.target;

    setEditData(prev=>({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const saveProfile = ()=>{
    localStorage.setItem("user", JSON.stringify(editData));
    setUser(editData);
    setShowEdit(false);
  };

  return (

    <div className="pf-wrap">

      <div className="pf-grid">

        {/* LEFT PROFILE */}
        <section className="pf-card pf-profile">

          <div className="pf-avatarRing">
            <img
              className="pf-avatar"
              src="https://i.pravatar.cc/220?img=5"
              alt="profile"
            />
          </div>

          <div className="pf-name">
            {user?.name || "User Name"}
          </div>

          <div className="pf-loc">
            {user?.role || "Role"}
          </div>

          <div className="pf-info">

            <div className="pf-row">
              <span className="pf-ico">👤</span>
              <span>{user?.role}</span>
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
              <span>
                {user?.isMember ? "SmartCollab Member" : "Not a Member"}
              </span>
            </div>

          </div>

          <div className="pf-actions">

            <button
              className="pf-editBtn"
              onClick={()=>setShowEdit(true)}
            >
              ✏️ Edit Profile
            </button>

            <button
              className="pf-logoutBtn"
              onClick={logout}
            >
              Logout
            </button>

          </div>

        </section>

        {/* CENTER */}
        <section className="pf-card pf-center">

          <div className="pf-breadcrumb">
            Inicio &gt; Profile
          </div>

          <div className="pf-title">
            {user?.role || "Member"}
          </div>

          <div className="pf-quote">
            Welcome to your SmartCollab workspace
          </div>

          <div className="pf-sectionHead">
            <div className="pf-sectionTitle">Worked with</div>
          </div>

          <div className="pf-peopleGrid">
            {workedWith.map((p,i)=>(
              <div key={i} className="pf-person">
                <img className="pf-personImg" src={p.img} alt={p.name}/>
                <div className="pf-personName">{p.name}</div>
              </div>
            ))}
          </div>

        </section>

        {/* RIGHT PROJECTS */}
        <section className="pf-card pf-projects">

          <div className="pf-rightHead">
            <div className="pf-rightTitle">Projects</div>
          </div>

          <div className="pf-projectGrid">
            {projects.map((p,i)=>(
              <div key={i} className="pf-projectItem">
                <img className="pf-projectImg" src={p.img} alt={p.title}/>
                <div className="pf-projectLabel">{p.title}</div>
              </div>
            ))}
          </div>

        </section>

        {/* RIGHT BOTTOM */}
        <section className="pf-card pf-total">

          <div className="pf-rightHead">
            <div className="pf-rightTitle">Total work done</div>
          </div>

          <div className="pf-donutWrap">
            <div className="pf-donut">
              <div className="pf-donutInner">
                <div className="pf-donutText">Active</div>
              </div>
            </div>
          </div>

        </section>

      </div>

      {/* ================= EDIT MODAL ================= */}

      {showEdit && (
        <div className="pf-modalOverlay">

          <div className="pf-modal">

            <h2>Edit Profile</h2>

            <input name="name" value={editData.name} onChange={handleChange} placeholder="Name" />
            <input name="email" value={editData.email} onChange={handleChange} placeholder="Email" />

            <select name="role" value={editData.role} onChange={handleChange}>
              <option value="">Select Role</option>
              <option value="Developer">Developer</option>
              <option value="Tester">Tester</option>
              <option value="Designer">Designer</option>
              <option value="Manager">Manager</option>
            </select>

            <input name="team" value={editData.team} onChange={handleChange} placeholder="Team Name" />

            <label>
              <input type="checkbox" name="isMember" checked={editData.isMember} onChange={handleChange}/>
              SmartCollab Member
            </label>

            <div className="pf-modalActions">
              <button onClick={saveProfile}>Save</button>
              <button onClick={()=>setShowEdit(false)}>Cancel</button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}