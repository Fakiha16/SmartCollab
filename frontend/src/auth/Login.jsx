import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./auth.css";
import illus from "../assets/login.png";

export default function Login() {

  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  // ✅ URL se projectId pakdo
  const [urlProjectId, setUrlProjectId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("projectId");
    if (pid) {
      setUrlProjectId(pid);
      // ✅ Turant save karo — form submit ka wait mat karo
      localStorage.setItem("projectId", pid);
      console.log("✅ projectId from URL saved immediately:", pid);
    }
  }, []);

  // ✅ Already logged in check
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token && role) {
      if (role === "manager") navigate("/manager/dashboard");
      if (role === "employee") navigate("/employee/dashboard");
      if (role === "client") navigate("/client/dashboard");
    }
  }, [navigate]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Email and password are required.");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email: form.email, password: form.password }
      );

      const token = res.data.token;
      const user = res.data.user;
      const role = user.role;

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("user", JSON.stringify(user));

      // ✅ Priority 1: URL se aaya projectId
      if (urlProjectId) {
        localStorage.setItem("projectId", urlProjectId);
        console.log("✅ projectId saved from URL:", urlProjectId);
      }
      // ✅ Priority 2: User object mein projectId ho (backend ne save kiya tha signup pe)
      else if (user.projectId) {
        localStorage.setItem("projectId", user.projectId);
        console.log("✅ projectId saved from user object:", user.projectId);
      }
      // ✅ Priority 3: Already localStorage mein hai to rehne do
      else {
        const existing = localStorage.getItem("projectId");
        console.log("ℹ️ Existing projectId in localStorage:", existing);
      }

      // ✅ Navigate karo role ke hisaab se
      if (role === "manager") navigate("/manager/dashboard");
      else if (role === "employee") navigate("/employee/dashboard");
      else if (role === "client") navigate("/client/dashboard");

    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Login failed. Please check your credentials.");
      }
    }
  };

  return (
    <div className="authPage">
      <div className="authCard">

        <div className="authLeft">
          <div className="authHeader">
            <div className="authBrand">
              <div className="authLogo">SC</div>
              <div className="authBrandText">
                <div className="authBrandName">SmartCollab</div>
                <div className="authBrandSub">A Real-Time Project Coordination Platform</div>
              </div>
            </div>
          </div>
          <div className="authIllusWrap">
            <img className="authIllus authIllusLogin" src={illus} alt="Login" />
          </div>
        </div>

        <div className="authRight">
          <div className="authRightInner">

            <h1 className="authTitle">Welcome Back</h1>

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
                🎉 You have been invited! Login to join the project.
              </div>
            )}

            {error && <div className="authError">{error}</div>}

            <form className="authForm" onSubmit={onSubmit}>

              <div className="authField">
                <label>Email</label>
                <div className="uWrap">
                  <input
                    className="uInput"
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={onChange}
                  />
                </div>
              </div>

              <div className="authField">
                <label>Password</label>
                <div className="uWrap">
                  <input
                    className="uInput"
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={onChange}
                  />
                </div>
              </div>

              <div className="authRowBetween">
                <Link to="/forgot-password" className="authLink">Forgot Password?</Link>
              </div>

              <button type="submit" className="authBtn">Login</button>

              <div className="authBottomLine">
                Don't have an account?
                <Link to={urlProjectId ? `/signup?projectId=${urlProjectId}` : "/signup"}> Signup</Link>
              </div>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
}