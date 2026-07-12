import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sparkles,
  Plus,
  Play,
  CheckCircle,
  FileText,
  Clock,
  ArrowRight,
  TrendingUp,
  Settings,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  AlertTriangle
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useLaunchStore, WorkflowState } from "../store/useLaunchStore"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Select } from "../components/ui/select"
import { Badge } from "../components/ui/badge"

export default function Dashboard() {
  const navigate = useNavigate()
  const { workflows, addWorkflow, runAIPipeline, deleteWorkflow } = useLaunchStore()
  
  // Modal State
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [rawDescription, setRawDescription] = useState("")
  const [category, setCategory] = useState("Apparel")
  const [targetAudience, setTargetAudience] = useState("General")
  const [price, setPrice] = useState("49.99")
  const [sku, setSku] = useState("")
  const [imageLink, setImageLink] = useState("https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60")

  // Statistics calculations
  const totalLaunches = workflows.length
  const completedLaunches = workflows.filter((w) => w.state === "COMPLETED").length
  const inProgressLaunches = workflows.filter(
    (w) =>
      w.state !== "COMPLETED" &&
      w.state !== "FAILED" &&
      w.state !== "APPROVED" &&
      w.state !== "REJECTED" &&
      w.state !== "UPLOADED"
  ).length
  const reviewRequired = workflows.filter((w) => w.state === "VALIDATED").length

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const newId = addWorkflow({
      title,
      rawDescription,
      category,
      targetAudience,
      price: parseFloat(price) || 0,
      sku: sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      images: [imageLink]
    })

    setIsOpen(false)
    
    // Reset Form fields
    setTitle("")
    setRawDescription("")
    setCategory("Apparel")
    setTargetAudience("General")
    setPrice("49.99")
    setSku("")

    // Run the pipeline
    await runAIPipeline(newId)
  }

  // Get color for badges
  const getBadgeVariant = (state: WorkflowState) => {
    switch (state) {
      case "COMPLETED":
      case "PUBLISHED":
        return "success"
      case "REJECTED":
      case "FAILED":
        return "destructive"
      case "VALIDATED":
      case "APPROVED":
        return "warning"
      case "UPLOADED":
        return "outline"
      default:
        return "info"
    }
  }

  // Helper to map workflow steps into simple text list
  const getWorkflowPipelineProgress = (state: WorkflowState) => {
    const stages: { label: string; active: boolean; finished: boolean }[] = [
      { label: "Vision Check", active: state === "ANALYZING", finished: ["ANALYZED", "GENERATING_DESC", "DESC_GENERATED", "GENERATING_MKTG", "MKTG_GENERATED", "GENERATING_PROMPTS", "PROMPTS_GENERATED", "VALIDATING", "VALIDATED", "APPROVED", "PUBLISHING", "PUBLISHED", "VERIFYING", "COMPLETED"].includes(state) },
      { label: "Copywriting", active: state === "GENERATING_DESC", finished: ["DESC_GENERATED", "GENERATING_MKTG", "MKTG_GENERATED", "GENERATING_PROMPTS", "PROMPTS_GENERATED", "VALIDATING", "VALIDATED", "APPROVED", "PUBLISHING", "PUBLISHED", "VERIFYING", "COMPLETED"].includes(state) },
      { label: "Marketing", active: state === "GENERATING_MKTG", finished: ["MKTG_GENERATED", "GENERATING_PROMPTS", "PROMPTS_GENERATED", "VALIDATING", "VALIDATED", "APPROVED", "PUBLISHING", "PUBLISHED", "VERIFYING", "COMPLETED"].includes(state) },
      { label: "Validation", active: state === "VALIDATING", finished: ["VALIDATED", "APPROVED", "PUBLISHING", "PUBLISHED", "VERIFYING", "COMPLETED"].includes(state) },
      { label: "Publish", active: ["PUBLISHING", "VERIFYING"].includes(state), finished: ["PUBLISHED", "COMPLETED"].includes(state) }
    ]
    return stages
  }

  return (
    <div className="space-y-8 font-sans max-w-7xl mx-auto pb-12">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-2">
            <span>Orchestrator Control</span>
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          </h1>
          <p className="text-sm text-slate-500">Pipeline workflow state monitor & Shopify agent status.</p>
        </div>
        <Button variant="glow" onClick={() => setIsOpen(true)} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>New Catalog Launch</span>
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-6 md:grid-cols-4">
        {[
          { label: "Total Launches", val: totalLaunches, icon: ShoppingBag, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "In Active Pipeline", val: inProgressLaunches, icon: Clock, color: "text-indigo-400", bg: "bg-indigo-500/10", animate: "animate-pulse" },
          { label: "Awaiting Review", val: reviewRequired, icon: ShieldCheck, color: "text-yellow-500", bg: "bg-yellow-500/10" },
          { label: "Completed Launches", val: completedLaunches, icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" }
        ].map((m, i) => (
          <Card key={i} hoverGlow className="glass-panel relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{m.label}</p>
                <h3 className="text-3xl font-bold text-slate-100">{m.val}</h3>
              </div>
              <div className={`p-2 rounded-xl ${m.bg} ${m.color} ${m.animate || ""}`}>
                <m.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="absolute bottom-0 inset-x-0 h-[2px] bg-slate-900" />
          </Card>
        ))}
      </div>

      {/* Active Workflows Timeline Section */}
      <Card className="glass-panel">
        <CardHeader className="flex flex-row justify-between items-center pb-2 border-b border-slate-900/60">
          <div>
            <CardTitle>Active Lifecycle Pipelines</CardTitle>
            <CardDescription>Track running AI agent pipeline generation and validation status.</CardDescription>
          </div>
          <Badge variant="outline" className="font-mono text-[10px]">
            Realtime Updates
          </Badge>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {workflows.filter((w) => w.state !== "COMPLETED").length === 0 ? (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <TrendingUp className="w-10 h-10 mx-auto text-slate-700" />
              <p className="text-sm font-medium">No active pipelines running.</p>
              <p className="text-xs text-slate-600">Click "New Catalog Launch" above to initiate a product launch.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {workflows
                .filter((w) => w.state !== "COMPLETED")
                .map((w) => {
                  const stages = getWorkflowPipelineProgress(w.state)
                  return (
                    <div key={w.id} className="p-5 border border-slate-900/80 rounded-2xl bg-slate-950/20 space-y-4">
                      
                      {/* Product details header */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="flex items-center space-x-3">
                          <img
                            src={w.productDetails.images[0]}
                            alt={w.productDetails.title}
                            className="w-10 h-10 object-cover rounded-lg border border-slate-900"
                          />
                          <div>
                            <h4 className="font-bold text-slate-200 text-sm">{w.productDetails.title}</h4>
                            <span className="text-xs font-mono text-slate-600">ID: {w.id}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={getBadgeVariant(w.state)} className="uppercase text-[9px] px-2 py-0.5 tracking-wider">
                            {w.state.replace("_", " ")}
                          </Badge>
                          
                          {/* If validated, review button */}
                          {w.state === "VALIDATED" && (
                            <Button
                              variant="glow"
                              size="sm"
                              onClick={() => {
                                useLaunchStore.setState({ activeWorkflowId: w.id })
                                navigate("/review")
                              }}
                              className="text-xs h-8 px-3"
                            >
                              Open Human Review
                            </Button>
                          )}

                          {w.state === "APPROVED" && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={async () => {
                                await runAIPipeline(w.id) // Fallback or re-trigger
                              }}
                              className="text-xs h-8 px-3"
                              disabled
                            >
                              Ready to Publish
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Timeline bars */}
                      <div className="grid gap-3 sm:grid-cols-5 pt-2">
                        {stages.map((st, sidx) => (
                          <div key={sidx} className="space-y-1.5">
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="font-semibold text-slate-500">{st.label}</span>
                              {st.active && <span className="text-primary font-bold">running...</span>}
                              {st.finished && <span className="text-green-500 font-bold">done</span>}
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-slate-900 overflow-hidden relative border border-slate-950">
                              {st.finished && <div className="absolute inset-0 bg-green-500/80" />}
                              {st.active && (
                                <motion.div
                                  initial={{ left: "-100%" }}
                                  animate={{ left: "100%" }}
                                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                  className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
                                />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Catalog Launches List */}
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Catalog History & Stored Reports</CardTitle>
          <CardDescription>Review recent publications, Shopify synced pages, and analytics.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-900 text-slate-500 text-xs uppercase font-semibold">
                  <th className="py-3 px-4">Launch Details</th>
                  <th className="py-3 px-4">Target Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">SKU Code</th>
                  <th className="py-3 px-4">Launch State</th>
                  <th className="py-3 px-4">Shopify Sync</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60">
                {workflows.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-950/20 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={w.productDetails.images[0]}
                          alt={w.productDetails.title}
                          className="w-10 h-10 object-cover rounded-lg border border-slate-900"
                        />
                        <div>
                          <span className="font-semibold text-slate-200 block text-xs sm:text-sm">{w.productDetails.title}</span>
                          <span className="text-[10px] text-slate-600 block">{w.createdAt.split("T")[0]}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-400 font-medium">{w.productDetails.category}</td>
                    <td className="py-4 px-4 font-semibold text-slate-300">${w.productDetails.price.toFixed(2)}</td>
                    <td className="py-4 px-4 text-xs font-mono text-slate-500">{w.productDetails.sku}</td>
                    <td className="py-4 px-4">
                      <Badge variant={getBadgeVariant(w.state)} className="uppercase text-[9px]">
                        {w.state.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      {w.publication ? (
                        <a
                          href={w.publication.publishedUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 text-xs text-primary hover:underline"
                        >
                          <span>Live Store</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-600">Pending Pub</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {w.state === "COMPLETED" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            useLaunchStore.setState({ activeWorkflowId: w.id })
                            navigate("/report")
                          }}
                          className="text-xs px-2.5 h-8 font-medium"
                        >
                          View Report
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            useLaunchStore.setState({ activeWorkflowId: w.id })
                            navigate("/review")
                          }}
                          className="text-xs px-2.5 h-8 font-medium"
                        >
                          Audit Details
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Trigger Launch Modal Dialog */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-950 border border-slate-900 rounded-3xl w-full max-w-xl p-6 relative overflow-hidden shadow-2xl z-10 space-y-6"
            >
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
              
              <div>
                <h3 className="text-lg font-bold text-slate-100">Initiate AI Product Launch</h3>
                <p className="text-xs text-slate-500">Provide catalog specs to trigger the background state machine.</p>
              </div>

              <form onSubmit={handleLaunch} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Product Title</label>
                    <Input
                      required
                      type="text"
                      placeholder="e.g. Vintage Leather Messenger Bag"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Product SKU</label>
                    <Input
                      type="text"
                      placeholder="e.g. BAG-MSGR-LT"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Product Category</label>
                    <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                      <option value="Apparel">Apparel</option>
                      <option value="Kitchenware">Kitchenware</option>
                      <option value="Home Decor">Home Decor</option>
                      <option value="Accessories">Accessories</option>
                      <option value="Electronics">Electronics</option>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Unit Price (USD)</label>
                    <Input
                      required
                      type="number"
                      step="0.01"
                      placeholder="49.99"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Target Audience</label>
                  <Input
                    type="text"
                    placeholder="e.g. Commuters, eco-conscious college students"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Image Asset URL</label>
                  <Input
                    type="text"
                    placeholder="Provide image link..."
                    value={imageLink}
                    onChange={(e) => setImageLink(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Specs / Raw Details</label>
                  <Textarea
                    required
                    placeholder="Faux leather, waterproof lining, adjustable strap, laptop padding..."
                    value={rawDescription}
                    onChange={(e) => setRawDescription(e.target.value)}
                  />
                </div>

                <div className="flex space-x-3 pt-4 border-t border-slate-900">
                  <Button type="button" variant="outline" className="w-1/2" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="glow" className="w-1/2">
                    Start Pipeline Engine
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
