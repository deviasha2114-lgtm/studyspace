import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import { useEffect } from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'StudySpace',
  description: 'The ultimate learning community platform',
  icons: [
    {
      url: '/icons/icon-144x144.png',
      type: 'image/png',
      sizes: '144x144'
    },
    {
      url: '/icons/icon-192x192.png',
      type: 'image/png',
      sizes: '192x192'
    },
    {
      url: '/icons/icon-512x512.png',
      type: 'image/png',
      sizes: '512x512'
    }
  ],
  manifest: '/manifest.webmanifest',
  openGraph: {
    title: 'StudySpace - Learn Together, Grow Together',
    description: 'Join StudySpace to connect with classmates, join study groups, share resources, and ace your exams together.',
    url: 'https://studyspace.example.com',
    siteName: 'StudySpace',
    images: [
      {
        url: '/assets/og-image.png',
        width: 1200,
        height: 630,
        alt: 'StudySpace - Collaborative Learning Platform'
      }
    ],
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StudySpace - Learn Together, Grow Together',
    description: 'Join StudySpace to connect with classmates, join study groups, share resources, and ace your exams together.',
    images: ['/assets/og-image.png']
  }
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Apply theme from localStorage on client side
  useEffect(() => {
    const applyTheme = () => {
      const themePreference = localStorage.getItem('themePreference') || 'SYSTEM';
      let isDark = false;

      if (themePreference === 'DARK') {
        isDark = true;
      } else if (themePreference === 'LIGHT') {
        isDark = false;
      } else if (themePreference === 'SYSTEM') {
        // Check system preference
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    // Run on initial load
    if (typeof window !== 'undefined') {
      applyTheme();

      // Listen for changes to theme preference in localStorage (from other tabs)
      window.addEventListener('storage', (e) => {
        if (e.key === 'themePreference') {
          applyTheme();
        }
      });

      // Also listen for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleSystemThemeChange = (e: MediaQueryListEvent) => {
        if (localStorage.getItem('themePreference') === 'SYSTEM') {
          if (e.matches) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      };
      mediaQuery.addEventListener('change', handleSystemThemeChange);

      // Register service worker for PWA functionality
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/service-worker.js')
            .then((registration) => {
              console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch((error) => {
              console.log('ServiceWorker registration failed: ', error);
            });
        });
      }

      return () => {
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
      };
    }
  }, []);

  return (
    <html lang="en" className={inter.className}>
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
