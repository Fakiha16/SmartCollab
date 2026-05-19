import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./Tasks.css";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 7;
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        if (!user?.email) return;

        const res = await axios.get(
          `http://localhost:5000/api/tasks/my-tasks/${encodeURIComponent(user.email)}`
        );

        if (Array.isArray(res.data)) {
          setTasks(res.data);
        } else {
          setTasks([]);
        }
      } catch (err) {
        console.error("Employee tasks fetch error:", err);
        setTasks([]);
      }
    };

    fetchTasks();
  }, [user?.email]);

  const normalizeStatus = (status = "") => {
    const value = String(status).toLowerCase().replace(/\s+/g, "");

    if (
      value === "completed" ||
      value === "complete" ||
      value === "done"
    ) {
      return "Completed";
    }

    if (
      value === "inprogress" ||
      value === "progress" ||
      value === "ongoing"
    ) {
      return "In Progress";
    }

    if (
      value === "pending" ||
      value === "backlog" ||
      value === "todo" ||
      value === "review" ||
      value === "inreview"
    ) {
      return "Pending";
    }

    return "Pending";
  };

  const getCounts = useMemo(() => {
    return tasks.reduce(
      (acc, task) => {
        const status = normalizeStatus(task.status || task.column);
        acc[status] += 1;
        acc.All += 1;
        return acc;
      },
      {
        All: 0,
        Pending: 0,
        "In Progress": 0,
        Completed: 0,
      }
    );
  }, [tasks]);

  const filtered = useMemo(() => {
    if (filter === "All") return tasks;

    return tasks.filter((task) => {
      const status = normalizeStatus(task.status || task.column);
      return status === filter;
    });
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

  const getTaskTitle = (task) => {
    return task.title || task.taskTitle || task.name || "Untitled Task";
  };

  const getTaskDesc = (task) => {
    return task.description || task.desc || task.details || "";
  };

  const getTaskCreator = (task) => {
    return (
      task.managerName ||
      task.assignedByName ||
      task.createdBy ||
      task.createdByName ||
      "Manager"
    );
  };

  return (
    <div className="tsk-wrap">
      <div className="tsk-head">
        <h1 className="tsk-title">Tasks</h1>

        <div className="tsk-categoryTabs">
          {["All", "Pending", "In Progress", "Completed"].map((item) => (
            <button
              key={item}
              className={`tsk-categoryBtn ${filter === item ? "tsk-categoryBtnActive" : ""}`}
              onClick={() => {
                setFilter(item);
                setPage(1);
              }}
            >
              {item}
              <span>{getCounts[item]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="tsk-list">
        {pageItems.length === 0 ? (
          <div className="tsk-empty">
            No {filter === "All" ? "" : filter.toLowerCase()} tasks found.
          </div>
        ) : (
          pageItems.map((t) => {
            const status = normalizeStatus(t.status || t.column);

            return (
              <div key={t._id} className="tsk-row">
                <div className="tsk-left">
                  <div className="tsk-gear">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.2 1.5 1.5 2.5" />
                      <path d="M9 18h6" />
                      <path d="M10 22h4" />
                    </svg>
                  </div>

                  <div className="tsk-info">
                    <div className="tsk-rowTitle">
                      {getTaskTitle(t)}
                    </div>

                    {getTaskDesc(t) && (
                      <div className="tsk-rowDesc">
                        {getTaskDesc(t)}
                      </div>
                    )}

                    <div className="tsk-metaRow">
                      <div className="tsk-meta">
                        #{t._id ? t._id.substring(0, 6) : "task"} Opened{" "}
                        {getRelativeTime(t.createdAt)} by {getTaskCreator(t)}
                      </div>

                      <div
                        className={`tsk-pill ${
                          status === "Completed"
                            ? "tsk-pillGreen"
                            : status === "In Progress"
                            ? "tsk-pillBlue"
                            : "tsk-pillSoft"
                        }`}
                      >
                        {status}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="tsk-right">
                  <div
                    className={`tsk-time ${
                      getDeadlineRemainingTime(t.taskEndDate).includes("overdue")
                        ? "tsk-timePink"
                        : "tsk-timeGreen"
                    }`}
                  >
                    <svg
                      className="tsk-clock"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>

                    {getDeadlineRemainingTime(t.taskEndDate)}
                  </div>

                  <img
                    className="tsk-avatar"
                    src="https://i.pravatar.cc/80"
                    alt=""
                  />

                  
                </div>
              </div>
            );
          })
        )}
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

const getRelativeTime = (createdAtString) => {
  if (!createdAtString) return "Recently";

  const createdDate = new Date(createdAtString);
  const nowDate = new Date();

  const diffInMs = nowDate - createdDate;
  const diffInMins = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMins < 1) return "Just now";
  if (diffInMins < 60) return `${diffInMins} ${diffInMins === 1 ? "minute" : "minutes"} ago`;
  if (diffInHours < 24) return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;

  return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
};

const getDeadlineRemainingTime = (endDateString) => {
  if (!endDateString) return "No deadline set";

  const targetDate = new Date(endDateString);
  const nowDate = new Date();

  const diffInMs = targetDate - nowDate;

  if (diffInMs <= 0) {
    const overdueMs = Math.abs(diffInMs);
    const overdueDays = Math.floor(overdueMs / (1000 * 60 * 60 * 24));
    if (overdueDays === 0) return "Overdue today";
    return `${overdueDays} ${overdueDays === 1 ? "day" : "days"} overdue`;
  }

  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    if (diffInHours === 0) {
      const diffInMins = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMins} ${diffInMins === 1 ? "min" : "mins"} left`;
    }

    return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} left`;
  }

  return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} left`;
};