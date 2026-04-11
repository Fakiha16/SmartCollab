import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function ClientJoin() {
  const { token } = useParams();
  const [message, setMessage] = useState("Connecting client...");

  useEffect(() => {
    const acceptInvite = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/invite/accept/${token}`);
        setMessage(res.data.message || "Client connected successfully");
      } catch (err) {
        setMessage(err?.response?.data?.message || "Failed to connect client");
      }
    };

    acceptInvite();
  }, [token]);

  return <div>{message}</div>;
}