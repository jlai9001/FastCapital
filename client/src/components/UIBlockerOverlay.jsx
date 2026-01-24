import React from "react";
import { useUIBlocker } from "../context/ui-blocker-provider.jsx";
import "./UIBlocker-overlay.css";

export default function UIBlockerOverlay() {
  const { isBlocked, message } = useUIBlocker();

  if (!isBlocked) return null;

  return (
    <div className="ui-blocker-overlay" aria-busy="true" aria-live="polite">
      <div className="ui-blocker-card">
        <div className="ui-blocker-spinner" />
        <div className="ui-blocker-text">{message || "Loading..."}</div>
      </div>
    </div>
  );
}
