import React, { useEffect, useState } from "react";
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
  const file = e.target.files[0]; // Get the first file selected

  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("email", user.email); // Pass the user's email
  formData.append("projectId", projectId); // Pass the project ID

  try {
    const res = await fetch("http://localhost:5000/api/upload", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const newFile = await res.json();
      // Add the new file to the state to update the file list
      setFiles((prev) => [...prev, newFile]);
    } else {
      alert("Error uploading file");
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    alert("File upload failed. Please try again.");
  }
};

  return (
    <div className="empDash">

      {/* 🔥 PROFESSIONAL HEADER */}
      <div className="header">
        <button
          onClick={() => navigate("/manager/projects")}
          className="backButton"
        >
          ← <span>Back to Projects</span>
        </button>

        <div className="projectTitle">
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

          <input type="file" onChange={uploadFile} className="fileInput" />

          <div className="docBody">
            {files.map((f, i) => (
              <div key={i}>
                <a
                  href={`http://localhost:5000/uploads/${f.name}`}
                  target="_blank"
                  rel="noreferrer"
                  className="docLink"
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