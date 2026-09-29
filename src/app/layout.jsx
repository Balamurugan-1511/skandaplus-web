import React from 'react';
import '../styles/index.css';
import '../styles/tailwind.css';
import Chatbot from '../components/Chatbot';
export const viewport = {
  width: 'device-width',
  initialScale: 1,
};
export const metadata = {
  title: 'AI Plus Pune | AI & IT Training Institute',
  description:
    "AI Plus is Pune's premier AI and IT training institute offering career-focused courses with hands-on training, expert mentors, and placement support.",
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        type: 'image/x-icon',
      },
      {
        url: '/icon.png',
        type: 'image/png',
        sizes: '512x512',
      },
    ],
    apple: [
      {
        url: '/apple-icon.png',
        type: 'image/png',
        sizes: '180x180',
      },
    ],
  },
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lexend+Deca:wght@300;400;500;600;700;800&family=Hind:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />

        <script
          type="module"
          async
          src="https://static.rocket.new/rocket-web.js?_cfg=https%3A%2F%2Fskandaplus7814back.builtwithrocket.new&_be=https%3A%2F%2Fappanalytics.rocket.new&_v=0.1.19"
        />
        <script type="module" defer src="https://static.rocket.new/rocket-shot.js?v=0.0.2" />
      </head>
      <body>
        {children}
        <Chatbot />
      </body>
    </html>
  );
}
