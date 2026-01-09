"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Ticket } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  ticketNumber: string | null;
  ticketMessage: string | null;
  isCreatingTicket: boolean;
}

class ErrorBoundaryWithTicketing extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      ticketNumber: null,
      ticketMessage: null,
      isCreatingTicket: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    this.createAutoTicket(error, errorInfo);
  }

  async createAutoTicket(error: Error, errorInfo: ErrorInfo) {
    this.setState({ isCreatingTicket: true });

    try {
      const response = await fetch("/api/tickets/auto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error_type: "ui_error",
          error_message: error.message,
          error_stack: error.stack,
          page_url: typeof window !== "undefined" ? window.location.href : "",
          browser_info: typeof navigator !== "undefined" ? navigator.userAgent : "",
          severity: "medium"
        })
      });

      const data = await response.json();
      
      if (data.success) {
        this.setState({
          ticketNumber: data.ticket.number,
          ticketMessage: data.ticket.message,
          isCreatingTicket: false
        });
      }
    } catch (e) {
      console.error("Failed to create auto-ticket:", e);
      this.setState({ isCreatingTicket: false });
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      ticketNumber: null,
      ticketMessage: null
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-4">
              We encountered an unexpected error. Our team has been notified.
            </p>

            {this.state.isCreatingTicket && (
              <div className="flex items-center justify-center gap-2 text-blue-600 mb-4">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Creating support ticket...</span>
              </div>
            )}

            {this.state.ticketNumber && (
              <div className="bg-cyan-500 border border-cyan-500 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-center gap-2 text-cyan-500 mb-2">
                  <Ticket className="w-5 h-5" />
                  <span className="font-semibold">Ticket Created</span>
                </div>
                <p className="text-cyan-500 font-mono text-lg">
                  {this.state.ticketNumber}
                </p>
                <p className="text-cyan-500 text-sm mt-2">
                  {this.state.ticketMessage}
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              <a
                href="/support"
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundaryWithTicketing;
