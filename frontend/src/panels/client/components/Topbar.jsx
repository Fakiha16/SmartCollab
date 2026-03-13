import React from "react";
import { useNavigate } from "react-router-dom";
import "./Topbar.css";

export default function Topbar() {
  const navigate = useNavigate();

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

        {/* ✅ CLICKABLE USER PROFILE */}
        <button
          type="button"
          className="sc-user sc-userBtn"
          onClick={() => navigate("/client/profile")}
          title="Open Profile"
        >
          <div className="sc-userMeta">
            <div className="sc-userName">Kashaf</div>
            <div className="sc-muted">Pakistan</div>
          </div>
          <div className="sc-userAvatar">K</div>
        </button>
      </div>
    </div>
  );
}
