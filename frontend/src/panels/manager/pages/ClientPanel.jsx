import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./ClientPanel.css";

export default function ClientPanel() {

  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const fileInputRef = useRef();
  const user = JSON.parse(localStorage.getItem("user"));

  // ================= FILES =================
  useEffect(() => {
    const fetchFiles = async () => {
      const res = await axios.get("http://localhost:5000/api/upload");
      setFiles(res.data);
    };
    fetchFiles();
  }, []);

  // ================= MESSAGES =================
  useEffect(() => {
    const fetchMessages = async () => {
      const res = await axios.get("http://localhost:5000/api/messages");
      setMessages(res.data);
    };
    fetchMessages();
  }, []);

  // SEND MESSAGE (DB)
  const sendMessage = async () => {
    if (!message.trim()) return;

    const now = new Date();
    const time = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const newMsg = {
      text: message,
      sender: user?.email || "me",
      time,
    };

    const res = await axios.post(
      "http://localhost:5000/api/messages",
      newMsg
    );

    setMessages([...messages, res.data]);
    setMessage("");
  };

  // DELETE SINGLE MESSAGE
  const deleteMessage = async (id) => {
    await axios.delete(`http://localhost:5000/api/messages/${id}`);
    setMessages(messages.filter((m) => m._id !== id));
  };

  // CLEAR ALL CHAT
  const clearChat = async () => {
    await axios.delete("http://localhost:5000/api/messages");
    setMessages([]);
  };

  // ================= FILE UPLOAD =================
  const handleUpload = async (e) => {
    const file = e.target.files[0];

    const formData = new FormData();
    formData.append("file", file);
    formData.append("user", user?.email);

    const res = await axios.post(
      "http://localhost:5000/api/upload",
      formData
    );

    setFiles([res.data, ...files]);
  };

  // DELETE FILE (UNCHANGED)
  const deleteFile = async (id, uploadedBy) => {
    if (uploadedBy !== user?.email) {
      alert("You can only delete your own file");
      return;
    }

    await axios.delete(`http://localhost:5000/api/upload/${id}`);
    setFiles(files.filter(f => f._id !== id));
  };

  return (
    <div className="empDash">
      <div className="empDash__wrap">

        {/* ================= CHAT ================= */}
        <section className="empCard">
          <div className="empCard__title">
            Client Messages

            <button onClick={clearChat}>
              Clear All
            </button>
          </div>

          <div className="chatBody">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`chatBubble ${
                  msg.sender === user?.email ? "me" : "other"
                }`}
              >
                <div>{msg.text}</div>
                <div className="chatTime">{msg.time}</div>

                {/* delete message */}
                <span onClick={() => deleteMessage(msg._id)}>
                  ❌
                </span>
              </div>
            ))}
          </div>

          <div className="chatInput">
            <input
              type="text"
              placeholder="Type a message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={sendMessage}>➤</button>
          </div>
        </section>

        {/* ================= FILES (AS IT IS - FRIEND CODE) ================= */}
        <section className="empCard">
          <div className="empCard__title">Shared Document</div>

          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleUpload}
          />

          <div className="docContainer">

            {/* Upload Box */}
            <div
              className="uploadBox"
              onClick={() => fileInputRef.current.click()}
            >
              +
            </div>

            {/* File List */}
            <div className="docBody">

              {files.map((f) => (
                <div className="fileCard" key={f._id}>

                  <div className="fileLeft">📄</div>

                  <div className="fileMiddle">
                    <div className="fileName">
                      {f.url.split("/").pop()}
                    </div>
                    <div className="fileMeta">File</div>
                  </div>

                  <div className="fileActions">

                    {/* open */}
                    <button
                      className="fileBtn"
                      onClick={() => window.open(f.url, "_blank")}
                    >
                      ⬇
                    </button>

                    {/* delete */}
                    {f.uploadedBy === user?.email && (
                      <button
                        className="fileBtn delete"
                        onClick={() => deleteFile(f._id, f.uploadedBy)}
                      >
                        ×
                      </button>
                    )}

                  </div>

                </div>
              ))}

            </div>

          </div>
        </section>

      </div>
    </div>
  );
}