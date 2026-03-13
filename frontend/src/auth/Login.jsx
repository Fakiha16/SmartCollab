import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./auth.css";
import illus from "../assets/login.png";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "", terms: false });
  const [showPass, setShowPass] = useState(false);

  // TEMP role for testing (backend ready ho jaye to remove)
  const [tempRole, setTempRole] = useState("manager");

  // Show user-friendly error
  const [error, setError] = useState("");

  // ✅ Already logged-in user ko correct dashboard pe redirect
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token && role) {
      if (role === "manager") navigate("/manager/dashboard", { replace: true });
      if (role === "employee") navigate("/employee/dashboard", { replace: true });
      if (role === "client") navigate("/client/dashboard", { replace: true });
    }
  }, [navigate]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Email and password are required.");
      return;
    }

    if (!form.terms) {
      setError("Please accept Terms & Conditions to continue.");
      return;
    }

    // TEMP login (backend later)
    const tokenFromBackend = "dummy-token";
    const roleFromBackend = tempRole;

    localStorage.setItem("token", tokenFromBackend);
    localStorage.setItem("role", roleFromBackend);

    // ✅ Login ke baad correct panel dashboard pe bhejo
    if (roleFromBackend === "manager") navigate("/manager/dashboard", { replace: true });
    if (roleFromBackend === "employee") navigate("/employee/dashboard", { replace: true });
    if (roleFromBackend === "client") navigate("/client/dashboard", { replace: true });
  };

  return (
    <div className="authPage">
      <div className="authCard">
        {/* Left */}
        <div className="authLeft">
          <div className="authHeader">
            <div className="authBrand">
              <div className="authLogo">SC</div>
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

        {/* Right */}
        <div className="authRight">
          <div className="authRightInner">
            <h1 className="authTitle authTitleLeft">Welcome back, Username</h1>
            <p className="authSubtitle authSubtitleLeft">
              Welcome back! Please enter your details.
            </p>

            {error && <div className="authError">{error}</div>}

            <form className="authForm authFormLogin" onSubmit={onSubmit}>
              <div className="authField">
                <label className="authLabel">Email</label>
                <input
                  className="uInput"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  autoComplete="email"
                />
              </div>

              <div className="authField">
                <label className="authLabel">Password</label>

                <div className="uWrap">
                  <input
                    className="uInput uInput--withIcon"
                    type={showPass ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={onChange}
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    className="uIcon"
                    onClick={() => setShowPass((s) => !s)}
                    aria-label="Toggle password visibility"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"
                        stroke="currentColor"
                        strokeWidth="1.7"
                      />
                      <path
                        d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
                        stroke="currentColor"
                        strokeWidth="1.7"
                      />
                      {!showPass && (
                        <path
                          d="M4 4l16 16"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          opacity="0.85"
                        />
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              {/* TEMP Role selector for testing */}
              <div className="authField">
                <label className="authLabel">Login as</label>
                <select
                  className="uInput"
                  value={tempRole}
                  onChange={(e) => setTempRole(e.target.value)}
                >
                  <option value="manager">Manager</option>
                  <option value="employee">Employee</option>
                  <option value="client">Client</option>
                </select>
              </div>

              <div className="authRowBetween">
                <label className="authCheck">
                  <input
                    type="checkbox"
                    name="terms"
                    checked={form.terms}
                    onChange={onChange}
                  />
                  <span>Terms &amp; Conditions</span>
                </label>

                <Link className="authLink" to="/forgot-password">
                  Forgot Password
                </Link>
              </div>

              <button className="authBtn authBtnDark" type="submit">
                Log in
              </button>

              <div className="authBottomLine">
                Don&apos;t have an account?{" "}
                <Link className="authLinkStrong" to="/signup">
                  Sign up for free
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}