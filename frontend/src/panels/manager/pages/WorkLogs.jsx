import React, { useMemo, useState, useEffect } from "react";
import "./WorkLogs.css";
import axios from "axios";

const columns = [
  { key: "backlog",    title: "Backlog SubTasks" },
  { key: "inprogress", title: "In progress" },
  { key: "review",     title: "Review" },
  { key: "completed",  title: "Completed" },
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
          <div className="wl-metaItem"><Icon>📎</Icon><span>{item.comments || 0}</span></div>
          <div className="wl-metaItem"><Icon>💬</Icon><span>{item.files || 0}</span></div>
        </div>
        <People count={item.people || 1} />
      </div>
    </div>
  );
}

export default function WorkLogs() {
  const [globalSearch, setGlobalSearch] = useState("");
  const [data, setData] = useState({ backlog: [], inprogress: [], review: [], completed: [] });
  const [projects, setProjects]       = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [columnSearch, setColumnSearch] = useState({ backlog: "", inprogress: "", review: "", completed: "" });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskTitle, setTaskTitle]     = useState("");
  const [taskType, setTaskType]       = useState("");
  const [taskStartDate, setTaskStartDate] = useState("");
  const [taskEndDate, setTaskEndDate]     = useState("");
  const [taskDesc, setTaskDesc]       = useState("");
  const [assignedTo, setAssignedTo]   = useState("");
  const [projectMembers, setProjectMembers] = useState([]);

  // ── Load projects from DB ──────────────────────────────────
  useEffect(() => {
    axios.get("http://localhost:5000/api/projects")
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setProjects(res.data);
          setSelectedProject(res.data[0]._id || res.data[0].id);
        }
      })
      .catch(console.error);
  }, []);

  // ── Load tasks whenever project changes ───────────────────
  useEffect(() => {
    if (selectedProject) fetchTasks();
  }, [selectedProject]);

  // ── Load members of selected project ─────────────────────
  useEffect(() => {
    if (!selectedProject) return;
    axios.get(`http://localhost:5000/api/projects/${selectedProject}`)
      .then(res => {
        // team object: { Frontend:[..], Backend:[..], QA:[..], Designer:[..] }
        const team = res.data?.team || {};
        const allMembers = Object.values(team).flat();
        setProjectMembers(allMembers);
      })
      .catch(console.error);
  }, [selectedProject]);

  const fetchTasks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tasks");
      const grouped = { backlog: [], inprogress: [], review: [], completed: [] };
      res.data.forEach(task => {
        const pid = task.projectId;
        if (pid === selectedProject && grouped[task.status]) {
          grouped[task.status].push(task);
        }
      });
      setData(grouped);
    } catch (err) { console.error(err); }
  };

  const openModal  = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setTaskTitle(""); setTaskType(""); setTaskStartDate("");
    setTaskEndDate(""); setTaskDesc(""); setAssignedTo("");
  };

  const handleTaskSubmit = async () => {
    if (!taskTitle || !taskDesc || !taskType || !assignedTo || !taskStartDate || !taskEndDate) return;
    try {
      await axios.post("http://localhost:5000/api/tasks", {
        title:      taskTitle,
        desc:       taskDesc,
        status:     "backlog",
        projectId:  selectedProject,
        assignedTo,
        startDate:  taskStartDate,
        endDate:    taskEndDate,
        taskType,
      });
      await fetchTasks();
      closeModal();
    } catch (err) { console.error(err); }
  };

  const filtered = useMemo(() => {
    const next = {};
    for (const col of columns) {
      let list = data[col.key] || [];
      if (globalSearch)
        list = list.filter(x =>
          x.title.toLowerCase().includes(globalSearch.toLowerCase()) ||
          x.desc.toLowerCase().includes(globalSearch.toLowerCase())
        );
      if (columnSearch[col.key])
        list = list.filter(x =>
          x.title.toLowerCase().includes(columnSearch[col.key].toLowerCase()) ||
          x.desc.toLowerCase().includes(columnSearch[col.key].toLowerCase())
        );
      next[col.key] = list;
    }
    return next;
  }, [data, globalSearch, columnSearch]);

  return (
    <div className="wl-wrap">
      <div className="wl-head">
        <h1 className="wl-title">Work Logs</h1>
        <div className="wl-actions">
          <div className="wl-search">
            <span className="wl-searchIco">⌕</span>
            <input value={globalSearch} onChange={e => setGlobalSearch(e.target.value)} placeholder="Search Tasks" />
          </div>

          {/* Project dropdown — from DB */}
          <select className="wl-select" value={selectedProject} onChange={e => setSelectedProject(e.target.value)}>
            {projects.map(p => (
              <option key={p._id || p.id} value={p._id || p.id}>{p.title}</option>
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

            {/* Backlog → only "+" button (no "Add Task" text) */}
            {col.key === "backlog" ? (
              <div className="wl-addBox" onClick={openModal}>
                <span className="wl-plusIcon">+</span>
              </div>
            ) : (
              <div className="wl-colSearch">
                <span className="wl-colSearchIco">⌕</span>
                <input
                  value={columnSearch[col.key]}
                  onChange={e => setColumnSearch(prev => ({ ...prev, [col.key]: e.target.value }))}
                  placeholder="Search..."
                />
              </div>
            )}

            <div className="wl-list">
              {(filtered[col.key] || []).map(item => (
                <CardItem key={item._id} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* CREATE TASK MODAL */}
      {isModalOpen && (
        <div className="wl-modalOverlay" onMouseDown={closeModal}>
          <div className="wl-modal" onMouseDown={e => e.stopPropagation()}>
            <h2>Create Task</h2>

            <div className="wl-formRow">
              <input placeholder="Task Title" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} />
              <select value={taskType} onChange={e => setTaskType(e.target.value)}>
                <option value="">Task Type</option>
                <option value="Development">Development</option>
                <option value="Testing">Testing</option>
                <option value="Design">Design</option>
              </select>
            </div>

            <div className="wl-formRow">
              <input type="date" value={taskStartDate} onChange={e => setTaskStartDate(e.target.value)} />
              <input type="date" value={taskEndDate}   onChange={e => setTaskEndDate(e.target.value)} />
            </div>

            <textarea placeholder="Task Description" value={taskDesc} onChange={e => setTaskDesc(e.target.value)} />

            {/* Assign to — project ke members jo DB se aaye */}
            <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)}>
              <option value="">Assign To</option>
              {projectMembers.map((email, i) => (
                <option key={i} value={email}>{email}</option>
              ))}
            </select>

            <div className="wl-btnRow">
              <button className="wl-createBtn" onClick={handleTaskSubmit}>Create</button>
              <button className="wl-cancelBtn" onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}