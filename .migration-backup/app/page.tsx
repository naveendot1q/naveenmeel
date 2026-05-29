'use client';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0d1117' }}>
      <div className="text-center">
        <div className="text-6xl mb-6">📡</div>
        <h1 className="font-display font-bold text-2xl mb-3" style={{ color: '#e6edf3' }}>
          You're Offline
        </h1>
        <p className="text-sm mb-6" style={{ color: '#8b949e' }}>
          No internet connection. Check your network and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-primary"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
