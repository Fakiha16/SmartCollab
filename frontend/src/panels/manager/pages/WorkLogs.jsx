import React, { useMemo, useState } from "react";
import "./WorkLogs.css";

const columns = [
  { key: "backlog", title: "Backlog SubTasks" },
  { key: "inprogress", title: "In progress" },
  { key: "review", title: "Review" },
  { key: "completed", title: "Completed" },
];

const seed = {
  backlog: [
    {
      id: "b1",
      title: "Food Research",
      desc: "Food design is required for our new project let's research the best practices.",
      days: 12,
      comments: 5,
      files: 8,
      people: 3,
    },
    {
      id: "b2",
      title: "Mockups",
      desc: "Create 12 mockups for mobile iphone 13 pro max",
      days: 12,
      comments: 3,
      files: 6,
      people: 3,
    },
    {
      id: "b3",
      title: "UI Animation",
      desc: "Micro interaction loading and progress, story telling, Navigation",
      days: 12,
      comments: 2,
      files: 4,
      people: 3,
    },
    {
      id: "b4",
      title: "UI Animation",
      desc: "Micro interaction loading and progress, story telling, Navigation",
      days: 12,
      comments: 2,
      files: 4,
      people: 3,
    },
  ],
  inprogress: [
    {
      id: "p1",
      title: "User interface",
      desc: "Design new user interface design for food delivery app",
      days: 12,
      comments: 2,
      files: 4,
      people: 3,
    },
    {
      id: "p2",
      title: "Usability Testing",
      desc: "Perform the usability testing for the newly develop app",
      days: 12,
      comments: 3,
      files: 5,
      people: 3,
    },
  ],
  review: [
    {
      id: "r1",
      title: "Mind Mapping",
      desc: "Mind mapping for the food delivery app for by targeting young users",
      days: 12,
      comments: 7,
      files: 2,
      people: 3,
    },
  ],
  completed: [
    {
      id: "c1",
      title: "User Feedback",
      desc: "Perform the user survey and take necessary steps to solve their problem with existing one",
      days: 12,
      comments: 5,
      files: 8,
      people: 3,
    },
  ],
};

function Icon({ children }) {
  return <span className="wl-ico">{children}</span>;
}

function People({ count = 3 }) {
  const arr = Array.from({ length: count });
  return (
    <div className="wl-people">
      {arr.map((_, i) => (
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
          <span>{item.days} Days</span>
        </div>
      </div>

      <div className="wl-cardDesc">{item.desc}</div>

      <div className="wl-cardBottom">
        <div className="wl-meta">
          <div className="wl-metaItem">
            <Icon>📎</Icon>
            <span>{item.comments}</span>
          </div>
          <div className="wl-metaItem">
            <Icon>💬</Icon>
            <span>{item.files}</span>
          </div>
        </div>

        <People count={item.people} />
      </div>
    </div>
  );
}

export default function WorkLogs() {
  const [q, setQ] = useState(""); // top search
  const [view, setView] = useState("List View");
  const [data, setData] = useState(seed);

  // ✅ backlog column search (ONLY for backlog top input)
  const [backlogQ, setBacklogQ] = useState("");

  // ✅ Modal state (move task from previous column)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fromCol, setFromCol] = useState(null);
  const [toCol, setToCol] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [modalQ, setModalQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    const next = {};
    for (const col of columns) {
      let list = data[col.key] || [];

      // ✅ global search
      if (query) {
        list = list.filter(
          (x) =>
            x.title.toLowerCase().includes(query) ||
            x.desc.toLowerCase().includes(query)
        );
      }

      // ✅ backlog column local search (works with global search too)
      if (col.key === "backlog") {
        const bq = backlogQ.trim().toLowerCase();
        if (bq) {
          list = list.filter(
            (x) =>
              x.title.toLowerCase().includes(bq) ||
              x.desc.toLowerCase().includes(bq)
          );
        }
      }

      next[col.key] = list;
    }

    return next;
  }, [q, backlogQ, data]);

  const openMoveModal = (targetColKey) => {
    const idx = columns.findIndex((c) => c.key === targetColKey);
    if (idx <= 0) return; // backlog has no previous

    const prevKey = columns[idx - 1].key;
    setFromCol(prevKey);
    setToCol(targetColKey);
    setSelectedTaskId(null);
    setModalQ("");
    setIsModalOpen(true);
  };

  const closeMoveModal = () => {
    setIsModalOpen(false);
    setFromCol(null);
    setToCol(null);
    setSelectedTaskId(null);
    setModalQ("");
  };

  const modalTasks = useMemo(() => {
    if (!fromCol) return [];
    const list = data[fromCol] || [];
    const query = modalQ.trim().toLowerCase();
    if (!query) return list;

    return list.filter(
      (x) =>
        x.title.toLowerCase().includes(query) ||
        x.desc.toLowerCase().includes(query)
    );
  }, [data, fromCol, modalQ]);

  const onDoneMove = () => {
    if (!fromCol || !toCol || !selectedTaskId) return;

    setData((prev) => {
      const fromList = prev[fromCol] || [];
      const toList = prev[toCol] || [];
      const task = fromList.find((t) => t.id === selectedTaskId);
      if (!task) return prev;

      return {
        ...prev,
        [fromCol]: fromList.filter((t) => t.id !== selectedTaskId),
        [toCol]: [task, ...toList],
      };
    });

    closeMoveModal();
  };

  const labelForCol = (key) => {
    if (key === "backlog") return "Backlog Tasks";
    if (key === "inprogress") return "In progress Tasks";
    if (key === "review") return "Review Tasks";
    if (key === "completed") return "Completed Tasks";
    return "Tasks";
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
              placeholder="Search Projects"
            />
          </div>

          <select
            className="wl-select"
            value={view}
            onChange={(e) => setView(e.target.value)}
          >
            <option>List View</option>
            <option>Board View</option>
          </select>
        </div>
      </div>

      <div className="wl-board">
        {columns.map((col) => (
          <div key={col.key} className="wl-col">
            <div className="wl-colHead">
              <div className="wl-colTitle">{col.title}</div>
              <button className="wl-more" type="button" title="More">
                ⋯
              </button>
            </div>

            {/* ✅ Backlog: search box (NO +) */}
            {col.key === "backlog" ? (
              <div className="wl-colSearch">
                <span className="wl-colSearchIco">⌕</span>
                <input
                  value={backlogQ}
                  onChange={(e) => setBacklogQ(e.target.value)}
                  placeholder="Search for Tasks..."
                />
              </div>
            ) : (
              /* ✅ Other columns: + button to open modal */
              <button
                className="wl-add"
                type="button"
                onClick={() => openMoveModal(col.key)}
                title="Move task from previous column"
              >
                <span className="wl-addBox">
                  <span className="wl-plusIcon">+</span>
                </span>
              </button>
            )}

            <div className="wl-list">
              {(filtered[col.key] || []).map((item) => (
                <CardItem key={item.id} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ✅ Modal */}
      {isModalOpen && (
        <div className="wl-modalOverlay" onMouseDown={closeMoveModal}>
          <div
            className="wl-modal"
            onMouseDown={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="wl-modalHead">
              <div className="wl-modalTitle">Select Task</div>

              <div className="wl-modalSearch">
                <span className="wl-modalSearchIcon">⌕</span>
                <input
                  value={modalQ}
                  onChange={(e) => setModalQ(e.target.value)}
                  placeholder="Search tasks..."
                />
              </div>

              <button
                className="wl-modalClose"
                type="button"
                onClick={closeMoveModal}
              >
                ✕
              </button>
            </div>

            <div className="wl-modalBody">
              <div className="wl-modalTable">
                <div className="wl-modalRow wl-modalRowHead">
                  <div className="wl-modalCell wl-modalCellTitle">
                    {labelForCol(fromCol)}
                  </div>
                  <div className="wl-modalCell wl-modalCellSelect">Select</div>
                </div>

                {modalTasks.length === 0 ? (
                  <div className="wl-modalEmpty">No tasks found.</div>
                ) : (
                  modalTasks.map((t) => {
                    const checked = selectedTaskId === t.id;
                    return (
                      <div
                        key={t.id}
                        className={`wl-modalRow ${checked ? "is-active" : ""}`}
                        onClick={() => setSelectedTaskId(t.id)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="wl-modalCell wl-modalCellTitle">
                          <div className="wl-modalTaskTitle">{t.title}</div>
                          <div className="wl-modalTaskSub">{t.desc}</div>
                        </div>
                        <div className="wl-modalCell wl-modalCellSelect">
                          <input type="checkbox" checked={checked} readOnly />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="wl-modalFooter">
              <button
                className="wl-modalBtn wl-modalBtnGhost"
                type="button"
                onClick={closeMoveModal}
              >
                Cancel
              </button>

              <button
                className="wl-modalBtn wl-modalBtnPrimary"
                type="button"
                disabled={!selectedTaskId}
                onClick={onDoneMove}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}