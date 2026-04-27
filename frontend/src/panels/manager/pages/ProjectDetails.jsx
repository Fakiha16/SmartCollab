import React, { useEffect, useState, useRef } from "react";
import "./ProjectDetails.css";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";

const socket = io("http://localhost:5000");

export default function ProjectDetails() {
  const navigate = useNavigate();
  const projectId = window.location.pathname.split("/").pop();
  const user = JSON.parse(localStorage.getItem("user"));

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const [members, setMembers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [projectName, setProjectName] = useState("Project Workspace");
  const [activeTab, setActiveTab] = useState("chat");
  const [uploading, setUploading] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  // ─── Auto scroll ───────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ─── Socket Setup ──────────────────────────────────────
  useEffect(() => {
    socket.emit("joinProject", {
      projectId,
      user: { email: user.email, name: user.name || user.email },
    });

    // Load previous messages
    socket.on("previousMessages", (msgs) => setMessages(msgs));

    // New incoming message
    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Online members list
    socket.on("projectMembers", (memberList) => setMembers(memberList));

    // Typing indicators
    socket.on("userTyping", ({ name, email }) => {
      if (email !== user.email) {
        setTypingUsers((prev) =>
          prev.find((u) => u.email === email) ? prev : [...prev, { name, email }]
        );
      }
    });

    socket.on("userStoppedTyping", ({ email }) => {
      setTypingUsers((prev) => prev.filter((u) => u.email !== email));
    });

    // File uploaded by someone else
    socket.on("fileUploaded", (file) => {
      setFiles((prev) => [...prev, file]);
    });

    return () => {
      socket.off("previousMessages");
      socket.off("receiveMessage");
      socket.off("projectMembers");
      socket.off("userTyping");
      socket.off("userStoppedTyping");
      socket.off("fileUploaded");
    };
  }, [projectId]);

  // ─── Fetch files ───────────────────────────────────────
  useEffect(() => {
    fetch(`http://localhost:5000/api/upload/${projectId}`)
      .then((res) => res.json())
      .then((data) => setFiles(data))
      .catch(console.error);
  }, [projectId]);

  // ─── Send Message ──────────────────────────────────────
  const sendMessage = () => {
    if (!text.trim()) return;

    const msg = {
      text: text.trim(),
      sender: user.email,
      senderName: user.name || user.email,
      projectId,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      timestamp: Date.now(),
    };

    socket.emit("sendMessage", msg);
    socket.emit("stopTyping", { projectId, email: user.email });
    setText("");
    clearTimeout(typingTimeoutRef.current);
  };

  // ─── Typing Handler ────────────────────────────────────
  const handleTyping = (e) => {
    setText(e.target.value);
    socket.emit("typing", {
      projectId,
      name: user.name || user.email,
      email: user.email,
    });

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", { projectId, email: user.email });
    }, 1500);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ─── File Upload ───────────────────────────────────────
  const uploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("email", user.email);
    formData.append("projectId", projectId);

    try {
      const res = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const newFile = await res.json();
        setFiles((prev) => [...prev, newFile]);
        // Broadcast to other members
        socket.emit("broadcastFile", { projectId, file: newFile });

        // Also send a chat message about the file
        const fileMsg = {
          text: `📎 Shared a file: ${newFile.name}`,
          sender: user.email,
          senderName: user.name || user.email,
          projectId,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          timestamp: Date.now(),
          isFileMsg: true,
        };
        socket.emit("sendMessage", fileMsg);
      } else {
        alert("File upload failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Upload error. Try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // ─── Helpers ───────────────────────────────────────────
  const getFileIcon = (name = "") => {
    const ext = name.split(".").pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return "🖼️";
    if (["pdf"].includes(ext)) return "📄";
    if (["doc", "docx"].includes(ext)) return "📝";
    if (["xls", "xlsx"].includes(ext)) return "📊";
    if (["zip", "rar"].includes(ext)) return "🗜️";
    if (["mp4", "mov", "avi"].includes(ext)) return "🎬";
    return "📎";
  };

  const getInitials = (email = "") =>
    email.split("@")[0].slice(0, 2).toUpperCase();

  const getAvatarColor = (email = "") => {
    const colors = ["#25D366", "#128C7E", "#075E54", "#34B7F1", "#ECE5DD"];
    let hash = 0;
    for (let i = 0; i < email.length; i++) hash = email.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // ─── GROUP MESSAGES by sender + time ──────────────────
  const groupedMessages = messages.reduce((acc, msg, i) => {
    const prev = messages[i - 1];
    const sameBlock =
      prev && prev.sender === msg.sender && msg.timestamp - prev.timestamp < 60000;
    if (sameBlock) {
      acc[acc.length - 1].push(msg);
    } else {
      acc.push([msg]);
    }
    return acc;
  }, []);

  return (
    <div className="pd-root">
      {/* ── HEADER ── */}
      <header className="pd-header">
        <button className="pd-back" onClick={() => navigate("/manager/projects")}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="pd-header-avatar" style={{ background: "#25D366" }}>
          {projectName.charAt(0)}
        </div>

        <div className="pd-header-info">
          <div className="pd-header-title">{projectName}</div>
          <div className="pd-header-sub">
            {members.length > 0
              ? members.map((m) => m.name || m.email).join(", ")
              : "Loading members..."}
          </div>
        </div>

        <div className="pd-header-actions">
          <button
            className={`pd-tab-btn ${activeTab === "chat" ? "active" : ""}`}
            onClick={() => setActiveTab("chat")}
          >
            💬 Chat
          </button>
          <button
            className={`pd-tab-btn ${activeTab === "files" ? "active" : ""}`}
            onClick={() => setActiveTab("files")}
          >
            📁 Files {files.length > 0 && <span className="pd-badge">{files.length}</span>}
          </button>
          <button
            className={`pd-tab-btn ${activeTab === "members" ? "active" : ""}`}
            onClick={() => setActiveTab("members")}
          >
            👥 Members {members.length > 0 && <span className="pd-badge">{members.length}</span>}
          </button>
        </div>
      </header>

      {/* ── CHAT TAB ── */}
      {activeTab === "chat" && (
        <div className="pd-chat-wrap">
          {/* Wallpaper */}
          <div className="pd-chat-bg" />

          <div className="pd-messages">
            {groupedMessages.map((group, gi) => {
              const isMe = group[0].sender === user.email;
              return (
                <div key={gi} className={`pd-msg-group ${isMe ? "me" : "them"}`}>
                  {!isMe && (
                    <div
                      className="pd-avatar"
                      style={{ background: getAvatarColor(group[0].sender) }}
                    >
                      {getInitials(group[0].senderName || group[0].sender)}
                    </div>
                  )}
                  <div className="pd-bubbles">
                    {!isMe && (
                      <div className="pd-sender-name">
                        {group[0].senderName || group[0].sender}
                      </div>
                    )}
                    {group.map((msg, mi) => (
                      <div
                        key={mi}
                        className={`pd-bubble ${isMe ? "pd-bubble--me" : "pd-bubble--them"} ${msg.isFileMsg ? "pd-bubble--file" : ""}`}
                      >
                        <span className="pd-bubble-text">{msg.text}</span>
                        <span className="pd-bubble-time">{msg.time}</span>
                        {isMe && (
                          <span className="pd-ticks">✓✓</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {typingUsers.length > 0 && (
              <div className="pd-msg-group them">
                <div className="pd-avatar" style={{ background: "#34B7F1" }}>
                  {getInitials(typingUsers[0].email)}
                </div>
                <div className="pd-bubbles">
                  <div className="pd-sender-name">{typingUsers[0].name}</div>
                  <div className="pd-bubble pd-bubble--them pd-bubble--typing">
                    <span className="pd-typing-dots">
                      <span /><span /><span />
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Composer */}
          <div className="pd-composer">
            <button
              className="pd-composer-icon"
              title="Attach file"
              onClick={() => fileInputRef.current?.click()}
            >
              📎
            </button>
            <input
              ref={fileInputRef}
              type="file"
              style={{ display: "none" }}
              onChange={uploadFile}
            />

            <textarea
              className="pd-composer-input"
              value={text}
              onChange={handleTyping}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
            />

            <button
              className={`pd-composer-send ${text.trim() ? "active" : ""}`}
              onClick={sendMessage}
              disabled={!text.trim()}
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── FILES TAB ── */}
      {activeTab === "files" && (
        <div className="pd-files-wrap">
          <div className="pd-files-header">
            <span>Shared Documents ({files.length})</span>
            <label className="pd-upload-btn">
              {uploading ? "Uploading..." : "+ Upload File"}
              <input type="file" onChange={uploadFile} style={{ display: "none" }} />
            </label>
          </div>

          <div className="pd-files-grid">
            {files.length === 0 && (
              <div className="pd-empty">
                <div className="pd-empty-icon">📂</div>
                <div>No files shared yet</div>
              </div>
            )}
            {files.map((f, i) => (
              <a
                key={i}
                href={`http://localhost:5000/uploads/${f.name}`}
                target="_blank"
                rel="noreferrer"
                className="pd-file-card"
              >
                <div className="pd-file-icon">{getFileIcon(f.name)}</div>
                <div className="pd-file-info">
                  <div className="pd-file-name">{f.name}</div>
                  <div className="pd-file-meta">
                    {f.uploadedBy && <span>{f.uploadedBy}</span>}
                    {f.size && <span>{formatFileSize(f.size)}</span>}
                  </div>
                </div>
                <div className="pd-file-download">↓</div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ── MEMBERS TAB ── */}
      {activeTab === "members" && (
        <div className="pd-members-wrap">
          <div className="pd-members-header">Project Members ({members.length})</div>
          {members.length === 0 && (
            <div className="pd-empty">
              <div className="pd-empty-icon">👥</div>
              <div>No members online yet</div>
            </div>
          )}
          {members.map((m, i) => (
            <div key={i} className="pd-member-row">
              <div
                className="pd-member-avatar"
                style={{ background: getAvatarColor(m.email) }}
              >
                {getInitials(m.name || m.email)}
              </div>
              <div className="pd-member-info">
                <div className="pd-member-name">{m.name || m.email}</div>
                <div className="pd-member-email">{m.email}</div>
              </div>
              <div className="pd-member-status">
                <span className="pd-online-dot" /> Online
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}