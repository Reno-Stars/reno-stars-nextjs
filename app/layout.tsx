import type { Metadata } from "next";
import "./globals.css";
import { SITE_NAME } from '@/lib/utils';

export const metadata: Metadata = {
  title: `${SITE_NAME} - Where Renovation Starts`,
  description: "Professional renovation services in Vancouver and the Lower Mainland",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
