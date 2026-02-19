import type { Metadata } from "next"
import { Syne, JetBrains_Mono } from "next/font/google"
import "./globals.css"

const syne = Syne({ subsets: ["latin"], variable: "--font-syne" })
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const metadata: Metadata = {
  title: "Faultrix — Chaos Engineering Platform",
  description: "God-tier chaos engineering. Built different.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${syne.variable} ${mono.variable} dark bg-[#0a0a0f] text-[#e8e8f0] antialiased`}>
        {children}
      </body>
    </html>
  )
}
