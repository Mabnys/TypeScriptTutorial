import './globals.css'
import { Inter } from 'next/font/google'
import { Metadata } from 'next' // Import Metadata type for better type checking

// Initialize the Inter font
const inter = Inter({ subsets: ['latin'] })

// Define metadata for the app
export const metadata: Metadata = {
  title: 'NYS ITS App Management',
  description: 'App management system for NYS ITS',
}

// Root layout component
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Main content will be injected here */}
        {children}
        
        {/* Removed commented-out script tag */}
      </body>
    </html>
  )
}
