import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sparkles, Plus, CheckCircle, FileText, Clock, ArrowRight,
  TrendingUp, ShoppingBag, AlertTriangle, Upload, X, Image,
  Play, Eye, Trash2, Search, RefreshCw
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useLaunchStore, WorkflowState } from "../store/useLaunchStore"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Select } from "../components/ui/select"
import { Badge } from "../components/ui/badge"
import PipelineProgress from "../components/ui/PipelineProgress"

// ─── State badge helper ──────────────────────────────────────────────────────
const STATE_CONFIG: Record<WorkflowState, { label: string; color: string }> = {
  UPLOADED:          { label: "Uploaded",          color: "bg-slate-100 text-slate-700" },
  ANALYZING:         { label: "Analyzing...",       color: "bg-blue-100 text-blue-700" },
  ANALYZED:          { label: "Analyzed",           color: "bg-blue-100 text-blue-700" },
  GENERATING_DESC:   { label: "Writing Copy...",    color: "bg-violet-100 text-violet-700" },
  DESC_GENERATED:    { label: "Copy Ready",         color: "bg-violet-100 text-violet-700" },
  GENERATING_MKTG:   { label: "Marketing...",       color: "bg-pink-100 text-pink-700" },
  MKTG_GENERATED:    { label: "Marketing Ready",    color: "bg-pink-100 text-pink-700" },
  GENERATING_PROMPTS:{ label: "Prompts...",         color: "bg-amber-100 text-amber-700" },
  PROMPTS_GENERATED: { label: "Prompts Ready",      color: "bg-amber-100 text-amber-700" },
  VALIDATING:        { label: "Validating...",      color: "bg-orange-100 text-orange-700" },
  VALIDATED:         { label: "Awaiting Review",    color: "bg-yellow-100 text-yellow-700" },
  APPROVED:          { label: "Approved",           color: "bg-emerald-100 text-emerald-700" },
  REJECTED:          { label: "Rejected",           color: "bg-red-100 text-red-700" },
  PUBLISHING:        { label: "Publishing...",      color: "bg-teal-100 text-teal-700" },
  PUBLISHED:         { label: "Published",          color: "bg-green-100 text-green-700" },
  VERIFYING:         { label: "Verifying...",       color: "bg-cyan-100 text-cyan-700" },
  COMPLETED:         { label: "Live in Catalog",    color: "bg-green-100 text-green-700" },
  FAILED:            { label: "Failed",             color: "bg-red-100 text-red-700" },
}

const isPipelineRunning = (state: WorkflowState) =>
  ["ANALYZING","GENERATING_DESC","GENERATING_MKTG","GENERATING_PROMPTS","VALIDATING",
   "PUBLISHING","VERIFYING"].includes(state)

export default function Dashboard() {
  const navigate = useNavigate()
  const { workflows, addWorkflow, runAIPipeline, deleteWorkflow, fetchWorkflows, loading, error, publishProduct } = useLaunchStore()

  // Modal form state
  const [isOpen, setIsOpen] = useState(false)
  const [productName, setProductName] = useState("")
  const [category, setCategory] = useState("Programming Courses")
  const [ageGroup, setAgeGroup] = useState("8-12 years")
  const [difficulty, setDifficulty] = useState("Beginner")
  const [price, setPrice] = useState("49.99")
  const [language, setLanguage] = useState("English")
  const [duration, setDuration] = useState("10 hours")
  const [tags, setTags] = useState("")
  const [learningOutcomes, setLearningOutcomes] = useState("")
  const [prerequisites, setPrerequisites] = useState("")
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [activeRunId, setActiveRunId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { fetchWorkflows() }, [])

  // Statistics
  const totalLaunches = workflows.length
  const completedLaunches = workflows.filter((w) => w.state === "COMPLETED").length
  const inProgressLaunches = workflows.filter((w) => isPipelineRunning(w.state)).length
  const reviewRequired = workflows.filter((w) => w.state === "VALIDATED").length

  // Filtered workflows
  const filteredWorkflows = workflows.filter((w) =>
    !searchQuery || w.productDetails.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.productDetails.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Image file handler
  const handleFileSelect = (files: FileList | null) => {
    if (!files) return
    const newFiles = Array.from(files).slice(0, 5)
    setImageFiles(prev => [...prev, ...newFiles].slice(0, 5))
    newFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => setImagePreviews(prev => [...prev, e.target?.result as string].slice(0, 5))
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (idx: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== idx))
    setImagePreviews(prev => prev.filter((_, i) => i !== idx))
  }

  const resetForm = () => {
    setProductName(""); setCategory("Programming Courses"); setAgeGroup("8-12 years")
    setDifficulty("Beginner"); setPrice("49.99"); setLanguage("English")
    setDuration("10 hours"); setTags(""); setLearningOutcomes(""); setPrerequisites("")
    setImageFiles([]); setImagePreviews([]); setNotes("")
  }

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!productName.trim()) return
    setSubmitting(true)

    try {
      const tagsList = tags.split(",").map((t) => t.trim()).filter(Boolean)
      const details = {
        title: productName,
        rawDescription: notes,
        category,
        targetAudience: ageGroup,
        price: parseFloat(price) || 0,
        sku: `KP-${category.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
        images: []
      }

      const id = await addWorkflow(details, imageFiles.length > 0 ? imageFiles : undefined)
      setIsOpen(false)
      resetForm()

      // Auto-run the AI pipeline
      setActiveRunId(id)
      await runAIPipeline(id)
      setActiveRunId(null)
    } catch (err) {
      console.error("Launch error:", err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleRunPipeline = async (id: string) => {
    setActiveRunId(id)
    await runAIPipeline(id)
    setActiveRunId(null)
  }

  return (
    <div className="space-y-8 font-sans max-w-7xl mx-auto pb-12">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-primary uppercase tracking-widest block">KiddyPi Platform</span>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Product Launch Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">AI-powered product catalog automation for Subhanu Technologies</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-slate-200 text-slate-600" onClick={() => fetchWorkflows()}>
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Refresh
          </Button>
          <Button variant="glow" className="shadow-lg" onClick={() => setIsOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            New Product Launch
          </Button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Products", value: totalLaunches, icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Completed", value: completedLaunches, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
          { label: "AI Processing", value: inProgressLaunches, icon: Sparkles, color: "text-violet-600", bg: "bg-violet-50" },
          { label: "Needs Review", value: reviewRequired, icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
        ].map((kpi) => (
          <Card key={kpi.label} className="bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{kpi.label}</p>
                  <p className="text-3xl font-extrabold text-slate-900 mt-1">{kpi.value}</p>
                </div>
                <div className={`w-11 h-11 ${kpi.bg} rounded-xl flex items-center justify-center`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Error Banner ── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"
          >
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Product Workflow List ── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-800">All Products</h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 border-slate-200"
            />
          </div>
        </div>

        {filteredWorkflows.length === 0 ? (
          <Card className="bg-white border border-slate-100 shadow-sm">
            <CardContent className="py-16 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">No products yet</h3>
              <p className="text-sm text-slate-500 max-w-sm mb-6">
                Click "New Product Launch" to upload your first product and let our AI agents generate all the content for you.
              </p>
              <Button variant="glow" onClick={() => setIsOpen(true)}>
                <Plus className="w-4 h-4 mr-1.5" />
                Launch First Product
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {filteredWorkflows.map((wf) => {
              const cfg = STATE_CONFIG[wf.state] || STATE_CONFIG.UPLOADED
              const isRunning = isPipelineRunning(wf.state) || activeRunId === wf.id
              return (
                <motion.div
                  key={wf.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
                    <div className="flex">
                      {/* Product image */}
                      <div className="w-28 sm:w-36 flex-shrink-0 bg-slate-50 relative overflow-hidden">
                        {wf.productDetails.images[0] ? (
                          <img
                            src={wf.productDetails.images[0]}
                            alt={wf.productDetails.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Image className="w-8 h-8 text-slate-300" />
                          </div>
                        )}
                        {isRunning && (
                          <div className="absolute inset-0 bg-blue-600/10 flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-4 min-w-0 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-bold text-slate-900 text-sm truncate">{wf.productDetails.title}</h3>
                            <p className="text-xs text-slate-500">{wf.productDetails.category} · {wf.productDetails.targetAudience}</p>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 ${cfg.color}`}>
                            {cfg.label}
                          </span>
                        </div>

                        {/* Pipeline progress bar */}
                        <PipelineProgress state={wf.state} compact />

                        {/* AI-generated preview */}
                        {wf.generatedDescription && (
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {wf.generatedDescription.seoDescription || wf.generatedDescription.descriptionHtml?.replace(/<[^>]+>/g, "").substring(0, 120)}
                          </p>
                        )}

                        {/* Tags */}
                        {wf.generatedDescription?.tags && wf.generatedDescription.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {wf.generatedDescription.tags.slice(0, 3).map((tag, i) => (
                              <span key={i} className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-full">{tag}</span>
                            ))}
                            {wf.generatedDescription.tags.length > 3 && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-full">+{wf.generatedDescription.tags.length - 3}</span>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-xs font-bold text-slate-800 mr-auto">
                            ${wf.productDetails.price.toFixed(2)}
                          </span>

                          {wf.state === "UPLOADED" && (
                            <Button
                              size="sm"
                              variant="glow"
                              className="h-7 text-xs px-3"
                              onClick={() => handleRunPipeline(wf.id)}
                              disabled={activeRunId !== null}
                            >
                              <Play className="w-3 h-3 mr-1" />
                              Run AI
                            </Button>
                          )}

                          {wf.state === "VALIDATED" && (
                            <Button
                              size="sm"
                              className="h-7 text-xs px-3 bg-amber-500 hover:bg-amber-600 text-white"
                              onClick={() => navigate("/review")}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Review
                            </Button>
                          )}

                          {wf.state === "APPROVED" && (
                            <Button
                              size="sm"
                              className="h-7 text-xs px-3 bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => publishProduct(wf.id)}
                            >
                              <ShoppingBag className="w-3 h-3 mr-1" />
                              Publish
                            </Button>
                          )}

                          {(wf.state === "COMPLETED" || wf.state === "VALIDATED" || wf.state === "APPROVED") && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs px-3 border-slate-200"
                              onClick={() => { useLaunchStore.getState().activeWorkflowId = wf.id; navigate("/review") }}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 p-0 border-slate-200 text-red-400 hover:text-red-600 hover:border-red-200"
                            onClick={() => deleteWorkflow(wf.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Running pipeline indicator */}
                    {isRunning && (
                      <div className="px-4 py-2 bg-blue-50 border-t border-blue-100">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                          <span className="text-xs text-blue-700 font-medium">
                            AI agents are processing your product...
                          </span>
                        </div>
                      </div>
                    )}
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── New Product Launch Modal ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setIsOpen(false); resetForm() }} />

            <motion.div
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-100"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
            >
              {/* Modal header */}
              <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Launch New Product</h2>
                  <p className="text-xs text-slate-500">AI will generate all content automatically</p>
                </div>
                <button
                  onClick={() => { setIsOpen(false); resetForm() }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleLaunch} className="p-6 space-y-5">

                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Product Images</label>
                  <div
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                      imagePreviews.length > 0 ? "border-blue-200 bg-blue-50/50" : "border-slate-200 hover:border-blue-300 hover:bg-blue-50/30"
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); handleFileSelect(e.dataTransfer.files) }}
                  >
                    {imagePreviews.length === 0 ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                          <Upload className="w-6 h-6 text-slate-400" />
                        </div>
                        <p className="text-sm font-medium text-slate-700">Drag & drop images here</p>
                        <p className="text-xs text-slate-400">or click to browse • PNG, JPG, WebP up to 10MB</p>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-3 justify-center">
                        {imagePreviews.map((src, idx) => (
                          <div key={idx} className="relative group">
                            <img src={src} alt="" className="w-20 h-20 object-cover rounded-lg border border-slate-200" />
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); removeImage(idx) }}
                              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        {imagePreviews.length < 5 && (
                          <div className="w-20 h-20 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:border-blue-300">
                            <Plus className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files)}
                  />
                </div>

                {/* Product Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Product Name *</label>
                  <Input
                    required
                    placeholder="e.g. Scratch Junior: Coding for Kids"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="border-slate-200 text-slate-900"
                  />
                </div>

                {/* Category + Age Group */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Category</label>
                    <Select value={category} onChange={(e) => setCategory(e.target.value)} className="border-slate-200 text-slate-800">
                      {["Programming Courses","Robotics Kits","STEM Kits","Arduino Courses","Python Courses",
                        "Scratch Programming","Electronics Courses","Raspberry Pi","Digital Worksheets","Books","Flashcards"
                      ].map((c) => <option key={c} value={c}>{c}</option>)}
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Age Group</label>
                    <Select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} className="border-slate-200 text-slate-800">
                      {["5-7 years","8-12 years","10-14 years","13-17 years","Teens","Adults","All Ages"].map((a) => <option key={a} value={a}>{a}</option>)}
                    </Select>
                  </div>
                </div>

                {/* Difficulty + Price + Language */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Difficulty</label>
                    <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="border-slate-200 text-slate-800">
                      {["Beginner","Intermediate","Advanced"].map((d) => <option key={d} value={d}>{d}</option>)}
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Price (USD)</label>
                    <Input value={price} onChange={(e) => setPrice(e.target.value)} type="number" step="0.01" min="0" className="border-slate-200" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Language</label>
                    <Select value={language} onChange={(e) => setLanguage(e.target.value)} className="border-slate-200 text-slate-800">
                      {["English","Hindi","Tamil","Telugu","Kannada"].map((l) => <option key={l} value={l}>{l}</option>)}
                    </Select>
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Tags (comma separated)</label>
                  <Input placeholder="coding, scratch, kids, beginner" value={tags} onChange={(e) => setTags(e.target.value)} className="border-slate-200" />
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Additional Notes</label>
                  <Textarea
                    placeholder="Any special instructions for the AI agents..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="h-20 border-slate-200 resize-none"
                  />
                </div>

                {/* AI Pipeline preview */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold text-slate-800">AI Pipeline Preview</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["🔍 Vision Analysis","✍️ SEO Copy","📱 Marketing","🎨 Image Prompts","🛡️ Validation"].map((step) => (
                      <span key={step} className="text-[10px] px-2 py-1 bg-white/70 text-slate-700 rounded-full border border-blue-100 font-medium">{step}</span>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2">All 6 AI stages will run automatically after upload</p>
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-slate-200 text-slate-600"
                    onClick={() => { setIsOpen(false); resetForm() }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="glow"
                    className="flex-1 shadow-lg"
                    disabled={submitting || !productName.trim()}
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Launching...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-1.5" />
                        Launch with AI
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
