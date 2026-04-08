import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./ClientPanel.css";

export default function ClientPanel() {

  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef();
  const user = JSON.parse(localStorage.getItem("user"));
  const docRef = useRef();

  // ================= FILES =================
  useEffect(() => {
    const fetchFiles = async () => {
  const res = await axios.get("http://localhost:5000/api/upload");

  const sorted = res.data.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  setFiles(sorted);
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



  const sendMessage = async () => {
    if (!message.trim()) return;

    const now = new Date();
    const time = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const res = await axios.post(
      "http://localhost:5000/api/messages",
      {
        text: message,
        sender: user?.email,
        time,
      }
    );

    setMessages([...messages, res.data]);
    setMessage("");
  };

  const deleteMessage = async (id) => {
    await axios.delete(`http://localhost:5000/api/messages/${id}`);
    setMessages(messages.filter((m) => m._id !== id));
  };

  const clearChat = async () => {
    await axios.delete("http://localhost:5000/api/messages");
    setMessages([]);
  };

  // ================= INVITE =================
  const sendInvite = async () => {
    if (!inviteEmail) {
      alert("Please enter email");
      return;
    }

    setLoading(true);

    try {
      console.log("Sending invite to:", inviteEmail);

      await axios.post("http://localhost:5000/api/invite", {
        email: inviteEmail,
      });

      alert("✅ Invitation sent successfully!");

      setInviteEmail("");
      setShowInvite(false);

    } catch (err) {
      console.error(err);
      alert("❌ Email failed");
    }

    setLoading(false);
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

    setFiles(prev => [res.data, ...prev]);
  };

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

      {/* INVITE BUTTON */}
      <div className="inviteBtnWrap">
        <button
  className="inviteBtn"
  onClick={() => {
    console.log("CLICK WORKING");
    setShowInvite(true);
  }}
>
  + Send Invitation
</button>
      </div>

      <div className="empDash__wrap">

        {/* CHAT */}
        <section className="empCard">
          <div className="empCard__title">
            Client Messages
            <button onClick={clearChat}>Clear All</button>
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
                <span onClick={() => deleteMessage(msg._id)}>❌</span>
              </div>
            ))}
          </div>

          <div className="chatInput">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message"
            />
            <button onClick={sendMessage}>➤</button>
          </div>
        </section>

        {/* FILES */}
        <section className="empCard">
          <div className="empCard__title">Shared Document</div>

          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleUpload}
          />

          <div className="docContainer">
            <div
              className="uploadBox"
              onClick={() => fileInputRef.current.click()}
            >
              +
            </div>

            <div className="docBody" ref={docRef}>
              {files.map((f) => (
                <div className="fileCard" key={f._id}>
                  <div className="fileLeft">📄</div>

                  <div className="fileMiddle">
                    <div className="fileName">
                      {f.url.split("/").pop()}
                    </div>
                  </div>

                  <div className="fileActions">
                    <button
                      className="fileBtn"
                      onClick={() => window.open(f.url, "_blank")}
                    >
                      ⬇
                    </button>

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

      {/* INVITE MODAL */}
      {showInvite && (
        <div
            className="pf-modalOverlay"
            onClick={() => setShowInvite(false)}
          >
            <div
              className="pf-modal"
              onClick={(e) => e.stopPropagation()}
            >
            <h3>Send Invitation</h3>

            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Enter email"
            />

            <div className="pf-modalActions">
              <button onClick={sendInvite} disabled={loading}>
                {loading ? "Sending..." : "Send"}
              </button>
              <button onClick={() => setShowInvite(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}