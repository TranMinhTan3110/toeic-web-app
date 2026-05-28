import React from "react";
// ─── Bar (mini chart) ─────────────────────────────
export function Bar({ h, active, val }) {
  return (
    <div
      className={`bar${active ? " active" : ""}`}
      style={{ height: `${h}%` }}
      data-tooltip={`${val} người dùng`}
    />
  );
}

// ─── ProgressItem ─────────────────────────────────
export function ProgressItem({ label, val, pct, color }) {
  return (
    <div className="progress-item">
      <div className="progress-header">
        <span className="progress-label">{label}</span>
        <span className="progress-val">{val}</span>
      </div>
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}
