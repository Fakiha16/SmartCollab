import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const projects = [
  { title: "Website Redesign", img: "https://picsum.photos/90/90?random=11", progress: 70 },
  { title: "Mobile App", img: "https://picsum.photos/90/90?random=12", progress: 45 },
  { title: "Dashboard UI", img: "https://picsum.photos/90/90?random=13", progress: 90 }
];

export default function Profile() {

  const navigate = useNavigate();
  const [user,setUser] = useState(null);

  useEffect(()=>{
    const storedUser = localStorage.getItem("user");
    if(storedUser){
      setUser(JSON.parse(storedUser));
    }
  },[]);

  const logout = () => {
    localStorage.clear();
    navigate("/login",{replace:true});
  };

  return (

    <div className="pf-wrap">

      <div className="pf-grid">

        {/* LEFT PROFILE CARD */}
        <section className="pf-card pf-profile">

          <div className="pf-avatarRing">
            <img
              className="pf-avatar"
              src="https://i.pravatar.cc/220?img=5"
              alt="profile"
            />
          </div>

          <div className="pf-name">
            {user?.name || "Client Name"}
          </div>

          <div className="pf-loc">
            Client
          </div>

          <div className="pf-info">

            <div className="pf-row">
              <span className="pf-ico">👤</span>
              <span>Client</span>
            </div>

            <div className="pf-row">
              <span className="pf-ico">✉️</span>
              <span>{user?.email || "Email"}</span>
            </div>

            

          </div>

          <div className="pf-actions">

            <button
              className="pf-editBtn"
              onClick={() => navigate("/client/edit-profile")}
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
            Client &gt; Profile
          </div>

          <div className="pf-title">
            Welcome, {user?.name || "Client"}
          </div>

          <div className="pf-quote">
            You can monitor your project progress and communicate with the team here.
          </div>

          {/* ACTIVITY SUMMARY */}
          <div className="pf-sectionHead">
            <div className="pf-sectionTitle">Activity Summary</div>
          </div>

          <div className="pf-info">
            <div className="pf-row">
              <span className="pf-ico">💬</span>
              <span>Messages Sent: 12</span>
            </div>
            <div className="pf-row">
              <span className="pf-ico">📢</span>
              <span>Feedback Given: 3</span>
            </div>
            <div className="pf-row">
              <span className="pf-ico">⏱️</span>
              <span>Last Active: Today</span>
            </div>
          </div>

          {/* FEEDBACK BUTTON */}
          <div style={{marginTop:"16px"}}>
            <button className="pf-editBtn" onClick={()=>navigate("/client/feedback")}>
              ✍️ Give Feedback
            </button>
          </div>

        </section>

        {/* RIGHT PROJECTS */}
        <section className="pf-card pf-projects">

          <div className="pf-rightHead">
            <div className="pf-rightTitle">Your Projects</div>
          </div>

          <div className="pf-projectGrid">
            {projects.map((p,i)=>(
              <div key={i} className="pf-projectItem">
                <img className="pf-projectImg" src={p.img} alt={p.title}/>
                <div className="pf-projectLabel">{p.title}</div>

                {/* Progress */}
                <div style={{fontSize:"10px", color:"#aaa"}}>
                  Progress: {p.progress}%
                </div>
              </div>
            ))}
          </div>

        </section>



      </div>
    </div>
  );
}