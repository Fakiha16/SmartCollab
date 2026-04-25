import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./Tasks.css";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("Completed");
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 7;

  const user = JSON.parse(localStorage.getItem("user"));

  // ✅ FETCH TASKS
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/tasks/my-tasks/${user.email}`
        );
        setTasks(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchTasks();
  }, []);

  // ✅ FILTER
  const filtered = useMemo(() => {
    return tasks.filter((t) => t.status === filter);
  }, [tasks, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const safeSetPage = (p) => {
    if (p < 1) return setPage(1);
    if (p > totalPages) return setPage(totalPages);
    setPage(p);
  };

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
        </div>
      </div>

      <div className="tsk-list">
        {pageItems.map((t) => (
          <div key={t._id} className="tsk-row">
            <div className="tsk-left">
              <div className="tsk-gear">⚙</div>

              <div className="tsk-info">
                <div className="tsk-rowTitle">{t.title}</div>

                <div className="tsk-metaRow">
                  <div className="tsk-meta">
                    #{t._id} Assigned by {t.createdBy}
                  </div>

                  <div className="tsk-pill tsk-pillGreen">
                    {t.status}
                  </div>

                  <div
                    className={`tsk-pill ${
                      t.priority === "high"
                        ? "tsk-pillPink"
                        : "tsk-pillSoft"
                    }`}
                  >
                    {t.priority}
                  </div>
                </div>
              </div>
            </div>

            <div className="tsk-right">
              <img
                className="tsk-avatar"
                src="https://i.pravatar.cc/80"
                alt=""
              />

              <div className="tsk-count">{t.comments}</div>

              <button className="tsk-iconBtn">☰</button>
              <button className="tsk-iconBtn">💬</button>
            </div>
          </div>
        ))}
      </div>

      <div className="tsk-pagination">
        <button
          onClick={() => safeSetPage(page - 1)}
          disabled={page === 1}
        >
          Previous
        </button>

        {visiblePages.map((p) => (
          <button
            key={p}
            className={p === page ? "tsk-active" : ""}
            onClick={() => safeSetPage(p)}
          >
            {p}
          </button>
        ))}

        <button
          onClick={() => safeSetPage(page + 1)}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}