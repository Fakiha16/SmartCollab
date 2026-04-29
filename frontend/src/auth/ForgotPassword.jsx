import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./auth.css";
import illus from "../assets/login.png";
import logo from "../assets/Logo.png";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate(); // ✅ correct place

  const onSubmit = (e) => {
    e.preventDefault();
    console.log("Forgot:", email);

    // TODO: call API here

    // After success → go to reset screen
    navigate("/reset-password");
  };

  return (
    <div className="authPage">
      <div className="authCard">
        {/* Left */}
        <div className="authLeft">
          <div className="authHeader">
            <div className="authBrand">
<div className="authLogo">
                <img src={logo} alt="Logo" />
                </div>              <div className="authBrandText">
                <div className="authBrandName">SmartCollab</div>
                <div className="authBrandSub">Recover your account</div>
              </div>
            </div>
          </div>

          <div className="authIllusWrap">
            <img className="authIllus" src={illus} alt="Forgot Password" />
          </div>
        </div>

        {/* Right */}
        <div className="authRight">
          <div className="authRightInner">
            <h1 className="authTitle">Forgot Password</h1>
            <p className="authSubtitle">
              Enter your email and we’ll send you a reset code.
            </p>

            <form className="authForm" onSubmit={onSubmit}>
              <div className="authField">
                <label className="authLabel">Email</label>
                <input
                  className="authInput"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              <button className="authBtn" type="submit">
                Send Reset Code
              </button>

              <div className="authLinksRow">
                <Link className="authLink" to="/login">
                  Back to Login
                </Link>

                <div className="authInlineText">
                  Don&apos;t have an account?{" "}
                  <Link className="authLinkStrong" to="/signup">
                    Sign up
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}