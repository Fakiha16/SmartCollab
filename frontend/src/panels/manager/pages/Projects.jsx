import React, { useMemo, useState } from "react";
import "./Projects.css";

const mockProjects = Array.from({ length: 12 }).map((_, i) => ({
  id: i + 1,
  title: "Adoddle",
  status: "Offtrack",
  date: "05 April 2023",
  issues: 14,
  desc:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  members: ["A", "B", "C", "D"],
}));

export default function Projects() {
  const pageSize = 6;
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(mockProjects.length / pageSize);

  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return mockProjects.slice(start, start + pageSize);
  }, [page]);

  return (
    <div className="pr-wrap">
      <div className="pr-header">
        <h1 className="pr-title">Projects</h1>
      </div>

      <div className="pr-grid">
        {pageData.map((p) => (
          <div key={p.id} className="pr-card">
            <div className="pr-cardTop">
              <div className="pr-cardTitleRow">
                <div className="pr-cardTitle">{p.title}</div>
                <button className="pr-editBtn" title="Edit" type="button">
                  ✎
                </button>
              </div>

              <span className="pr-status">{p.status}</span>
            </div>

            <div className="pr-divider" />

            <p className="pr-desc">{p.desc}</p>

            <div className="pr-bottom">
              <div className="pr-date">
                <span className="pr-dateIcon">⏳</span>
                <span>{p.date}</span>
              </div>

              <div className="pr-meta">
                <div className="pr-avatars">
                  {p.members.slice(0, 4).map((m, idx) => (
                    <div key={idx} className="pr-avatar">
                      {m}
                    </div>
                  ))}
                  <div className="pr-avatar pr-avatarMore">+2</div>
                </div>

                <div className="pr-issues">
                  <span className="pr-issueIcon">▣</span>
                  <span>{p.issues} issues</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pr-pagination">
        <button
          className="pr-pageBtn"
          onClick={() => setPage((x) => Math.max(1, x - 1))}
          disabled={page === 1}
        >
          Previous
        </button>

        {Array.from({ length: totalPages }).map((_, i) => {
          const num = i + 1;
          return (
            <button
              key={num}
              className={`pr-pageNum ${num === page ? "is-active" : ""}`}
              onClick={() => setPage(num)}
            >
              {num}
            </button>
          );
        })}

        <button
          className="pr-pageBtn"
          onClick={() => setPage((x) => Math.min(totalPages, x + 1))}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
