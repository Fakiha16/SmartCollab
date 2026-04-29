import React from "react";

export default function Card({ className = "", children, ...rest }) {
  return (
    <div className={`sc-card ${className}`} {...rest}>
      {children}
    </div>
  );
}