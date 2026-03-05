import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("AppErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">
          <div className="max-w-lg w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 p-6 shadow-sm">
            <h1 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              {this.state.error.message}
            </p>
            {typeof window !== "undefined" && (
              <details className="text-xs font-mono text-slate-500 dark:text-slate-500 overflow-auto max-h-40">
                <summary className="cursor-pointer">Stack</summary>
                <pre className="mt-2 whitespace-pre-wrap break-words">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            <button
              type="button"
              onClick={() => this.setState({ error: null })}
              className="mt-4 px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:brightness-110"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
