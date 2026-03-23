import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "react-hot-toast"
import Chatbot from "@/components/Chatbot"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CollegeSocial",
  description: "Your college community hub – follow clubs, see events, chat with AI",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Toaster position="top-right" />
        {children}
        <Chatbot />
      </body>
    </html>
  )
}
