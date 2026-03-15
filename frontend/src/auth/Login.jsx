import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./auth.css";
import illus from "../assets/login.png";

export default function Login() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    terms: false
  });

  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

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

    const { name, value, type, checked } = e.target;

    setForm((p) => ({
      ...p,
      [name]: type === "checkbox" ? checked : value
    }));

  };

  const onSubmit = async (e) => {

    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Email and password are required.");
      return;
    }

    if (!form.terms) {
      setError("Please accept Terms & Conditions.");
      return;
    }

    try {

      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email: form.email,
          password: form.password
        }
      );

      const token = res.data.token;
      const role = res.data.user.role;

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      if (role === "manager") navigate("/manager/dashboard");
      if (role === "employee") navigate("/employee/dashboard");
      if (role === "client") navigate("/client/dashboard");

    } catch (err) {

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Login failed");
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

                <div className="authBrandSub">
                  A Real-Time Project Coordination Platform
                </div>

              </div>

            </div>

          </div>

          <div className="authIllusWrap">
            <img className="authIllus authIllusLogin" src={illus} alt="Login"/>
          </div>

        </div>

        <div className="authRight">

          <div className="authRightInner">

            <h1 className="authTitle">Welcome Back</h1>

            {error && <div className="authError">{error}</div>}

            <form className="authForm" onSubmit={onSubmit}>

              <div className="authField">

                <label>Email</label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                />

              </div>

              <div className="authField">

                <label>Password</label>

                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={onChange}
                />

              </div>

              <label>

                <input
                  type="checkbox"
                  name="terms"
                  checked={form.terms}
                  onChange={onChange}
                />

                Accept Terms

              </label>

              <button type="submit" className="authBtn">
                Login
              </button>

              <div className="authBottomLine">
                Don't have an account?
                <Link to="/signup">Signup</Link>
              </div>

            </form>

          </div>

        </div>

      </div>

    </div>

  );

}