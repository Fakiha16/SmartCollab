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
  const [activeTab, setActiveTab] = useState("files");

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    socket.emit("joinProject", {
      projectId,
      user: { email: user.email, name: user.name || user.email },
    });

    socket.on("previousMessages", setMessages);
    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("projectMembers", setMembers);
    socket.on("fileUploaded", (file) => {
      setFiles((prev) => [...prev, file]);
    });

    return () => {
      socket.off("previousMessages");
      socket.off("receiveMessage");
      socket.off("projectMembers");
      socket.off("fileUploaded");
    };
  }, [projectId]);

  useEffect(() => {
    fetch(`http://localhost:5000/api/upload/${projectId}`)
      .then((res) => res.json())
      .then(setFiles);
  }, [projectId]);

  const sendMessage = () => {
  if (!text.trim()) return;

  const msg = {
    text,
    sender: user.email,
    projectId,
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };

  // 🔥 ADD THIS (important)
  setMessages((prev) => [...prev, msg]);

  socket.emit("sendMessage", msg);

  setText("");
};

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
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

    const res = await fetch("http://localhost:5000/api/upload", {
      method: "POST",
      body: formData,
    });

    const newFile = await res.json();
    setFiles((prev) => [...prev, newFile]);

    socket.emit("broadcastFile", { projectId, file: newFile });
  };

  return (
    <div className="layout">

      {/* LEFT CHAT */}
      <div className="chat-section">

        <div className="chat-header">
          <button onClick={() => navigate("/manager/projects")}>←</button>
          <div>
            <div className="title">Project Chat</div>
            <div className="sub">{members.length} members online</div>
          </div>
        </div>

        <div className="chat-messages">
          {messages.map((msg, i) => {
            const isMe = msg.sender === user.email;
            return (
              <div key={i} className={`msg-row ${isMe ? "me" : ""}`}>
                <div className={`msg ${isMe ? "me" : ""}`}>
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
          <input type="file" ref={fileInputRef} hidden onChange={uploadFile} />

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
          />

          <button className="send" onClick={sendMessage}>➤</button>
        </div>

      </div>

      {/* RIGHT PANEL */}
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
            onClick={() => setActiveTab("members")}
          >
            Members
          </button>
        </div>

        <div className="panel-body">

          {activeTab === "files" && (
            files.length === 0 ? (
              <div className="empty">No files</div>
            ) : (
              files.map((f, i) => (
                <div key={i} className="file">
                  📄 {f.name}
                </div>
              ))
            )
          )}

          {activeTab === "members" && (
            members.map((m, i) => (
              <div key={i} className="member">
                <div className="avatar">{m.email[0]}</div>
                <div>
                  <div>{m.email}</div>
                </div>
              </div>
            ))
          )}

        </div>
      </div>

    </div>
  );
}