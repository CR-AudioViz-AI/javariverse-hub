"use client";

import React, { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  appName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  ticketNumber?: string;
}

export class CRAIverseErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  async componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Report to monitoring API
    try {
      const response = await fetch("/api/monitoring/error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error_message: error.message,
          error_stack: error.stack,
          component_stack: errorInfo.componentStack,
          source_app: this.props.appName || "unknown",
          source_url: typeof window !== "undefined" ? window.location.href : "",
          severity: "high"
        })
      });
      
      const data = await response.json();
      if (data.ticket_number) {
        this.setState({ ticketNumber: data.ticket_number });
      }
    } catch (e) {
      console.error("Failed to report error:", e);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">😵</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-4">
              We have been notified and are looking into it.
              {this.state.ticketNumber && (
                <span className="block mt-2 text-sm">
                  Ticket: <strong>{this.state.ticketNumber}</strong>
                </span>
              )}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for manual error reporting
export function useErrorReporter() {
  const reportError = async (error: Error, context?: Record<string, any>) => {
    try {
      await fetch("/api/monitoring/error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error_message: error.message,
          error_stack: error.stack,
          source_url: typeof window !== "undefined" ? window.location.href : "",
          severity: "medium",
          ...context
        })
      });
    } catch (e) {
      console.error("Failed to report error:", e);
    }
  };

  return { reportError };
}

export default CRAIverseErrorBoundary;
