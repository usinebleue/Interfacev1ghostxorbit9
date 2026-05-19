/**
 * ErrorBoundary.tsx — Attrape les crashs React et affiche un message au lieu d'une page blanche
 * Sprint B — Stabilite
 */

import { Component } from "react";
import type { ReactNode, ErrorInfo } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  componentStack: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, componentStack: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] Crash intercepte:", error, errorInfo);
    this.setState({ componentStack: errorInfo.componentStack || null });
    // Telemetry: envoyer le crash au backend pour debug remote
    try {
      const entry = {
        ts: new Date().toISOString(),
        msg: `REACT ERROR BOUNDARY:\n${error.message}\n\nStack: ${error.stack || "?"}\n\nComponent Stack: ${errorInfo.componentStack || "?"}`.substring(0, 3000),
      };
      const prev = JSON.parse(localStorage.getItem("carloscrash") || "[]");
      prev.push(entry);
      if (prev.length > 5) prev.shift();
      localStorage.setItem("carloscrash", JSON.stringify(prev));
      fetch("/api/v1/crash-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      }).catch(() => {});
    } catch { /* noop */ }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, componentStack: null });
  };

  handleReset = () => {
    // Nettoyer le localStorage corrompu
    try {
      localStorage.removeItem("ghostx-threads");
      localStorage.removeItem("ghostx-active-thread");
      localStorage.removeItem("ghostx-crystals");
    } catch { /* noop */ }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md mx-auto text-center p-8 bg-white rounded-2xl shadow-lg border">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">!</span>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              CarlOS a plante
            </h2>
            <pre className="text-[10px] text-left text-red-700 bg-red-50 p-3 rounded-lg mb-3 max-h-40 overflow-auto whitespace-pre-wrap break-all">
              {this.state.error?.message || "Erreur inconnue"}
              {this.state.componentStack ? "\n\nComponent:" + this.state.componentStack.substring(0, 500) : ""}
            </pre>
            <p className="text-[10px] text-gray-400 mb-3">Ce crash a ete enregistre automatiquement.</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Reessayer
              </button>
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Reset complet
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
