import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./auth.css";
import illus from "../assets/signup.png";
import logo from "../assets/Logo.png";

export default function Signup() {
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [urlProjectId, setUrlProjectId] = useState("");
  const [urlRole, setUrlRole] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    empType: "",
  });

  const [role, setRole] = useState("employee");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("projectId") || "";
    const roleFromUrl = params.get("role") || "";

    if (pid) {
      setUrlProjectId(pid);
      localStorage.setItem("projectId", pid);
      console.log("✅ projectId from invite URL:", pid);
    }

    if (roleFromUrl) {
      setUrlRole(roleFromUrl);
      setRole(roleFromUrl);
      console.log("✅ role from invite URL:", roleFromUrl);
    }
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const fullName = `${form.firstName} ${form.lastName}`.trim();
    const finalRole = urlRole || role || "employee";

    if (!fullName) {
      setError("Name is required.");
      return;
    }

    if (!form.email || !form.password) {
      setError("Email and password are required.");
      return;
    }

    if (finalRole === "employee" && !form.empType) {
      setError("Department is required for employee.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/signup", {
        name: fullName,
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: finalRole,
        empType: finalRole === "employee" ? form.empType : "",
        projectId: urlProjectId || "",
      });

      console.log("Signup success:", res.data);

      if (urlProjectId) {
        localStorage.setItem("projectId", urlProjectId);
      }

      alert("Account created successfully");

      if (urlProjectId) {
        navigate(`/login?projectId=${urlProjectId}&role=${finalRole}`);
      } else {
        navigate("/login");
      }
    } catch (err) {
      console.error("Signup error:", err);

      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Signup failed. Please try again.";

      if (message.toLowerCase().includes("already registered")) {
        alert("This email is already registered. Please login to join the project.");

        if (urlProjectId) {
          navigate(`/login?projectId=${urlProjectId}&role=${finalRole}`);
        } else {
          navigate("/login");
        }

        return;
      }

      setError(message);
    }
  };

  const loginLink = urlProjectId
    ? `/login?projectId=${urlProjectId}&role=${urlRole || role}`
    : "/login";

  const showRoleSelect = !urlProjectId;
  const showDepartment = (urlRole || role) === "employee";

  return (
    <div className="authPage">
      <div className="authCard">
        <div className="authLeft">
          <div className="authHeader">
            <div className="authBrand">
              <div className="authLogo">
                <img src={logo} alt="Logo" />
              </div>

              <div>
                <div className="authBrandName">SmartCollab</div>
                <div className="authBrandSub">
                  A Real-Time Project Coordination Platform
                </div>
              </div>
            </div>
          </div>

          <div className="authIllusWrap">
            <img className="authIllus" src={illus} alt="signup" />
          </div>
        </div>

        <div className="authRight">
          <div className="authRightInner">
            <h1 className="authTitle">Create Account</h1>

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
                🎉 You have been invited to a project as{" "}
                <b>{urlRole || role}</b>. Sign up to join.
              </div>
            )}

            {error && <div className="authError">{error}</div>}

            <form className="authForm" onSubmit={onSubmit}>
              <div className="authGrid2">
                <div className="authField">
                  <label className="authLabel">First Name</label>
                  <input
                    className="authInput"
                    name="firstName"
                    placeholder="First Name"
                    value={form.firstName}
                    onChange={onChange}
                    required
                  />
                </div>

                <div className="authField">
                  <label className="authLabel">Last Name</label>
                  <input
                    className="authInput"
                    name="lastName"
                    placeholder="Last Name"
                    value={form.lastName}
                    onChange={onChange}
                    required
                  />
                </div>
              </div>

              <div className="authField">
                <label className="authLabel">Email</label>
                <input
                  className="authInput"
                  name="email"
                  type="email"
                  placeholder="Enter email"
                  value={form.email}
                  onChange={onChange}
                  required
                />
              </div>

              <div className="authField">
                <label className="authLabel">Password</label>
                <input
                  className="authInput"
                  name="password"
                  type="password"
                  placeholder="Enter password"
                  value={form.password}
                  onChange={onChange}
                  required
                />
              </div>

              {showRoleSelect && (
                <div className="authField">
                  <label className="authLabel">Role</label>
                  <select
                    className="authInput"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="manager">Manager</option>
                    <option value="employee">Employee</option>
                    <option value="client">Client</option>
                  </select>
                </div>
              )}

              {showDepartment && (
                <div className="authField">
                  <label className="authLabel">Department</label>
                  <select
                    className="authInput"
                    name="empType"
                    value={form.empType}
                    onChange={onChange}
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="development">Development</option>
                    <option value="testing">Testing</option>
                    <option value="design">Design</option>
                  </select>
                </div>
              )}

              <button type="submit" className="authBtn">
                Signup
              </button>

              <div className="authBottomLine">
                Already have an account?
                <Link to={loginLink}> Login</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}