import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Basket Catching Quiz Game",
  description: "A fun educational game where you catch falling fruits with the correct answers! Test your knowledge while improving your reflexes.",
  keywords: ["game", "quiz", "educational", "kids", "learning", "react", "nextjs"],
  authors: [{ name: "Your Name" }],
  robots: "index, follow",
  openGraph: {
    title: "Basket Catching Quiz Game",
    description: "A fun educational game where you catch falling fruits with the correct answers!",
    type: "website",
    // Add your domain when you deploy
    // url: "https://yourdomain.com",
    // images: [{ url: "https://yourdomain.com/og-image.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Basket Catching Quiz Game",
    description: "A fun educational game where you catch falling fruits with the correct answers!",
    // images: ["https://yourdomain.com/twitter-image.png"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1.0,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}