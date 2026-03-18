import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./ClientPanel.css";

export default function ClientPanel() {

  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const fileInputRef = useRef();

  const user = JSON.parse(localStorage.getItem("user"));

  // fetch files
  useEffect(() => {
    const fetchFiles = async () => {
      const res = await axios.get("http://localhost:5000/api/upload");
      setFiles(res.data);
    };
    fetchFiles();
  }, []);

  // send message
  const sendMessage = () => {
    if (!message.trim()) return;

    setMessages([...messages, { text: message, sender: "me" }]);
    setMessage("");
  };

  // upload file
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

  // delete file
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

        {/* CHAT */}
        <section className="empCard">
          <div className="empCard__title">Client Messages</div>

          <div className="chatBody">
            {messages.map((msg, i) => (
              <div key={i} className={`chatBubble ${msg.sender === "me" ? "me" : "other"}`}>
                {msg.text}
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

        {/* FILES */}
        <section className="empCard">
          <div className="empCard__title">Shared Document</div>

          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleUpload}
          />

          <div
            className="uploadBox"
            onClick={() => fileInputRef.current.click()}
          >
            +
          </div>

          <div className="docBody">

            {files.map((f, i) => (
              <div className="fileCard" key={i}>

                {/* delete */}
                {f.uploadedBy === user?.email && (
                  <div
                    className="deleteBtn"
                    onClick={() => deleteFile(f._id, f.uploadedBy)}
                  >
                    ❌
                  </div>
                )}

                <div className="fileLeft">📄</div>

                <div className="fileMiddle">
                  <div className="fileName">
                    {f.url.split("/").pop()}
                  </div>
                  <div className="fileType">File</div>
                </div>

                <a href={f.url} target="_blank" rel="noreferrer" className="downloadBtn">
                  ⬇
                </a>

              </div>
            ))}

          </div>
        </section>

      </div>
    </div>
  );
}