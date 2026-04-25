import React, { useEffect, useState } from "react";
import "./Dashboard.css";
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

  // ================= CHAT =================
  useEffect(() => {

    socket.emit("joinProject", projectId);

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("receiveMessage");
    };

  }, [projectId]);

  const sendMessage = () => {
    if (!text) return;

    const msg = {
      text,
      sender: user.email,
      projectId,
      time: new Date().toLocaleTimeString()
    };

    socket.emit("sendMessage", msg);
    setText("");
  };

  // ================= FILES =================
  useEffect(() => {
    fetch(`http://localhost:5000/api/upload/${projectId}`)
      .then(res => res.json())
      .then(data => setFiles(data));
  }, [projectId]);

  const uploadFile = async (e) => {
    const file = e.target.files[0];

    const formData = new FormData();
    formData.append("file", file);
    formData.append("email", user.email);
    formData.append("projectId", projectId);

    const res = await fetch("http://localhost:5000/api/upload", {
      method: "POST",
      body: formData
    });

    const newFile = await res.json();
    setFiles((prev) => [...prev, newFile]);
  };

  return (
    <div className="empDash">

      {/* 🔥 PROFESSIONAL HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 20px",
          borderBottom: "1px solid #eee",
          background: "#fff"
        }}
      >
        <button
          onClick={() => navigate("/manager/projects")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "none",
            border: "none",
            fontSize: "15px",
            cursor: "pointer",
            color: "#333",
            fontWeight: "500"
          }}
        >
          ← <span>Back to Projects</span>
        </button>

        <div style={{ fontWeight: "600", fontSize: "16px" }}>
          Project Workspace
        </div>
      </div>

      <div className="empDash__wrap">

        {/* CHAT */}
        <section className="empCard">
          <div className="empCard__title">Project Chat</div>

          <div className="chatMessages">

            {messages.map((m, i) => (
              <div
                key={i}
                className={`msgRow ${m.sender === user.email ? "msgRow--right" : "msgRow--left"}`}
              >
                <div className={`bubble ${m.sender === user.email ? "bubble--black" : "bubble--green"}`}>
                  {m.text}
                </div>
                <div className="time">{m.time}</div>
              </div>
            ))}

          </div>

          <div className="chatComposer">
            <input
              className="chatComposer__input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message"
            />

            <button className="chatComposer__sendBtn" onClick={sendMessage}>
              ➤
            </button>
          </div>

        </section>

        {/* DOCUMENTS */}
        <section className="empCard">
          <div className="empCard__title">Shared Documents</div>

          <input type="file" onChange={uploadFile} />

          <div className="docBody">
            {files.map((f, i) => (
              <div key={i}>
                <a
                  href={`http://localhost:5000/uploads/${f.name}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {f.name}
                </a>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}