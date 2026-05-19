
  import { createRoot } from "react-dom/client";
  // import App from "./app/App.tsx";        // V1 — garder comme reference
  import App from "./app/v2/AppV2.tsx";      // V2 — Frame Master
  import "./styles/index.css";

  // Guard: nettoyer localStorage corrompu (resizable-panels V1 data)
  try {
    const keysToClean = Object.keys(localStorage).filter(k =>
      k.startsWith("react-resizable-panels:") && !k.includes("frame-master-v2")
    );
    keysToClean.forEach(k => localStorage.removeItem(k));
  } catch { /* noop */ }

  // Filet de securite: TOUS les types d'erreurs
  function logCrash(msg: string) {
    try {
      const entry = { ts: new Date().toISOString(), msg: msg.substring(0, 2000) };
      const prev = JSON.parse(localStorage.getItem("carloscrash") || "[]");
      prev.push(entry);
      if (prev.length > 5) prev.shift();
      localStorage.setItem("carloscrash", JSON.stringify(prev));
      // Fire-and-forget: send to backend for remote debugging
      fetch("/api/v1/crash-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      }).catch(() => {});
    } catch { /* noop */ }
  }

  function showCrash(msg: string) {
    logCrash(msg);
    const root = document.getElementById("root");
    if (root) {
      root.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif">' +
        '<div style="text-align:center;max-width:600px;padding:20px">' +
        '<h2 style="color:#dc2626">CarlOS — Crash Detecte</h2>' +
        '<pre style="color:#666;text-align:left;background:#f5f5f5;padding:12px;border-radius:8px;font-size:11px;overflow:auto;max-height:400px;white-space:pre-wrap;word-break:break-all">' + msg + '</pre>' +
        '<p style="color:#999;font-size:11px;margin-top:8px">Ce crash a ete enregistre automatiquement.</p>' +
        '<button onclick="localStorage.clear();location.reload()" style="margin-top:12px;padding:8px 16px;background:#2563eb;color:white;border:none;border-radius:8px;cursor:pointer">Reset &amp; Reload</button>' +
        '</div></div>';
    }
  }

  window.addEventListener("error", (e) => {
    const stack = e.error?.stack || "";
    showCrash("ERROR: " + (e.message || "Unknown") + "\n\nFile: " + (e.filename || "?") + "\nLine: " + (e.lineno || "?") + ":" + (e.colno || "?") + (stack ? "\n\nStack:\n" + stack : ""));
  });

  window.addEventListener("unhandledrejection", (e) => {
    const stack = e.reason?.stack || "";
    showCrash("PROMISE REJECTION: " + String(e.reason) + (stack ? "\n\nStack:\n" + stack : ""));
  });

  try {
    const el = document.getElementById("root");
    if (!el) throw new Error("root element not found");
    createRoot(el).render(<App />);
  } catch (err) {
    showCrash("RENDER ERROR: " + String(err));
  }
