import React from 'react';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Chart as ChartJS, registerables } from 'chart.js';
import './index.css'
import App from './App.jsx'

// Robust Chart.js Registration
ChartJS.register(...registerables);

const ErrorFallback = ({ error }) => (
  <div style={{ padding: '40px', color: '#ff4d4d', background: '#0a0e17', height: '100vh', fontFamily: 'monospace' }}>
    <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>⚠️ System Crash Detected</h1>
    <div style={{ background: '#161b22', padding: '20px', borderRadius: '8px', border: '1px solid #f85149', marginBottom: '20px' }}>
      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{error.toString()}</pre>
    </div>
    <button
      onClick={() => window.location.reload()}
      style={{ background: '#007aff', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}
    >
      Reload Platform
    </button>
  </div>
);

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { console.error("Crash Info:", error, errorInfo); }
  render() {
    if (this.state.hasError) return <ErrorFallback error={this.state.error} />;
    return (
      <StrictMode>
        {this.props.children}
      </StrictMode>
    );
  }
}

createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
)
