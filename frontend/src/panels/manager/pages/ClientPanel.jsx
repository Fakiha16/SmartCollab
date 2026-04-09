import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./ClientPanel.css";

export default function ClientPanel() {

  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const [showInvite, setShowInvite] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false); // State for the update status modal
  const [inviteEmail, setInviteEmail] = useState("");
  const [updateTitle, setUpdateTitle] = useState("");
  const [managerName, setManagerName] = useState("Manager's Name"); // Replace with dynamic data
  const [updateDate, setUpdateDate] = useState(new Date().toLocaleDateString());
  const [updateDescription, setUpdateDescription] = useState("");
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

// Function to handle the Update Status form submission
  const handleUpdateStatus = async () => {
    if (!updateDescription) {
      alert("Please provide a description of the update.");
      return;
    }

    const updateData = {
      title: updateTitle,
      manager: managerName,
      date: updateDate,
      description: updateDescription,
    };

    try {
      // Sending update status to backend
      await axios.post("http://localhost:5000/api/update-status", updateData);
      alert("✅ Status Updated successfully!");
      setShowUpdate(false); // Close modal after submitting
    } catch (err) {
      console.error(err);
      alert("❌ Failed to update status");
    }
  };

 return (
    <div className="empDash">
      {/* INVITE AND UPDATE BUTTONS */}
      <div className="inviteBtnWrap">
        <button
          className="inviteBtn"
          onClick={() => setShowInvite(true)}
        >
          + Send Invitation
        </button>

        <button
          className="updateBtn"
          onClick={() => setShowUpdate(true)}
        >
          + Update Status
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
      {/* UPDATE STATUS MODAL */}
      {showUpdate && (
        <div
          className="pf-modalOverlay"
          onClick={() => setShowUpdate(false)}
        >
          <div className="pf-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Update Status</h3>
            <input
              type="text"
              placeholder="Title"
              value={updateTitle}
              onChange={(e) => setUpdateTitle(e.target.value)}
            />
            <input
              type="text"
              placeholder="Manager's Name"
              value={managerName}
              disabled
            />
            <input
              type="date"
              value={updateDate}
              onChange={(e) => setUpdateDate(e.target.value)}
            />
            <textarea
              placeholder="Description of the update"
              value={updateDescription}
              onChange={(e) => setUpdateDescription(e.target.value)}
            />
            <div className="pf-modalActions">
              <button onClick={handleUpdateStatus}>Update</button>
              <button onClick={() => setShowUpdate(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}