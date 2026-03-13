import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./auth.css";
import illus from "../assets/signup.png";

export default function Signup() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    console.log("Signup:", form);
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
                <div className="authBrandSub">Create your account</div>
              </div>
            </div>
          </div>

          <div className="authIllusWrap">
            <img className="authIllus" src={illus} alt="Signup" />
          </div>
        </div>

        {/* Right */}
        <div className="authRight">
          <div className="authRightInner">
            <h1 className="authTitle">WELCOME!</h1>
            <p className="authSubtitle">
              Sign up to access your dashboard and workspace.
            </p>

            <form className="authForm" onSubmit={onSubmit}>
              <div className="authGrid2">
                <div className="authField">
                  <label className="authLabel">First Name</label>
                  <input
                    className="authInput"
                    name="firstName"
                    value={form.firstName}
                    onChange={onChange}
                    placeholder="Enter first name"
                    autoComplete="given-name"
                  />
                </div>

                <div className="authField">
                  <label className="authLabel">Last Name</label>
                  <input
                    className="authInput"
                    name="lastName"
                    value={form.lastName}
                    onChange={onChange}
                    placeholder="Enter last name"
                    autoComplete="family-name"
                  />
                </div>
              </div>

              <div className="authField">
                <label className="authLabel">Email</label>
                <input
                  className="authInput"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>

              <div className="authField">
                <label className="authLabel">Password</label>
                <input
                  className="authInput"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={onChange}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                />
              </div>

              <button className="authBtn" type="submit">
                Create Account
              </button>

              <div className="authLinksRow">
                <Link className="authLink" to="/forgot-password">
                  Forgot password?
                </Link>

                <div className="authInlineText">
                  Already have an account?{" "}
                  <Link className="authLinkStrong" to="/login">
                    Login
                  </Link>
                </div>
              </div>

              <div className="authDivider">
                <span />
                <p>or</p>
                <span />
              </div>

              <button
                type="button"
                className="authBtnOutline"
                onClick={() => console.log("Google signup")}
              >
                Continue with Google
              </button>
            </form>

            <div className="authFinePrint">
              By signing up, you agree to our Terms & Privacy Policy.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}