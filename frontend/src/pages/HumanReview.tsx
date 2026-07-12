import { useState } from "react"
import { motion } from "framer-motion"
import {
  ShieldAlert,
  Save,
  CheckCircle,
  XCircle,
  FileText,
  Instagram,
  Twitter,
  Facebook,
  Mail,
  Camera,
  Layers,
  Sparkles,
  ClipboardCheck
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
  const { workflows, activeWorkflowId, submitReview, publishToShopify } = useLaunchStore()
  
  // Find workflow
  const activeWorkflow = workflows.find((w) => w.id === activeWorkflowId)
  
  // Tab control state
  const [activeTab, setActiveTab] = useState<"copy" | "marketing" | "prompts" | "safety">("copy")

  // Editing state for generated catalog content
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState("")
  const [editedHtml, setEditedHtml] = useState("")
  const [editedSeoTitle, setEditedSeoTitle] = useState("")
  const [editedSeoDesc, setEditedSeoDesc] = useState("")
  const [editedTags, setEditedTags] = useState("")

  // Review status states
  const [notes, setNotes] = useState("")
  const [isPublishing, setIsPublishing] = useState(false)

  // Initialize fields once a workflow is selected
  const handleOpenEdit = () => {
    if (!activeWorkflow || !activeWorkflow.generatedDescription) return
    setEditedTitle(activeWorkflow.generatedDescription.title)
    setEditedHtml(activeWorkflow.generatedDescription.descriptionHtml)
    setEditedSeoTitle(activeWorkflow.generatedDescription.seoTitle)
    setEditedSeoDesc(activeWorkflow.generatedDescription.seoDescription)
    setEditedTags(activeWorkflow.generatedDescription.tags.join(", "))
    setIsEditing(true)
  }

  const handleSaveEdit = () => {
    if (!activeWorkflow) return
    
    // Update store state directly
    activeWorkflow.generatedDescription = {
      title: editedTitle,
      descriptionHtml: editedHtml,
      seoTitle: editedSeoTitle,
      seoDescription: editedSeoDesc,
      tags: editedTags.split(",").map((t) => t.trim()).filter((t) => t.length > 0)
    }
    
    setIsEditing(false)
  }

  const handleReviewSubmission = async (approved: boolean) => {
    if (!activeWorkflow) return
    
    // Submit review state
    submitReview(activeWorkflow.id, approved, notes)
    
    if (approved) {
      setIsPublishing(true)
      await publishToShopify(activeWorkflow.id)
      setIsPublishing(false)
      navigate("/report")
    } else {
      navigate("/")
    }
  }

  // Workflows that are ready for review or has been validated
  const reviewableWorkflows = workflows.filter(
    (w) => w.state === "VALIDATED" || w.state === "APPROVED" || w.state === "REJECTED"
  )

  if (!activeWorkflow) {
    return (
      <div className="space-y-8 font-sans max-w-7xl mx-auto pb-12">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">Review Center</h1>
          <p className="text-sm text-slate-500 font-light font-sans">Audit generated product parameters and authorize launches.</p>
        </div>

        <Card className="glass-panel text-center py-16 space-y-4">
          <ClipboardCheck className="w-12 h-12 mx-auto text-slate-700 animate-bounce" />
          <h3 className="text-lg font-bold text-slate-200">Select Launch Workflow to Audit</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Choose from the list of workflows that have completed AI validation stages.
          </p>
          
          <div className="max-w-md mx-auto grid gap-3 pt-4">
            {reviewableWorkflows.length === 0 ? (
              <p className="text-xs text-slate-600 italic">No workflows are currently awaiting audit.</p>
            ) : (
              reviewableWorkflows.map((w) => (
                <button
                  key={w.id}
                  onClick={() => useLaunchStore.setState({ activeWorkflowId: w.id })}
                  className="flex items-center justify-between p-4 border border-slate-900 bg-slate-950/45 rounded-xl hover:border-primary/45 transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={w.productDetails.images[0]}
                      alt=""
                      className="w-8 h-8 rounded object-cover border border-slate-800"
                    />
                    <div>
                      <span className="font-semibold text-slate-200 text-xs sm:text-sm block leading-tight">{w.productDetails.title}</span>
                      <span className="text-[10px] text-slate-600 font-mono">{w.id}</span>
                    </div>
                  </div>
                  <Badge variant="warning" className="text-[9px] uppercase">
                    {w.state}
                  </Badge>
                </button>
              ))
            )}
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8 font-sans max-w-7xl mx-auto pb-12">
      
      {/* Header with selection picker */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-semibold text-primary uppercase tracking-wider block">Stage 7 & 8: Human Approval</span>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-2">
            <span>Audit Workspace</span>
          </h1>
          <p className="text-sm text-slate-500">Reviewing generated assets for <span className="font-semibold text-slate-400">{activeWorkflow.productDetails.title}</span></p>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => useLaunchStore.setState({ activeWorkflowId: null })}
        >
          Change Workflow
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        
        {/* Left Columns - Content Tabs and Form */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Tabs Navigation */}
          <div className="flex space-x-1.5 border-b border-slate-900 pb-px">
            {[
              { id: "copy", label: "Catalog & Description", icon: FileText },
              { id: "marketing", label: "Marketing Campaigns", icon: Instagram },
              { id: "prompts", label: "Backdrop Prompts", icon: Camera },
              { id: "safety", label: "Safety & Policies", icon: ShieldAlert }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center space-x-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === t.id
                    ? "border-primary text-primary"
                    : "border-transparent text-slate-500 hover:text-slate-300"
                }`}
              >
                <t.icon className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* Tab contents */}
          <Card className="glass-panel">
            <CardContent className="pt-6">
              
              {/* TAB 1: CATALOG DETAILS & DESCRIPTION */}
              {activeTab === "copy" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-bold text-slate-200">Shopify Product Listing</h3>
                    {!isEditing ? (
                      <Button variant="outline" size="sm" onClick={handleOpenEdit}>
                        Edit Content
                      </Button>
                    ) : (
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                        <Button variant="glow" size="sm" onClick={handleSaveEdit} className="flex items-center space-x-1.5">
                          <Save className="w-3.5 h-3.5" />
                          <span>Save Changes</span>
                        </Button>
                      </div>
                    )}
                  </div>

                  {!isEditing ? (
                    <div className="space-y-4 font-sans text-sm">
                      <div className="grid grid-cols-3 border-b border-slate-900/60 pb-3">
                        <span className="text-slate-500 font-medium">Synced Title</span>
                        <span className="col-span-2 font-bold text-slate-100">
                          {activeWorkflow.generatedDescription?.title || activeWorkflow.productDetails.title}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 border-b border-slate-900/60 pb-3">
                        <span className="text-slate-500 font-medium">Description (HTML)</span>
                        <div
                          className="col-span-2 text-slate-300 font-light leading-relaxed prose prose-invert max-w-none text-xs sm:text-sm"
                          dangerouslySetInnerHTML={{
                            __html: activeWorkflow.generatedDescription?.descriptionHtml || activeWorkflow.productDetails.rawDescription
                          }}
                        />
                      </div>
                      <div className="grid grid-cols-3 border-b border-slate-900/60 pb-3">
                        <span className="text-slate-500 font-medium">SEO Title</span>
                        <span className="col-span-2 text-slate-300">
                          {activeWorkflow.generatedDescription?.seoTitle || "Not generated"}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 border-b border-slate-900/60 pb-3">
                        <span className="text-slate-500 font-medium">SEO Description</span>
                        <span className="col-span-2 text-slate-400 font-light text-xs leading-relaxed">
                          {activeWorkflow.generatedDescription?.seoDescription || "Not generated"}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 pb-2">
                        <span className="text-slate-500 font-medium">Product Tags</span>
                        <div className="col-span-2 flex flex-wrap gap-1.5">
                          {activeWorkflow.generatedDescription?.tags.map((t, idx) => (
                            <Badge key={idx} variant="secondary" className="text-[10px]">
                              {t}
                            </Badge>
                          )) || <span className="text-slate-500">None</span>}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Listing Title</label>
                        <Input value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Listing Description HTML</label>
                        <Textarea className="h-40" value={editedHtml} onChange={(e) => setEditedHtml(e.target.value)} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">SEO Page Title</label>
                          <Input value={editedSeoTitle} onChange={(e) => setEditedSeoTitle(e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Product Tags (Comma separated)</label>
                          <Input value={editedTags} onChange={(e) => setEditedTags(e.target.value)} />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">SEO Meta Description</label>
                        <Textarea value={editedSeoDesc} onChange={(e) => setEditedSeoDesc(e.target.value)} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: MARKETING CAMPAIGNS */}
              {activeTab === "marketing" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-200">Generated Ad/Social Copy</h3>
                    <p className="text-xs text-slate-500">Pre-constructed copies for multi-platform distribution campaigns.</p>
                  </div>

                  {activeWorkflow.marketingContent ? (
                    <div className="space-y-6">
                      
                      {/* Social block */}
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="p-4 border border-slate-900 bg-slate-950/60 rounded-xl space-y-3">
                          <div className="flex items-center space-x-2 text-indigo-400">
                            <Instagram className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Instagram Post</span>
                          </div>
                          <p className="text-xs text-slate-300 font-light leading-relaxed bg-slate-950 p-2.5 rounded border border-slate-900/60">
                            {activeWorkflow.marketingContent.socialCopy.instagram}
                          </p>
                        </div>
                        <div className="p-4 border border-slate-900 bg-slate-950/60 rounded-xl space-y-3">
                          <div className="flex items-center space-x-2 text-blue-400">
                            <Twitter className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Twitter Ad</span>
                          </div>
                          <p className="text-xs text-slate-300 font-light leading-relaxed bg-slate-950 p-2.5 rounded border border-slate-900/60">
                            {activeWorkflow.marketingContent.socialCopy.twitter}
                          </p>
                        </div>
                      </div>

                      {/* Google/Meta Ads block */}
                      <div className="p-4 border border-slate-900 bg-slate-950/60 rounded-xl space-y-3">
                        <div className="flex items-center space-x-2 text-violet-400">
                          <Facebook className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase tracking-wider">Paid Ads Campaign Copy</span>
                        </div>
                        <div className="space-y-2 bg-slate-950 p-3 rounded border border-slate-900/60">
                          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Headline</span>
                          <p className="text-xs text-slate-200 font-semibold mb-2">{activeWorkflow.marketingContent.adCopy.metaHeadline}</p>
                          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Body Copy</span>
                          <p className="text-xs text-slate-300 font-light leading-relaxed">{activeWorkflow.marketingContent.adCopy.metaBody}</p>
                        </div>
                      </div>

                      {/* Newsletter */}
                      <div className="p-4 border border-slate-900 bg-slate-950/60 rounded-xl space-y-3">
                        <div className="flex items-center space-x-2 text-teal-400">
                          <Mail className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase tracking-wider">Email Drops Campaign</span>
                        </div>
                        <pre className="text-[11px] text-slate-400 font-mono whitespace-pre-wrap bg-slate-950 p-3 rounded border border-slate-900/60 max-h-48 overflow-y-auto">
                          {activeWorkflow.marketingContent.emailNewsletter}
                        </pre>
                      </div>

                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 italic">No campaign assets generated.</span>
                  )}
                </div>
              )}

              {/* TAB 3: IMAGE PROMPTS */}
              {activeTab === "prompts" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-200">AI Background/Diffusion Prompts</h3>
                    <p className="text-xs text-slate-500">Engineered prompt descriptions used to swap product backgrounds using Imagen models.</p>
                  </div>

                  {activeWorkflow.imagePrompts ? (
                    <div className="space-y-4">
                      <div className="p-4 border border-slate-900 rounded-xl space-y-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Lifestyle Placement Prompt</span>
                        <ul className="space-y-2">
                          {activeWorkflow.imagePrompts.lifestylePrompts.map((prm, i) => (
                            <li key={i} className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded border border-slate-900">
                              {prm}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-4 border border-slate-900 rounded-xl space-y-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Studio Background Prompt</span>
                        <ul className="space-y-2">
                          {activeWorkflow.imagePrompts.studioPrompts.map((prm, i) => (
                            <li key={i} className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded border border-slate-900">
                              {prm}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 italic">No image prompts generated.</span>
                  )}
                </div>
              )}

              {/* TAB 4: SAFETY & POLICY CHECKS */}
              {activeTab === "safety" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-200">AI Policy Checks & Compliance Logs</h3>
                    <p className="text-xs text-slate-500">Automated verification reports checking descriptions against Shopify terms of service.</p>
                  </div>

                  {activeWorkflow.validation ? (
                    <div className="space-y-4">
                      
                      {/* Valid status banner */}
                      <div className="flex items-center space-x-3 bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-green-400 text-xs">
                        <CheckCircle className="w-5 h-5 flex-shrink-0" />
                        <div>
                          <p className="font-bold">Automated Safety Validation: Passed</p>
                          <p className="text-[11px] text-green-500/80 font-light mt-0.5">Content aligns with Shopify seller guidelines and contains no flagged terms.</p>
                        </div>
                      </div>

                      {/* AI recommendations */}
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">AI Integration Suggestions</span>
                        <div className="bg-slate-950/60 p-3.5 border border-slate-900 rounded-xl space-y-1 text-xs">
                          {activeWorkflow.validation.suggestions.map((sug, i) => (
                            <p key={i} className="text-slate-300 leading-relaxed flex items-start space-x-2">
                              <span className="text-primary font-bold">•</span>
                              <span>{sug}</span>
                            </p>
                          ))}
                        </div>
                      </div>

                      {/* Engine Logs */}
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Detailed Engine Logs</span>
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-900 font-mono text-[10px] text-slate-500 space-y-1">
                          {activeWorkflow.validation.logs.map((log, i) => (
                            <p key={i}>[SYSTEM LOG - {new Date().toLocaleTimeString()}] {log}</p>
                          ))}
                        </div>
                      </div>

                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 italic">No validation reports generated.</span>
                  )}
                </div>
              )}

            </CardContent>
          </Card>
        </div>

        {/* Right Column - Vision Metadata and Actions */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Vision specs card */}
          <Card className="glass-panel">
            <CardHeader className="border-b border-slate-900/60 pb-3">
              <CardTitle className="text-sm flex items-center space-x-2">
                <Layers className="w-4 h-4 text-primary" />
                <span>Gemini Vision Metadata</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-xs font-sans">
              
              {/* Product sample image */}
              <div className="w-full aspect-[4/3] rounded-lg overflow-hidden border border-slate-900 bg-slate-900 relative">
                <img
                  src={activeWorkflow.productDetails.images[0]}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>

              {activeWorkflow.imageAnalysis ? (
                <div className="space-y-3.5">
                  <div className="flex justify-between border-b border-slate-900/40 pb-2">
                    <span className="text-slate-500">Detected Class</span>
                    <span className="font-bold text-slate-300">{activeWorkflow.imageAnalysis.productType}</span>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-slate-500 font-medium">Detected Features</span>
                    <div className="flex flex-wrap gap-1">
                      {activeWorkflow.imageAnalysis.features.map((ft, i) => (
                        <Badge key={i} variant="outline" className="text-[9px] px-1.5 py-0">
                          {ft}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-slate-500 font-medium">Detected Materials</span>
                    <div className="flex flex-wrap gap-1">
                      {activeWorkflow.imageAnalysis.materials.map((m, i) => (
                        <Badge key={i} variant="outline" className="text-[9px] px-1.5 py-0 border-blue-500/10 text-blue-400 bg-blue-500/5">
                          {m}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-500 font-medium block">Vision Parsing Summary</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-light">
                      {activeWorkflow.imageAnalysis.rawSummary}
                    </p>
                  </div>
                </div>
              ) : (
                <span className="text-xs text-slate-500 italic block">No vision metadata.</span>
              )}

            </CardContent>
          </Card>

          {/* Action verification card */}
          <Card className="glass-panel border-primary/20 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-blue-500 to-indigo-500" />
            
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Authorize Publication</CardTitle>
              <CardDescription>Authorize catalog items to sync directly to live storefront.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Approval Feedback Notes</label>
                <Textarea
                  placeholder="Mention changes made, notes for layout editor, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="h-20"
                />
              </div>

              <div className="flex flex-col space-y-2 pt-2 border-t border-slate-900">
                <Button
                  variant="glow"
                  onClick={() => handleReviewSubmission(true)}
                  disabled={isPublishing}
                  className="w-full flex items-center justify-center space-x-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{isPublishing ? "Syncing Shopify..." : "Approve & Sync Shopify"}</span>
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleReviewSubmission(false)}
                  disabled={isPublishing}
                  className="w-full flex items-center justify-center space-x-1.5 bg-slate-900 border border-slate-800 text-red-400 hover:bg-slate-900/80 shadow-none"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject Launch</span>
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>

      </div>

    </div>
  )
}
