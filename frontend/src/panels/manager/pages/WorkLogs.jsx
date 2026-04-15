import React, { useMemo, useState } from "react";
import "./WorkLogs.css";
import axios from "axios";

// Dummy teams
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

// Projects
const projects = [
  { id: "p1", name: "SmartCollab", team: teams.Development },
  { id: "p2", name: "Auth System", team: teams.Testing },
  { id: "p3", name: "UI Design", team: teams.Design },
];

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
  const calculateRemainingDays = (endDate) => {
    if (!endDate) return "";
    const today = new Date();
    const diff = Math.ceil((new Date(endDate) - today) / (1000 * 3600 * 24));
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
  const [globalSearch, setGlobalSearch] = useState("");
  const [data, setData] = useState(seed);

  const [selectedProject, setSelectedProject] = useState(projects[0].id);

  // ✅ Column-wise search
  const [columnSearch, setColumnSearch] = useState({
    backlog: "",
    inprogress: "",
    review: "",
    completed: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskType, setTaskType] = useState("");
  const [taskStartDate, setTaskStartDate] = useState("");
  const [taskEndDate, setTaskEndDate] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  const currentProject = projects.find(p => p.id === selectedProject);

  const assignableMembers = taskType
    ? currentProject?.team || []
    : [];

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

  const handleTaskSubmit = async () => {
  if (
    taskTitle &&
    taskDesc &&
    taskType &&
    assignedTo &&
    taskStartDate &&
    taskEndDate
  ) {
    try {
      await axios.post("http://localhost:5000/api/tasks", {
        title: taskTitle,
        desc: taskDesc,
        status: "backlog",
        projectId: selectedProject,
        assignedTo,
      });

      alert("✅ Task Created");

      closeModal();

    } catch (err) {
      console.error(err);
      alert("❌ Error creating task");
    }
  }
};

  // 🔥 FILTER LOGIC
  const filtered = useMemo(() => {
    const next = {};

    for (const col of columns) {
      let list = data[col.key] || [];

      // Project filter
      list = list.filter(item => item.projectId === selectedProject);

      // Global search
      if (globalSearch) {
        list = list.filter(
          x =>
            x.title.toLowerCase().includes(globalSearch.toLowerCase()) ||
            x.desc.toLowerCase().includes(globalSearch.toLowerCase())
        );
      }

      // Column search
      if (columnSearch[col.key]) {
        list = list.filter(
          x =>
            x.title.toLowerCase().includes(columnSearch[col.key].toLowerCase()) ||
            x.desc.toLowerCase().includes(columnSearch[col.key].toLowerCase())
        );
      }

      next[col.key] = list;
    }

    return next;
  }, [data, selectedProject, globalSearch, columnSearch]);

  return (
    <div className="wl-wrap">
      <div className="wl-head">
        <h1 className="wl-title">Work Logs</h1>

        <div className="wl-actions">
          <div className="wl-search">
            <span className="wl-searchIco">⌕</span>
            <input
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Search Tasks"
            />
          </div>

          <select
            className="wl-select"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="wl-board">
        {columns.map(col => (
          <div key={col.key} className="wl-col">
            <div className="wl-colHead">
              <div className="wl-colTitle">{col.title}</div>
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
                  value={columnSearch[col.key]}
                  onChange={(e) =>
                    setColumnSearch(prev => ({
                      ...prev,
                      [col.key]: e.target.value,
                    }))
                  }
                  placeholder="Search for Tasks..."
                />
              </div>
            )}

            <div className="wl-list">
              {(filtered[col.key] || []).map(item => (
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

                {assignableMembers.map(m => (
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