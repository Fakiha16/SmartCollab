import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./auth.css";
import illus from "../assets/login.png"; // reset wali image ho to yahan change kar lena

export default function ResetPassword() {
  const [code, setCode] = useState("");

  const maskedEmail = "bis****@gmail.com"; // TODO: dynamic later

  const onSubmit = (e) => {
    e.preventDefault();
    console.log("Reset code:", code);
    // TODO: verify code then navigate to new password screen OR dashboard
  };

  const onResend = () => {
    console.log("Resend code");
    // TODO: resend API
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
                <div className="authBrandSub">Reset your password</div>
              </div>
            </div>
          </div>

          <div className="authIllusWrap">
            <img className="authIllus" src={illus} alt="Reset Password" />
          </div>
        </div>

        {/* Right */}
        <div className="authRight">
          <div className="authRightInner">
            <h1 className="authTitle">Reset Password</h1>
            <p className="authSubtitle">
              We sent a 6-digit code to <b>{maskedEmail}</b>. Enter the code to reset your password.
            </p>

            <form className="authForm" onSubmit={onSubmit}>
              <div className="authField">
                <label className="authLabel">Enter code</label>
                <input
                  className="authInput"
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  inputMode="numeric"
                  placeholder="6-digit code"
                  maxLength={6}
                  required
                />
              </div>

              <div className="authLinksRow">
                <button
                  type="button"
                  className="authLinkBtn"
                  onClick={onResend}
                >
                  Resend Code
                </button>

                <button className="authBtn authBtnDark" type="submit">
                  Continue
                </button>
              </div>

              <div className="authBottomLine">
                <Link className="authLink" to="/login">
                  Back to Login
                </Link>
              </div>
            </form>

            <div className="authFinePrint">
              Didn’t get it? Check spam/junk folder or resend.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}