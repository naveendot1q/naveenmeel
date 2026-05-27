import type { Metadata, Viewport } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: { default: 'Naveen Meel — Network & Cloud Engineer', template: '%s | Naveen Meel' },
  description: 'Network Engineer at Airtel. Writing about Networking, Cloud, DevOps, Kubernetes, Terraform, and Basketball.',
  authors: [{ name: 'Naveen Meel' }],
  keywords: ['Naveen Meel', 'Network Engineer', 'Cloud', 'DevOps', 'MPLS', 'Airtel', 'Kubernetes'],
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Naveen.dev' },
  openGraph: { type: 'website', siteName: 'Naveen Meel', title: 'Naveen Meel | Network & Cloud Engineer' },
  icons: {
    icon: [{ url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#f9fafb',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Only load Inter + JetBrains Mono — subset to latin only for speed */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
