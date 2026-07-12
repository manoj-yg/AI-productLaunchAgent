import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Sparkles, ArrowRight, Zap, ShieldCheck, ShoppingBag, Globe, Cpu } from "lucide-react"
import { Button } from "../components/ui/button"

export default function Landing() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  }

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-800 overflow-hidden font-sans">
      
      {/* Background Glowing Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[120px]" />

      {/* Header */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-slate-100 bg-white/60 backdrop-blur-md">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            KiddyPi Launcher
          </span>
        </div>
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
          <a href="#pipeline" className="hover:text-slate-900 transition-colors">How it Works</a>
          <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
          <a href="#pricing" className="hover:text-slate-900 transition-colors">Pricing</a>
        </nav>
        <div className="flex items-center space-x-4">
          <Link to="/login">
            <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100/50">Sign In</Button>
          </Link>
          <Link to="/login">
            <Button variant="glow" size="sm" className="hidden sm:inline-flex">Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-24 text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-600 text-xs font-semibold"
        >
          <Cpu className="w-3.5 h-3.5 animate-spin" />
          <span>Next-Generation Product Publishing</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-tight max-w-4xl mx-auto text-slate-950"
        >
          Upload once.
          <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
            AI publishes to Shopify.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-slate-500 text-lg sm:text-xl max-w-2xl mx-auto font-light leading-relaxed"
        >
          An automated intelligence agent that visualizes your products, writes optimized copy, constructs marketing materials, self-validates policies, and launches to Shopify in seconds.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
        >
          <Link to="/login">
            <Button variant="glow" size="lg" className="w-full sm:w-auto flex items-center space-x-2">
              <span>Start Free Trial</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <a href="#pipeline">
            <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900">
              Watch Demo
            </Button>
          </a>
        </motion.div>
      </section>

      {/* Feature Icons grid */}
      <section id="pipeline" className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-slate-100">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-3xl font-bold text-slate-900">Automatic Publishing Pipeline</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">Six autonomous AI agents working in sequence to package and publish your educational catalog items.</p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid gap-6 md:grid-cols-3"
        >
          {[
            { title: "1. Intake & Check", desc: "Data normalized, tags lowercase format, prerequisites sorted, images uploaded to Firebase.", icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
            { title: "2. Visual Insights", desc: "Gemini Vision inspects images, mapping materials, style keywords, and design styles.", icon: Globe, color: "text-indigo-600", bg: "bg-indigo-50" },
            { title: "3. Copy Generation", desc: "Copywriter generates titles, short hooks, faq items, modules, and specifications.", icon: Zap, color: "text-violet-600", bg: "bg-violet-50" },
            { title: "4. Marketing Media", desc: "Social captions, newsletter layout copy, WhatsApp promotions, and headlines created.", icon: Sparkles, color: "text-pink-600", bg: "bg-pink-50" },
            { title: "5. Visual Prompts", desc: "Imagen prompts for website banners, hero posters, and course covers prepared.", icon: Cpu, color: "text-amber-600", bg: "bg-amber-50" },
            { title: "6. Compliance Audit", desc: "Validation check parses guidelines alignment and score evaluation reports.", icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
          ].map((feat, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="p-6 bg-white border border-slate-100 rounded-3xl space-y-4 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-300 group"
            >
              <div className={`p-3 rounded-2xl w-fit ${feat.bg} ${feat.color} group-hover:scale-110 transition-transform`}>
                <feat.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">{feat.title}</h3>
              <p className="text-slate-500 text-sm font-light leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Footer banner */}
      <footer className="bg-white border-t border-slate-100 py-8 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400 font-semibold uppercase tracking-wider">
          <span>© 2026 Subhanu Technologies. All rights reserved.</span>
          <span>Automating KiddyPi Storefront Launches.</span>
        </div>
      </footer>
    </div>
  )
}
