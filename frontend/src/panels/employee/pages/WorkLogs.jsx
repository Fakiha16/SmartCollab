import React, { useMemo, useState, useEffect } from "react";
import "./WorkLogs.css";
import axios from "axios";

const columns = [
  { key: "backlog", title: "Backlog SubTasks" },
  { key: "inprogress", title: "In progress" },
  { key: "review", title: "Review" },
  { key: "completed", title: "Completed" },
];

function Icon({ children }) {
  return <span className="wl-ico">{children}</span>;
}

function People({ count = 3 }) {
  return (
    <div className="wl-people">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="wl-person" />
      ))}
      <div className="wl-person wl-plus">+</div>
    </div>
  );
}

function CardItem({ item }) {
  return (
    <div className="wl-card">
      <div className="wl-cardTop">
        <div className="wl-cardTitle">{item.title}</div>
        <div className="wl-days">
          <Icon>⏱</Icon>
          <span>--</span>
        </div>
      </div>

      <div className="wl-cardDesc">{item.desc}</div>

      <div className="wl-cardBottom">
        <div className="wl-meta">
          <div className="wl-metaItem">
            <Icon>📎</Icon>
            <span>{item.comments || 0}</span>
          </div>
          <div className="wl-metaItem">
            <Icon>💬</Icon>
            <span>{item.files || 0}</span>
          </div>
        </div>
        <People count={item.people || 1} />
      </div>
    </div>
  );
}

export default function WorkLogs() {
  const [q, setQ] = useState("");
  const [data, setData] = useState({
    backlog: [],
    inprogress: [],
    review: [],
    completed: [],
  });

  const [backlogQ, setBacklogQ] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fromCol, setFromCol] = useState(null);
  const [toCol, setToCol] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [modalQ, setModalQ] = useState("");

  // ✅ FETCH TASKS FROM BACKEND
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const res = await axios.get("http://localhost:5000/api/tasks");

    const grouped = {
      backlog: [],
      inprogress: [],
      review: [],
      completed: [],
    };

    res.data.forEach((task) => {
      grouped[task.status].push(task);
    });

    setData(grouped);
  };

  const filtered = useMemo(() => {
    const query = q.toLowerCase();
    const next = {};

    for (const col of columns) {
      let list = data[col.key] || [];

      if (query) {
        list = list.filter(
          (x) =>
            x.title.toLowerCase().includes(query) ||
            x.desc.toLowerCase().includes(query)
        );
      }

      if (col.key === "backlog" && backlogQ) {
        list = list.filter(
          (x) =>
            x.title.toLowerCase().includes(backlogQ.toLowerCase()) ||
            x.desc.toLowerCase().includes(backlogQ.toLowerCase())
        );
      }

      next[col.key] = list;
    }

    return next;
  }, [q, backlogQ, data]);

  const openMoveModal = (targetColKey) => {
    const idx = columns.findIndex((c) => c.key === targetColKey);
    if (idx <= 0) return;

    setFromCol(columns[idx - 1].key);
    setToCol(targetColKey);
    setSelectedTaskId(null);
    setModalQ("");
    setIsModalOpen(true);
  };

  const closeMoveModal = () => {
    setIsModalOpen(false);
    setSelectedTaskId(null);
  };

  const modalTasks = useMemo(() => {
    if (!fromCol) return [];
    const list = data[fromCol] || [];

    if (!modalQ) return list;

    return list.filter(
      (x) =>
        x.title.toLowerCase().includes(modalQ.toLowerCase()) ||
        x.desc.toLowerCase().includes(modalQ.toLowerCase())
    );
  }, [data, fromCol, modalQ]);

  // ✅ UPDATE TASK STATUS (IMPORTANT)
  const onDoneMove = async () => {
    if (!selectedTaskId || !toCol) return;

    await axios.put(
      `http://localhost:5000/api/tasks/${selectedTaskId}`,
      { status: toCol }
    );

    fetchTasks(); // refresh
    closeMoveModal();
  };

  return (
    <div className="wl-wrap">
      <div className="wl-head">
        <h1 className="wl-title">Work Logs</h1>

        <div className="wl-actions">
          <div className="wl-search">
            <span className="wl-searchIco">⌕</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search Tasks"
            />
          </div>
        </div>
      </div>

      <div className="wl-board">
        {columns.map((col) => (
          <div key={col.key} className="wl-col">
            <div className="wl-colHead">
              <div className="wl-colTitle">{col.title}</div>
            </div>

            {col.key === "backlog" ? (
              <div className="wl-colSearch">
                <input
                  value={backlogQ}
                  onChange={(e) => setBacklogQ(e.target.value)}
                  placeholder="Search..."
                />
              </div>
            ) : (
              <button
                className="wl-add"
                onClick={() => openMoveModal(col.key)}
              >
                +
              </button>
            )}

            <div className="wl-list">
              {(filtered[col.key] || []).map((item) => (
                <CardItem key={item._id} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="wl-modalOverlay">
          <div className="wl-modal">
            <input
              value={modalQ}
              onChange={(e) => setModalQ(e.target.value)}
              placeholder="Search..."
            />

            {modalTasks.map((t) => (
              <div
                key={t._id}
                onClick={() => setSelectedTaskId(t._id)}
              >
                {t.title}
              </div>
            ))}

            <button onClick={onDoneMove}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
}