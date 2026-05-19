import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./ClientPanel.css";

const API = "http://localhost:5000/api";

export default function ClientPanel() {
  const user = JSON.parse(localStorage.getItem("user"));
  const projectId = localStorage.getItem("projectId");

  // ─── State ───────────────────────────────────────────────
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const [showInvite, setShowInvite] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);

  const [updateTitle, setUpdateTitle] = useState("");
  const [updateDate, setUpdateDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [updateDescription, setUpdateDescription] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);

  const fileInputRef = useRef(null);
  const chatBodyRef = useRef(null);

  // ─── Derived ─────────────────────────────────────────────
  const managerName = user?.name || user?.email || "Manager";

  // ─── Auto-scroll chat ────────────────────────────────────
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  // ─── Fetch Files ─────────────────────────────────────────
  useEffect(() => {
    if (!projectId) return;
    const fetchFiles = async () => {
      try {
        const res = await axios.get(`${API}/upload/${projectId}`);
        const sorted = res.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setFiles(sorted);
      } catch (err) {
        console.error("Files fetch error:", err);
      }
    };
    fetchFiles();
  }, [projectId]);

  // ─── Fetch Messages ──────────────────────────────────────
  useEffect(() => {
    if (!projectId) return;
    const fetchMessages = async () => {
      try {
        // Filter by projectId if your backend supports it; fallback to all
        const res = await axios.get(`${API}/messages?projectId=${projectId}`);
        setMessages(res.data);
      } catch (err) {
        console.error("Messages fetch error:", err);
      }
    };
    fetchMessages();
  }, [projectId]);

  // ─── Send Message ────────────────────────────────────────
  const sendMessage = async () => {
    if (!message.trim()) return;

    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    try {
      const res = await axios.post(`${API}/messages`, {
        text: message.trim(),
        sender: user?.email,
        senderName: user?.name || user?.email,
        time,
        projectId,
      });
      setMessages((prev) => [...prev, res.data]);
      setMessage("");
    } catch (err) {
      console.error("Send message error:", err);
      alert("❌ Message send failed");
    }
  };

  const handleMessageKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ─── Delete Single Message ───────────────────────────────
  const deleteMessage = async (id) => {
    try {
      await axios.delete(`${API}/messages/${id}`);
      setMessages((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      console.error("Delete message error:", err);
    }
  };

  // ─── Clear All Chat ──────────────────────────────────────
  const clearChat = async () => {
    if (!window.confirm("Sab messages delete karna chahte hain?")) return;
    try {
      await axios.delete(`${API}/messages?projectId=${projectId}`);
      setMessages([]);
    } catch (err) {
      console.error("Clear chat error:", err);
      alert("❌ Chat clear failed");
    }
  };

  // ─── Send Invitation ─────────────────────────────────────
  const sendInvite = async () => {
    if (!inviteEmail.trim()) {
      alert("Please enter an email address.");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail.trim())) {
      alert("Please enter a valid email address.");
      return;
    }

    setInviteLoading(true);
    try {
      await axios.post(`${API}/invite`, {
        email: inviteEmail.trim(),
        projectId,
        invitedBy: user?.email,
        inviterName: managerName,
      });
      alert(`✅ Invitation sent to ${inviteEmail}!`);
      setInviteEmail("");
      setShowInvite(false);
    } catch (err) {
      console.error("Invite error:", err);
      const msg = err.response?.data?.message || "Email send failed";
      alert(`❌ ${msg}`);
    } finally {
      setInviteLoading(false);
    }
  };

  // ─── Update Status ───────────────────────────────────────
  const handleUpdateStatus = async () => {
    if (!updateTitle.trim()) {
      alert("Please enter a title.");
      return;
    }
    if (!updateDescription.trim()) {
      alert("Please provide a description.");
      return;
    }

    setUpdateLoading(true);
    try {
      await axios.post(`${API}/update-status`, {
        title: updateTitle.trim(),
        manager: managerName,
        date: updateDate,
        description: updateDescription.trim(),
        projectId,
      });
      alert("✅ Status updated successfully!");
      // Reset form
      setUpdateTitle("");
      setUpdateDescription("");
      setUpdateDate(new Date().toISOString().split("T")[0]);
      setShowUpdate(false);
    } catch (err) {
      console.error("Update status error:", err);
      const msg = err.response?.data?.message || "Update failed";
      alert(`❌ ${msg}`);
    } finally {
      setUpdateLoading(false);
    }
  };

  // ─── File Upload ─────────────────────────────────────────
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset so same file can be re-uploaded if needed
    e.target.value = "";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("user", user?.email);
    formData.append("projectId", projectId);

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

  // ─── File Delete ─────────────────────────────────────────
  const handleDeleteFile = async (file) => {
    // Only uploader can delete
    if (file.uploadedBy && file.uploadedBy !== user?.email) {
      alert("Sirf apna uploaded file delete kar sakte hain.");
      return;
    }
    if (!window.confirm(`"${file.name || file.filename}" delete karna chahte hain?`)) return;

    try {
      await axios.delete(`${API}/upload/${file._id}`);
      setFiles((prev) => prev.filter((f) => f._id !== file._id));
    } catch (err) {
      console.error("Delete file error:", err);
      alert("❌ Delete failed");
    }
  };

  // ─── Render ──────────────────────────────────────────────
  return (
    <div className="cpDash">

      {/* TOP ACTION BUTTONS */}
      <div className="cpInviteWrap">
        <button className="cpInviteBtn" onClick={() => setShowInvite(true)}>
          ✉ Send Invitation
        </button>
        <button className="cpUpdateBtn" onClick={() => setShowUpdate(true)}>
          📋 Update Status
        </button>
      </div>

      <div className="cpDashWrap">

        {/* ── CHAT SECTION ── */}
        <section className="cpCard">
          <div className="cpCardTitle">
            <span>💬 Client Messages</span>
            <button onClick={clearChat} className="cpClearBtn">Clear All</button>
          </div>

          <div className="cpChatBody" ref={chatBodyRef}>
            {messages.length === 0 && (
              <div className="cpEmpty">No messages yet. Start the conversation!</div>
            )}
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`cpChatBubble ${msg.sender === user?.email ? "cpMe" : "cpOther"}`}
              >
                {msg.sender !== user?.email && (
                  <div className="cpSenderName">{msg.senderName || msg.sender}</div>
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
            />
            <button onClick={sendMessage} disabled={!message.trim()}>➤</button>
          </div>
        </section>

        {/* ── FILES SECTION ── */}
        <section className="cpCard">
          <div className="cpCardTitle">
            <span>📁 Shared Documents</span>
          </div>

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleUpload}
          />

          <div className="cpDocContainer">
            {/* Upload trigger */}
            <div
              className="cpUploadBox"
              onClick={() => fileInputRef.current?.click()}
              title="Click to upload file"
            >
              <span className="cpUploadIcon">+</span>
              <span className="cpUploadLabel">Upload File</span>
            </div>

            {/* File list */}
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
                        <div className="cpFileName" title={fileName}>{fileName}</div>
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

      {/* ── INVITE MODAL ── */}
      {showInvite && (
        <div className="cpModalOverlay" onClick={() => setShowInvite(false)}>
          <div className="cpModal" onClick={(e) => e.stopPropagation()}>
            <div className="cpModalHeader">
              <h3>✉ Send Invitation</h3>
              <button className="cpModalClose" onClick={() => setShowInvite(false)}>✕</button>
            </div>
            <p className="cpModalSubtitle">
              Client ko project access ke liye invite karein.
            </p>
            <label className="cpLabel">Email Address *</label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="client@example.com"
              onKeyDown={(e) => e.key === "Enter" && sendInvite()}
              autoFocus
            />
            <div className="cpModalActions">
              <button
                className="cpBtnPrimary"
                onClick={sendInvite}
                disabled={inviteLoading || !inviteEmail.trim()}
              >
                {inviteLoading ? "Sending..." : "Send Invite"}
              </button>
              <button className="cpBtnSecondary" onClick={() => setShowInvite(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── UPDATE STATUS MODAL ── */}
      {showUpdate && (
        <div className="cpModalOverlay" onClick={() => setShowUpdate(false)}>
          <div className="cpModal cpModalLarge" onClick={(e) => e.stopPropagation()}>
            <div className="cpModalHeader">
              <h3>📋 Update Project Status</h3>
              <button className="cpModalClose" onClick={() => setShowUpdate(false)}>✕</button>
            </div>
            <p className="cpModalSubtitle">
              Client ko project ki latest update bhejein.
            </p>

            <label className="cpLabel">Update Title *</label>
            <input
              type="text"
              placeholder="e.g. Phase 1 Complete"
              value={updateTitle}
              onChange={(e) => setUpdateTitle(e.target.value)}
              autoFocus
            />

            <label className="cpLabel">Manager</label>
            <input
              type="text"
              value={managerName}
              disabled
              className="cpInputDisabled"
            />

            <label className="cpLabel">Date *</label>
            <input
              type="date"
              value={updateDate}
              onChange={(e) => setUpdateDate(e.target.value)}
            />

            <label className="cpLabel">Description *</label>
            <textarea
              placeholder="Update ki details likhein... (kya complete hua, next steps kya hain)"
              value={updateDescription}
              onChange={(e) => setUpdateDescription(e.target.value)}
              rows={5}
            />

            <div className="cpModalActions">
              <button
                className="cpBtnPrimary"
                onClick={handleUpdateStatus}
                disabled={updateLoading || !updateTitle.trim() || !updateDescription.trim()}
              >
                {updateLoading ? "Updating..." : "Send Update"}
              </button>
              <button className="cpBtnSecondary" onClick={() => setShowUpdate(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}