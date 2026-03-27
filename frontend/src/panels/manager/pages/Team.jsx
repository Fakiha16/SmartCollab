import React from "react";
import "./Team.css";

const teamData = [
  {
    name: "Ali Raza",
    role: "Frontend Developer",
    email: "ali@gmail.com",
    project: "SmartCollab",
    description: "Working on UI & dashboard components",
    status: "Active",
    image: "https://i.pravatar.cc/150?img=1",
  },
  {
    name: "Sara Khan",
    role: "QA Tester",
    email: "sara@gmail.com",
    project: "Auth System",
    description: "Testing login & security flows",
    status: "Busy",
    image: "https://i.pravatar.cc/150?img=2",
  },
  {
    name: "Usman",
    role: "Backend Developer",
    email: "usman@gmail.com",
    project: "API Development",
    description: "Building REST APIs",
    status: "Active",
    image: "https://i.pravatar.cc/150?img=3",
  },
];

export default function Team() {
  return (
    <div className="team-page">
      <h1 className="team-title">Team Members</h1>

      <div className="team-grid">
        {teamData.map((member, index) => (
          <div className="team-card" key={index}>
            <img src={member.image} className="team-img" />

            <h3>{member.name}</h3>
            <p className="role">{member.role}</p>

            <p className="email">{member.email}</p>

            <div className="project-box">
              <h4>{member.project}</h4>
              <p>{member.description}</p>
            </div>

            <span className={`status ${member.status.toLowerCase()}`}>
              {member.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}