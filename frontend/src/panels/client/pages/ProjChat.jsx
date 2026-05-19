import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./ProjChat.css";

const API = "http://localhost:5000/api";

export default function ProjChat() {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const activeProjectId = projectId || localStorage.getItem("projectId");

  const [project, setProject] = useState(null);
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fileInputRef = useRef(null);
  const chatBodyRef = useRef(null);

  const fetchMessages = useCallback(async () => {
    if (!activeProjectId) {
      setMessages([]);
      return;
    }

    try {
      const res = await axios.get(
        `${API}/messages?projectId=${String(activeProjectId)}`
      );

      const freshMessages = Array.isArray(res.data) ? res.data : [];
      setMessages(freshMessages);
    } catch (err) {
      console.error("Messages fetch error:", err);
      setMessages([]);
    }
  }, [activeProjectId]);

  useEffect(() => {
    if (activeProjectId) {
      localStorage.setItem("projectId", activeProjectId);
    }
  }, [activeProjectId]);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        if (!activeProjectId) return;

        const res = await axios.get(`${API}/projects/${activeProjectId}`);
        setProject(res.data);
      } catch (err) {
        console.error("Project fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [activeProjectId]);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!activeProjectId) {
      setFiles([]);
      return;
    }

    const fetchFiles = async () => {
      try {
        const res = await axios.get(`${API}/upload/${activeProjectId}`);

        const sorted = Array.isArray(res.data)
          ? res.data.sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            )
          : [];

        setFiles(sorted);
      } catch (err) {
        console.error("Files fetch error:", err);
        setFiles([]);
      }
    };

    fetchFiles();
  }, [activeProjectId]);

  useEffect(() => {
    fetchMessages();

    const interval = setInterval(fetchMessages, 3000);

    return () => clearInterval(interval);
  }, [fetchMessages]);

  const sendMessage = async () => {
    const cleanMessage = message.trim();

    if (!cleanMessage) return;

    if (!activeProjectId) {
      alert("Project not found.");
      return;
    }

    const now = new Date();
    const time = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    try {
      const res = await axios.post(`${API}/messages`, {
        text: cleanMessage,
        sender: user?.email || "client",
        senderName: user?.name || user?.email || "Client",
        senderRole: "client",
        receiverRole: "manager",
        type: "client-manager",
        time,
        projectId: String(activeProjectId),
      });

      setMessages((prev) => {
        const exists = prev.some((msg) => msg._id === res.data._id);
        return exists ? prev : [...prev, res.data];
      });

      setMessage("");
      setTimeout(fetchMessages, 300);
    } catch (err) {
      console.error("Send message error:", err);

      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.response?.data?.details ||
        "Message send failed. Please check backend terminal.";

      alert(`❌ ${msg}`);
    }
  };

  const handleMessageKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const deleteMessage = async (id) => {
    try {
      await axios.delete(`${API}/messages/${id}`);
      setMessages((prev) => prev.filter((m) => m._id !== id));
      setTimeout(fetchMessages, 300);
    } catch (err) {
      console.error("Delete message error:", err);
      alert("❌ Message delete failed");
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!activeProjectId) {
      alert("Project not found.");
      return;
    }

    e.target.value = "";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("user", user?.email || "client");
    formData.append("projectId", String(activeProjectId));

    try {
      const res = await axios.post(`${API}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setFiles((prev) => [res.data, ...prev]);
    } catch (err) {
      console.error("Upload error:", err);
      alert("❌ File upload failed");
    }
  };

  const handleDeleteFile = async (file) => {
    if (file.uploadedBy && file.uploadedBy !== user?.email) {
      alert("You can only delete your own uploaded file.");
      return;
    }

    if (!window.confirm(`Do you want to delete "${file.name || file.filename}"?`)) {
      return;
    }

    try {
      await axios.delete(`${API}/upload/${file._id}`);
      setFiles((prev) => prev.filter((f) => f._id !== file._id));
    } catch (err) {
      console.error("Delete file error:", err);
      alert("❌ Delete failed");
    }
  };

  if (loading) {
    return (
      <div className="cpDash">
        <div className="cpEmpty">Loading project...</div>
      </div>
    );
  }

  return (
    <div className="cpDash">
      <div className="cpInviteWrap pcTopLeft">
        <button
          className="cpInviteBtn"
          type="button"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        <div className="cpProjectSelectBox">
          <span className="cpProjectSelectIcon">📌</span>

          <div className="cpTopProjectSelect cpProjectTitleText">
            {project?.title || project?.name || "Project Discussion"}
          </div>
        </div>
      </div>

      <div className="cpDashWrap">
        <section className="cpCard">
          <div className="cpCardTitle">
            <span>💬 Project Messages</span>
          </div>

          <div className="cpChatBody" ref={chatBodyRef}>
            {messages.length === 0 && (
              <div className="cpEmpty">
                No messages yet. Start the conversation!
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`cpChatBubble ${
                  msg.sender === user?.email ? "cpMe" : "cpOther"
                }`}
              >
                {msg.sender !== user?.email && (
                  <div className="cpSenderName">
                    {msg.senderName || msg.sender || "User"}
                  </div>
                )}

                <div className="cpBubbleText">{msg.text}</div>

                <div className="cpChatMeta">
                  <span className="cpChatTime">{msg.time}</span>

                  {msg.sender === user?.email && (
                    <button
                      className="cpDeleteMsgBtn"
                      onClick={() => deleteMessage(msg._id)}
                      title="Delete message"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="cpChatInput">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleMessageKeyDown}
              placeholder="Type a message... (Enter to send)"
              disabled={!activeProjectId}
            />

            <button
              onClick={sendMessage}
              disabled={!message.trim() || !activeProjectId}
            >
              ➤
            </button>
          </div>
        </section>

        <section className="cpCard">
          <div className="cpCardTitle">
            <span>📁 Shared Documents</span>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleUpload}
          />

          <div className="cpDocContainer">
            <div
              className="cpUploadBox"
              onClick={() => fileInputRef.current?.click()}
              title="Click to upload file"
            >
              <span className="cpUploadIcon">+</span>
              <span className="cpUploadLabel">Upload File</span>
            </div>

            <div className="cpDocBody">
              {files.length === 0 ? (
                <div className="cpEmpty">No files uploaded yet.</div>
              ) : (
                files.map((f, i) => {
                  const fileName = f.name || f.filename || "file";
                  const ext = fileName.split(".").pop().toUpperCase();

                  return (
                    <div key={f._id || i} className="cpFileCard">
                      <div className="cpFileIcon">
                        <span className="cpFileExt">{ext}</span>
                      </div>

                      <div className="cpFileMiddle">
                        <div className="cpFileName" title={fileName}>
                          {fileName}
                        </div>

                        {f.uploadedBy && (
                          <div className="cpFileUploader">{f.uploadedBy}</div>
                        )}
                      </div>

                      <div className="cpFileActions">
                        <a
                          href={`http://localhost:5000/uploads/${fileName}`}
                          download={fileName}
                          className="cpFileBtn cpDownload"
                          title="Download"
                        >
                          ⬇
                        </a>

                        <button
                          className="cpFileBtn cpDelete"
                          onClick={() => handleDeleteFile(f)}
                          title="Delete"
                        >
                          ✖
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}