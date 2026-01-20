import React from "react";
import { useLocation } from "react-router-dom";
import { useProtectedData } from "../context/protected-data-provider.jsx";

/**
 * Shows a full-screen loading gate ONLY on protected routes
 * while ProtectedDataProvider is still fetching.
 *
 * Goal: after login, you don't see Portfolio/BusinessProfile render
 * half-empty for a moment — you see a simple loader until cached data is ready.
 */
export default function ProtectedRouteGate({ children }) {
  const location = useLocation();
  const { status, error, refreshProtectedData } = useProtectedData();

  const protectedRoutes = [
    "/portfolio",
    "/business-profile",
    "/add-business",
    "/create-investment",
    "/create-financials",
    "/investment-details",
  ];


  const isProtected = protectedRoutes.some((path) =>
    location.pathname.startsWith(path)
  );

  // Keep this consistent with your AuthRouteGuard logic.
  const token = localStorage.getItem("access_token");

  // If we're not on a protected route, never block rendering.
  if (!isProtected) return children;

  // If no token, AuthRouteGuard will redirect — don't block here.
  if (!token) return children;

  // Gate: token exists + protected route + protected data not ready yet
  const isLoading = status === "loading";
  if (isLoading) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <div style={styles.spinner} />
          <div style={styles.title}>Loading your account…</div>
          <div style={styles.sub}>
            Pulling your portfolio, business profile, and financials.
          </div>
        </div>
      </div>
    );
  }

  // If something failed, show a simple retry UI
  if (status === "error") {
    return (
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <div style={styles.title}>Couldn’t load your data</div>
          <div style={styles.sub}>
            {error?.message || "Please try again."}
          </div>

          <button
            type="button"
            onClick={refreshProtectedData}
            style={styles.button}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // status === "ready"
  return children;
}

const styles = {
  wrapper: {
    minHeight: "70vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
  },
  card: {
    width: "100%",
    maxWidth: "520px",
    borderRadius: "16px",
    padding: "28px 24px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    border: "1px solid rgba(0,0,0,0.08)",
    background: "white",
    textAlign: "center",
  },
  spinner: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    border: "3px solid rgba(0,0,0,0.12)",
    borderTop: "3px solid rgba(0,0,0,0.55)",
    margin: "0 auto 14px",
    animation: "fcSpin 0.9s linear infinite",
  },
  title: {
    fontSize: "18px",
    fontWeight: 700,
    marginBottom: "6px",
  },
  sub: {
    fontSize: "14px",
    opacity: 0.75,
    lineHeight: 1.4,
  },
  button: {
    marginTop: "14px",
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1px solid rgba(0,0,0,0.18)",
    background: "white",
    cursor: "pointer",
    fontWeight: 600,
  },
};

// Inject keyframes without touching your CSS files
const styleTagId = "fc-protected-gate-keyframes";
if (typeof document !== "undefined" && !document.getElementById(styleTagId)) {
  const tag = document.createElement("style");
  tag.id = styleTagId;
  tag.innerHTML = `
    @keyframes fcSpin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(tag);
}
