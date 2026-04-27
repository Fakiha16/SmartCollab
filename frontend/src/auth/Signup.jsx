import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./auth.css";
import illus from "../assets/signup.png";

export default function Signup() {

  const navigate = useNavigate();
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    empType: ""
  });

  const [role, setRole] = useState("employee");

  // ✅ URL se projectId lo jab page load ho
  const [urlProjectId, setUrlProjectId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("projectId");
    if (pid) {
      setUrlProjectId(pid);
      // ✅ Turant localStorage mein save karo taake login pe bhi mile
      localStorage.setItem("projectId", pid);
      console.log("✅ projectId from URL saved to localStorage:", pid);
    }
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/signup",
        {
          name: form.firstName + " " + form.lastName,
          email: form.email,
          password: form.password,
          role: urlProjectId ? "employee" : role, // invite se aaya to employee hi hoga
          empType: (role === "employee" || urlProjectId) ? form.empType : "",
          // ✅ Backend mein bhi projectId save karo user ke saath
          projectId: urlProjectId || null
        }
      );

      // ✅ Signup success ke baad bhi confirm kar lo
      if (urlProjectId) {
        localStorage.setItem("projectId", urlProjectId);
        console.log("✅ projectId re-confirmed in localStorage after signup:", urlProjectId);
      }

      alert("Account created successfully");

      // ✅ Employee ko login pe bhejo with projectId
      if (urlProjectId) {
        navigate("/login?projectId=" + urlProjectId);
      } else {
        navigate("/login");
      }

    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Signup failed");
      }
    }
  };

  return (
    <div className="authPage">
      <div className="authCard">

        {/* LEFT */}
        <div className="authLeft">
          <div className="authHeader">
            <div className="authBrand">
              <div className="authLogo">SC</div>
              <div>
                <div className="authBrandName">SmartCollab</div>
                <div className="authBrandSub">A Real-Time Project Coordination Platform</div>
              </div>
            </div>
          </div>
          <div className="authIllusWrap">
            <img className="authIllus" src={illus} alt="signup" />
          </div>
        </div>

        {/* RIGHT */}
        <div className="authRight">
          <div className="authRightInner">

            <h1 className="authTitle">Create Account</h1>

            {/* ✅ Invite banner */}
            {urlProjectId && (
              <div style={{
                background: "#dcf8c6",
                border: "1px solid #25D366",
                borderRadius: "8px",
                padding: "10px 14px",
                marginBottom: "16px",
                fontSize: "13px",
                color: "#075E54",
                fontWeight: "600"
              }}>
                🎉 You have been invited to a project! Sign up to join.
              </div>
            )}

            {error && <div className="authError">{error}</div>}

            <form className="authForm" onSubmit={onSubmit}>

              <div className="authGrid2">
                <div className="authField">
                  <label className="authLabel">First Name</label>
                  <input className="authInput" name="firstName" placeholder="First Name" onChange={onChange} required />
                </div>
                <div className="authField">
                  <label className="authLabel">Last Name</label>
                  <input className="authInput" name="lastName" placeholder="Last Name" onChange={onChange} required />
                </div>
              </div>

              <div className="authField">
                <label className="authLabel">Email</label>
                <input className="authInput" name="email" type="email" placeholder="Enter email" onChange={onChange} required />
              </div>

              <div className="authField">
                <label className="authLabel">Password</label>
                <input className="authInput" name="password" type="password" placeholder="Enter password" onChange={onChange} required />
              </div>

              {/* ✅ Invite link se aaya to role fixed = employee, show nahi karo */}
              {!urlProjectId && (
                <div className="authField">
                  <label className="authLabel">Role</label>
                  <select className="authInput" value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="manager">Manager</option>
                    <option value="employee">Employee</option>
                    <option value="client">Client</option>
                  </select>
                </div>
              )}

              {(role === "employee" || urlProjectId) && (
                <div className="authField">
                  <label className="authLabel">Department</label>
                  <select className="authInput" name="empType" value={form.empType} onChange={onChange} required>
                    <option value="">Select Department</option>
                    <option value="development">Development</option>
                    <option value="testing">Testing</option>
                    <option value="design">Design</option>
                  </select>
                </div>
              )}

              <button type="submit" className="authBtn">Signup</button>

              <div className="authBottomLine">
                Already have an account?
                <Link to={urlProjectId ? `/login?projectId=${urlProjectId}` : "/login"}> Login</Link>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}