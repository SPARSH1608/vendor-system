import type React from "react"
import Navbar from "./Navbar"

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-20 p-6">{children}</main> {/* Adjusted padding to account for the fixed Navbar */}
    </div>
  )
}

export default Layout
