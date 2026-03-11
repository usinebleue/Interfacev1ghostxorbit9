
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
  function showCrash(msg: string) {
    const root = document.getElementById("root");
    if (root) {
      root.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif">' +
        '<div style="text-align:center;max-width:500px;padding:20px">' +
        '<h2 style="color:#dc2626">CarlOS — Crash Detecte</h2>' +
        '<pre style="color:#666;text-align:left;background:#f5f5f5;padding:12px;border-radius:8px;font-size:12px;overflow:auto;max-height:300px">' + msg + '</pre>' +
        '<button onclick="localStorage.clear();location.reload()" style="margin-top:16px;padding:8px 16px;background:#2563eb;color:white;border:none;border-radius:8px;cursor:pointer">Reset &amp; Reload</button>' +
        '</div></div>';
    }
  }

  window.addEventListener("error", (e) => {
    showCrash("ERROR: " + (e.message || "Unknown") + "\n\nFile: " + (e.filename || "?") + "\nLine: " + (e.lineno || "?") + ":" + (e.colno || "?"));
  });

  window.addEventListener("unhandledrejection", (e) => {
    showCrash("PROMISE REJECTION: " + String(e.reason));
  });

  try {
    const el = document.getElementById("root");
    if (!el) throw new Error("root element not found");
    createRoot(el).render(<App />);
  } catch (err) {
    showCrash("RENDER ERROR: " + String(err));
  }
