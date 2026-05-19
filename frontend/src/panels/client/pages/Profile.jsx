// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "./ClientProfile.css";

// const projects = [
//   { title: "Website Redesign", img: "https://picsum.photos/90/90?random=11", progress: 70 },
//   { title: "Mobile App", img: "https://picsum.photos/90/90?random=12", progress: 45 },
//   { title: "Dashboard UI", img: "https://picsum.photos/90/90?random=13", progress: 90 }
// ];

// export default function Profile() {

//   const navigate = useNavigate();
//   const [user,setUser] = useState(null);

//   useEffect(()=>{
//     const storedUser = localStorage.getItem("user");
//     if(storedUser){
//       setUser(JSON.parse(storedUser));
//     }
//   },[]);

//   const logout = () => {
//     localStorage.clear();
//     navigate("/login",{replace:true});
//   };

//   return (

//     <div className="pf-wrap">

//       <div className="pf-grid">

//         {/* LEFT PROFILE CARD */}
//         <section className="pf-card pf-profile">

//           <div className="pf-avatarRing">
//             <img
//               className="pf-avatar"
//               src="https://i.pravatar.cc/220?img=5"
//               alt="profile"
//             />
//           </div>

//           <div className="pf-name">
//             {user?.name || "Client Name"}
//           </div>

//           <div className="pf-loc">
//             Client
//           </div>

//           <div className="pf-info">

//             <div className="pf-row">
//               <span className="pf-ico">👤</span>
//               <span>Client</span>
//             </div>

//             <div className="pf-row">
//               <span className="pf-ico">✉️</span>
//               <span>{user?.email || "Email"}</span>
//             </div>



//           </div>

//           <div className="pf-actions">

//             <button
//               className="pf-editBtn"
//               onClick={() => navigate("/client/edit-profile")}
//             >
//               ✏️ Edit Profile
//             </button>

//             <button
//               className="pf-logoutBtn"
//               onClick={logout}
//             >
//               Logout
//             </button>

//           </div>

//         </section>

//         {/* CENTER */}
//         <section className="pf-card pf-center">

//           <div className="pf-breadcrumb">
//             Client &gt; Profile
//           </div>

//           <div className="pf-title">
//             Welcome, {user?.name || "Client"}
//           </div>

//           <div className="pf-quote">
//             You can monitor your project progress and communicate with the team here.
//           </div>

//           {/* ACTIVITY SUMMARY */}
//           <div className="pf-sectionHead">
//             <div className="pf-sectionTitle">Activity Summary</div>
//           </div>

//           <div className="pf-info">
//             <div className="pf-row">
//               <span className="pf-ico">💬</span>
//               <span>Messages Sent: 12</span>
//             </div>
//             <div className="pf-row">
//               <span className="pf-ico">📢</span>
//               <span>Feedback Given: 3</span>
//             </div>
//             <div className="pf-row">
//               <span className="pf-ico">⏱️</span>
//               <span>Last Active: Today</span>
//             </div>
//           </div>

//           {/* FEEDBACK BUTTON */}
//           <div style={{marginTop:"16px"}}>
//             <button className="pf-editBtn" onClick={()=>navigate("/client/feedback")}>
//               ✍️ Give Feedback
//             </button>
//           </div>

//         </section>

//         {/* RIGHT PROJECTS */}
//         <section className="pf-card pf-projects">

//           <div className="pf-rightHead">
//             <div className="pf-rightTitle">Your Projects</div>
//           </div>

//           <div className="pf-projectGrid">
//             {projects.map((p,i)=>(
//               <div key={i} className="pf-projectItem">
//                 <img className="pf-projectImg" src={p.img} alt={p.title}/>
//                 <div className="pf-projectLabel">{p.title}</div>

//                 {/* Progress */}
//                 <div style={{fontSize:"10px", color:"#aaa"}}>
//                   Progress: {p.progress}%
//                 </div>
//               </div>
//             ))}
//           </div>

//         </section>



//       </div>
//     </div>
//   );
// }
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ClientProfile.css";

const projects = [
  { title: "Website Redesign", img: "https://picsum.photos/90/90?random=11", progress: 70 },
  { title: "Mobile App", img: "https://picsum.photos/90/90?random=12", progress: 45 },
  { title: "Dashboard UI", img: "https://picsum.photos/90/90?random=13", progress: 90 }
];

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form input states (Nationality and Designation eliminated)
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      // Split full name into first and last name inputs
      const nameParts = (parsedUser.name || "Client Name").split(" ");
      setFirstName(nameParts[0] || "");
      setLastName(nameParts.slice(1).join(" ") || "");

      setEmail(parsedUser.email || "");
      setPhone(parsedUser.phone || "8023456789");
    }
  }, []);

  const saveProfileChanges = async () => {
    const fullName = `${firstName} ${lastName}`.trim();

    try {
      const response = await fetch(`http://localhost:5000/api/users/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: fullName,
          email: email,
          phone: phone
        })
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const updatedUserDB = await response.json();

      // Maintain existing fields in the object, updating only the edited items
      const updatedUser = {
        ...user,
        ...updatedUserDB
      };

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setIsEditing(false);
    } catch (error) {
      console.error("Profile update failed:", error);
      alert("Error updating profile. Please try again.");
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
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
            <button className="pf-editBtn" onClick={() => setIsEditing(true)}>
              ✏️ Edit Profile
            </button>

            <button className="pf-logoutBtn" onClick={logout}>
              Logout
            </button>
          </div>
        </section>

        {/* CENTER COLUMN */}
        <div className="pf-center-col">

          {/* --- EDIT FORM MODE (CLEANED) --- */}
          {isEditing && (
            <section className="pf-card pf-center-card">
              <div className="pf-breadcrumb" style={{ marginBottom: "16px" }}>Client &gt; Profile</div>
              <div style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "20px", color: "#fff" }}>Edit Profile</div>

              {/* Form Grid Matrix (Only safe fields remaining) */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "11px", color: "#aaa", display: "block", marginBottom: "4px" }}>First Name</label>
                  <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: "11px", color: "#aaa", display: "block", marginBottom: "4px" }}>Last Name</label>
                  <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: "11px", color: "#aaa", display: "block", marginBottom: "4px" }}>Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: "11px", color: "#aaa", display: "block", marginBottom: "4px" }}>Phone Number</label>
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} />
                </div>
              </div>

              {/* Save Button */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
                <button onClick={() => setIsEditing(false)} style={{ padding: "10px 20px", background: "transparent", color: "#aaa", border: "1px solid #334155", borderRadius: "6px", cursor: "pointer" }}>
                  Cancel
                </button>
                <button onClick={saveProfileChanges} style={{ padding: "10px 40px", background: "#115e59", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer" }}>
                  Save
                </button>
              </div>
            </section>
          )}

          {/* --- NORMAL VIEW MODE --- */}
          <section className="pf-card pf-center-card">
            {!isEditing && <div className="pf-breadcrumb">Client &gt; Profile</div>}
            <div className="pf-title">Welcome, {user?.name || "Client"}</div>
            <div className="pf-quote">
              You can monitor your project progress and communicate with the team here.
            </div>

            <div className="pf-sectionHead">
              <div className="pf-sectionTitle">Activity Summary</div>
            </div>
            <div className="pf-info">
              <div className="pf-row"><span className="pf-ico">💬</span><span>Messages Sent: 12</span></div>
              <div className="pf-row"><span className="pf-ico">📢</span><span>Feedback Given: 3</span></div>
              <div className="pf-row"><span className="pf-ico">⏱️</span><span>Last Active: Today</span></div>
            </div>

            <div style={{ marginTop: "16px" }}>
              <button className="pf-editBtn" onClick={() => navigate("/client/feedback")}>
                ✍️ Give Feedback
              </button>
            </div>
          </section>
        </div>

        {/* RIGHT PROJECTS */}
        <section className="pf-card pf-projects">
          <div className="pf-rightHead">
            <div className="pf-rightTitle">Your Projects</div>
          </div>

          <div className="pf-projectGrid">
            {projects.map((p, i) => (
              <div key={i} className="pf-projectItem">
                <img className="pf-projectImg" src={p.img} alt={p.title} />
                <div className="pf-projectLabel">{p.title}</div>
                <div style={{ fontSize: "10px", color: "#aaa" }}>
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

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  background: "#1e293b",
  color: "#fff",
  border: "1px solid #334155",
  borderRadius: "6px",
  fontSize: "13px",
  boxSizing: "border-box"
};