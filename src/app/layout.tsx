// app/layout.tsx (Enhanced for mobile viewport issues)
import './globals.css'
import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Basket Catching Quiz Game',
  description: 'A fun educational game where you catch falling fruits with correct answers',
  keywords: 'game, quiz, education, mobile, responsive, basket, catching, fruits',
  authors: [{ name: 'Your Name' }],
  creator: 'Your Name',
  publisher: 'Your Name',
  robots: 'index, follow',
  openGraph: {
    title: 'Basket Catching Quiz Game',
    description: 'A fun educational game where you catch falling fruits with correct answers',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Basket Catching Quiz Game',
    description: 'A fun educational game where you catch falling fruits with correct answers',
  },
}

// ENHANCED viewport configuration for mobile rendering issues
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content', // Handles soft keyboard better
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#667eea' },
    { media: '(prefers-color-scheme: dark)', color: '#4facfe' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Critical mobile viewport fixes */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Basket Game" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-TileColor" content="#667eea" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* Additional mobile fixes */}
        <meta name="screen-orientation" content="portrait" />
        <meta name="x5-orientation" content="portrait" />
        <meta name="full-screen" content="yes" />
        <meta name="x5-fullscreen" content="true" />
        <meta name="browsermode" content="application" />
        
        {/* Prevent zoom on input focus */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, viewport-fit=cover, interactive-widget=resizes-content" />
        
        {/* Preconnect to fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Critical CSS for preventing layout shift */}
        <style dangerouslySetInnerHTML={{
          __html: `
            html {
              height: 100%;
              height: -webkit-fill-available;
              overflow-x: hidden;
              box-sizing: border-box;
            }
            body {
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
              height: -webkit-fill-available;
              overflow-x: hidden;
              position: fixed;
              top: 0;
              left: 0;
              box-sizing: border-box;
              touch-action: manipulation;
            }
            *, *:before, *:after {
              box-sizing: border-box;
            }
            #__next {
              height: 100%;
              height: -webkit-fill-available;
              overflow-x: hidden;
            }
          `
        }} />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
