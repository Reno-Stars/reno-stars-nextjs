import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reno Stars - Where Renovation Starts",
  description: "Professional renovation services in Vancouver and the Lower Mainland",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
