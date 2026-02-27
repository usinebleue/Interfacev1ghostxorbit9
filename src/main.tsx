
  import { createRoot } from "react-dom/client";
  // import App from "./app/App.tsx";        // V1 — garder comme reference
  import App from "./app/v2/AppV2.tsx";      // V2 — Frame Master
  import "./styles/index.css";

  createRoot(document.getElementById("root")!).render(<App />);
  