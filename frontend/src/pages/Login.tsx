import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Sparkles, Key, User } from "lucide-react"
import { useLaunchStore } from "../store/useLaunchStore"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"

export default function Login() {
  const [username, setUsername] = useState("")
  const login = useLaunchStore((state) => state.login)
  const navigate = useNavigate()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) return
    login(username)
    navigate("/")
  }

  return (
    <div className="relative min-h-screen bg-[#020617] flex items-center justify-center p-6 overflow-hidden">
      
      {/* Background Glowing Blobs */}
      <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] bg-indigo-500/25 rounded-full blur-[90px] animate-pulse" />

      {/* Decorative floating shapes */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute top-20 left-20 w-12 h-12 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-2xl rotate-12 opacity-30 blur-[1px]"
      />
      <motion.div
        animate={{ y: [0, 15, 0], rotate: [0, 360] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute bottom-20 right-20 w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-500 rounded-full opacity-20 blur-[1px]"
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="w-full max-w-md relative z-10"
      >
        
        {/* Logo */}
        <div className="flex flex-col items-center space-y-2 mb-8">
          <Link to="/" className="flex items-center space-x-2">
            <div className="p-2.5 bg-primary/10 rounded-2xl">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <span className="font-extrabold text-2xl bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Launch AI
            </span>
          </Link>
          <p className="text-xs text-slate-500 font-medium">Production-Ready Publishing Client</p>
        </div>

        {/* Login Card */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 bg-slate-950/40 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
          
          <h2 className="text-xl font-bold text-center text-slate-100 mb-2">Welcome Back</h2>
          <p className="text-xs text-slate-500 text-center mb-8">Enter your reviewer details to access the workspace</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                User Profile Identifier
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-slate-600">
                  <User className="w-4 h-4" />
                </span>
                <Input
                  required
                  type="text"
                  placeholder="e.g. Alex Staff"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Security Passcode
                </label>
                <span className="text-[10px] text-slate-600">Optional for scaffolding demo</span>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-slate-600">
                  <Key className="w-4 h-4" />
                </span>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  disabled
                />
              </div>
            </div>

            <Button type="submit" variant="glow" className="w-full mt-4 h-11">
              Authenticate Profile
            </Button>
          </form>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            ← Back to product introduction
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
