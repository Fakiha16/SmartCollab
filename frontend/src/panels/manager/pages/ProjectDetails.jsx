import React, { useEffect, useState, useRef } from "react";
import "./ProjectDetails.css";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";

const socket = io("http://localhost:5000");

export default function ProjectDetails() {
  const navigate = useNavigate();
  const projectId = window.location.pathname.split("/").pop();
  const teamChatRoomId = `team-${projectId}`;

  const user = JSON.parse(localStorage.getItem("user")) || {};

  const [project, setProject] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const [onlineMembers, setOnlineMembers] = useState([]);
  const [activeTab, setActiveTab] = useState("files");

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    fetch(`http://localhost:5000/api/projects/${projectId}`)
      .then((res) => res.json())
      .then((data) => {
        setProject(data);
      })
      .catch((err) => {
        console.error("Fetch project details failed:", err);
      });
  }, [projectId]);

  useEffect(() => {
    if (!projectId || !user?.email) return;

    socket.emit("joinProject", {
      projectId: teamChatRoomId,
      realProjectId: projectId,
      chatType: "team",
      user: {
        email: user.email,
        name: user.name || user.email,
        role: user.role || "manager",
      },
    });

    socket.on("previousMessages", (oldMessages) => {
      const teamMessages = Array.isArray(oldMessages)
        ? oldMessages.filter((msg) => {
            return (
              msg.chatType === "team" ||
              msg.projectId === teamChatRoomId ||
              String(msg.projectId).startsWith("team-")
            );
          })
        : [];

      setMessages(teamMessages);
    });

    socket.on("receiveMessage", (msg) => {
      if (
        msg.chatType !== "team" &&
        msg.projectId !== teamChatRoomId &&
        !String(msg.projectId || "").startsWith("team-")
      ) {
        return;
      }

      setMessages((prev) => {
        const alreadyExists = prev.some(
          (m) =>
            (m._id && msg._id && m._id === msg._id) ||
            (m.text === msg.text &&
              m.sender === msg.sender &&
              m.time === msg.time &&
              m.projectId === msg.projectId)
        );

        if (alreadyExists) return prev;
        return [...prev, msg];
      });
    });

    socket.on("projectMembers", setOnlineMembers);

    socket.on("fileUploaded", (file) => {
      setFiles((prev) => [...prev, file]);
    });

    return () => {
      socket.off("previousMessages");
      socket.off("receiveMessage");
      socket.off("projectMembers");
      socket.off("fileUploaded");
    };
  }, [projectId, teamChatRoomId, user.email, user.name, user.role]);

  useEffect(() => {
    fetch(`http://localhost:5000/api/upload/${projectId}`)
      .then((res) => res.json())
      .then((data) => {
        setFiles(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("Fetch files failed:", err));
  }, [projectId]);

  const refreshProjectDetails = () => {
    fetch(`http://localhost:5000/api/projects/${projectId}`)
      .then((res) => res.json())
      .then((data) => {
        setProject(data);
      })
      .catch((err) => {
        console.error("Refresh project details failed:", err);
      });
  };

  const sendMessage = () => {
    const cleanText = text.trim();

    if (!cleanText) return;

    const msg = {
      text: cleanText,
      sender: user.email,
      senderName: user.name || user.email,
      senderRole: user.role || "manager",
      receiverRole: "employee",
      projectId: teamChatRoomId,
      realProjectId: projectId,
      chatType: "team",
      type: "manager-employee",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, msg]);
    socket.emit("sendMessage", msg);
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const uploadFile = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("projectId", projectId);
    formData.append("user", user?.email || "manager");

    try {
      const res = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
      });

      const newFile = await res.json();

      setFiles((prev) => [...prev, newFile]);
      socket.emit("broadcastFile", { projectId, file: newFile });
    } catch (err) {
      console.error("File upload failed:", err);
    }
  };

  const handleDeleteFile = async (fileName) => {
    try {
      if (!window.confirm("Delete this file?")) return;

      await fetch(`http://localhost:5000/api/upload/${fileName}`, {
        method: "DELETE",
      });

      setFiles((prev) => prev.filter((f) => f.name !== fileName));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const joinedMembers = project?.joinedMembers || [];
  const pendingInvites = project?.pendingInvites || [];

  return (
    <div className="layout">
      <div className="chat-section">
        <div className="chat-header">
          <button onClick={() => navigate("/manager/projects")}>←</button>

          <div>
            <div className="title">{project?.title || "Project Chat"}</div>
            <div className="sub">{onlineMembers.length} members online</div>
          </div>
        </div>

        <div className="chat-messages">
          {messages.map((msg, i) => {
            const isMe = msg.sender === user.email;

            return (
              <div key={msg._id || i} className={`msg-row ${isMe ? "me" : ""}`}>
                <div className={`msg ${isMe ? "me" : ""}`}>
                  {msg.sender !== user.email && (
                    <strong className="sender-name">
                      {msg.senderName || msg.sender}
                    </strong>
                  )}

                  {msg.text}

                  <span className="time">{msg.time}</span>
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef}></div>
        </div>

        <div className="chat-input">
          <button onClick={() => fileInputRef.current.click()}>📎</button>

          <input
            type="file"
            ref={fileInputRef}
            hidden
            onChange={uploadFile}
          />

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a team message..."
          />

          <button className="send" onClick={sendMessage}>
            ➤
          </button>
        </div>
      </div>

      <div className="right-section">
        <div className="tabs">
          <button
            className={activeTab === "files" ? "active" : ""}
            onClick={() => setActiveTab("files")}
          >
            Files
          </button>

          <button
            className={activeTab === "members" ? "active" : ""}
            onClick={() => {
              setActiveTab("members");
              refreshProjectDetails();
            }}
          >
            Members
          </button>
        </div>

        <div className="panel-body">
          {activeTab === "files" && (
            <>
              {files.length === 0 ? (
                <div className="empty">No files</div>
              ) : (
                files.map((f, i) => {
                  const fileName = f.name || f.filename || "file";

                  return (
                    <div key={f._id || i} className="file-card">
                      <div className="file-left">
                        <span className="file-icon">📄</span>
                        <span className="file-name">{fileName}</span>
                      </div>

                      <div className="file-actions">
                        <a
                          href={`http://localhost:5000/uploads/${fileName}`}
                          download
                          className="icon-btn"
                          title="Download"
                        >
                          ⬇
                        </a>

                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteFile(fileName)}
                          title="Delete"
                        >
                          ✖
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}

          {activeTab === "members" && (
            <div className="team-section">
              <div className="team-block">
                <h3>Team Members</h3>

                {joinedMembers.length > 0 ? (
                  joinedMembers.map((member, index) => (
                    <div key={index} className="team-member-card">
                      <div className="member-left">
                        <div className="avatar">
                          {(member.name || member.email || "T")[0].toUpperCase()}
                        </div>

                        <div>
                          <strong>{member.name || "Team Member"}</strong>
                          <p>{member.email}</p>

                          {member.empType && <small>{member.empType}</small>}
                        </div>
                      </div>

                      <span className="joined-badge">Joined</span>
                    </div>
                  ))
                ) : (
                  <div className="empty">No team members joined yet.</div>
                )}
              </div>

              <div className="team-block">
                <h3>Pending Invitations</h3>

                {pendingInvites.length > 0 ? (
                  pendingInvites.map((invite, index) => (
                    <div key={index} className="team-member-card">
                      <div className="member-left">
                        <div className="avatar">
                          {(invite.email || "P")[0].toUpperCase()}
                        </div>

                        <div>
                          <strong>{invite.email}</strong>
                          <p>Invitation sent</p>
                        </div>
                      </div>

                      <span className="pending-badge">Pending</span>
                    </div>
                  ))
                ) : (
                  <div className="empty">No pending invitations.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}