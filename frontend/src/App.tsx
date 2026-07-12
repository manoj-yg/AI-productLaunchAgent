import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from "react-router-dom"
import {
  LayoutGrid,
  UploadCloud,
  FileText,
  CheckSquare,
  Sparkles,
  ShoppingBag,
  Settings,
  LogOut,
  User,
  ExternalLink
} from "lucide-react"
import { useLaunchStore } from "./store/useLaunchStore"
import { Button } from "./components/ui/button"

// Pages Import
import Landing from "./pages/Landing"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Products from "./pages/Products"
import HumanReview from "./pages/HumanReview"
import Reports from "./pages/Reports"
import SettingsPage from "./pages/Settings"
import DemoStore from "./pages/DemoStore"

// Protected Route Guard
function ProtectedRoute({ children }: { children: JSX.Element }) {
  const user = useLaunchStore((state) => state.user)
  if (!user.isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return children
}

// Main Sidebar Layout wrapper for authorized routes
function MainLayout() {
  const { user, logout } = useLaunchStore()
  const location = useLocation()

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
    { to: "/products", label: "Inventory Products", icon: ShoppingBag },
    { to: "/review", label: "Review Center", icon: CheckSquare },
    { to: "/reports", label: "Audit Reports", icon: FileText },
    { to: "/settings", label: "Custom Settings", icon: Settings },
    { to: "/store", label: "Demo Store", icon: ExternalLink }
  ]

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans">
      
      {/* Dynamic Light Sidebar */}
      <aside className="w-64 border-r border-slate-100 bg-white p-6 flex flex-col justify-between relative shadow-sm">
        <div className="space-y-8">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <span className="font-extrabold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              KiddyPi Launcher
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.to
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center space-x-3 px-3 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-white shadow-md shadow-primary/15"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* User profile bottom details */}
        <div className="border-t border-slate-100 pt-4 space-y-4">
          <div className="flex items-center space-x-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
              {user.username ? user.username.charAt(0) : "A"}
            </div>
            <div className="overflow-hidden">
              <span className="font-semibold text-xs text-slate-800 block truncate leading-tight">
                {user.username || "Alex Staff"}
              </span>
              <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider block mt-0.5">
                {user.role}
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-500/5 rounded-xl"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto bg-slate-50">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/review" element={<HumanReview />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/store" element={<DemoStore />} />
        
        {/* Protected Dashboard Wrapper routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}
