import React from "react";
import { useNavigate } from "react-router-dom";
import "./Topbar.css";

export default function Topbar() {
  const navigate = useNavigate();

  // ✅ Get logged-in user data
  const user = JSON.parse(localStorage.getItem("user"));

  // ✅ Safe values (fallback bhi rakho)
  const userName = user?.name || "User";
  const userRole = user?.role || "Member";

  return (
    <div className="sc-topbar">
      <div className="sc-left"></div>

      <div className="sc-center">
        <div className="sc-search">
          <span className="sc-searchIcon">⌕</span>
          <input
            placeholder="Search anything..."
            className="sc-searchInput"
          />
        </div>
      </div>

      <div className="sc-right">
        <button className="sc-iconBtn" title="Notifications" type="button">
          🔔
        </button>

        {/* ✅ DYNAMIC USER PROFILE */}
        <button
          type="button"
          className="sc-user sc-userBtn"
          onClick={() => navigate("/manager/profile")}
          title="Open Profile"
        >
          <div className="sc-userMeta">
            <div className="sc-userName">{userName}</div>
            <div className="sc-muted">{userRole}</div>
          </div>

          {/* ✅ Avatar first letter */}
          <div className="sc-userAvatar">
            {userName.charAt(0).toUpperCase()}
          </div>
        </button>
      </div>
    </div>
  );
}