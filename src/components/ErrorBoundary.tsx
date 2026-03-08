import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 bg-red-900 text-white p-8 overflow-auto z-50 flex flex-col items-start gap-4 font-mono">
          <h1 className="text-2xl font-bold">App Crashed</h1>
          <p className="bg-red-950 p-4 rounded text-sm whitespace-pre-wrap font-bold">
            {this.state.error && this.state.error.toString()}
          </p>
          <pre className="text-xs opacity-80 whitespace-pre-wrap">
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
          <button 
            className="mt-4 bg-white text-red-900 px-4 py-2 rounded font-bold"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
