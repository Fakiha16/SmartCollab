import React, { useMemo, useState } from "react";
import "./AccessControl.css";

const members = [
  { name: "A", role: "Lead" },
  { name: "B", role: "Dev" },
  { name: "C", role: "QA" },
  { name: "D", role: "PM" },
  { name: "E", role: "Dev" },
  { name: "F", role: "QA" },
  { name: "G", role: "Designer" },
  { name: "H", role: "Dev" },
  { name: "I", role: "BA" },
];

const tasksSeed = [
  { id: "#402235", title: "Make an Automatic Payment System that enable the design", opened: "Opened 10 days ago by Yash Ghori", statusLeft: "Canceled", statusRight: "Completed", time: "00 : 30 : 00" },
  { id: "#402235-2", title: "Make an Automatic Payment System that enable the design", opened: "Opened 10 days ago by Yash Ghori", statusLeft: "Canceled", statusRight: "Completed", time: "00 : 30 : 00" },
  { id: "#402235-3", title: "Make an Automatic Payment System that enable the design", opened: "Opened 10 days ago by Yash Ghori", statusLeft: "Canceled", statusRight: "Completed", time: "00 : 30 : 00" },
];

function MemberAvatar({ label }) {
  return <div className="ac-avatar">{label}</div>;
}

function MiniCard({ title, subtitle }) {
  return (
    <div className="ac-miniCard">
      <div className="ac-miniTitle">{title}</div>
      <div className="ac-miniArt" aria-hidden />
      <div className="ac-miniSub">{subtitle}</div>
    </div>
  );
}

function StatusPill({ kind, text }) {
  const cls =
    kind === "red" ? "ac-pill ac-pillRed" : "ac-pill ac-pillGreen";
  return <span className={cls}>{text}</span>;
}

function TaskRow({ t }) {
  return (
    <div className="ac-task">
      <div className="ac-taskLeft">
        <div className="ac-taskIcon" aria-hidden>☼</div>
        <div>
          <div className="ac-taskTitle">{t.title}</div>
          <div className="ac-taskMeta">
            <span className="ac-taskId">{t.id}</span>
            <span className="ac-taskDot">•</span>
            <span className="ac-taskOpened">{t.opened}</span>
          </div>
          <div className="ac-taskPills">
            <StatusPill kind="red" text={t.statusLeft} />
            <StatusPill kind="green" text={t.statusRight} />
          </div>
        </div>
      </div>

      <div className="ac-taskRight">
        <div className="ac-time">
          <span className="ac-timeDot" />
          <span>{t.time}</span>
        </div>

        <div className="ac-taskUser" title="Assigned">
          <div className="ac-userAvatar" />
        </div>

        <button className="ac-iconBtn" type="button" title="Message">💬</button>
        <button className="ac-iconBtn" type="button" title="More">⋯</button>
      </div>
    </div>
  );
}

export default function AccessControl() {
  const [q, setQ] = useState("");

  const tasks = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return tasksSeed;
    return tasksSeed.filter(
      (t) =>
        t.title.toLowerCase().includes(query) ||
        t.id.toLowerCase().includes(query) ||
        t.opened.toLowerCase().includes(query)
    );
  }, [q]);

  return (
    <div className="ac-wrap">
      {/* Top big panel */}
      <div className="ac-topPanel">
        <div className="ac-team">
          <div className="ac-teamTitle">Team Management</div>
          <div className="ac-teamGrid">
            {members.map((m, i) => (
              <MemberAvatar key={i} label={m.name} />
            ))}
          </div>
        </div>

        <MiniCard title="Add Member" subtitle="" />
        <MiniCard title="Delete Member" subtitle="" />
      </div>

      {/* Bottom permissions */}
      <div className="ac-bottomPanel">
        <div className="ac-bottomHead">
          <div className="ac-bottomTitle">Manage Task Permissions</div>

          <div className="ac-search">
            <span className="ac-searchIcon">⌕</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search for anything..."
            />
          </div>
        </div>

        <div className="ac-taskList">
          {tasks.map((t) => (
            <TaskRow key={t.id} t={t} />
          ))}
        </div>
      </div>
    </div>
  );
}
