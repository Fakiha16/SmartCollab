import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

export default function Dashboard() {

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));
  const projectId = localStorage.getItem("projectId");

  // ================= CHAT =================
  useEffect(() => {

    socket.emit("joinProject", projectId);

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

  }, []);

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
  }, []);

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
      <div className="empDash__wrap">

        {/* LEFT: CHAT */}
        <section className="empCard">
          <div className="empCard__title">Messages</div>

          <div className="chatCard__body">

            <div className="chatMessages">

              {messages.map((m, i) => (
                <div key={i} className={`msgRow ${m.sender === user.email ? "msgRow--right" : "msgRow--left"}`}>
                  
                  {m.sender !== user.email && (
                    <div className="avatarRound">
                      <img
                        src="https://i.pravatar.cc/40"
                        className="avatarImg"
                        draggable={false}
                      />
                    </div>
                  )}

                  <div>
                    <div className={`bubble ${m.sender === user.email ? "bubble--black" : "bubble--green"}`}>
                      {m.text}
                    </div>
                    <div className={`time ${m.sender === user.email ? "time--right" : ""}`}>
                      {m.time}
                    </div>
                  </div>

                  {m.sender === user.email && (
                    <div className="avatarRound avatarRound--right">
                      <img
                        src="https://i.pravatar.cc/40"
                        className="avatarImg"
                        draggable={false}
                      />
                    </div>
                  )}

                </div>
              ))}

            </div>

            {/* composer */}
            <div className="chatComposer">
              <button className="chatComposer__iconBtn">📎</button>

              <input
                className="chatComposer__input"
                placeholder="Type a message"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />

              <button className="chatComposer__iconBtn">🙂</button>

              <button className="chatComposer__sendBtn" onClick={sendMessage}>
                ➤
              </button>
            </div>

          </div>
        </section>

        {/* RIGHT: DOCUMENT */}
        <section className="empCard">
          <div className="empCard__title">Shared Document</div>

          <div className="docUpload">
            <input type="file" onChange={uploadFile} />
          </div>

          <div className="docBody">
            {files.map((f, i) => (
              <div key={i}>
                <a href={`http://localhost:5000/uploads/${f.name}`} target="_blank">
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