import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // ✅ ADDED
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
  { id: 11, img: "https://i.pravatar.cc/120?img=21" },
  { id: 12, img: "https://i.pravatar.cc/120?img=22" },
  { id: 13, img: "https://i.pravatar.cc/120?img=23" },
  { id: 14, img: "https://i.pravatar.cc/120?img=24" },
  { id: 15, img: "https://i.pravatar.cc/120?img=25" },
  { id: 16, img: "https://i.pravatar.cc/120?img=26" },
  { id: 17, img: "https://i.pravatar.cc/120?img=27" },
  { id: 18, img: "https://i.pravatar.cc/120?img=28" },
  { id: 19, img: "https://i.pravatar.cc/120?img=29" },
  { id: 20, img: "https://i.pravatar.cc/120?img=30" },
  { id: 21, img: "https://i.pravatar.cc/120?img=31" },
  { id: 22, img: "https://i.pravatar.cc/120?img=32" },
  { id: 23, img: "https://i.pravatar.cc/120?img=33" },
  { id: 24, img: "https://i.pravatar.cc/120?img=34" },
];

const doneDelivered = [
  { title: "Dashboard UI", tag: "Delivered" },
  { title: "Auth Flow", tag: "Done" },
  { title: "Client Panel", tag: "Delivered" },
  { title: "Access Control", tag: "Done" },
  { title: "Reports", tag: "Delivered" },
];

export default function Dashboard({ standalone = false }) {
  const navigate = useNavigate(); // ✅ ADDED

  const [activeMenu, setActiveMenu] = useState("Project");
  const [leadSearch, setLeadSearch] = useState("");

  const PAGE_SIZE = 14;
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

  const leadPageSafe = Math.min(leadPage, totalLeadPages);

  const pagedLeadership = useMemo(() => {
    const start = (leadPageSafe - 1) * PAGE_SIZE;
    return leadershipFiltered.slice(start, start + PAGE_SIZE);
  }, [leadershipFiltered, leadPageSafe]);

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
        <div className="sc-dashLeft">
          <div className="sc-grid2">
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
                <button className="sc-btn sc-btnPrimary">Open</button>
                <button className="sc-btn sc-btnGhost">Manage</button>
              </div>
            </Card>

            <div onClick={() => navigate("/manager/performance")}>
              <PerformanceCard />
            </div>
          </div>

          {/* 🔥 UPDATED PART */}
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

                {/* ✅ CONNECTED BUTTON */}
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
                disabled={leadPageSafe === 1}
              >
                Previous
              </button>

              {Array.from({ length: totalLeadPages })
                .slice(0, 3)
                .map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      className={`sc-pageNum ${
                        pageNum === leadPageSafe ? "sc-active" : ""
                      }`}
                      onClick={() => setLeadPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}

              <button
                className="sc-pageBtn"
                onClick={() =>
                  setLeadPage((p) => Math.min(totalLeadPages, p + 1))
                }
                disabled={leadPageSafe === totalLeadPages}
              >
                Next
              </button>
            </div>
          </Card>
        </div>
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