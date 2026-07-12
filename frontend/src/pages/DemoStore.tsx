import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  ShoppingBag,
  Sparkles,
  ArrowRight,
  Check,
  ChevronRight,
  BookOpen,
  Award,
  Layers,
  Heart,
  ShoppingCart
} from "lucide-react"
import { useLaunchStore, LaunchWorkflow } from "../store/useLaunchStore"
import { Card, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"

// Static list of seed products matching the backend sample products
const STORE_SEED_PRODUCTS = [
  // Programming
  {
    productId: "seed-prog-1",
    title: "KiddyPi Python Programming Masterclass",
    category: "Programming",
    price: 49.99,
    ageGroup: "8-12 years",
    imageUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600&q=80",
    description: "Master Python syntax and construct logical automation routines using children-friendly modules. Covers statements, data structures, loops, and micro-challenges.",
    features: ["Hands-on workspace coding", "10 guided projects", "Expert developer mentors"],
    whatsIncluded: ["Python coding worksheets", "12-month platform code editor access", "KiddyPi certification certificate"]
  },
  {
    productId: "seed-prog-2",
    title: "KiddyPi Scratch Game Design Studio",
    category: "Programming",
    price: 29.99,
    ageGroup: "5-7 years",
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80",
    description: "Drag-and-drop programming block layouts. Perfect for younger kids starting their logic coding structures. Design animations and classic games.",
    features: ["Visual block design blocks", "Colorful workspace animations", "Self-paced guide cards"],
    whatsIncluded: ["Activity sticker book", "Scratch curriculum link", "10 offline worksheets"]
  },
  {
    productId: "seed-prog-3",
    title: "KiddyPi Web Programming for Beginners",
    category: "Programming",
    price: 59.99,
    ageGroup: "10-14 years",
    imageUrl: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&q=80",
    description: "Learn HTML5, CSS3 styling, and foundational JavaScript logic to compile your first responsive website from scratch. Create a student portfolio site.",
    features: ["Responsive layouts build", "Vanilla JavaScript functions", "Hosting deployment guidelines"],
    whatsIncluded: ["Codebook for web development", "KiddyPi free web hosting access", "Interactive cheat sheets"]
  },
  {
    productId: "seed-prog-4",
    title: "KiddyPi Game Development with Unity",
    category: "Programming",
    price: 89.99,
    ageGroup: "13-17 years",
    imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&q=80",
    description: "Delve into full C# logic script and construct early 2D and 3D level systems inside the popular game engine Unity. Formulate complex game mechanics.",
    features: ["2D physics configurations", "3D assets arrangement", "C# scripts masterclass"],
    whatsIncluded: ["KiddyPi Unity project kit files", "C# cheat guide book", "Online developer asset pack access"]
  },
  // Electronics
  {
    productId: "seed-elec-1",
    title: "KiddyPi Arduino Starter Robotics Kit",
    category: "Electronics",
    price: 89.99,
    ageGroup: "8-12 years",
    imageUrl: "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=600&q=80",
    description: "Assemble microcontrollers, breadboards, jumper wires, and motors. Program your robot to trace lines and navigate around obstacles.",
    features: ["No-soldering assembly", "Arduino C++ software basics", "Real electronic sensors"],
    whatsIncluded: ["KiddyPi Uno microcontroller", "Sensor expansion board", "Obstacle ultrasonic sensor", "Motor chassis kit"]
  },
  {
    productId: "seed-elec-2",
    title: "KiddyPi Raspberry Pi Smart Home Creator",
    category: "Electronics",
    price: 129.99,
    ageGroup: "13-17 years",
    imageUrl: "https://images.unsplash.com/photo-1517059224940-d4af9eec41b7?w=600&q=80",
    description: "Construct home server controls using Raspberry Pi. Connect temperature monitors and design a web dashboard interface to toggle LED lights.",
    features: ["Python hardware scripts", "Web control center server", "IoT smart relays setup"],
    whatsIncluded: ["Raspberry Pi developer board", "Relay modules bundle", "DHT11 sensor", "16GB SD preloaded card"]
  },
  {
    productId: "seed-elec-3",
    title: "KiddyPi Micro:bit Coding Board",
    category: "Electronics",
    price: 39.99,
    ageGroup: "5-7 years",
    imageUrl: "https://images.unsplash.com/photo-1608564697071-ddf911d837e5?w=600&q=80",
    description: "Program LED board indicators, internal compass, and accelerometer using block code models. Make a digital pedometer and games.",
    features: ["Onboard LED matrix layout", "Bluetooth sensor mapping", "Vibe motor alerts"],
    whatsIncluded: ["BBC Micro:bit card unit", "Battery holder case", "Premium microUSB cable"]
  }
]

export default function DemoStore() {
  const { workflows, fetchWorkflows } = useLaunchStore()
  
  // States
  const [products, setProducts] = useState<any[]>([])
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [cartCount, setCartCount] = useState(0)
  const [purchaseSuccess, setPurchaseSuccess] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string | null>(null)

  // Fetch workflows from backend database on mount
  useEffect(() => {
    fetchWorkflows()
  }, [])

  // Merge seed products and published workflows
  useEffect(() => {
    // Filter completed workflows
    const published = workflows
      .filter((w) => w.state === "COMPLETED" || w.state === "PUBLISHED")
      .map((w) => {
        // Map images
        const imagesList = [...w.productDetails.images]
        if (w.generatedImages) {
          if (w.generatedImages.packshot) imagesList.push(w.generatedImages.packshot)
          if (w.generatedImages.lifestyleScene) imagesList.push(w.generatedImages.lifestyleScene)
          if (w.generatedImages.promotionalBanner) imagesList.push(w.generatedImages.promotionalBanner)
        }

        return {
          productId: w.id,
          title: w.generatedDescription?.title || w.productDetails.title,
          category: w.productDetails.category.includes("Programming") ? "Programming" : "Electronics",
          price: w.productDetails.price,
          ageGroup: w.productDetails.targetAudience,
          imageUrl: w.generatedImages?.packshot || w.productDetails.images[0] || STORE_SEED_PRODUCTS[0].imageUrl,
          description: w.generatedDescription?.descriptionHtml?.replace(/<[^>]+>/g, "") || w.productDetails.rawDescription,
          descriptionHtml: w.generatedDescription?.descriptionHtml,
          features: w.features?.keyFeatures || w.productDetails.rawDescription.split("\n").slice(0, 3),
          whatsIncluded: w.features?.whatsIncluded || ["Standard workbook kit included"],
          images: imagesList,
          highlights: w.features?.highlights || [],
          specifications: w.features?.specifications || {},
          recommendations: w.recommendations || []
        }
      })

    // Combine
    const combined = [...published, ...STORE_SEED_PRODUCTS]
    
    // Deduplicate
    const unique = combined.filter((v, i, a) => a.findIndex(t => t.productId === v.productId) === i)
    setProducts(unique)
  }, [workflows])

  const handleBuy = () => {
    setCartCount(prev => prev + 1)
    setPurchaseSuccess(true)
    setTimeout(() => setPurchaseSuccess(false), 3000)
  }

  // Filtered products list
  const filteredProducts = filterCategory 
    ? products.filter(p => p.category === filterCategory)
    : products

  // Map product detail images list
  const getProductImages = (prod: any) => {
    if (prod.images && prod.images.length > 0) return prod.images
    return [prod.imageUrl]
  }

  // Get recommendations for detail page
  const getProductRecommendations = (prod: any) => {
    // If backend provided recommendations, map those
    if (prod.recommendations && prod.recommendations.length > 0) {
      return prod.recommendations.map((r: any) => products.find(p => p.productId === r.productId) || {
        productId: r.productId,
        title: r.title,
        category: r.category,
        price: r.price,
        ageGroup: r.ageGroup || "8-12 years",
        imageUrl: r.imageUrl
      })
    }
    // Fallback: match category
    return products.filter(p => p.category === prod.category && p.productId !== prod.productId).slice(0, 3)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16 relative">
      
      {/* Dynamic Background Blobs */}
      <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[100px]" />

      {/* Store Header */}
      <header className="sticky top-0 bg-white/80 border-b border-slate-100 backdrop-blur-md z-40 p-5 px-8 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-primary/10 rounded-xl">
            <ShoppingBag className="w-5 h-5 text-primary animate-pulse" />
          </div>
          <span className="font-extrabold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            KiddyPi Demo Store
          </span>
        </div>
        
        {/* Category toggles */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setFilterCategory(null)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              filterCategory === null ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            All Products
          </button>
          <button
            onClick={() => setFilterCategory("Programming")}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              filterCategory === "Programming" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Programming
          </button>
          <button
            onClick={() => setFilterCategory("Electronics")}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              filterCategory === "Electronics" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Electronics
          </button>
        </div>

        {/* Cart */}
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-xs font-black text-slate-600 hover:text-primary transition-all px-3.5 py-2 bg-slate-100/60 rounded-xl">
            Admin Dashboard
          </Link>
          <div className="relative p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-all cursor-pointer">
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[9px] font-extrabold w-5 h-5 flex items-center justify-center rounded-full border border-white animate-bounce">
                {cartCount}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Grid Wrapper */}
      <main className="max-w-7xl mx-auto px-6 pt-10 space-y-8">
        
        {/* Hero banner for catalog */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-blue-500/10">
          <div className="absolute right-0 bottom-[-20%] w-[350px] h-[350px] bg-white/5 rounded-full blur-[60px]" />
          <div className="max-w-xl space-y-3 relative z-10">
            <span className="text-[10px] font-bold tracking-widest bg-white/20 px-2 py-0.5 rounded-full uppercase">KiddyPi Academy Store</span>
            <h1 className="text-3xl font-extrabold tracking-tight">Expand Kids' Cognitive Coding Talents</h1>
            <p className="text-sm font-light text-white/85 leading-relaxed">
              Explore hands-on programming courses and high-end microcontrollers kits launched entirely through our custom AI Product Studio.
            </p>
          </div>
        </div>

        {/* Product Cards List */}
        <div className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <span>Explore Catalog</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </h2>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredProducts.map((prod) => (
              <motion.div
                key={prod.productId}
                layout
                whileHover={{ y: -6 }}
                className="group cursor-pointer"
                onClick={() => { setSelectedProduct(prod); setActiveImageIndex(0) }}
              >
                <Card className="bg-white border border-slate-100 shadow-sm rounded-3xl overflow-hidden h-full flex flex-col justify-between group-hover:shadow-lg transition-all duration-300">
                  <div className="space-y-3">
                    
                    {/* Image */}
                    <div className="aspect-[4/3] w-full bg-slate-50 relative overflow-hidden">
                      <img
                        src={prod.imageUrl}
                        alt={prod.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <Badge className="absolute top-3 left-3 bg-white/95 text-slate-800 text-[9px] font-extrabold uppercase px-2 py-0.5 shadow-sm border border-slate-100">
                        {prod.category}
                      </Badge>
                    </div>

                    {/* Content */}
                    <div className="px-4 space-y-1.5">
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{prod.ageGroup}</p>
                      <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                        {prod.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-light line-clamp-2 leading-relaxed">
                        {prod.description}
                      </p>
                    </div>

                  </div>

                  <div className="p-4 pt-3 flex items-center justify-between border-t border-slate-50 mt-3">
                    <span className="font-black text-slate-950">${prod.price.toFixed(2)}</span>
                    <button className="p-1.5 bg-blue-50 text-primary group-hover:bg-primary group-hover:text-white rounded-xl transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

      </main>

      {/* DETAIL MODAL / PREVIEW VIEW */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedProduct(null)} />

            {/* Modal Body */}
            <motion.div
              className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col md:flex-row"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
            >
              
              {/* Left Column: Visual Carousel */}
              <div className="w-full md:w-1/2 p-6 flex flex-col justify-between bg-slate-50/50 md:border-r border-slate-150">
                <div className="space-y-4">
                  
                  {/* Selected image display */}
                  <div className="w-full aspect-[4/3] bg-white border border-slate-100 rounded-2xl overflow-hidden relative shadow-sm">
                    <img
                      src={getProductImages(selectedProduct)[activeImageIndex]}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Thumbnail lists */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    {getProductImages(selectedProduct).map((src: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-14 h-14 rounded-xl border-2 overflow-hidden bg-white ${
                          activeImageIndex === idx ? "border-primary" : "border-slate-200"
                        }`}
                      >
                        <img src={src} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>

                </div>

                {/* Buy Box block */}
                <div className="pt-6 border-t border-slate-200/60 mt-6 space-y-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-slate-500 font-medium">Retail price value</span>
                    <span className="text-3xl font-black text-slate-950">${selectedProduct.price.toFixed(2)}</span>
                  </div>

                  <Button
                    variant="glow"
                    size="lg"
                    className="w-full py-6 rounded-2xl flex items-center justify-center space-x-2 font-bold shadow-lg"
                    onClick={handleBuy}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>Purchase Product</span>
                  </Button>
                </div>
              </div>

              {/* Right Column: Descriptions & Details */}
              <div className="w-full md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto space-y-6">
                
                {/* Product Title and core tag metadata */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[9px] uppercase px-2 py-0.5 rounded-full font-bold">
                      {selectedProduct.category}
                    </Badge>
                    <span className="text-xs font-semibold text-slate-400">{selectedProduct.ageGroup}</span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900 leading-tight">
                    {selectedProduct.title}
                  </h2>
                </div>

                {/* Description Narrative */}
                <div className="space-y-1 text-xs sm:text-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Product Description</span>
                  {selectedProduct.descriptionHtml ? (
                    <div
                      className="text-slate-650 leading-relaxed font-light prose max-w-none bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100/50"
                      dangerouslySetInnerHTML={{ __html: selectedProduct.descriptionHtml }}
                    />
                  ) : (
                    <p className="text-slate-650 leading-relaxed font-light bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100/50">
                      {selectedProduct.description}
                    </p>
                  )}
                </div>

                {/* Features & What's included checklist */}
                <div className="space-y-4">
                  {selectedProduct.features && selectedProduct.features.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Key Features</span>
                      <ul className="space-y-1 text-xs">
                        {selectedProduct.features.map((feat: string, i: number) => (
                          <li key={i} className="flex gap-2 items-start text-slate-700 font-light">
                            <span className="text-green-500 font-extrabold">•</span>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedProduct.whatsIncluded && selectedProduct.whatsIncluded.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">What's Included</span>
                      <ul className="space-y-1 text-xs">
                        {selectedProduct.whatsIncluded.map((inc: string, i: number) => (
                          <li key={i} className="flex gap-2 items-start text-slate-755 font-light">
                            <span className="text-blue-500 font-extrabold">•</span>
                            <span>{inc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Recommendations Category Matched */}
                <div className="border-t border-slate-100 pt-5 space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Related KiddyPi Recommendations</span>
                  
                  <div className="grid gap-2.5">
                    {getProductRecommendations(selectedProduct).map((rec: any) => (
                      <div
                        key={rec.productId}
                        onClick={() => { setSelectedProduct(rec); setActiveImageIndex(0) }}
                        className="flex items-center gap-2.5 p-2 bg-slate-50 hover:bg-blue-50/50 border border-slate-100 rounded-2xl transition-colors cursor-pointer text-left"
                      >
                        <img src={rec.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover bg-white" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-800 truncate">{rec.title}</p>
                          <p className="text-[9px] text-slate-400">{rec.category} · Age {rec.ageGroup}</p>
                        </div>
                        <span className="text-xs font-extrabold text-primary px-2">${rec.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Alert Banner for Purchase Success */}
      <AnimatePresence>
        {purchaseSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-6 right-6 bg-slate-900 border border-slate-800 text-white rounded-2xl p-4 flex items-center gap-3 shadow-2xl z-50 max-w-sm"
          >
            <div className="w-8 h-8 rounded-lg bg-green-500/20 text-green-400 flex items-center justify-center">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold">Purchase Successful!</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Thank you. Checkout the related recommendations box.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
