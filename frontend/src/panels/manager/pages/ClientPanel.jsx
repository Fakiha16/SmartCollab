import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import "./ClientPanel.css";

const API = "http://localhost:5000/api";

export default function ClientPanel() {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const storedProjectId = localStorage.getItem("projectId");

  const getProjectIdFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const queryProjectId = params.get("projectId");

    if (queryProjectId) return queryProjectId;

    const pathParts = window.location.pathname.split("/").filter(Boolean);
    const lastPart = pathParts[pathParts.length - 1];

    if (/^[a-f\d]{24}$/i.test(lastPart)) return lastPart;

    return "";
  };

  const defaultProjectId =
    storedProjectId ||
    user?.projectId ||
    user?.projectIds?.[0] ||
    getProjectIdFromUrl();

  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [unreadProjectIds, setUnreadProjectIds] = useState([]);

  const [showInvite, setShowInvite] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(
    defaultProjectId || ""
  );
  const [inviteProjectId, setInviteProjectId] = useState(defaultProjectId || "");

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);

  const [updateDate, setUpdateDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [frontendProgress, setFrontendProgress] = useState("");
  const [backendProgress, setBackendProgress] = useState("");
  const [workDone, setWorkDone] = useState("");
  const [currentErrors, setCurrentErrors] = useState("");
  const [nextWork, setNextWork] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);

  const fileInputRef = useRef(null);
  const chatBodyRef = useRef(null);

  const managerName = user?.name || user?.email || "Manager";

  const getUnreadStorageKey = () => {
    return `managerReadMessages_${user?.email || "manager"}`;
  };

  const getReadMap = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(getUnreadStorageKey())) || {};
      return saved && typeof saved === "object" ? saved : {};
    } catch {
      return {};
    }
  };

  const saveReadMap = (nextMap) => {
    localStorage.setItem(getUnreadStorageKey(), JSON.stringify(nextMap));
  };

  const markProjectMessagesAsRead = useCallback(
    (projectId, projectMessages = []) => {
      if (!projectId) return;

      const clientMessages = projectMessages.filter(
        (msg) =>
          msg.sender !== user?.email &&
          (msg.senderRole === "client" ||
            msg.receiverRole === "manager" ||
            msg.type === "client-manager")
      );

      const latestClientMessage = clientMessages[clientMessages.length - 1];

      if (!latestClientMessage?._id) return;

      const readMap = getReadMap();
      readMap[projectId] = latestClientMessage._id;
      saveReadMap(readMap);

      setUnreadProjectIds((prev) =>
        prev.filter((id) => String(id) !== String(projectId))
      );
    },
    [user?.email]
  );

  const fetchMessages = useCallback(async () => {
    if (!selectedProjectId) {
      setMessages([]);
      return;
    }

    try {
      const res = await axios.get(
        `${API}/messages?projectId=${String(selectedProjectId)}`
      );

      const projectMessages = Array.isArray(res.data) ? res.data : [];

      setMessages(projectMessages);
      markProjectMessagesAsRead(selectedProjectId, projectMessages);
    } catch (err) {
      console.error("Messages fetch error:", err);
      setMessages([]);
    }
  }, [selectedProjectId, markProjectMessagesAsRead]);

  useEffect(() => {
    const fetchManagerProjects = async () => {
      try {
        if (!user?.email) return;

        const res = await axios.get(`${API}/projects/manager/${user.email}`);

        if (Array.isArray(res.data)) {
          setProjects(res.data);

          if (!selectedProjectId && res.data.length > 0) {
            const firstProjectId = res.data[0]._id || res.data[0].id;
            setSelectedProjectId(firstProjectId);
            setInviteProjectId(firstProjectId);
            localStorage.setItem("projectId", firstProjectId);
          }
        }
      } catch (err) {
        console.error("Fetch manager projects error:", err);
      }
    };

    fetchManagerProjects();
  }, [user?.email, selectedProjectId]);

  useEffect(() => {
    if (selectedProjectId) {
      localStorage.setItem("projectId", selectedProjectId);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!selectedProjectId) {
      setFiles([]);
      return;
    }

    const fetchFiles = async () => {
      try {
        const res = await axios.get(`${API}/upload/${selectedProjectId}`);

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
  }, [selectedProjectId]);

  useEffect(() => {
    fetchMessages();

    const interval = setInterval(fetchMessages, 3000);

    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    if (!projects.length || !user?.email) return;

    const checkUnreadMessages = async () => {
      try {
        const readMap = getReadMap();

        const results = await Promise.all(
          projects.map(async (project) => {
            const projectId = project._id || project.id;

            try {
              const res = await axios.get(`${API}/messages?projectId=${projectId}`);
              const projectMessages = Array.isArray(res.data) ? res.data : [];

              const clientMessages = projectMessages.filter(
                (msg) =>
                  msg.sender !== user?.email &&
                  (msg.senderRole === "client" ||
                    msg.receiverRole === "manager" ||
                    msg.type === "client-manager")
              );

              const latestClientMessage =
                clientMessages[clientMessages.length - 1];

              if (!latestClientMessage?._id) return null;

              const lastReadMessageId = readMap[projectId];

              if (
                String(projectId) !== String(selectedProjectId) &&
                String(lastReadMessageId) !== String(latestClientMessage._id)
              ) {
                return projectId;
              }

              return null;
            } catch (err) {
              console.error("Unread check failed for project:", projectId, err);
              return null;
            }
          })
        );

        setUnreadProjectIds(results.filter(Boolean));
      } catch (err) {
        console.error("Unread messages check error:", err);
      }
    };

    checkUnreadMessages();

    const interval = setInterval(checkUnreadMessages, 5000);

    return () => clearInterval(interval);
  }, [projects, selectedProjectId, user?.email]);

  const handleProjectChange = (e) => {
    const projectId = e.target.value;

    setSelectedProjectId(projectId);
    setInviteProjectId(projectId);
    setMessages([]);
    setFiles([]);

    if (projectId) {
      localStorage.setItem("projectId", projectId);
    } else {
      localStorage.removeItem("projectId");
    }
  };

  const sendMessage = async () => {
    const cleanMessage = message.trim();

    if (!cleanMessage) return;

    if (!selectedProjectId) {
      alert("Please select a project first.");
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
        sender: user?.email || "manager",
        senderName: user?.name || user?.email || "Manager",
        senderRole: "manager",
        receiverRole: "client",
        type: "client-manager",
        time,
        projectId: String(selectedProjectId),
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
        "Message send failed";

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
    }
  };

  const clearChat = async () => {
    if (!selectedProjectId) {
      alert("Please select a project first.");
      return;
    }

    if (!window.confirm("Do you want to delete all messages?")) return;

    try {
      await axios.delete(`${API}/messages?projectId=${selectedProjectId}`);
      setMessages([]);
    } catch (err) {
      console.error("Clear chat error:", err);
      alert("❌ Chat clear failed");
    }
  };

  const sendInvite = async () => {
    const email = inviteEmail.trim();

    if (!email) {
      alert("Please enter an email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    if (!inviteProjectId) {
      alert("Please select a project.");
      return;
    }

    setInviteLoading(true);

    try {
      await axios.post(`${API}/invite`, {
        email,
        projectId: inviteProjectId,
        invitedBy: user?.email,
        inviterName: managerName,
        managerName,
        inviteRole: "client",
      });

      alert(`✅ Invitation sent to ${email}!`);
      setInviteEmail("");
      setShowInvite(false);
    } catch (err) {
      console.error("Invite error:", err);

      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Email send failed. Please check backend console.";

      alert(`❌ ${msg}`);
    } finally {
      setInviteLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedProjectId) {
      alert("Please select a project first.");
      return;
    }

    if (!frontendProgress.trim()) {
      alert("Please enter frontend progress.");
      return;
    }

    if (!backendProgress.trim()) {
      alert("Please enter backend progress.");
      return;
    }

    if (!workDone.trim()) {
      alert("Please describe completed work.");
      return;
    }

    setUpdateLoading(true);

    try {
      await axios.post(`${API}/update-status`, {
        projectId: selectedProjectId,
        manager: managerName,
        managerEmail: user?.email,
        date: updateDate,
        frontendProgress: frontendProgress.trim(),
        backendProgress: backendProgress.trim(),
        workDone: workDone.trim(),
        currentErrors: currentErrors.trim(),
        nextWork: nextWork.trim(),
      });

      alert("✅ Project status updated successfully!");

      setFrontendProgress("");
      setBackendProgress("");
      setWorkDone("");
      setCurrentErrors("");
      setNextWork("");
      setUpdateDate(new Date().toISOString().split("T")[0]);
      setShowUpdate(false);
    } catch (err) {
      console.error("Update status error:", err);

      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Update failed";

      alert(`❌ ${msg}`);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!selectedProjectId) {
      alert("Please select a project first.");
      return;
    }

    e.target.value = "";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("user", user?.email || "manager");
    formData.append("projectId", selectedProjectId);

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

  return (
    <div className="cpDash">
      <div className="cpInviteWrap">
        <div className="cpProjectSelectBox">
          <span className="cpProjectSelectIcon">📌</span>

          <select
            className="cpTopProjectSelect"
            value={selectedProjectId}
            onChange={handleProjectChange}
          >
            <option value="">Select Project</option>

            {projects.map((project) => {
              const projectId = project._id || project.id;
              const hasUnread = unreadProjectIds.some(
                (id) => String(id) === String(projectId)
              );

              return (
                <option key={projectId} value={projectId}>
                  {hasUnread ? "🔴 " : ""}
                  {project.title || project.name || "Untitled Project"}
                </option>
              );
            })}
          </select>
        </div>

        <button className="cpInviteBtn" onClick={() => setShowInvite(true)}>
          ✉ Send Invitation
        </button>

        <button className="cpUpdateBtn" onClick={() => setShowUpdate(true)}>
          📋 Update Status
        </button>
      </div>

      <div className="cpDashWrap">
        <section className="cpCard">
          <div className="cpCardTitle">
            <span>💬 Client Messages</span>

            <button onClick={clearChat} className="cpClearBtn">
              Clear All
            </button>
          </div>

          <div className="cpChatBody" ref={chatBodyRef}>
            {messages.length === 0 && (
              <div className="cpEmpty">
                {selectedProjectId
                  ? "No messages yet. Start the conversation!"
                  : "Please select a project to view messages."}
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
              disabled={!selectedProjectId}
            />

            <button
              onClick={sendMessage}
              disabled={!message.trim() || !selectedProjectId}
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
                <div className="cpEmpty">
                  {selectedProjectId
                    ? "No files uploaded yet."
                    : "Please select a project to view files."}
                </div>
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

      {showInvite && (
        <div className="cpModalOverlay" onClick={() => setShowInvite(false)}>
          <div className="cpModal" onClick={(e) => e.stopPropagation()}>
            <div className="cpModalHeader">
              <h3>✉ Send Invitation</h3>

              <button
                className="cpModalClose"
                onClick={() => setShowInvite(false)}
              >
                ✕
              </button>
            </div>

            <label className="cpLabel">Select Project *</label>

            <select
              value={inviteProjectId}
              onChange={(e) => setInviteProjectId(e.target.value)}
              className="cpSelect"
            >
              <option value="">Select Project</option>

              {projects.map((project) => (
                <option
                  key={project._id || project.id}
                  value={project._id || project.id}
                >
                  {project.title || project.name || "Untitled Project"}
                </option>
              ))}
            </select>

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
                disabled={inviteLoading || !inviteEmail.trim() || !inviteProjectId}
              >
                {inviteLoading ? "Sending..." : "Send Invite"}
              </button>

              <button
                className="cpBtnSecondary"
                onClick={() => setShowInvite(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showUpdate && (
        <div className="cpModalOverlay" onClick={() => setShowUpdate(false)}>
          <div
            className="cpModal cpModalLarge"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cpModalHeader">
              <h3>📋 Update Project Status</h3>

              <button
                className="cpModalClose"
                onClick={() => setShowUpdate(false)}
              >
                ✕
              </button>
            </div>

            <p className="cpModalSubtitle">
              Add current project progress, completed work, and issues for the client.
            </p>

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

            <div className="cpFormGrid">
              <div>
                <label className="cpLabel">Frontend Progress *</label>
                <input
                  type="text"
                  placeholder="e.g. 70% completed"
                  value={frontendProgress}
                  onChange={(e) => setFrontendProgress(e.target.value)}
                />
              </div>

              <div>
                <label className="cpLabel">Backend Progress *</label>
                <input
                  type="text"
                  placeholder="e.g. APIs 80% completed"
                  value={backendProgress}
                  onChange={(e) => setBackendProgress(e.target.value)}
                />
              </div>
            </div>

            <label className="cpLabel">Completed Work *</label>
            <textarea
              placeholder="Write what work has been completed so far..."
              value={workDone}
              onChange={(e) => setWorkDone(e.target.value)}
              rows={4}
            />

            <label className="cpLabel">Current Errors / Issues</label>
            <textarea
              placeholder="Mention current bugs/errors, if any..."
              value={currentErrors}
              onChange={(e) => setCurrentErrors(e.target.value)}
              rows={3}
            />

            <label className="cpLabel">Next Working Plan</label>
            <textarea
              placeholder="Write next steps or remaining work..."
              value={nextWork}
              onChange={(e) => setNextWork(e.target.value)}
              rows={3}
            />

            <div className="cpModalActions">
              <button
                className="cpBtnPrimary"
                onClick={handleUpdateStatus}
                disabled={
                  updateLoading ||
                  !frontendProgress.trim() ||
                  !backendProgress.trim() ||
                  !workDone.trim()
                }
              >
                {updateLoading ? "Updating..." : "Send Update"}
              </button>

              <button
                className="cpBtnSecondary"
                onClick={() => setShowUpdate(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}