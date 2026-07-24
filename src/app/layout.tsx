import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Flipping Portfolio",
  description: "Gestión de inversiones inmobiliarias",
}

export const viewport = {
  themeColor: "#1B7B4C",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${geistSans.variable} h-full`}>
      <body className="min-h-full">
        {children}
      </body>
    </html>
  )
}
