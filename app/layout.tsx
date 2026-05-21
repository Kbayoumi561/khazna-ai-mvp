import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "sonner"

export const metadata: Metadata = {
  title: "Khazna Analytics",
  description: "AI-Powered Customer Support Analytics",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'hsl(222, 35%, 9%)',
              border: '1px solid hsl(220, 18%, 16%)',
              color: 'hsl(210, 30%, 94%)',
              fontFamily: "'Sora', sans-serif",
              fontSize: '13px',
            },
          }}
        />
      </body>
    </html>
  )
}
