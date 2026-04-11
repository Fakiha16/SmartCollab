import React, { useMemo, useState } from "react";
import "./WorkLogs.css";

// Dummy data for teams
const teams = {
  Development: [
    { id: "dev1", name: "Yash Ghori" },
    { id: "dev2", name: "John Doe" },
  ],
  Testing: [
    { id: "test1", name: "Alice Smith" },
    { id: "test2", name: "Bob Johnson" },
  ],
  Design: [
    { id: "design1", name: "Charlie Brown" },
    { id: "design2", name: "David Green" },
  ],
};

const columns = [
  { key: "backlog", title: "Backlog SubTasks" },
  { key: "inprogress", title: "In progress" },
  { key: "review", title: "Review" },
  { key: "completed", title: "Completed" },
];

const seed = {
  backlog: [],
  inprogress: [],
  review: [],
  completed: [],
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
  const calculateRemainingDays = (endDate) => {
    if (!endDate) return "";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const taskEndDate = new Date(endDate);
    taskEndDate.setHours(0, 0, 0, 0);

    const diff = Math.ceil((taskEndDate - today) / (1000 * 3600 * 24));

    if (diff <= 0) return "Today";
    if (diff === 1) return "Tomorrow";
    return `${diff} Days`;
  };

  return (
    <div className="wl-card">
      <div className="wl-cardTop">
        <div className="wl-cardTitle">{item.title}</div>
        <div className="wl-days">
          <Icon>⏱</Icon>
          <span>{calculateRemainingDays(item.endDate)}</span>
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
  const [q, setQ] = useState("");
  const [view, setView] = useState("List View");
  const [data, setData] = useState(seed);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskType, setTaskType] = useState("");
  const [taskStartDate, setTaskStartDate] = useState("");
  const [taskEndDate, setTaskEndDate] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  const [openMenuCol, setOpenMenuCol] = useState(null);
  const [columnFilters, setColumnFilters] = useState({
    backlog: "all",
    inprogress: "all",
    review: "all",
    completed: "all",
  });

  const openModal = () => setIsModalOpen(true);

  const closeModal = () => {
    setIsModalOpen(false);
    setTaskTitle("");
    setTaskType("");
    setTaskStartDate("");
    setTaskEndDate("");
    setTaskDesc("");
    setAssignedTo("");
  };

  const assignableMembers = taskType ? teams[taskType] || [] : [];

  const handleTaskSubmit = () => {
    if (
      taskTitle &&
      taskDesc &&
      taskType &&
      assignedTo &&
      taskStartDate &&
      taskEndDate
    ) {
      const newTask = {
        id: Date.now().toString(),
        title: taskTitle,
        desc: taskDesc,
        comments: 0,
        files: 0,
        people: 1,
        type: taskType,
        startDate: taskStartDate,
        endDate: taskEndDate,
        assignedTo,
      };

      setData((prev) => ({
        ...prev,
        backlog: [...prev.backlog, newTask],
      }));

      closeModal();
    }
  };

  const getDayDiff = (dateStr) => {
    if (!dateStr) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);

    return Math.ceil((target - today) / (1000 * 3600 * 24));
  };

  const matchesColumnFilter = (item, filterValue) => {
    if (filterValue === "all") return true;

    const diff = getDayDiff(item.endDate);
    if (diff === null) return false;

    if (filterValue === "today") return diff <= 0;
    if (filterValue === "tomorrow") return diff === 1;
    if (filterValue === "7days") return diff >= 0 && diff <= 7;
    if (filterValue === "10days") return diff >= 0 && diff <= 10;

    return true;
  };

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
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

      list = list.filter((item) =>
        matchesColumnFilter(item, columnFilters[col.key])
      );

      next[col.key] = list;
    }

    return next;
  }, [q, data, columnFilters]);

  const getPriority = (endDate) => {
    if (!endDate) return 9999;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const taskEnd = new Date(endDate);
    taskEnd.setHours(0, 0, 0, 0);

    const diff = Math.ceil((taskEnd - today) / (1000 * 3600 * 24));

    if (diff <= 0) return 0;
    if (diff === 1) return 1;
    return diff;
  };

  const sortedData = useMemo(() => {
    const sorted = {};

    for (const col of columns) {
      const list = [...(filtered[col.key] || [])];
      list.sort((a, b) => getPriority(a.endDate) - getPriority(b.endDate));
      sorted[col.key] = list;
    }

    return sorted;
  }, [filtered]);

  const handleColumnFilterChange = (colKey, value) => {
    setColumnFilters((prev) => ({
      ...prev,
      [colKey]: value,
    }));
    setOpenMenuCol(null);
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

              <div className="wl-moreWrap">
                <button
                  className="wl-more"
                  type="button"
                  title="More"
                  onClick={() =>
                    setOpenMenuCol((prev) => (prev === col.key ? null : col.key))
                  }
                >
                  ⋯
                </button>

                {openMenuCol === col.key && (
                  <div className="wl-dropdownMenu">
                    <button
                      type="button"
                      onClick={() => handleColumnFilterChange(col.key, "all")}
                    >
                      All Tasks
                    </button>
                    <button
                      type="button"
                      onClick={() => handleColumnFilterChange(col.key, "today")}
                    >
                      Today Tasks
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleColumnFilterChange(col.key, "tomorrow")
                      }
                    >
                      Tomorrow Tasks
                    </button>
                    <button
                      type="button"
                      onClick={() => handleColumnFilterChange(col.key, "7days")}
                    >
                      Last 7 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => handleColumnFilterChange(col.key, "10days")}
                    >
                      Last 10 Days
                    </button>
                  </div>
                )}
              </div>
            </div>

            {col.key === "backlog" ? (
              <button className="wl-add" onClick={openModal}>
                <span className="wl-addBox">
                  <span className="wl-plusIcon">+</span>
                </span>
              </button>
            ) : (
              <div className="wl-colSearch">
                <span className="wl-colSearchIco">⌕</span>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search for Tasks..."
                />
              </div>
            )}

            <div className="wl-list">
              {(sortedData[col.key] || []).map((item) => (
                <CardItem key={item.id} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="wl-modalOverlay" onMouseDown={closeModal}>
          <div className="wl-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="wl-modalHead">
              <div>Create New Task</div>
              <button onClick={closeModal}>✕</button>
            </div>

            <div className="wl-modalBody">
              <input
                placeholder="Task Title"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
              />

              <select
                value={taskType}
                onChange={(e) => {
                  setTaskType(e.target.value);
                  setAssignedTo("");
                }}
              >
                <option value="">Task Type</option>
                <option value="Development">Development</option>
                <option value="Testing">Testing</option>
                <option value="Design">Design</option>
              </select>

              <input
                type="date"
                value={taskStartDate}
                onChange={(e) => setTaskStartDate(e.target.value)}
              />

              <input
                type="date"
                value={taskEndDate}
                onChange={(e) => setTaskEndDate(e.target.value)}
              />

              <textarea
                placeholder="Description"
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
              />

              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                disabled={!taskType}
              >
                <option value="">
                  {taskType ? "Assign to" : "Select type first"}
                </option>

                {assignableMembers.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="wl-modalFooter">
              <button onClick={closeModal}>Cancel</button>
              <button onClick={handleTaskSubmit}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}