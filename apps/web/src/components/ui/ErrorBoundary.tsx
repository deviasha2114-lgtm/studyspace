import React from 'react';

interface ErrorBoundaryProps {
  /** Fallback UI to display when an error occurs */
  fallback: React.ReactNode;
  /** Optional children to render */
  children?: React.ReactNode;
}

/**
 * Error boundary component to catch and display errors in the component tree
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, { hasError: boolean }> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can log the error to an error reporting service here
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children ?? (<></>);
  }
}

export { ErrorBoundary };