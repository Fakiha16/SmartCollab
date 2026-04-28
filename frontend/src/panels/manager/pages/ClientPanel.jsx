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

  const user = JSON.parse(localStorage.getItem("user"));
  const projectId = localStorage.getItem("projectId");
  const docRef = useRef();
  const fileInputRef = useRef(null);
  // ================= FILES =================
  useEffect(() => {
    const fetchFiles = async () => {
  const res = await axios.get(`http://localhost:5000/api/upload/${projectId}`);

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

  if (!file) return; // important

  const formData = new FormData();
  formData.append("file", file);
  formData.append("user", user?.email);

  try {
    const res = await axios.post(
      "http://localhost:5000/api/upload",
      formData
    );

    setFiles(prev => [res.data, ...prev]);
  } catch (err) {
    console.error(err);
  }
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

  const handleDeleteFile = async (fileName) => {
  try {
    await axios.delete(`http://localhost:5000/api/upload/${fileName}`);

    setFiles(prev => prev.filter(f => (f.name || f.filename) !== fileName));
  } catch (err) {
    console.error(err);
    alert("Delete failed");
  }
};
// ONLY CLASS NAMES CHANGED (emp → cp)

return (
  <div className="cpDash">
    {/* INVITE AND UPDATE BUTTONS */}
    <div className="cpInviteWrap">
      <button
        className="cpInviteBtn"
        onClick={() => setShowInvite(true)}
      >
        + Send Invitation
      </button>

      <button
        className="cpUpdateBtn"
        onClick={() => setShowUpdate(true)}
      >
        + Update Status
      </button>
    </div>

    <div className="cpDashWrap">

      {/* CHAT */}
      <section className="cpCard">
        <div className="cpCardTitle">
          Client Messages
          <button onClick={clearChat}>Clear All</button>
        </div>

        <div className="cpChatBody">
          {messages.map((msg) => (
            <div
              key={msg._id}
              className={`cpChatBubble ${
                msg.sender === user?.email ? "cpMe" : "cpOther"
              }`}
            >
              <div>{msg.text}</div>
              <div className="cpChatTime">{msg.time}</div>
              <span onClick={() => deleteMessage(msg._id)}>❌</span>
            </div>
          ))}
        </div>

        <div className="cpChatInput">
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
      {/* FILES */}
<section className="cpCard">
  <div className="cpCardTitle">Shared Document</div>

  {/* hidden file input */}
  <input
    type="file"
    ref={fileInputRef}
    style={{ display: "none" }}
    onChange={handleUpload}
  />

  <div className="cpDocContainer">

    {/* UPLOAD BOX */}
    <div
      className="cpUploadBox"
      onClick={() => {
        if (fileInputRef.current) {
          fileInputRef.current.click();
        }
      }}
    >
      +
    </div>

    {/* FILE LIST */}
    <div className="cpDocBody">

      {files.length === 0 ? (
        <div className="empty">No files</div>
      ) : (
        files.map((f, i) => (
          <div key={i} className="cpFileCard">

            <div className="cpFileLeft">
              📄
            </div>

            <div className="cpFileMiddle">
              <div className="cpFileName">
                {f.name || f.filename || "file"}
              </div>
            </div>

            <div className="cpFileActions">

              {/* DOWNLOAD */}
              <a
                href={`http://localhost:5000/uploads/${f.name || f.filename}`}
                download
                className="cpFileBtn"
              >
                ⬇
              </a>

              {/* DELETE */}
              <button
                className="cpFileBtn cpDelete"
                onClick={() => handleDeleteFile(f.name || f.filename)}
              >
                ✖
              </button>

            </div>

          </div>
        ))
      )}

    </div>
  </div>
</section>

    </div>

    {/* INVITE MODAL */}
    {showInvite && (
      <div
        className="cpModalOverlay"
        onClick={() => setShowInvite(false)}
      >
        <div
          className="cpModal"
          onClick={(e) => e.stopPropagation()}
        >
          <h3>Send Invitation</h3>

          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="Enter email"
          />

          <div className="cpModalActions">
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
        className="cpModalOverlay"
        onClick={() => setShowUpdate(false)}
      >
        <div className="cpModal" onClick={(e) => e.stopPropagation()}>
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

          <div className="cpModalActions">
            <button onClick={handleUpdateStatus}>Update</button>
            <button onClick={() => setShowUpdate(false)}>Cancel</button>
          </div>
        </div>
      </div>
    )}

  </div>
);
}