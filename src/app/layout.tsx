import type { Metadata } from "next";
import { IBM_Plex_Mono, Newsreader } from "next/font/google";
import "./globals.css";

const newsreader = Newsreader({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Metis LLC — AI Systems, Secure Compute & Cyber Resilience",
  description:
    "Metis LLC designs advanced AI systems, secure compute architectures, and public-sector technology strategies for healthcare and critical infrastructure. Based in Coral Gables, Florida.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${newsreader.variable} ${ibmPlexMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
