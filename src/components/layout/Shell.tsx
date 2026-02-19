import Sidebar from "./Sidebar"
import Topbar from "./Topbar"

export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Background ambiance */}
      <div className="orb orb-purple" />
      <div className="orb orb-blue" />
      <div className="grid-bg fixed inset-0 pointer-events-none z-0" />

      <Sidebar />
      <div className="ml-56 relative z-10 flex flex-col min-h-screen">
        <Topbar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
