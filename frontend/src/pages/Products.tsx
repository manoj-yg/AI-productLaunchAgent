import { useState } from "react"
import { motion } from "framer-motion"
import { Search, ShoppingBag, Eye, ExternalLink, RefreshCw, Star, Trash2 } from "lucide-react"
import { useLaunchStore } from "../store/useLaunchStore"
import { Card, CardContent } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Select } from "../components/ui/select"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"

export default function Products() {
  const { workflows, deleteWorkflow } = useLaunchStore()
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")

  // Filter completed or publishing/approved products
  const products = workflows.filter((w) => {
    const matchesSearch = w.productDetails.title.toLowerCase().includes(search.toLowerCase()) || 
                          w.productDetails.sku.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === "All" || w.productDetails.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-8 font-sans max-w-7xl mx-auto pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">Shopify Sync Inventory</h1>
        <p className="text-sm text-slate-500 font-light">View active products, edit tags, and check verification logs.</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-950/20 p-4 border border-slate-900 rounded-2xl">
        <div className="relative w-full sm:max-w-md">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-600">
            <Search className="w-4 h-4" />
          </span>
          <Input
            placeholder="Search by product name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="w-full sm:w-48">
          <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="All">All Categories</option>
            <option value="Apparel">Apparel</option>
            <option value="Kitchenware">Kitchenware</option>
            <option value="Home Decor">Home Decor</option>
            <option value="Accessories">Accessories</option>
            <option value="Electronics">Electronics</option>
          </Select>
        </div>
      </div>

      {/* Inventory Grid */}
      {products.length === 0 ? (
        <div className="text-center py-20 text-slate-500 space-y-3 glass-panel rounded-2xl">
          <ShoppingBag className="w-12 h-12 mx-auto text-slate-700 animate-bounce" />
          <p className="text-sm font-semibold">No synchronized products found.</p>
          <p className="text-xs text-slate-600 max-w-md mx-auto">Create a launch on the dashboard, complete the AI generation pipeline, and approve the product to sync it here.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {products.map((p, idx) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card hoverGlow className="glass-panel group overflow-hidden flex flex-col h-full relative">
                
                {/* Product Image Panel */}
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-900 border border-slate-900/60 relative">
                  <img
                    src={p.productDetails.images[0]}
                    alt={p.productDetails.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant={p.state === "COMPLETED" ? "success" : "info"} className="shadow-lg uppercase text-[9px]">
                      {p.state === "COMPLETED" ? "Synced" : "In Pipeline"}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => deleteWorkflow(p.id)}
                      className="w-8 h-8 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <div className="pt-4 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-slate-200 group-hover:text-primary transition-colors text-sm sm:text-base leading-tight">
                        {p.productDetails.title}
                      </h3>
                      <span className="font-bold text-slate-100 text-sm sm:text-base">${p.productDetails.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span className="font-medium">{p.productDetails.category}</span>
                      <span className="font-mono text-[10px] bg-slate-950/40 px-1.5 py-0.5 rounded border border-slate-900">{p.productDetails.sku}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 font-light line-clamp-2 leading-relaxed">
                    {p.generatedDescription?.seoDescription || p.productDetails.rawDescription}
                  </p>

                  <div className="border-t border-slate-900/60 pt-3 flex items-center justify-between text-xs">
                    {p.publication ? (
                      <a
                        href={p.publication.publishedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1.5 text-primary font-semibold hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Show Shopify Store</span>
                      </a>
                    ) : (
                      <span className="text-slate-500 italic">No sync details yet</span>
                    )}

                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 shadow-md shadow-green-500/50" />
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">verified</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
