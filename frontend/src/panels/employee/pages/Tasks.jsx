import React, { useMemo, useState } from "react";
import "./Tasks.css";

const seedTasks = Array.from({ length: 28 }).map((_, i) => {
  const id = 402235 + i;
  const isPink = i % 6 === 0;
  const priority = i % 5 === 0 ? "high" : "low";
  return {
    id,
    title: "Make an Automatic Payment System that enable the design",
    meta: `#${id}  Opened 10 days ago by Yash Ghori`,
    status: "Completed",
    priority,
    time: isPink ? "00 : 15 : 00" : "00 : 30 : 00",
    timeTone: isPink ? "pink" : "green",
    comments: 2,
    avatar: "https://i.pravatar.cc/80?img=32",
  };
});

export default function Tasks() {
  const [filter, setFilter] = useState("Completed");

  // pagination
  const PAGE_SIZE = 7; // image jesa feel (adjust if you want)
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    // future me filter extend kar sakti ho
    return seedTasks.filter((t) => t.status === filter);
  }, [filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  // keep page in range
  const safeSetPage = (p) => {
    if (p < 1) return setPage(1);
    if (p > totalPages) return setPage(totalPages);
    setPage(p);
  };

  // page numbers (max 3 visible like screenshot)
  const visiblePages = useMemo(() => {
    const arr = [];
    const maxBtns = 3;
    let start = Math.max(1, page - 1);
    let end = start + (maxBtns - 1);
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - (maxBtns - 1));
    }
    for (let p = start; p <= end; p++) arr.push(p);
    return arr;
  }, [page, totalPages]);

  return (
    <div className="tsk-wrap">
      <div className="tsk-head">
        <h1 className="tsk-title">Tasks</h1>

        <div className="tsk-filter">
          <span className="tsk-filterIco">⎘</span>
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(1);
            }}
          >
            <option>Completed</option>
            <option>In Progress</option>
            <option>Pending</option>
          </select>
          <span className="tsk-caret">▾</span>
        </div>
      </div>

      {/* LIST (no page scroll) */}
      <div className="tsk-list">
        {pageItems.map((t) => (
          <div key={t.id} className="tsk-row">
            <div className="tsk-left">
              <div className="tsk-gear">⚙</div>

              <div className="tsk-info">
                <div className="tsk-rowTitle">{t.title}</div>

                <div className="tsk-metaRow">
                  <div className="tsk-meta">{t.meta}</div>

                  <div className="tsk-pill tsk-pillGreen">{t.status}</div>

                  <div
                    className={`tsk-pill ${
                      t.priority === "high" ? "tsk-pillPink" : "tsk-pillSoft"
                    }`}
                  >
                    {t.priority}
                  </div>
                </div>
              </div>
            </div>

            <div className="tsk-right">
              <div
                className={`tsk-time ${
                  t.timeTone === "pink" ? "tsk-timePink" : "tsk-timeGreen"
                }`}
              >
                <span className="tsk-clock">⏱</span>
                {t.time}
              </div>

              <img className="tsk-avatar" src={t.avatar} alt="" />

              <div className="tsk-count">{t.comments}</div>

              <button className="tsk-iconBtn" type="button" title="List">
                ☰
              </button>
              <button className="tsk-iconBtn" type="button" title="Comments">
                💬
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION (instead of scrolling) */}
      <div className="tsk-pagination">
        <button
          className="tsk-pageBtn"
          type="button"
          onClick={() => safeSetPage(page - 1)}
          disabled={page === 1}
        >
          Previous
        </button>

        {visiblePages.map((p) => (
          <button
            key={p}
            className={`tsk-pageNum ${p === page ? "tsk-active" : ""}`}
            type="button"
            onClick={() => safeSetPage(p)}
          >
            {p}
          </button>
        ))}

        <button
          className="tsk-pageBtn"
          type="button"
          onClick={() => safeSetPage(page + 1)}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}