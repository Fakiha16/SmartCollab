import React from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const workedWith = [
  { name: "Addodle", img: "https://i.pravatar.cc/80?img=12" },
  { name: "Marketplace.", img: "https://i.pravatar.cc/80?img=21" },
  { name: "Von Dracula", img: "https://i.pravatar.cc/80?img=32" },
  { name: "Von Dracula", img: "https://i.pravatar.cc/80?img=35" },
  { name: "John Joestar", img: "https://i.pravatar.cc/80?img=41" },
  { name: "Akali Jin", img: "https://i.pravatar.cc/80?img=45" },
  { name: "Kayn Vampyr", img: "https://i.pravatar.cc/80?img=49" },
  { name: "Kayn Vampyr", img: "https://i.pravatar.cc/80?img=52" },
  { name: "John Joestar", img: "https://i.pravatar.cc/80?img=57" },
  { name: "Akali Jin", img: "https://i.pravatar.cc/80?img=60" },
  { name: "Kayn Vampyr", img: "https://i.pravatar.cc/80?img=63" },
  { name: "Kayn Vampyr", img: "https://i.pravatar.cc/80?img=66" },
];

const projects = [
  { title: "Emo stuff", img: "https://picsum.photos/90/90?random=11" },
  { title: "Tim Burton", img: "https://picsum.photos/90/90?random=12" },
  { title: "Halloween!", img: "https://picsum.photos/90/90?random=13" },
  { title: "Spooky Art", img: "https://picsum.photos/90/90?random=14" },
  { title: "Dark Art", img: "https://picsum.photos/90/90?random=15" },
  { title: "Gothic art", img: "https://picsum.photos/90/90?random=16" },
  { title: ":- happy :3", img: "https://picsum.photos/90/90?random=17" },
  { title: "#V4MPYR*", img: "https://picsum.photos/90/90?random=18" },
  { title: "I <3 Art", img: "https://picsum.photos/90/90?random=19" },
];

export default function Profile() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login", { replace: true });
  };

  return (
    <div className="pf-wrap">
      <div className="pf-grid">
        {/* LEFT: Profile card */}
        <section className="pf-card pf-profile">
          <div className="pf-avatarRing">
            <img
              className="pf-avatar"
              src="https://i.pravatar.cc/220?img=5"
              alt="profile"
            />
          </div>

          <div className="pf-name">Yash Ghori</div>
          <div className="pf-loc">Ahmedabad, Gujarat</div>

          {/* ✅ Logout here */}
          <button className="pf-logoutBtn" type="button" onClick={logout}>
            Logout
          </button>

          <div className="pf-info">
            <div className="pf-row">
              <span className="pf-ico">👤</span>
              <span>UI - Intern</span>
            </div>
            <div className="pf-row">
              <span className="pf-ico">🕒</span>
              <span>on-teak</span>
            </div>
            <div className="pf-row">
              <span className="pf-ico">📞</span>
              <span>+91 7048144030</span>
            </div>
            <div className="pf-row">
              <span className="pf-ico">✉️</span>
              <span>yghori@asite.com</span>
            </div>
            <div className="pf-row">
              <span className="pf-ico">📄</span>
              <span>PDT - I</span>
            </div>
          </div>
        </section>

        {/* CENTER: Worked with */}
        <section className="pf-card pf-center">
          <div className="pf-breadcrumb">Inicio &nbsp;&gt;&nbsp; Profile</div>
          <div className="pf-title">UI Developer</div>

          <div className="pf-quote">
            Lorem Ipsum is the best sentence in the world of dummy text
          </div>

          <div className="pf-sectionHead">
            <div className="pf-sectionTitle">Worked with</div>
            <button className="pf-link" type="button">
              View all
            </button>
          </div>

          <div className="pf-peopleGrid">
            {workedWith.map((p, i) => (
              <div key={`${p.name}-${i}`} className="pf-person">
                <img className="pf-personImg" src={p.img} alt={p.name} />
                <div className="pf-personName">{p.name}</div>
              </div>
            ))}
          </div>
        </section>

        {/* RIGHT TOP: Projects */}
        <section className="pf-card pf-projects">
          <div className="pf-rightHead">
            <div className="pf-rightTitle">Projects</div>
            <button className="pf-link" type="button">
              View all
            </button>
          </div>

          <div className="pf-projectGrid">
            {projects.map((p) => (
              <div key={p.title} className="pf-projectItem">
                <img className="pf-projectImg" src={p.img} alt={p.title} />
                <div className="pf-projectLabel">{p.title}</div>
              </div>
            ))}
          </div>
        </section>

        {/* RIGHT BOTTOM: Total work done */}
        <section className="pf-card pf-total">
          <div className="pf-rightHead">
            <div className="pf-rightTitle">Total work done</div>
            <select className="pf-select" defaultValue="This Week">
              <option>This Week</option>
              <option>This Month</option>
              <option>This Quarter</option>
            </select>
          </div>

          <div className="pf-donutWrap">
            <div className="pf-donut">
              <div className="pf-donutInner">
                <div className="pf-donutText">5w: 2d</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}