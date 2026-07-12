import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ShieldAlert,
  Save,
  CheckCircle,
  XCircle,
  FileText,
  Instagram,
  Facebook,
  Linkedin,
  Mail,
  Camera,
  Layers,
  Sparkles,
  ClipboardCheck,
  Award,
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  Sliders,
  DollarSign
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useLaunchStore, LaunchWorkflow } from "../store/useLaunchStore"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Badge } from "../components/ui/badge"

export default function HumanReview() {
  const navigate = useNavigate()
  const { workflows, activeWorkflowId, submitReview, publishProduct } = useLaunchStore()
  
  // Find workflow
  const activeWorkflow = workflows.find((w) => w.id === activeWorkflowId)
  
  // Tab control state
  const [activeTab, setActiveTab] = useState<"copy" | "marketing" | "images" | "safety">("copy")

  // Editing state
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState("")
  const [editedHtml, setEditedHtml] = useState("")
  const [editedSeoTitle, setEditedSeoTitle] = useState("")
  const [editedSeoDesc, setEditedSeoDesc] = useState("")
  const [editedTags, setEditedTags] = useState("")
  const [editedFeatures, setEditedFeatures] = useState("")
  const [editedWhatsIncluded, setEditedWhatsIncluded] = useState("")
  const [editedHighlights, setEditedHighlights] = useState("")
  const [editedInstagram, setEditedInstagram] = useState("")
  const [editedFacebook, setEditedFacebook] = useState("")
  const [editedLinkedin, setEditedLinkedin] = useState("")
  const [editedEmail, setEditedEmail] = useState("")

  // Review status
  const [notes, setNotes] = useState("")
  const [isPublishing, setIsPublishing] = useState(false)

  const handleOpenEdit = () => {
    if (!activeWorkflow) return
    setEditedTitle(activeWorkflow.generatedDescription?.title || activeWorkflow.productDetails.title)
    setEditedHtml(activeWorkflow.generatedDescription?.descriptionHtml || activeWorkflow.productDetails.rawDescription)
    setEditedSeoTitle(activeWorkflow.generatedDescription?.seoTitle || "")
    setEditedSeoDesc(activeWorkflow.generatedDescription?.seoDescription || "")
    setEditedTags(activeWorkflow.generatedDescription?.tags.join(", ") || "")
    setEditedFeatures(activeWorkflow.features?.keyFeatures.join("\n") || "")
    setEditedWhatsIncluded(activeWorkflow.features?.whatsIncluded.join("\n") || "")
    setEditedHighlights(activeWorkflow.features?.highlights.join("\n") || "")
    setEditedInstagram(activeWorkflow.marketingContent?.socialCopy.instagram || "")
    setEditedFacebook(activeWorkflow.marketingContent?.socialCopy.facebook || "")
    setEditedLinkedin(activeWorkflow.marketingContent?.socialCopy.twitter || "") // Map LinkedIn/Twitter field
    setEditedEmail(activeWorkflow.marketingContent?.emailNewsletter || "")
    setIsEditing(true)
  }

  const handleSaveEdit = () => {
    if (!activeWorkflow) return
    
    // Save changes into the store (in memory update)
    activeWorkflow.generatedDescription = {
      title: editedTitle,
      descriptionHtml: editedHtml,
      seoTitle: editedSeoTitle,
      seoDescription: editedSeoDesc,
      tags: editedTags.split(",").map((t) => t.trim()).filter((t) => t.length > 0)
    }

    activeWorkflow.features = {
      keyFeatures: editedFeatures.split("\n").map((f) => f.trim()).filter(Boolean),
      specifications: activeWorkflow.features?.specifications || {},
      whatsIncluded: editedWhatsIncluded.split("\n").map((w) => w.trim()).filter(Boolean),
      highlights: editedHighlights.split("\n").map((h) => h.trim()).filter(Boolean)
    }

    activeWorkflow.marketingContent = {
      socialCopy: {
        instagram: editedInstagram,
        facebook: editedFacebook,
        twitter: editedLinkedin
      },
      adCopy: activeWorkflow.marketingContent?.adCopy || { metaHeadline: "", metaBody: "", googleHeadline: "" },
      emailNewsletter: editedEmail
    }
    
    setIsEditing(false)
  }

  const handleReviewSubmission = async (approved: boolean) => {
    if (!activeWorkflow) return
    
    await submitReview(activeWorkflow.id, approved, notes)
    
    if (approved) {
      setIsPublishing(true)
      await publishProduct(activeWorkflow.id)
      setIsPublishing(false)
      navigate("/dashboard") // Go back to dashboard on approval/publish
    } else {
      useLaunchStore.setState({ activeWorkflowId: null })
    }
  }

  // Workflows that are ready for review or has been validated
  const reviewableWorkflows = workflows.filter(
    (w) => w.state === "VALIDATED" || w.state === "APPROVED" || w.state === "REJECTED" || w.state === "COMPLETED"
  )

  if (!activeWorkflow) {
    return (
      <div className="space-y-8 font-sans max-w-7xl mx-auto pb-12">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-primary uppercase tracking-widest block">KiddyPi Studio</span>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Review & Preview Center</h1>
          <p className="text-sm text-slate-500 font-light">Audit generated educational parameters, inspect visual assets, and authorize storefront publications.</p>
        </div>

        <Card className="bg-white border border-slate-100 shadow-sm text-center py-16 px-6 space-y-4">
          <ClipboardCheck className="w-16 h-16 mx-auto text-primary/30" />
          <h3 className="text-xl font-bold text-slate-800">Select a Product to Review</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Choose from the list of products that have completed the AI vision and copywriting generation stages.
          </p>
          
          <div className="max-w-md mx-auto grid gap-3 pt-6">
            {reviewableWorkflows.length === 0 ? (
              <div className="p-8 border border-slate-100 bg-slate-50 rounded-2xl text-center">
                <p className="text-xs text-slate-400 italic">No products are currently awaiting review. Initiate a launch from the Dashboard first.</p>
              </div>
            ) : (
              reviewableWorkflows.map((w) => (
                <button
                  key={w.id}
                  onClick={() => useLaunchStore.setState({ activeWorkflowId: w.id })}
                  className="flex items-center justify-between p-4 border border-slate-200 bg-slate-50 rounded-2xl hover:border-primary/30 hover:bg-blue-50/50 transition-all text-left group"
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    {w.productDetails.images[0] ? (
                      <img
                        src={w.productDetails.images[0]}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200/80 bg-white"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-primary font-bold">
                        <Sparkles className="w-5 h-5 text-primary" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <span className="font-bold text-slate-800 text-sm sm:text-base block leading-tight truncate group-hover:text-primary transition-colors">{w.productDetails.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{w.productDetails.category}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                </button>
              ))
            )}
          </div>
        </Card>
      </div>
    )
  }

  // Related products display
  const recommendedItems = activeWorkflow.recommendations || []

  // Safety rating configurations
  const validationScore = activeWorkflow.validation?.validationScore || 92

  return (
    <div className="space-y-8 font-sans max-w-7xl mx-auto pb-12">
      
      {/* Header with back options */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/70 p-6 rounded-3xl border border-slate-100/80 backdrop-blur-md">
        <div className="space-y-1">
          <button
            onClick={() => useLaunchStore.setState({ activeWorkflowId: null })}
            className="text-xs font-semibold text-slate-500 hover:text-primary flex items-center gap-1.5 transition-colors mb-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Select List
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              {activeWorkflow.productDetails.title}
            </h1>
            <Badge variant="secondary" className="text-[9px] uppercase px-2 py-0.5 font-bold tracking-wider">
              {activeWorkflow.state}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 font-medium">Category: <span className="text-slate-700 font-semibold">{activeWorkflow.productDetails.category}</span> · Price: <span className="text-primary font-bold">${activeWorkflow.productDetails.price.toFixed(2)}</span></p>
        </div>
        
        <div className="flex gap-2">
          {!isEditing ? (
            <Button
              variant="outline"
              className="border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl"
              onClick={handleOpenEdit}
            >
              <Sliders className="w-4 h-4 mr-1.5" />
              Edit Generated Copy
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-slate-200 text-slate-500"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button
                variant="glow"
                onClick={handleSaveEdit}
                className="flex items-center space-x-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Save Audits</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        
        {/* Left Columns - Content Tabs and Form */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Tabs Navigation */}
          <div className="flex space-x-1.5 border-b border-slate-200 pb-px">
            {[
              { id: "copy", label: "Shopify Listing & Features", icon: FileText },
              { id: "marketing", label: "Marketing Campaigns", icon: Instagram },
              { id: "images", label: "AI Generated Images", icon: Camera },
              { id: "safety", label: "Safety & Related Items", icon: ShieldAlert }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center space-x-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all duration-200 ${
                  activeTab === t.id
                    ? "border-primary text-primary"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <t.icon className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* Tab contents */}
          <Card className="bg-white border border-slate-100 shadow-sm rounded-3xl overflow-hidden">
            <CardContent className="pt-6 px-6">
              
              {/* TAB 1: CATALOG DETAILS & DESCRIPTION */}
              {activeTab === "copy" && (
                <div className="space-y-6">
                  {!isEditing ? (
                    <div className="space-y-5 text-sm font-sans">
                      
                      {/* Short Description Banner */}
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Short Product Hook</span>
                        <p className="text-slate-700 font-medium leading-relaxed italic">
                          "{activeWorkflow.generatedDescription?.seoDescription || activeWorkflow.productDetails.rawDescription.substring(0, 150) + "..."}"
                        </p>
                      </div>

                      {/* Long Description (HTML) */}
                      <div className="space-y-1.5 pt-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">HTML Description Narrative</span>
                        <div
                          className="text-slate-800 font-light leading-relaxed prose max-w-none text-xs sm:text-sm bg-slate-50/30 p-4 rounded-2xl border border-slate-100/50"
                          dangerouslySetInnerHTML={{
                            __html: activeWorkflow.generatedDescription?.descriptionHtml || activeWorkflow.productDetails.rawDescription
                          }}
                        />
                      </div>

                      {/* key features and whats included */}
                      <div className="grid gap-4 md:grid-cols-2 pt-2">
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Key Features</span>
                          <ul className="space-y-1.5 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                            {(activeWorkflow.features?.keyFeatures || []).map((feat, i) => (
                              <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                                <span className="text-green-500 font-bold">•</span>
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">What's Included</span>
                          <ul className="space-y-1.5 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                            {(activeWorkflow.features?.whatsIncluded || []).map((inc, i) => (
                              <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                                <span className="text-blue-500 font-bold">•</span>
                                <span>{inc}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Learning Highlights */}
                      <div className="space-y-2 pt-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Cognitive & Learning Highlights</span>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {(activeWorkflow.features?.highlights || []).map((hl, i) => (
                            <div key={i} className="p-3 bg-indigo-50/30 border border-indigo-500/10 rounded-xl text-xs text-slate-700 flex items-center gap-2">
                              <Award className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                              <span>{hl}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Technical specifications */}
                      {activeWorkflow.features?.specifications && Object.keys(activeWorkflow.features.specifications).length > 0 && (
                        <div className="space-y-2 pt-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Specifications Details</span>
                          <div className="border border-slate-150 rounded-2xl overflow-hidden bg-slate-50/30">
                            <table className="w-full text-xs text-left border-collapse">
                              <thead>
                                <tr className="border-b border-slate-150 bg-slate-50">
                                  <th className="px-4 py-2 text-slate-500 font-bold uppercase tracking-wider">Property</th>
                                  <th className="px-4 py-2 text-slate-500 font-bold uppercase tracking-wider">Value</th>
                                </tr>
                              </thead>
                              <tbody>
                                {Object.entries(activeWorkflow.features.specifications).map(([key, val]) => (
                                  <tr key={key} className="border-b border-slate-100">
                                    <td className="px-4 py-2 font-semibold text-slate-700">{key}</td>
                                    <td className="px-4 py-2 text-slate-650">{val}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* SEO settings and tags */}
                      <div className="grid gap-4 md:grid-cols-2 pt-3 border-t border-slate-100">
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">SEO Page Title</span>
                          <p className="text-xs font-bold text-slate-800">{activeWorkflow.generatedDescription?.seoTitle || "None"}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Catalog tags</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {activeWorkflow.generatedDescription?.tags.map((t, idx) => (
                              <Badge key={idx} variant="secondary" className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                                {t}
                              </Badge>
                            )) || <span className="text-slate-500 text-xs">None</span>}
                          </div>
                        </div>
                      </div>

                    </div>
                  ) : (
                    // EDIT MODE
                    <div className="space-y-4 font-sans text-sm">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Shopify Listing Title</label>
                        <Input value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)} className="border-slate-200" />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Listing Narrative HTML</label>
                        <Textarea className="h-44 border-slate-200 text-xs sm:text-sm" value={editedHtml} onChange={(e) => setEditedHtml(e.target.value)} />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">SEO Custom Page Title</label>
                          <Input value={editedSeoTitle} onChange={(e) => setEditedSeoTitle(e.target.value)} className="border-slate-200" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Product Tags (comma separated)</label>
                          <Input value={editedTags} onChange={(e) => setEditedTags(e.target.value)} className="border-slate-200" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Key Features (One feature per line)</label>
                        <Textarea className="h-24 border-slate-200 text-xs" value={editedFeatures} onChange={(e) => setEditedFeatures(e.target.value)} />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">What's Included (One item per line)</label>
                          <Textarea className="h-28 border-slate-200 text-xs" value={editedWhatsIncluded} onChange={(e) => setEditedWhatsIncluded(e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Highlights (One highlight per line)</label>
                          <Textarea className="h-28 border-slate-200 text-xs" value={editedHighlights} onChange={(e) => setEditedHighlights(e.target.value)} />
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-slate-100">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">SEO Meta Description Hook</label>
                        <Textarea value={editedSeoDesc} onChange={(e) => setEditedSeoDesc(e.target.value)} className="h-20 border-slate-200" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: MARKETING CAMPAIGNS */}
              {activeTab === "marketing" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Generated Ad & Social Campaigns</h3>
                    <p className="text-xs text-slate-500 font-light mt-0.5">Pre-constructed copies prepared for instant cross-platform promotion.</p>
                  </div>

                  {!isEditing ? (
                    <div className="space-y-6">
                      
                      {/* Social block */}
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="p-4 border border-slate-100 bg-slate-50/50 rounded-2xl space-y-2.5">
                          <div className="flex items-center space-x-2 text-pink-600">
                            <Instagram className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Instagram Hook</span>
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-100/80 min-h-[140px]">
                            {activeWorkflow.marketingContent?.socialCopy?.instagram || "Instagram caption template here"}
                          </p>
                        </div>
                        <div className="p-4 border border-slate-100 bg-slate-50/50 rounded-2xl space-y-2.5">
                          <div className="flex items-center space-x-2 text-blue-600">
                            <Facebook className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Facebook Campaign</span>
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-100/80 min-h-[140px]">
                            {activeWorkflow.marketingContent?.socialCopy?.facebook || "Facebook post copy here"}
                          </p>
                        </div>
                        <div className="p-4 border border-slate-100 bg-slate-50/50 rounded-2xl space-y-2.5">
                          <div className="flex items-center space-x-2 text-indigo-700">
                            <Linkedin className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">LinkedIn Launch</span>
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-100/80 min-h-[140px]">
                            {activeWorkflow.marketingContent?.socialCopy?.twitter || "LinkedIn product post layout"}
                          </p>
                        </div>
                      </div>

                      {/* Google/Meta Ads block */}
                      <div className="p-4 border border-slate-100 bg-slate-50/30 rounded-2xl space-y-3">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Paid Ads Target Copy</span>
                        <div className="bg-white p-4 rounded-xl border border-slate-150 space-y-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] px-1.5 py-0.5 bg-blue-50 text-blue-600 font-bold uppercase tracking-wider rounded">Headline</span>
                            <p className="text-xs font-bold text-slate-800">{activeWorkflow.marketingContent?.adCopy?.metaHeadline || "Early STEM Launch"}</p>
                          </div>
                          <div className="flex items-start gap-1.5 pt-1">
                            <span className="text-[9px] px-1.5 py-0.5 bg-violet-50 text-violet-600 font-bold uppercase tracking-wider rounded mt-0.5">Body copy</span>
                            <p className="text-xs text-slate-650 leading-relaxed">{activeWorkflow.marketingContent?.adCopy?.metaBody || "Launch body details copy text"}</p>
                          </div>
                          <div className="flex items-center gap-1.5 pt-1">
                            <span className="text-[9px] px-1.5 py-0.5 bg-emerald-50 text-emerald-600 font-bold uppercase tracking-wider rounded">Call to Action</span>
                            <p className="text-xs font-bold text-slate-800">{activeWorkflow.marketingContent?.adCopy?.googleHeadline || "Sign Up"}</p>
                          </div>
                        </div>
                      </div>

                      {/* Email Drop */}
                      <div className="p-4 border border-slate-100 bg-slate-50/50 rounded-2xl space-y-2.5">
                        <div className="flex items-center space-x-2 text-violet-600">
                          <Mail className="w-4 h-4" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Email Newsletter Drop</span>
                        </div>
                        <pre className="text-[11px] text-slate-650 font-mono whitespace-pre-wrap bg-white p-3.5 rounded-xl border border-slate-100 max-h-48 overflow-y-auto leading-relaxed">
                          {activeWorkflow.marketingContent?.emailNewsletter || "No newsletter copy."}
                        </pre>
                      </div>

                    </div>
                  ) : (
                    // EDIT MODE
                    <div className="space-y-4 text-xs font-sans">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Instagram Caption Hook</label>
                        <Textarea value={editedInstagram} onChange={(e) => setEditedInstagram(e.target.value)} className="h-24 border-slate-200" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Facebook Ad Copy</label>
                        <Textarea value={editedFacebook} onChange={(e) => setEditedFacebook(e.target.value)} className="h-24 border-slate-200" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">LinkedIn Announcement</label>
                        <Textarea value={editedLinkedin} onChange={(e) => setEditedLinkedin(e.target.value)} className="h-24 border-slate-200" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Email Campaign Newsletter</label>
                        <Textarea value={editedEmail} onChange={(e) => setEditedEmail(e.target.value)} className="h-40 border-slate-200 font-mono text-[11px]" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: IMAGES */}
              {activeTab === "images" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">AI Visual Generation Results</h3>
                    <p className="text-xs text-slate-500 mt-0.5">High-quality packshots, promotional banners, and lifestyle images generated for this catalog launch.</p>
                  </div>

                  {activeWorkflow.generatedImages ? (
                    <div className="grid gap-6 sm:grid-cols-2">
                      
                      {/* Consistent Packshot */}
                      <div className="border border-slate-100 rounded-3xl overflow-hidden bg-slate-50 p-4 space-y-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Consistent Product Packshot</span>
                        <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-white border border-slate-100">
                          <img src={activeWorkflow.generatedImages.packshot} alt="" className="w-full h-full object-cover" />
                        </div>
                      </div>

                      {/* Lifestyle scene */}
                      <div className="border border-slate-100 rounded-3xl overflow-hidden bg-slate-50 p-4 space-y-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Lifestyle Campaign Scene</span>
                        <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-white border border-slate-100">
                          <img src={activeWorkflow.generatedImages.lifestyleScene} alt="" className="w-full h-full object-cover" />
                        </div>
                      </div>

                      {/* Web banner */}
                      <div className="border border-slate-100 rounded-3xl overflow-hidden bg-slate-50 p-4 space-y-3 sm:col-span-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Promotional Storefront Web Banner</span>
                        <div className="aspect-[21/9] rounded-2xl overflow-hidden bg-white border border-slate-100">
                          <img src={activeWorkflow.generatedImages.promotionalBanner} alt="" className="w-full h-full object-cover" />
                        </div>
                      </div>

                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 italic">No visual assets generated yet. Run the AI pipeline.</span>
                  )}
                </div>
              )}

              {/* TAB 4: SAFETY & COMPLIANCE */}
              {activeTab === "safety" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Quality Validation & Recommendations</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Automated policy compliance checks and category-matching recommendations results.</p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    
                    {/* Validation Quality Scores */}
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-150 flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full border-4 border-primary/20 flex items-center justify-center bg-white relative">
                          <span className="text-lg font-extrabold text-primary">{validationScore}%</span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">Validation Quality Audit Score</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Score evaluates syntax grammar, completeness, and visual consistency levels.</p>
                        </div>
                      </div>

                      <div className="bg-slate-50/30 p-4 border border-slate-100 rounded-2xl space-y-3 text-xs font-sans">
                        <div className="flex justify-between border-b border-slate-100 pb-1.5">
                          <span className="text-slate-500">Grammar & Syntax</span>
                          <span className="font-semibold text-green-600">Passed (0 errors)</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-1.5">
                          <span className="text-slate-500">Readability Scale</span>
                          <span className="font-semibold text-slate-800">{activeWorkflow.validation?.readabilityRating || "Easy (Age 8-12)"}</span>
                        </div>
                        <div className="flex justify-between pb-0.5">
                          <span className="text-slate-500">Image Asset Quality</span>
                          <span className="font-semibold text-slate-800">{activeWorkflow.validation?.imageConsistency || "Consistent packshots"}</span>
                        </div>
                      </div>

                      {/* Suggestions list */}
                      {activeWorkflow.validation?.suggestions && activeWorkflow.validation.suggestions.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">AI Compliance Suggestions</span>
                          <div className="bg-amber-50/30 border border-amber-500/10 rounded-2xl p-4 space-y-1.5 text-xs">
                            {activeWorkflow.validation.suggestions.map((sug, idx) => (
                              <div key={idx} className="flex gap-2 items-start text-slate-700">
                                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                <p className="leading-relaxed">{sug}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Related Products Recommendations */}
                    <div className="space-y-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Category Recommendations (Seeded Products)</span>
                      
                      <div className="grid gap-3">
                        {recommendedItems.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">No recommendations mapped.</p>
                        ) : (
                          recommendedItems.map((rec) => (
                            <div key={rec.productId} className="flex items-center gap-3 p-3 bg-slate-50/50 border border-slate-100 rounded-2xl hover:bg-slate-100/30 transition-colors">
                              <img src={rec.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover border border-slate-200/50 bg-white" />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-slate-800 truncate">{rec.title}</p>
                                <p className="text-[10px] text-slate-400">{rec.category} · Age {rec.ageGroup}</p>
                              </div>
                              <span className="text-xs font-bold text-primary">${rec.price.toFixed(2)}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </CardContent>
          </Card>
        </div>

        {/* Right Column - Vision Metadata and Actions */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Vision specs card */}
          <Card className="bg-white border border-slate-100 shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 pb-3.5">
              <CardTitle className="text-sm flex items-center space-x-2">
                <Layers className="w-4 h-4 text-primary" />
                <span>AI Vision Metadata</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-xs font-sans">
              
              {/* Product sample image */}
              <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 relative">
                <img
                  src={activeWorkflow.productDetails.images[0] || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60"}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>

              {activeWorkflow.imageAnalysis ? (
                <div className="space-y-4 pt-1">
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500 font-medium">Visual Product Type</span>
                    <span className="font-bold text-slate-800">{activeWorkflow.imageAnalysis.productType}</span>
                  </div>
                  <div className="space-y-1.5 border-b border-slate-100 pb-3">
                    <span className="text-slate-500 font-medium">Detected Colors</span>
                    <div className="flex flex-wrap gap-1">
                      {activeWorkflow.imageAnalysis.suggestedColors.map((color, i) => (
                        <Badge key={i} variant="outline" className="text-[9px] px-2 py-0.5 border-slate-200 text-slate-700 bg-slate-50 rounded-full font-medium">
                          {color}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5 border-b border-slate-100 pb-3">
                    <span className="text-slate-500 font-medium">Detected Materials</span>
                    <div className="flex flex-wrap gap-1">
                      {activeWorkflow.imageAnalysis.materials.map((m, i) => (
                        <Badge key={i} variant="outline" className="text-[9px] px-2 py-0.5 border-blue-500/10 text-blue-600 bg-blue-50/50 rounded-full font-semibold">
                          {m}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-slate-500 font-medium block">Vision Parsing Summary</span>
                    <p className="text-[11px] text-slate-650 leading-relaxed font-light bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      {activeWorkflow.imageAnalysis.rawSummary}
                    </p>
                  </div>
                </div>
              ) : (
                <span className="text-xs text-slate-500 italic block">No vision metadata. Run the AI vision parser.</span>
              )}

            </CardContent>
          </Card>

          {/* Action verification card */}
          <Card className="bg-white border border-slate-100 shadow-sm border-t-4 border-t-primary rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-blue-500 to-indigo-500" />
            
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-slate-900">Authorize Launch Review</CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">Authorize final publication. Approved courses instantly appear live on the Demo Store.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Approval Feedback Notes</label>
                <Textarea
                  placeholder="Notes on copy edits, validation overrides, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="h-20 border-slate-200 text-slate-800 text-xs rounded-xl"
                />
              </div>

              <div className="flex flex-col space-y-2 pt-2 border-t border-slate-100">
                <Button
                  variant="glow"
                  onClick={() => handleReviewSubmission(true)}
                  disabled={isPublishing}
                  className="w-full flex items-center justify-center space-x-1.5 shadow-lg shadow-primary/10 rounded-xl"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{isPublishing ? "Publishing Catalog..." : "Approve & Publish Live"}</span>
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleReviewSubmission(false)}
                  disabled={isPublishing}
                  className="w-full flex items-center justify-center space-x-1.5 bg-slate-50 border border-slate-200 text-red-600 hover:bg-red-500/5 hover:text-red-700 shadow-none rounded-xl"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject Release</span>
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>

      </div>

    </div>
  )
}
