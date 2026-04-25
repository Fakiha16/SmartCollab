import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Card from "../components/Card";
import PerformanceCard from "../components/PerformanceCard";

const mockLeadership = [
  { id: 1, img: "https://i.pravatar.cc/120?img=11" },
  { id: 2, img: "https://i.pravatar.cc/120?img=12" },
  { id: 3, img: "https://i.pravatar.cc/120?img=13" },
  { id: 4, img: "https://i.pravatar.cc/120?img=14" },
  { id: 5, img: "https://i.pravatar.cc/120?img=15" },
  { id: 6, img: "https://i.pravatar.cc/120?img=16" },
  { id: 7, img: "https://i.pravatar.cc/120?img=17" },
  { id: 8, img: "https://i.pravatar.cc/120?img=18" },
  { id: 9, img: "https://i.pravatar.cc/120?img=19" },
  { id: 10, img: "https://i.pravatar.cc/120?img=20" },
];

export default function Dashboard({ standalone = false }) {

  const navigate = useNavigate();

  const [activeMenu, setActiveMenu] = useState("Project");
  const [leadSearch, setLeadSearch] = useState("");

  const PAGE_SIZE = 8;
  const [leadPage, setLeadPage] = useState(1);

  const leadershipFiltered = useMemo(() => {
    const q = leadSearch.trim().toLowerCase();
    if (!q) return mockLeadership;
    return mockLeadership.filter((p) => String(p.id).includes(q));
  }, [leadSearch]);

  useEffect(() => {
    setLeadPage(1);
  }, [leadSearch]);

  const totalLeadPages = Math.max(
    1,
    Math.ceil(leadershipFiltered.length / PAGE_SIZE)
  );

  const pagedLeadership = useMemo(() => {
    const start = (leadPage - 1) * PAGE_SIZE;
    return leadershipFiltered.slice(start, start + PAGE_SIZE);
  }, [leadershipFiltered, leadPage]);

  const Content = (
    <div className="sc-dashboardRoot">
      <div className="sc-pageHead">
        <div>
          <h1 className="sc-title">Dashboard</h1>
          <p className="sc-subtitle">
            Track your projects, performance and leadership.
          </p>
        </div>
      </div>

      <div className="sc-dashLayout">

          <div className="sc-grid2">

            {/* ✅ PROJECT CARD CLICKABLE */}
            <div
              onClick={() => navigate("/manager/projects")}
              style={{ cursor: "pointer" }}
            >
              <Card className="sc-card-project">
                <div className="sc-cardHead">
                  <div>
                    <div className="sc-cardTitle">Projects</div>
                    <div className="sc-muted">Files & assets overview</div>
                  </div>
                </div>

                <div className="sc-projectThumb">
                  <div className="sc-thumbOverlay">
                    <div className="sc-thumbTitle">SmartCollab</div>
                    <div className="sc-thumbMeta">UI • Components • Pages</div>
                  </div>
                </div>

                <div className="sc-cardFooter">
                  <button
                    className="sc-btn sc-btnPrimary"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/manager/projects");
                    }}
                  >
                    Open
                  </button>

                  <button
                    className="sc-btn sc-btnGhost"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Manage
                  </button>
                </div>
              </Card>
            </div>

            {/* PERFORMANCE CARD */}
            <div onClick={() => navigate("/manager/performance")}>
              <PerformanceCard />
            </div>

          </div>

          {/* LEADERSHIP PANEL */}
          <Card className="sc-leadership sc-leadershipCompact">
            <div className="sc-cardHead sc-cardHeadRow">
              <div>
                <div className="sc-cardTitle">Project Leadership Panel</div>
                <div className="sc-muted">
                  Team members involved in leadership
                </div>
              </div>

              <div className="sc-leadActions">
                <div className="sc-searchSmall">
                  <span className="sc-searchIcon">⌕</span>
                  <input
                    value={leadSearch}
                    onChange={(e) => setLeadSearch(e.target.value)}
                    placeholder="Search team..."
                  />
                </div>

                <button
                  className="sc-linkBtn"
                  onClick={() => navigate("/manager/team")}
                >
                  View all
                </button>
              </div>
            </div>

            <div className="sc-leadGrid">
              {pagedLeadership.map((p, idx) => (
                <div key={`${p.id}-${idx}`} className="sc-leadAvatarWrap">
                  <img className="sc-leadAvatar" src={p.img} alt="" />
                </div>
              ))}
            </div>

            <div className="sc-pagination">
              <button
                className="sc-pageBtn"
                onClick={() => setLeadPage((p) => Math.max(1, p - 1))}
                disabled={leadPage === 1}
              >
                Previous
              </button>

              <button
                className="sc-pageBtn"
                onClick={() =>
                  setLeadPage((p) =>
                    Math.min(totalLeadPages, p + 1)
                  )
                }
                disabled={leadPage === totalLeadPages}
              >
                Next
              </button>
            </div>
          </Card>

        </div>
    </div>
  );

  if (standalone) {
    return (
      <div className="sc-app">
        <Sidebar active={activeMenu} onChange={setActiveMenu} />
        <div className="sc-main">
          <Topbar />
          <div className="sc-content">{Content}</div>
        </div>
      </div>
    );
  }

  return <div>{Content}</div>;
}