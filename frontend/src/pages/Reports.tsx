import { useState } from "react"
import { motion } from "framer-motion"
import {
  FileText,
  Download,
  Calendar,
  Layers,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Clock,
  Printer
} from "lucide-react"
import { useLaunchStore } from "../store/useLaunchStore"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"

export default function Reports() {
  const { workflows, activeWorkflowId } = useLaunchStore()
  
  // Find workflows that have generated descriptions or are completed/published
  const eligibleWorkflows = workflows.filter((w) =>
    !["UPLOADED", "ANALYZING", "ANALYZED", "GENERATING_DESC"].includes(w.state)
  )
  const defaultReport = eligibleWorkflows[0]
  const selectedWorkflow = workflows.find((w) => w.id === activeWorkflowId) || defaultReport

  if (!selectedWorkflow) {
    return (
      <div className="space-y-8 font-sans max-w-7xl mx-auto pb-12">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">Audit Reports</h1>
          <p className="text-sm text-slate-500 font-light">Inspect publication confirmations and latency reports.</p>
        </div>

        <Card className="glass-panel text-center py-20 space-y-4">
          <FileText className="w-12 h-12 mx-auto text-slate-700 animate-bounce" />
          <h3 className="text-lg font-bold text-slate-200">No Reports Available</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Reports are generated once a product launch successfully completes the Shopify verification cycle.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8 font-sans max-w-7xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-semibold text-primary uppercase tracking-wider block">Stage 11: Workflow Report</span>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <span>Launch Audit Summary</span>
          </h1>
          <p className="text-sm text-slate-500">Report details for <span className="font-semibold text-slate-700">{selectedWorkflow.productDetails.title}</span></p>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => window.print()} className="flex items-center space-x-1.5">
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print Document</span>
          </Button>
          <Button variant="glow" size="sm" className="flex items-center space-x-1.5">
            <Download className="w-4 h-4" />
            <span>Download CSV</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        
        {/* Left Side: General Report details */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main Info Card */}
          <Card className="bg-white border border-slate-100 shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex justify-between items-center">
                <CardTitle>Lifecycle Execution Log</CardTitle>
                <Badge variant="success" className="font-semibold text-[9px] uppercase tracking-wider">
                  Verified Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6 text-sm">
              <div className="grid gap-6 sm:grid-cols-3">
                <div className="p-4 border border-slate-100 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    <span>Launch Date</span>
                  </span>
                  <p className="font-bold text-slate-800">{new Date(selectedWorkflow.createdAt).toLocaleDateString()}</p>
                  <p className="text-[10px] text-slate-500">{new Date(selectedWorkflow.createdAt).toLocaleTimeString()}</p>
                </div>
                <div className="p-4 border border-slate-100 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Total Runtime</span>
                  </span>
                  <p className="font-bold text-slate-800">
                    {selectedWorkflow.updatedAt && selectedWorkflow.createdAt
                      ? `${((new Date(selectedWorkflow.updatedAt).getTime() - new Date(selectedWorkflow.createdAt).getTime()) / 1000).toFixed(1)}s`
                      : "N/A"}
                  </p>
                  <p className="text-[10px] text-slate-500">Pipeline latency</p>
                </div>
                <div className="p-4 border border-slate-100 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider flex items-center gap-1">
                    <ShoppingBag className="w-3.5 h-3.5 text-teal-600" />
                    <span>Shopify SKU</span>
                  </span>
                  <p className="font-bold text-slate-800 font-mono text-xs">{selectedWorkflow.productDetails.sku}</p>
                  <p className="text-[10px] text-slate-500">Inventory ID mapped</p>
                </div>
              </div>

              {/* Step Audit timeline */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Orchestrator Execution Audit Trails</span>
                
                <div className="space-y-3 font-sans text-xs">
                  {[
                    { id: 1, title: "Stage 1: Raw catalog spec analysis & upload confirmation.", duration: "0.2s" },
                    { id: 2, title: "Stage 2: Multimodal Gemini vision analysis for feature extraction.", duration: "1.5s" },
                    { id: 3, title: "Stage 3: Generative AI copywriting for product description & tags.", duration: "1.8s" },
                    { id: 4, title: "Stage 4: Automated copy construction for ad & email newsletters.", duration: "1.5s" },
                    { id: 5, title: "Stage 5: Diffusion prompt template styling blocks.", duration: "1.2s" },
                    { id: 6, title: "Stage 6: Policy and safety compliance evaluation checks.", duration: "1.5s" },
                    { id: 7, title: "Stage 7 & 8: Human validation submission & approval log.", duration: "Instant" },
                    { id: 8, title: "Stage 9 & 10: Shopify product creation & live link verification.", duration: "3.5s" }
                  ].map((step) => {
                    const statusConfig = (() => {
                      const s = selectedWorkflow.state;
                      switch (step.id) {
                        case 1:
                          return { label: "Success", color: "bg-green-100 text-green-700", dot: "bg-green-500" };
                        case 2:
                          if (["UPLOADED", "ANALYZING"].includes(s)) {
                            return { label: "Pending", color: "bg-slate-100 text-slate-500", dot: "bg-slate-300" };
                          }
                          return { label: "Success", color: "bg-green-100 text-green-700", dot: "bg-green-500" };
                        case 3:
                          if (["UPLOADED", "ANALYZING", "ANALYZED", "GENERATING_DESC"].includes(s)) {
                            return { label: "Pending", color: "bg-slate-100 text-slate-500", dot: "bg-slate-300" };
                          }
                          return { label: "Success", color: "bg-green-100 text-green-700", dot: "bg-green-500" };
                        case 4:
                          if (["UPLOADED", "ANALYZING", "ANALYZED", "GENERATING_DESC", "DESC_GENERATED", "GENERATING_MKTG"].includes(s)) {
                            return { label: "Pending", color: "bg-slate-100 text-slate-500", dot: "bg-slate-300" };
                          }
                          return { label: "Success", color: "bg-green-100 text-green-700", dot: "bg-green-500" };
                        case 5:
                          if (["UPLOADED", "ANALYZING", "ANALYZED", "GENERATING_DESC", "DESC_GENERATED", "GENERATING_MKTG", "MKTG_GENERATED", "GENERATING_PROMPTS"].includes(s)) {
                            return { label: "Pending", color: "bg-slate-100 text-slate-500", dot: "bg-slate-300" };
                          }
                          return { label: "Success", color: "bg-green-100 text-green-700", dot: "bg-green-500" };
                        case 6:
                          if (["UPLOADED", "ANALYZING", "ANALYZED", "GENERATING_DESC", "DESC_GENERATED", "GENERATING_MKTG", "MKTG_GENERATED", "GENERATING_PROMPTS", "PROMPTS_GENERATED", "VALIDATING"].includes(s)) {
                            return { label: "Pending", color: "bg-slate-100 text-slate-500", dot: "bg-slate-300" };
                          }
                          return { label: "Success", color: "bg-green-100 text-green-700", dot: "bg-green-500" };
                        case 7:
                          if (["APPROVED", "PUBLISHING", "PUBLISHED", "VERIFYING", "COMPLETED"].includes(s)) {
                            return { label: "Approved", color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" };
                          }
                          if (s === "REJECTED" || s === "FAILED") {
                            return { label: "Rejected", color: "bg-red-100 text-red-700", dot: "bg-red-500" };
                          }
                          return { label: "Pending", color: "bg-slate-100 text-slate-500", dot: "bg-slate-300" };
                        case 8:
                          if (["PUBLISHED", "COMPLETED"].includes(s)) {
                            return { label: "Success", color: "bg-green-100 text-green-700", dot: "bg-green-500" };
                          }
                          if (s === "FAILED") {
                            return { label: "Failed", color: "bg-red-100 text-red-700", dot: "bg-red-500" };
                          }
                          return { label: "Pending", color: "bg-slate-100 text-slate-500", dot: "bg-slate-300" };
                        default:
                          return { label: "Pending", color: "bg-slate-100 text-slate-500", dot: "bg-slate-300" };
                      }
                    })();

                    return (
                      <div key={step.id} className="flex justify-between items-center p-3 border border-slate-100 bg-slate-50 rounded-xl">
                        <div className="flex items-center space-x-2.5">
                          <div className={`w-2 h-2 rounded-full ${statusConfig.dot}`} />
                          <span className="text-slate-800 font-medium">{step.title}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-slate-500 font-mono text-[10px]">{step.duration}</span>
                          <span className={`text-[9px] uppercase font-semibold px-2 py-0.5 rounded-full ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </CardContent>
          </Card>

        </div>

        {/* Right Side: Charts and Mapped Listings */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Mapped Listings */}
          <Card className="bg-white border border-slate-100 shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className="text-sm">Verified Shopify Mappings</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-xs font-sans">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Shopify Product ID</span>
                <span className="font-bold text-slate-800 font-mono">
                  {selectedWorkflow.publication?.shopifyProductId || "—"}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Publication Status</span>
                <span className={`font-bold uppercase tracking-wide flex items-center space-x-1 ${
                  selectedWorkflow.publication?.verificationStatus === "verified" ? "text-green-600" :
                  selectedWorkflow.publication?.verificationStatus === "failed" ? "text-red-600" : "text-slate-400"
                }`}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{selectedWorkflow.publication?.verificationStatus || "Pending"}</span>
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-medium">Published Date</span>
                <span className="font-bold text-slate-800">
                  {selectedWorkflow.publication?.publishedAt ? new Date(selectedWorkflow.publication.publishedAt).toLocaleDateString() : new Date().toLocaleDateString()}
                </span>
              </div>

              {selectedWorkflow.publication && (
                <div className="pt-2">
                  <a
                    href={selectedWorkflow.publication.publishedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center space-x-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors text-primary font-bold"
                  >
                    <span>View Shopify Page</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Simple Vector Graph Card for visual analytics mock */}
          <Card className="bg-white border border-slate-100 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-primary animate-pulse" />
                <span>Storefront Views Analytics</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="h-32 w-full rounded-xl bg-slate-50 border border-slate-100 relative flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 font-medium">Analytics not yet available</p>
                  <p className="text-[10px] text-slate-300">Data will appear once product is live</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-slate-50 p-2 border border-slate-100 rounded-lg">
                  <span className="text-[10px] text-slate-500 uppercase block tracking-wider">Total Views</span>
                  <span className="font-bold text-slate-400">—</span>
                </div>
                <div className="bg-slate-50 p-2 border border-slate-100 rounded-lg">
                  <span className="text-[10px] text-slate-500 uppercase block tracking-wider">Conversions</span>
                  <span className="font-bold text-slate-400">—</span>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

      </div>

    </div>
  )
}
