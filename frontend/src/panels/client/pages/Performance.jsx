// src/pages/Performance.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./Performance.css";
import Card from "../components/Card";
import PerformanceCard from "../components/PerformanceCard";

const tasksMock = [
  { title: "Make an Automatic Payment System...", tag: "Completed" },
  { title: "Design UI Animation Pack", tag: "On Progress" },
  { title: "Fix Auth Flow Edge Cases", tag: "Pending" },
  { title: "Client Panel Review", tag: "Completed" },
  { title: "Reports Module", tag: "On Hold" },
  { title: "Dashboard UI Polish", tag: "Completed" },
  { title: "WorkLogs Board Improvements", tag: "On Progress" },
];

const teamMembers = [
  { id: 1, img: "https://i.pravatar.cc/60?img=1" },
  { id: 2, img: "https://i.pravatar.cc/60?img=2" },
  { id: 3, img: "https://i.pravatar.cc/60?img=3" },
  { id: 4, img: "https://i.pravatar.cc/60?img=4" },
  { id: 5, img: "https://i.pravatar.cc/60?img=5" },
  { id: 6, img: "https://i.pravatar.cc/60?img=6" },
  { id: 7, img: "https://i.pravatar.cc/60?img=7" },
  { id: 8, img: "https://i.pravatar.cc/60?img=8" },
  { id: 9, img: "https://i.pravatar.cc/60?img=9" },
  { id: 10, img: "https://i.pravatar.cc/60?img=10" },
  { id: 11, img: "https://i.pravatar.cc/60?img=11" },
  { id: 12, img: "https://i.pravatar.cc/60?img=12" },
  { id: 13, img: "https://i.pravatar.cc/60?img=13" },
  { id: 14, img: "https://i.pravatar.cc/60?img=14" },
];

export default function Performance() {
  const navigate = useNavigate();

  const goPerProject = () => {
    navigate("/performance/project/smartcollab", {
      state: { projectName: "SmartCollab" },
    });
  };

  const goTasks = () => navigate("/tasks");

  return (
    <div className="sc-perfRoot">
      <div className="sc-dashLayout">

        {/* LEFT SIDE */}
        <div className="sc-dashLeft">

          {/* TOP ROW: Projects + Chart - same height */}
          <div className="sc-grid2">
            <Card
              className="sc-card-project"
              role="button"
              tabIndex={0}
              style={{ cursor: "pointer" }}
              onClick={goPerProject}
              onKeyDown={(e) => e.key === "Enter" && goPerProject()}
            >
              <div className="sc-cardHead">
                <div>
                  <div className="sc-cardTitle">Projects</div>
                  <div className="sc-muted">Files &amp; assets overview</div>
                </div>
                <span className="sc-badge">52 files</span>
              </div>
              <div className="sc-projectThumb">
                <div className="sc-thumbOverlay">
                  <div className="sc-thumbTitle">SmartCollab</div>
                  <div className="sc-thumbMeta">UI • Components • Pages</div>
                </div>
              </div>
            </Card>

            <PerformanceCard />
          </div>

          {/* BOTTOM ROW: Team Connections */}
          <Card className="sc-teamCard">
            <div className="sc-cardHead sc-cardHeadRow">
              <div className="sc-cardTitle">Previous Team Connections</div>
              <div className="sc-searchSmall">
                <span style={{ opacity: 0.5 }}>⌕</span>
                <input placeholder="Search for anything..." />
              </div>
              <button className="sc-linkBtn" type="button">View all</button>
            </div>
            <div className="sc-leadGrid">
              {teamMembers.map((m) => (
                <div className="sc-leadAvatarWrap" key={m.id}>
                  <img
                    className="sc-leadAvatar"
                    src={m.img}
                    alt={`member-${m.id}`}
                    draggable={false}
                  />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* RIGHT SIDE: Tasks */}
        <Card
          className="sc-doneDelivered"
          role="button"
          tabIndex={0}
          style={{ cursor: "pointer" }}
          onClick={goTasks}
          onKeyDown={(e) => e.key === "Enter" && goTasks()}
        >
          <div className="sc-cardHead">
            <div>
              <div className="sc-cardTitle">Tasks</div>
              <div className="sc-muted">Recent tasks overview</div>
            </div>
            <button
              className="sc-linkBtn"
              type="button"
              onClick={(e) => { e.stopPropagation(); goTasks(); }}
            >
              View all
            </button>
          </div>
          <div className="sc-deliveredList sc-deliveredScroll">
            {tasksMock.map((it, i) => (
              <div key={`${it.title}-${i}`} className="sc-deliveredItem">
                <div className="sc-deliveredThumb" />
                <div className="sc-deliveredInfo">
                  <div className="sc-deliveredTitle">{it.title}</div>
                  <div className="sc-tag">{it.tag}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </div>
  );
}