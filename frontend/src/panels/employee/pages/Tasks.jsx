import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./Tasks.css";

export default function Tasks() {
  const mockTasks = [
    { _id: "402231", title: "Make an Automatic Payment System that enable the design", status: "Completed", priority: "low", createdBy: "Yash Ghori" },
    { _id: "402232", title: "Make an Automatic Payment System that enable the design", status: "Completed", priority: "low", createdBy: "Yash Ghori" },
    { _id: "402233", title: "Make an Automatic Payment System that enable the design", status: "Completed", priority: "low", createdBy: "Yash Ghori" },
    { _id: "402234", title: "Make an Automatic Payment System that enable the design", status: "Completed", priority: "high", createdBy: "Yash Ghori" },
    { _id: "402235", title: "Make an Automatic Payment System that enable the design", status: "Completed", priority: "low", createdBy: "Yash Ghori" },
    { _id: "402236", title: "Make an Automatic Payment System that enable the design", status: "Completed", priority: "low", createdBy: "Yash Ghori" }
  ];
  const [tasks, setTasks] = useState(mockTasks);
  const [filter, setFilter] = useState("Completed");
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 7;

  const user = JSON.parse(localStorage.getItem("user"));

  // ✅ FETCH TASKS
  useEffect(() => {
    const fetchTasks = async () => {
      const mockTasks = [
        { _id: "402231", title: "Make an Automatic Payment System that enable the design", status: "Completed", priority: "low", createdBy: "Yash Ghori" },
        { _id: "402232", title: "Make an Automatic Payment System that enable the design", status: "Completed", priority: "low", createdBy: "Yash Ghori" },
        { _id: "402233", title: "Make an Automatic Payment System that enable the design", status: "Completed", priority: "low", createdBy: "Yash Ghori" },
        { _id: "402234", title: "Make an Automatic Payment System that enable the design", status: "Completed", priority: "high", createdBy: "Yash Ghori" },
        { _id: "402235", title: "Make an Automatic Payment System that enable the design", status: "Completed", priority: "low", createdBy: "Yash Ghori" },
        { _id: "402236", title: "Make an Automatic Payment System that enable the design", status: "Completed", priority: "low", createdBy: "Yash Ghori" }
      ];

      try {
        const res = await axios.get(
          `http://localhost:5000/api/tasks/my-tasks/${user?.email || ''}`
        );
        if (res.data && res.data.length > 0) {
          setTasks(res.data);
        } else {
          // Add mock data so the UI can be previewed even when no real tasks exist
          setTasks(mockTasks);
        }
      } catch (err) {
        console.log(err);
        setTasks(mockTasks);
      }
    };

    fetchTasks();
  }, [user?.email]);

  // ✅ FILTER
  // const filtered = useMemo(() => {
  //   // Return all tasks for now so we can debug why it's empty
  //   return tasks;
  // }, [tasks, filter]);
  // ✅ FIXED LOGIC
// const filtered = useMemo(() => {
//   return tasks.filter((t) => {
//     if (!t.status) return false;
    
//     // Normalize both values to lowercase and remove spaces for accurate matching
//     const taskStatus = t.status.toLowerCase().replace(/\s+/g, "");
//     const selectedFilter = filter.toLowerCase().replace(/\s+/g, "");
    
//     return taskStatus === selectedFilter;
//   });
// }, [tasks, filter]);
// ✅ FIXED LOGIC WITH BACKEND MAPPING
const filtered = useMemo(() => {
  return tasks.filter((t) => {
    if (!t.status) return false;
    
    // Normalize both values to lowercase and remove spaces for accurate matching
    const taskStatus = t.status.toLowerCase().replace(/\s+/g, "");
    const selectedFilter = filter.toLowerCase().replace(/\s+/g, "");
    
    // If user selects "Pending", also accept database tasks marked as "review"
    if (selectedFilter === "pending") {
      return taskStatus === "pending" || taskStatus === "review" || taskStatus === "inreview";
    }
    
    return taskStatus === selectedFilter;
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
              <div className="tsk-gear">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.2 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
              </div>

              <div className="tsk-info">
                <div className="tsk-rowTitle">{t.title || "Make an Automatic Payment System that enable the design"}</div>

                <div className="tsk-metaRow">
                  {/* <div className="tsk-meta">
                    #{t._id ? t._id.substring(0,6) : "402235"} Opened 10 days ago by {t.createdBy || "Yash Ghori"}
                  </div> */}
                  {/* ✅ NEW DYNAMIC LINE */}
                  <div className="tsk-meta">
                  #{t._id ? t._id.substring(0,6) : "402235"} Opened {getRelativeTime(t.createdAt)} by {t.createdBy || user?.name || "Me"}
                  </div>
                  <div className={`tsk-pill ${t.status === 'Completed' || filter === 'Completed' ? 'tsk-pillGreen' : 'tsk-pillSoft'}`}>
                    {t.status || "Completed"}
                  </div>

                  <div className={`tsk-pill ${t.priority === "high" || t.priority === "High" ? "tsk-pillPink" : "tsk-pillSoft"}`}>
                    {t.priority || "low"}
                  </div>
                </div>
              </div>
            </div>

            <div className="tsk-right">
              {/* <div className={`tsk-time ${t.priority === "high" || t.priority === "High" ? "tsk-timePink" : "tsk-timeGreen"}`}>
                <svg className="tsk-clock" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                {t.priority === "high" || t.priority === "High" ? "00 : 15 : 00" : "00 : 30 : 00"}
              </div> */}
                <div className={`tsk-time ${getDeadlineRemainingTime(t.taskEndDate).includes('overdue') ? 'tsk-timePink' : 'tsk-timeGreen'}`}>
                <svg className="tsk-clock" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                 <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
               </svg>

               {getDeadlineRemainingTime(t.taskEndDate)}

              </div>

              <img
                className="tsk-avatar"
                src="https://i.pravatar.cc/80"
                alt=""
              />

              <div className="tsk-actions">
                <div className="tsk-action-item">
                  <span className="tsk-count">2</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                </div>
                
                <div className="tsk-action-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </div>
              </div>
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
// sort by creation time kay creation kay baad kitna time guzar gaya
const getRelativeTime = (createdAtString) => {
  if (!createdAtString) return "Recently";
  const createdDate = new Date(createdAtString);
  const nowDate = new Date();
  
  // Difference in milliseconds
  const diffInMs = nowDate - createdDate;
  
  // Conversions
  const diffInMins = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMins < 1) return "Just now";
  if (diffInMins < 60) return `${diffInMins} ${diffInMins === 1 ? 'minute' : 'minutes'} ago`;
  if (diffInHours < 24) return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  
  return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
};

// remaining time until deadline - if deadline is passed show how many days left
const getDeadlineRemainingTime = (endDateString) => {
  if (!endDateString) return "No deadline set";

  const targetDate = new Date(endDateString);
  const nowDate = new Date();
  
  // Calculate difference in milliseconds
  const diffInMs = targetDate - nowDate;

  // If the deadline has already passed
  if (diffInMs <= 0) {
    const overdueMs = Math.abs(diffInMs);
    const overdueDays = Math.floor(overdueMs / (1000 * 60 * 60 * 24));
    if (overdueDays === 0) return "Overdue today";
    return `${overdueDays} ${overdueDays === 1 ? 'day' : 'days'} overdue`;
  }

  // Conversions for remaining time
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  // If less than 24 hours remain, show hours
  if (diffInDays === 0) {
    if (diffInHours === 0) {
      const diffInMins = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMins} ${diffInMins === 1 ? 'min' : 'mins'} left`;
    }
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} left`;
  }

  // Default: Show remaining days
  return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} left`;
};