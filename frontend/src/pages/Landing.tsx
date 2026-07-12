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
    <div className="relative min-h-screen bg-[#030712] text-slate-100 overflow-hidden font-sans">
      
      {/* Background Glowing Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px]" />

      {/* Header */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-slate-900 bg-slate-950/20 backdrop-blur-md">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Launch AI
          </span>
        </div>
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-400">
          <a href="#pipeline" className="hover:text-slate-100 transition-colors">How it Works</a>
          <a href="#features" className="hover:text-slate-100 transition-colors">Features</a>
          <a href="#pricing" className="hover:text-slate-100 transition-colors">Pricing</a>
        </nav>
        <div className="flex items-center space-x-4">
          <Link to="/login">
            <Button variant="ghost" size="sm">Sign In</Button>
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
          className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-semibold"
        >
          <Cpu className="w-3.5 h-3.5 animate-spin" />
          <span>Next-Generation Product Publishing</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-tight max-w-4xl mx-auto"
        >
          Upload once.
          <span className="block bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
            AI publishes to Shopify.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto font-light leading-relaxed"
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
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              See the Pipeline
            </Button>
          </a>
        </motion.div>

        {/* Floating Demo App Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 50 }}
          className="pt-12 max-w-5xl mx-auto"
        >
          <div className="relative p-1.5 rounded-3xl bg-gradient-to-tr from-slate-900 via-slate-800 to-blue-500/20 border border-slate-800 shadow-2xl">
            <div className="bg-[#0b1329] rounded-[22px] overflow-hidden aspect-[16/9] flex items-center justify-center p-8 relative">
              
              {/* Fake dashboard structure */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent pointer-events-none" />
              
              <div className="w-full h-full flex flex-col justify-between text-left space-y-4">
                <div className="flex items-center justify-between border-b border-slate-900 pb-4">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="text-xs text-slate-500">pipeline-orchestration-dashboard.ai</div>
                </div>

                <div className="flex-1 grid grid-cols-12 gap-6 pt-4">
                  <div className="col-span-4 bg-slate-950/40 border border-slate-900/60 rounded-xl p-4 space-y-4">
                    <div className="w-full aspect-square rounded-lg bg-slate-900 flex items-center justify-center border border-dashed border-slate-800">
                      <ShoppingBag className="w-8 h-8 text-slate-700 animate-bounce" />
                    </div>
                    <div className="h-3 w-3/4 bg-slate-900 rounded" />
                    <div className="h-2 w-1/2 bg-slate-900 rounded" />
                  </div>
                  <div className="col-span-8 space-y-4">
                    <div className="flex items-center space-x-3 bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
                      <Cpu className="w-5 h-5 text-primary animate-pulse" />
                      <div className="text-xs">
                        <span className="font-semibold text-blue-400">Gemini Vision</span>: Analyzing product texture and features...
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-slate-950/60 rounded border border-slate-900" />
                      <div className="h-4 w-5/6 bg-slate-950/60 rounded border border-slate-900" />
                      <div className="h-4 w-2/3 bg-slate-950/60 rounded border border-slate-900" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Linear Pipeline Stages */}
      <section id="pipeline" className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-slate-900 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-5xl font-bold">Autopilot Launch Pipeline</h2>
          <p className="text-slate-400">Our structured lifecycle guarantees zero errors while moving rapidly from concept to live Shopify catalog items.</p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-8 md:grid-cols-4"
        >
          {[
            {
              step: "01",
              title: "Upload details",
              desc: "Provide basic product attributes and high-resolution catalog photos.",
              icon: UploadCloudIcon
            },
            {
              step: "02",
              title: "AI Analysis",
              desc: "Gemini Vision analyzes the product style, colors, and components.",
              icon: Cpu
            },
            {
              step: "03",
              title: "Description & SEO",
              desc: "AI constructs high-converting descriptions, meta details, and key tags.",
              icon: Sparkles
            },
            {
              step: "04",
              title: "Shopify Publish",
              desc: "Verify copy during a human approval step and launch seamlessly.",
              icon: ShoppingBag
            }
          ].map((s, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="glass-panel p-6 rounded-2xl space-y-4 relative border border-slate-800 bg-slate-950/20 backdrop-blur-md"
            >
              <div className="absolute top-4 right-4 text-3xl font-extrabold text-slate-800">{s.step}</div>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <s.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">{s.title}</h3>
              <p className="text-sm text-slate-400 font-light leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-slate-900 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-5xl font-bold">Robust Platform Features</h2>
          <p className="text-slate-400">Everything needed to orchestrate brand launches with zero developer resource dependencies.</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Vivid Ad Campaigns",
              desc: "Instant generation of Instagram/Facebook headlines, captions, and Google Search campaigns.",
              icon: Zap
            },
            {
              title: "Content Safety Engine",
              desc: "AI-driven check matches terms and spelling against Shopify policies before submitting.",
              icon: ShieldCheck
            },
            {
              title: "Diffusion Backdrop Prompts",
              desc: "Generates creative lighting and studio prompts for diffusion photo replacement tools.",
              icon: Globe
            }
          ].map((f, i) => (
            <div key={i} className="glass-panel p-6 rounded-2xl border border-slate-900 hover:border-slate-800 transition-colors space-y-3">
              <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400">
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="text-sm text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900 py-12 text-center text-xs text-slate-600 bg-slate-950/40">
        <p>© 2026 Launch AI Platform. All rights reserved.</p>
      </footer>
    </div>
  )
}

function UploadCloudIcon(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
      />
    </svg>
  )
}
