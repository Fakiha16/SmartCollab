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

  useEffect(()=>{

    const storedUser = localStorage.getItem("user");

    if(storedUser){
      setUser(JSON.parse(storedUser));
    }

  },[]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
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
            {user?.name || "User Name"}
          </div>

          <div className="pf-loc">
            {user?.role || "Role"}
          </div>

          <button className="pf-logoutBtn" type="button" onClick={logout}>
            Logout
          </button>

          <div className="pf-info">

            <div className="pf-row">
              <span className="pf-ico">👤</span>
              <span>{user?.role || "Role"}</span>
            </div>

            <div className="pf-row">
              <span className="pf-ico">✉️</span>
              <span>{user?.email || "Email"}</span>
            </div>

            <div className="pf-row">
              <span className="pf-ico">📄</span>
              <span>SmartCollab Member</span>
            </div>

          </div>

        </section>

        {/* CENTER */}

        <section className="pf-card pf-center">

          <div className="pf-breadcrumb">
            Inicio &nbsp;&gt;&nbsp; Profile
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
                <div className="pf-donutText">
                  Active
                </div>

              </div>

            </div>

          </div>

        </section>

      </div>

    </div>

  );

}