"use client";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import Header from "./components/Header";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/ReactToastify.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// export const metadata: Metadata = {
//   title: "Task Buddy",
//   description: "Manage your todo-s and boost the Productivity",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <SessionProvider>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Header />
          <ToastContainer
            theme="dark"
            className={"capitalize"}
            autoClose={2000}
            closeOnClick
          />
          {children}
        </body>
      </SessionProvider>
    </html>
  );
}
