import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./auth.css";
import illus from "../assets/login.png";
import logo from "../assets/Logo.png";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [urlProjectId, setUrlProjectId] = useState("");
  const [urlRole, setUrlRole] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("projectId") || "";
    const roleFromUrl = params.get("role") || "";

    if (pid) {
      setUrlProjectId(pid);
      localStorage.setItem("projectId", pid);
      console.log("✅ projectId from URL saved immediately:", pid);
    }

    if (roleFromUrl) {
      setUrlRole(roleFromUrl);
      console.log("✅ role from URL:", roleFromUrl);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token && role) {
      if (role === "manager") navigate("/manager/dashboard");
      else if (role === "employee") navigate("/employee/dashboard");
      else if (role === "client") navigate("/client/performance");
    }
  }, [navigate]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Email and password are required.");
      return;
    }

    try {
      const params = new URLSearchParams(window.location.search);

      const projectId =
        params.get("projectId") ||
        urlProjectId ||
        localStorage.getItem("projectId") ||
        "";

      const roleFromUrl = params.get("role") || urlRole || "";

      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email: form.email.trim().toLowerCase(),
        password: form.password,
        projectId,
      });

      const token = res.data.token;
      const user = res.data.user;
      const actualRole = user.role;
      const navigateRole = roleFromUrl || actualRole;

      localStorage.setItem("token", token);
      localStorage.setItem("role", actualRole);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.projectId) {
        localStorage.setItem("projectId", user.projectId);
        console.log("✅ projectId saved from backend user:", user.projectId);
      } else if (projectId) {
        localStorage.setItem("projectId", projectId);
        console.log("✅ projectId saved from URL/localStorage:", projectId);
      }

      if (navigateRole === "manager") {
        navigate("/manager/dashboard");
      } else if (navigateRole === "employee") {
        navigate(`/employee/dashboard${projectId ? `?projectId=${projectId}` : ""}`);
      } else if (navigateRole === "client") {
        navigate(`/client/performance${projectId ? `?projectId=${projectId}` : ""}`);
      } else {
        navigate("/login");
      }
    } catch (err) {
      console.error("Login error:", err);

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Login failed. Please check your credentials.");
      }
    }
  };

  const signupLink = urlProjectId
    ? `/signup?projectId=${urlProjectId}${urlRole ? `&role=${urlRole}` : ""}`
    : "/signup";

  return (
    <div className="authPage">
      <div className="authCard">
        <div className="authLeft">
          <div className="authHeader">
            <div className="authBrand">
              <div className="authLogo">
                <img src={logo} alt="Logo" />
              </div>

              <div className="authBrandText">
                <div className="authBrandName">SmartCollab</div>
                <div className="authBrandSub">
                  A Real-Time Project Coordination Platform
                </div>
              </div>
            </div>
          </div>

          <div className="authIllusWrap">
            <img className="authIllus authIllusLogin" src={illus} alt="Login" />
          </div>
        </div>

        <div className="authRight">
          <div className="authRightInner">
            <h1 className="authTitle">Welcome Back!</h1>

            {urlProjectId && (
              <div
                style={{
                  background: "#dcf8c6",
                  border: "1px solid #25D366",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  marginBottom: "16px",
                  fontSize: "13px",
                  color: "#075E54",
                  fontWeight: "600",
                }}
              >
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
                <Link to="/forgot-password" className="authLink">
                  Forgot Password?
                </Link>
              </div>

              <button type="submit" className="authBtn">
                Login
              </button>

              <div className="authBottomLine">
                Don't have an account?
                <Link to={signupLink}> Signup</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}