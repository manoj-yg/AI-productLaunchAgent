import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search, Filter, ShoppingBag, Star, Tag, Eye, CheckCircle,
  Clock, AlertTriangle, Image, Sparkles, ArrowRight, TrendingUp, FileText
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useLaunchStore, WorkflowState, LaunchWorkflow } from "../store/useLaunchStore"
import { Card, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import PipelineProgress from "../components/ui/PipelineProgress"

const CATEGORY_COLORS: Record<string, string> = {
  "Programming Courses": "bg-blue-50 text-blue-700 border-blue-100",
  "Robotics Kits": "bg-violet-50 text-violet-700 border-violet-100",
  "STEM Kits": "bg-teal-50 text-teal-700 border-teal-100",
  "Arduino Courses": "bg-orange-50 text-orange-700 border-orange-100",
  "Python Courses": "bg-green-50 text-green-700 border-green-100",
  "Scratch Programming": "bg-yellow-50 text-yellow-700 border-yellow-100",
  "Electronics Courses": "bg-pink-50 text-pink-700 border-pink-100",
  "Raspberry Pi": "bg-red-50 text-red-700 border-red-100",
  "Digital Worksheets": "bg-cyan-50 text-cyan-700 border-cyan-100",
  "Books": "bg-amber-50 text-amber-700 border-amber-100",
  "Flashcards": "bg-indigo-50 text-indigo-700 border-indigo-100",
}

const STATE_BADGE: Partial<Record<WorkflowState, { label: string; icon: any; color: string }>> = {
  COMPLETED: { label: "Live in Catalog", icon: CheckCircle, color: "text-green-600 bg-green-50" },
  APPROVED:  { label: "Approved",         icon: CheckCircle, color: "text-emerald-600 bg-emerald-50" },
  VALIDATED: { label: "Needs Review",     icon: AlertTriangle, color: "text-amber-600 bg-amber-50" },
  FAILED:    { label: "Failed",            icon: AlertTriangle, color: "text-red-600 bg-red-50" },
}

const FILTERS = ["All", "Live", "Needs Review", "In Progress", "Failed"]

function getFilterMatch(wf: LaunchWorkflow, filter: string) {
  if (filter === "All") return true
  if (filter === "Live") return wf.state === "COMPLETED" || wf.state === "PUBLISHED"
  if (filter === "Needs Review") return wf.state === "VALIDATED"
  if (filter === "In Progress") return !["COMPLETED","PUBLISHED","VALIDATED","FAILED","UPLOADED"].includes(wf.state)
  if (filter === "Failed") return wf.state === "FAILED"
  return true
}

export default function Products() {
  const navigate = useNavigate()
  const { workflows } = useLaunchStore()
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("All")
  const [selectedCategory, setSelectedCategory] = useState("All")

  const categories = ["All", ...Array.from(new Set(workflows.map(w => w.productDetails.category)))]

  const filtered = workflows.filter((wf) => {
    const matchSearch = !search ||
      wf.productDetails.title.toLowerCase().includes(search.toLowerCase()) ||
      wf.productDetails.category.toLowerCase().includes(search.toLowerCase()) ||
      wf.generatedDescription?.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
    const matchFilter = getFilterMatch(wf, filter)
    const matchCat = selectedCategory === "All" || wf.productDetails.category === selectedCategory
    return matchSearch && matchFilter && matchCat
  })

  // Stats
  const liveCount = workflows.filter(w => w.state === "COMPLETED" || w.state === "PUBLISHED").length
  const reviewCount = workflows.filter(w => w.state === "VALIDATED").length
  const totalRevenue = workflows
    .filter(w => w.state === "COMPLETED")
    .reduce((sum, w) => sum + w.productDetails.price, 0)

  return (
    <div className="space-y-8 font-sans max-w-7xl mx-auto pb-12">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-primary uppercase tracking-widest block">Local Catalog</span>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Product Library</h1>
          <p className="text-sm text-slate-500 mt-1">All products processed by the AI launch pipeline</p>
        </div>
        <Button variant="glow" onClick={() => navigate("/")}>
          <Sparkles className="w-4 h-4 mr-1.5" />
          Launch New Product
        </Button>
      </div>

      {/* ── Catalog Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Products", value: workflows.length, icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Live in Catalog", value: liveCount, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
          { label: "Needs Review", value: reviewCount, icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Catalog Revenue", value: `$${totalRevenue.toFixed(0)}`, icon: TrendingUp, color: "text-violet-600", bg: "bg-violet-50" },
        ].map((s) => (
          <Card key={s.label} className="bg-white border border-slate-100 shadow-sm">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{s.label}</p>
                  <p className="text-2xl font-extrabold text-slate-900">{s.value}</p>
                </div>
                <div className={`w-9 h-9 ${s.bg} rounded-lg flex items-center justify-center`}>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by name, category, or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 border-slate-200"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === f ? "bg-primary text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {categories.slice(0, 5).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedCategory === cat ? "bg-slate-800 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Product Grid ── */}
      {filtered.length === 0 ? (
        <Card className="bg-white border border-slate-100 shadow-sm">
          <CardContent className="py-20 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">No products found</h3>
            <p className="text-sm text-slate-400">Try adjusting your filters or launch a new product</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filtered.map((wf) => {
              const catColor = CATEGORY_COLORS[wf.productDetails.category] || "bg-slate-50 text-slate-700 border-slate-100"
              const stateBadge = STATE_BADGE[wf.state]
              const isLive = wf.state === "COMPLETED" || wf.state === "PUBLISHED"

              return (
                <motion.div
                  key={wf.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="bg-white border border-slate-100 shadow-sm hover:shadow-lg transition-all overflow-hidden h-full flex flex-col">

                    {/* Product image */}
                    <div className="relative aspect-[16/9] bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
                      {wf.productDetails.images[0] ? (
                        <img
                          src={wf.productDetails.images[0]}
                          alt={wf.productDetails.title}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80" }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Image className="w-10 h-10 text-slate-300" />
                        </div>
                      )}

                      {/* Live badge overlay */}
                      {isLive && (
                        <div className="absolute top-3 left-3">
                          <span className="flex items-center gap-1 px-2 py-1 bg-green-500 text-white text-[10px] font-bold rounded-full shadow">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            LIVE
                          </span>
                        </div>
                      )}

                      {/* Price tag */}
                      <div className="absolute top-3 right-3">
                        <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-slate-900 text-xs font-bold rounded-full shadow border border-slate-100">
                          ${wf.productDetails.price.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <CardContent className="pt-4 pb-5 flex-1 flex flex-col space-y-3">
                      {/* Category */}
                      <span className={`self-start text-[10px] font-bold px-2 py-0.5 rounded-full border ${catColor}`}>
                        {wf.productDetails.category}
                      </span>

                      {/* Title */}
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm leading-tight line-clamp-2">
                          {wf.generatedDescription?.title || wf.productDetails.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {wf.productDetails.targetAudience}
                        </p>
                      </div>

                      {/* AI-generated description */}
                      {wf.generatedDescription?.seoDescription && (
                        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed flex-1">
                          {wf.generatedDescription.seoDescription}
                        </p>
                      )}

                      {/* Tags */}
                      {wf.generatedDescription?.tags && wf.generatedDescription.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {wf.generatedDescription.tags.slice(0, 4).map((tag, i) => (
                            <span key={i} className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                              <Tag className="w-2.5 h-2.5" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Pipeline progress */}
                      {!isLive && <PipelineProgress state={wf.state} compact />}

                      {/* Image analysis badge */}
                      {wf.imageAnalysis && (
                        <div className="text-[10px] text-slate-500 bg-slate-50 rounded-lg p-2 border border-slate-100">
                          <span className="font-semibold text-slate-700">AI Analysis: </span>
                          {wf.imageAnalysis.rawSummary.substring(0, 80)}...
                        </div>
                      )}

                      {/* Marketing snippet */}
                      {wf.marketingContent?.socialCopy?.instagram && (
                        <div className="text-[10px] bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-2 border border-pink-100">
                          <span className="font-semibold text-pink-700">📸 Instagram: </span>
                          <span className="text-slate-600">{wf.marketingContent.socialCopy.instagram.substring(0, 60)}...</span>
                        </div>
                      )}

                      {/* State badge + action */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-50">
                        {stateBadge ? (
                          <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full ${stateBadge.color}`}>
                            <stateBadge.icon className="w-3 h-3" />
                            {stateBadge.label}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium">{wf.state.replace(/_/g, " ")}</span>
                        )}

                        <div className="flex items-center gap-1.5">
                          {!["UPLOADED", "ANALYZING", "ANALYZED", "GENERATING_DESC"].includes(wf.state) && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs px-2.5 border-slate-200 bg-blue-50/50 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                              onClick={() => {
                                useLaunchStore.setState({ activeWorkflowId: wf.id })
                                navigate("/reports")
                              }}
                            >
                              <FileText className="w-3 h-3 mr-1" />
                              Report
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs px-3 border-slate-200"
                            onClick={() => {
                              useLaunchStore.setState({ activeWorkflowId: wf.id })
                              navigate("/review")
                            }}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            {wf.state === "VALIDATED" ? "Review" : "Details"}
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
