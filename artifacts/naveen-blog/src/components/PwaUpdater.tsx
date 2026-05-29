import { useRegisterSW } from "virtual:pwa-register/react";
import { useEffect, useState } from "react";

export default function PwaUpdater() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // Check for updates every hour when the app is open
      if (r) {
        setInterval(() => r.update(), 60 * 60 * 1000);
      }
    },
  });

  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (needRefresh) setDismissed(false);
  }, [needRefresh]);

  if (!needRefresh || dismissed) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        background: "#1c2128",
        border: "1px solid #30363d",
        borderRadius: 12,
        padding: "12px 18px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        minWidth: 280,
        maxWidth: "90vw",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <span style={{ fontSize: "1.1rem" }}>🔄</span>
      <span style={{ flex: 1, fontSize: "0.82rem", color: "#c9d1d9", lineHeight: 1.4 }}>
        New version available
      </span>
      <button
        onClick={() => setDismissed(true)}
        style={{
          background: "none",
          border: "none",
          color: "#8b949e",
          cursor: "pointer",
          fontSize: "0.75rem",
          padding: "2px 6px",
        }}
      >
        Later
      </button>
      <button
        onClick={() => updateServiceWorker(true)}
        style={{
          background: "#238636",
          border: "none",
          borderRadius: 6,
          color: "#fff",
          cursor: "pointer",
          fontSize: "0.78rem",
          fontWeight: 600,
          padding: "5px 12px",
          whiteSpace: "nowrap",
        }}
      >
        Update
      </button>
    </div>
  );
}
