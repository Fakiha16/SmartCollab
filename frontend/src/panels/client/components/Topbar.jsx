import React from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../../../assets/Logo.png";
import "./Topbar.css";

export default function Topbar() {
  const navigate = useNavigate();

  return (
    <div className="sc-topbar">
      <div className="sc-left">
        <div className="sc-logo">
          <Link to="" className="sc-brandLink">
            <div className="sc-brand">
              <img src={logo} alt="SmartCollab Logo" className="sc-brandLogoImg" />
              <div>
                <div className="sc-brandName">SmartCollab</div>
                <div className="sc-brandTag">Manager Panel</div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      <div className="sc-center">
        <div className="sc-search">
          <span className="sc-searchIcon">⌕</span>
          <input placeholder="Search anything..." className="sc-searchInput" />
        </div>
      </div>

      <div className="sc-right">
        <button className="sc-iconBtn" title="Notifications" type="button">
          🔔
        </button>
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