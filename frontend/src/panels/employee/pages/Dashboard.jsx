import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const params = new URLSearchParams(window.location.search);
  const urlPid = params.get("projectId");
  const storedPid = localStorage.getItem("projectId");

  const userProjectIds = user?.projectIds || [];

  const projectId =
    urlPid ||
    storedPid ||
    user?.projectId ||
    userProjectIds[0] ||
    "";

  const teamChatRoomId = projectId ? `team-${projectId}` : "";

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [members, setMembers] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [projectName, setProjectName] = useState("My Project");
  const [noProject, setNoProject] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (urlPid) {
      localStorage.setItem("projectId", urlPid);
      console.log("✅ projectId updated from URL:", urlPid);
    }
  }, [urlPid]);

  useEffect(() => {
    const joinActiveProject = async () => {
      try {
        if (!projectId || !user?.email) return;

        const res = await fetch("http://localhost:5000/api/projects/join-project", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectId,
            email: user.email,
          }),
        });

        const data = await res.json();
        console.log("✅ Employee joined active project:", data);

        if (data?.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
          localStorage.setItem("projectId", projectId);
        }
      } catch (err) {
        console.error("Join active project failed:", err);
      }
    };

    joinActiveProject();
  }, [projectId, user?.email]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!projectId) {
      setNoProject(true);
      return;
    }

    fetch(`http://localhost:5000/api/projects/${projectId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.title) setProjectName(data.title);
        else if (data?.name) setProjectName(data.name);
      })
      .catch(console.error);
  }, [projectId]);

  useEffect(() => {
    if (!projectId || !teamChatRoomId) {
      console.warn("⚠️ No projectId found — socket will not join any room");
      return;
    }

    console.log("🔌 Joining TEAM socket room:", teamChatRoomId);

    socket.emit("joinProject", {
      projectId: teamChatRoomId,
      realProjectId: projectId,
      chatType: "team",
      user: {
        email: user.email,
        name: user.name || user.email,
        role: user.role || "employee",
      },
    });

    socket.on("previousMessages", (msgs) => {
      const teamMessages = Array.isArray(msgs)
        ? msgs.filter((msg) => {
            return (
              msg.chatType === "team" ||
              msg.type === "manager-employee" ||
              msg.projectId === teamChatRoomId ||
              String(msg.projectId || "").startsWith("team-")
            );
          })
        : [];

      setMessages(teamMessages);
    });

    socket.on("receiveMessage", (msg) => {
      if (
        msg.chatType !== "team" &&
        msg.type !== "manager-employee" &&
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

    socket.on("projectMembers", (memberList) => {
      setMembers(memberList);
    });

    socket.on("userTyping", ({ name, email, chatType }) => {
      if (email !== user.email && (!chatType || chatType === "team")) {
        setTypingUsers((prev) =>
          prev.find((u) => u.email === email)
            ? prev
            : [...prev, { name, email }]
        );
      }
    });

    socket.on("userStoppedTyping", ({ email }) => {
      setTypingUsers((prev) => prev.filter((u) => u.email !== email));
    });

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
  }, [projectId, teamChatRoomId, user.email, user.name, user.role]);

  useEffect(() => {
    if (!projectId) return;

    fetch(`http://localhost:5000/api/upload/${projectId}`)
      .then((res) => res.json())
      .then((data) => setFiles(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [projectId]);

  const sendMessage = () => {
    const cleanText = text.trim();

    if (!cleanText || !projectId || !teamChatRoomId) return;

    const msg = {
      text: cleanText,
      sender: user.email,
      senderName: user.name || user.email,
      senderRole: user.role || "employee",
      receiverRole: "manager",
      projectId: teamChatRoomId,
      realProjectId: projectId,
      chatType: "team",
      type: "manager-employee",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      timestamp: Date.now(),
    };

    socket.emit("sendMessage", msg);
    socket.emit("stopTyping", {
      projectId: teamChatRoomId,
      realProjectId: projectId,
      chatType: "team",
      email: user.email,
    });

    setText("");
    clearTimeout(typingTimeoutRef.current);
  };

  const handleTyping = (e) => {
    setText(e.target.value);

    if (!projectId || !teamChatRoomId) return;

    socket.emit("typing", {
      projectId: teamChatRoomId,
      realProjectId: projectId,
      chatType: "team",
      name: user.name || user.email,
      email: user.email,
    });

    clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", {
        projectId: teamChatRoomId,
        realProjectId: projectId,
        chatType: "team",
        email: user.email,
      });
    }, 1500);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const uploadFile = async (e) => {
    const file = e.target.files[0];

    if (!file || !projectId) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("email", user.email);
    formData.append("user", user.email);
    formData.append("projectId", projectId);

    try {
      const res = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const newFile = await res.json();

        setFiles((prev) => [...prev, newFile]);
        socket.emit("broadcastFile", { projectId, file: newFile });

        const fileMsg = {
          text: `📎 Shared a file: ${newFile.name || newFile.filename}`,
          sender: user.email,
          senderName: user.name || user.email,
          senderRole: user.role || "employee",
          receiverRole: "manager",
          projectId: teamChatRoomId,
          realProjectId: projectId,
          chatType: "team",
          type: "manager-employee",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          timestamp: Date.now(),
          isFileMsg: true,
        };

        socket.emit("sendMessage", fileMsg);
      } else {
        alert("File upload failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Upload error.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const getInitials = (email = "") =>
    email.split("@")[0].slice(0, 2).toUpperCase();

  const getAvatarColor = (email = "") => {
    const colors = ["#25D366", "#128C7E", "#075E54", "#34B7F1", "#ECE5DD"];
    let hash = 0;

    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  };

  if (noProject) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "80vh",
          gap: "16px",
          fontFamily: "sans-serif",
          color: "#555",
        }}
      >
        <div style={{ fontSize: "48px" }}>📭</div>

        <div style={{ fontSize: "18px", fontWeight: "600" }}>
          No project assigned yet
        </div>

        <div style={{ fontSize: "14px", color: "#999" }}>
          Please use the invite link from your manager to join a project.
        </div>
      </div>
    );
  }

  return (
    <div className="empDash">
      <div className="empDash__wrap">
        <section className="empCard">
          <div className="empCard__title">
            💬 {projectName} — Team Chat

            {members.length > 0 && (
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "normal",
                  marginLeft: "8px",
                  color: "#25D366",
                }}
              >
                {members.length} online
              </span>
            )}
          </div>

          <div className="chatCard__body">
            <div className="chatMessages">
              {messages.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    color: "#aaa",
                    fontSize: "13px",
                    padding: "30px 0",
                  }}
                >
                  No team messages yet. Say hello! 👋
                </div>
              )}

              {messages.map((m, i) => {
                const isMe = m.sender === user.email;

                return (
                  <div
                    key={m._id || i}
                    className={`msgRow ${
                      isMe ? "msgRow--right" : "msgRow--left"
                    }`}
                  >
                    {!isMe && (
                      <div
                        className="avatarRound"
                        style={{
                          background: getAvatarColor(m.sender),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontWeight: "700",
                          fontSize: "13px",
                        }}
                      >
                        {getInitials(m.senderName || m.sender)}
                      </div>
                    )}

                    <div>
                      {!isMe && (
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#128C7E",
                            fontWeight: "700",
                            marginBottom: "2px",
                            paddingLeft: "2px",
                          }}
                        >
                          {m.senderName || m.sender}
                        </div>
                      )}

                      <div
                        className={`bubble ${
                          isMe ? "bubble--black" : "bubble--green"
                        }`}
                      >
                        {m.text}
                      </div>

                      <div className={`time ${isMe ? "time--right" : ""}`}>
                        {m.time}

                        {isMe && (
                          <span style={{ color: "#34B7F1", marginLeft: "4px" }}>
                            ✓✓
                          </span>
                        )}
                      </div>
                    </div>

                    {isMe && (
                      <div
                        className="avatarRound avatarRound--right"
                        style={{
                          background: getAvatarColor(user.email),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontWeight: "700",
                          fontSize: "13px",
                        }}
                      >
                        {getInitials(user.email)}
                      </div>
                    )}
                  </div>
                );
              })}

              {typingUsers.length > 0 && (
                <div className="msgRow msgRow--left">
                  <div
                    className="avatarRound"
                    style={{
                      background: "#34B7F1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontWeight: "700",
                      fontSize: "13px",
                    }}
                  >
                    {getInitials(typingUsers[0].email)}
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#128C7E",
                        fontWeight: "700",
                        marginBottom: "2px",
                      }}
                    >
                      {typingUsers[0].name}
                    </div>

                    <div
                      className="bubble bubble--green"
                      style={{ padding: "10px 16px" }}
                    >
                      <span className="typingDots">
                        <span>.</span>
                        <span>.</span>
                        <span>.</span>
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="chatComposer">
              <button
                className="chatComposer__iconBtn"
                onClick={() => fileInputRef.current?.click()}
                title="Attach file"
              >
                📎
              </button>

              <input
                ref={fileInputRef}
                type="file"
                style={{ display: "none" }}
                onChange={uploadFile}
              />

              <input
                className="chatComposer__input"
                placeholder="Type a team message..."
                value={text}
                onChange={handleTyping}
                onKeyDown={handleKeyDown}
              />

              <button
                className="chatComposer__sendBtn"
                onClick={sendMessage}
                disabled={!text.trim()}
              >
                ➤
              </button>
            </div>
          </div>
        </section>

        <section className="empCard">
          <div className="empCard__title">📁 Shared Documents</div>

          <div className="docUpload">
            <label
              className={`docUpload__btn ${
                uploading ? "docUpload__btn--loading" : ""
              }`}
            >
              {uploading ? "Uploading..." : "+ Upload File"}

              <input
                type="file"
                onChange={uploadFile}
                style={{ display: "none" }}
              />
            </label>
          </div>

          <div className="docBody">
            {files.length === 0 && (
              <div className="docEmpty">📂 No files shared yet</div>
            )}

            {files.length > 0 && (
              <div className="docList">
                {files.map((f, i) => {
                  const fileName = f.name || f.filename || "file";

                  return (
                    <a
                      key={f._id || i}
                      href={`http://localhost:5000/uploads/${fileName}`}
                      target="_blank"
                      rel="noreferrer"
                      className="docLink"
                    >
                      <span className="docLink__icon">📎</span>
                      <span className="docLink__name">{fileName}</span>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}