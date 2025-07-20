import type React from "react"
import Navbar from "./Navbar"

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-24 px-2 sm:px-6 w-screen">{children}</main>
    </div>
  )
}

export default Layout
