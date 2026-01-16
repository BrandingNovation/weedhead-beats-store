import React from 'react';
import ReactDOM from 'react-dom/client';
// import './index.css'; // Commented out - using Tailwind CDN
import App from './App';
import { FavoritesProvider } from './context/FavoritesContext';
import { PurchaseHistoryProvider } from './context/PurchaseHistoryContext';
import { ListeningHistoryProvider } from './context/ListeningHistoryContext';
import { DownloadHistoryProvider } from './context/DownloadHistoryContext';
import { CommentsProvider } from './context/CommentsContext';
import { PlaylistProvider } from './context/PlaylistContext';

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          color: '#fff',
          backgroundColor: '#000',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter, sans-serif'
        }}>
          <h1 style={{ color: '#0D5F11', fontSize: '2rem', marginBottom: '1rem' }}>
            ⚠️ Application Error
          </h1>
          <p style={{ color: '#94A6A5', marginBottom: '1rem' }}>
            Something went wrong. Please check the browser console for details.
          </p>
          {this.state.error && (
            <pre style={{
              backgroundColor: '#303D3C',
              padding: '1rem',
              borderRadius: '8px',
              color: '#fff',
              maxWidth: '800px',
              overflow: 'auto',
              fontSize: '0.875rem'
            }}>
              {this.state.error.toString()}
              {this.state.error.stack && (
                <div style={{ marginTop: '1rem', color: '#94A6A5' }}>
                  {this.state.error.stack}
                </div>
              )}
            </pre>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '2rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#0D5F11',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Initialize app with error handling
const rootElement = document.getElementById('root');
if (!rootElement) {
  document.body.innerHTML = `
    <div style="padding: 2rem; color: #fff; background: #000; min-height: 100vh; font-family: Inter, sans-serif;">
      <h1 style="color: #0D5F11;">Error: Root element not found</h1>
      <p style="color: #94A6A5;">Could not find #root element to mount React app.</p>
    </div>
  `;
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <FavoritesProvider>
            <PurchaseHistoryProvider>
              <ListeningHistoryProvider>
                <DownloadHistoryProvider>
                  <CommentsProvider>
                    <PlaylistProvider>
                      <App />
                    </PlaylistProvider>
                  </CommentsProvider>
                </DownloadHistoryProvider>
              </ListeningHistoryProvider>
            </PurchaseHistoryProvider>
          </FavoritesProvider>
        </ErrorBoundary>
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Failed to mount app:', error);
    rootElement.innerHTML = `
      <div style="padding: 2rem; color: #fff; background: #000; min-height: 100vh; font-family: Inter, sans-serif;">
        <h1 style="color: #0D5F11;">Failed to Load Application</h1>
        <p style="color: #94A6A5;">Error: ${error instanceof Error ? error.message : String(error)}</p>
        <p style="color: #94A6A5; margin-top: 1rem;">Please check the browser console (F12) for more details.</p>
        <button onclick="window.location.reload()" style="margin-top: 2rem; padding: 0.75rem 1.5rem; background: #0D5F11; color: #fff; border: none; border-radius: 8px; cursor: pointer;">
          Reload Page
        </button>
      </div>
    `;
  }
}