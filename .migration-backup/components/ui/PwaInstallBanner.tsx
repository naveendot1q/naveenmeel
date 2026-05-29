'use client';

import { useState, useEffect } from 'react';

export default function PwaInstallBanner() {
  const [prompt, setPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    function handler(e: Event) {
      e.preventDefault();
      setPrompt(e);
      const dismissed = localStorage.getItem('pwa_dismissed');
      if (!dismissed) setShow(true);
    }
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function install() {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setShow(false);
  }

  function dismiss() {
    setShow(false);
    localStorage.setItem('pwa_dismissed', '1');
  }

  if (!show) return null;

  return (
    <div className="pwa-banner">
      <div className="text-2xl">📱</div>
      <div className="flex-1 min-w-0">
        <p className="font-display font-bold text-sm" style={{ color: '#e6edf3' }}>
          Install NM.DEV Blog
        </p>
        <p className="text-xs mt-0.5" style={{ color: '#8b949e' }}>
          Add to home screen for offline reading & quick access
        </p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button onClick={dismiss} className="btn btn-outline text-xs py-1.5 px-3">Later</button>
        <button onClick={install} className="btn btn-primary text-xs py-1.5 px-3">Install</button>
      </div>
    </div>
  );
}
