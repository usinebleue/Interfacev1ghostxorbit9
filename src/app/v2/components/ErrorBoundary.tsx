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
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] Crash intercepte:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
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
            <p className="text-sm text-gray-500 mb-4">
              {this.state.error?.message || "Erreur inconnue"}
            </p>
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
