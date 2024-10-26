import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "Uncover it",
    template: "Uncover it| %s",
  },
  description:
    "Uncover the hidden malware, don't let it uncover you!",
  openGraph: {
    title: "Uncover it",
    description:
      "Uncover the hidden malware, don't let it uncover you!",
    url: "https://uncover.us.kg",
    siteName: "uncover.us.kg",
    images: [
      {
        url: "https://iili.io/2qkmLw7.md.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large" as const,
      "max-snippet": -1,
    },
  },
  twitter: {
    title: "Uncover it",
    card: "summary_large_image",
    description:
      "Uncover the hidden malware, don't let it uncover you!",
    images: [
      "https://iili.io/2qkmLw7.md.png",
    ],
  },
  icons: {
    shortcut: "/favicon.ico",
  },
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
