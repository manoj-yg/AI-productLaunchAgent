import { create } from "zustand"

export type WorkflowState =
  | "UPLOADED"
  | "ANALYZING"
  | "ANALYZED"
  | "GENERATING_DESC"
  | "DESC_GENERATED"
  | "GENERATING_MKTG"
  | "MKTG_GENERATED"
  | "GENERATING_PROMPTS"
  | "PROMPTS_GENERATED"
  | "VALIDATING"
  | "VALIDATED"
  | "APPROVED"
  | "REJECTED"
  | "PUBLISHING"
  | "PUBLISHED"
  | "VERIFYING"
  | "COMPLETED"
  | "FAILED"

export interface ProductDetails {
  title: string
  rawDescription: string
  category: string
  targetAudience: string
  price: number
  sku: string
  images: string[]
}

export interface ImageAnalysis {
  productType: string
  features: string[]
  suggestedColors: string[]
  materials: string[]
  styleKeywords: string[]
  rawSummary: string
}

export interface GeneratedDescription {
  title: string
  descriptionHtml: string
  seoTitle: string
  seoDescription: string
  tags: string[]
}

export interface MarketingContent {
  socialCopy: {
    instagram: string
    facebook: string
    twitter: string
  }
  adCopy: {
    metaHeadline: string
    metaBody: string
    googleHeadline: string
  }
  emailNewsletter: string
}

export interface ImagePrompts {
  lifestylePrompts: string[]
  studioPrompts: string[]
}

export interface ContentValidation {
  isValid: boolean
  policyCheckPassed: boolean
  suggestions: string[]
  logs: string[]
}

export interface ShopifyPublication {
  shopifyProductId: string
  publishedUrl: string
  publishedAt: string
  verificationStatus: "pending" | "verified" | "failed"
}

export interface LaunchWorkflow {
  id: string
  createdAt: string
  updatedAt: string
  state: WorkflowState
  productDetails: ProductDetails
  imageAnalysis?: ImageAnalysis
  generatedDescription?: GeneratedDescription
  marketingContent?: MarketingContent
  imagePrompts?: ImagePrompts
  validation?: ContentValidation
  feedbackNotes?: string
  publication?: ShopifyPublication
  errorMessage?: string
}

export interface UserSession {
  username: string
  role: "administrator" | "reviewer"
  isAuthenticated: boolean
}

export interface PlatformSettings {
  shopifyShopUrl: string
  shopifyAccessToken: string
  defaultLanguage: string
  brandVoice: "playful" | "professional" | "bold" | "luxurious"
  primaryColor: string
}

interface LaunchState {
  user: UserSession
  workflows: LaunchWorkflow[]
  activeWorkflowId: string | null
  settings: PlatformSettings
  // Actions
  login: (username: string) => void
  logout: () => void
  addWorkflow: (details: ProductDetails) => string
  deleteWorkflow: (id: string) => void
  updateWorkflowState: (id: string, state: WorkflowState) => void
  runAIPipeline: (id: string) => Promise<void>
  submitReview: (id: string, isApproved: boolean, notes: string) => void
  publishToShopify: (id: string) => Promise<void>
  updateSettings: (settings: Partial<PlatformSettings>) => void
}

const mockWorkflows: LaunchWorkflow[] = [
  {
    id: "wf-01",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 23).toISOString(),
    state: "COMPLETED",
    productDetails: {
      title: "Cozy Cotton Knit Hoodie",
      rawDescription: "Super soft hoodie made of organic cotton. Cozy fit, double fleece lining.",
      category: "Apparel",
      targetAudience: "Young Adults",
      price: 59.99,
      sku: "HD-COZY-01",
      images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&auto=format&fit=crop&q=60"]
    },
    imageAnalysis: {
      productType: "Apparel / Hoodie",
      features: ["Drawstring hood", "Kangaroo pocket", "Ribbed cuffs"],
      suggestedColors: ["Navy Blue", "Heather Grey"],
      materials: ["100% Organic Cotton"],
      styleKeywords: ["Casual", "Minimalist", "Athleisure"],
      rawSummary: "The image shows a high-quality navy blue organic cotton hoodie..."
    },
    generatedDescription: {
      title: "Premium Cozy Cotton Knit Hoodie",
      descriptionHtml: "<p>Elevate your everyday comfort with our <strong>Premium Cozy Cotton Knit Hoodie</strong>. Crafted from 100% certified organic cotton, it features a warm double-fleece lining and classic kangaroo pockets.</p>",
      seoTitle: "Premium Organic Cotton Hoodie | Cozy Streetwear",
      seoDescription: "Shop our eco-friendly cozy knit hoodie made from 100% organic cotton. Free shipping on all apparel items.",
      tags: ["hoodie", "organic-cotton", "casual", "streetwear"]
    },
    marketingContent: {
      socialCopy: {
        instagram: "Cozy meets green 🌿 Feel the organic softness of our new Knit Hoodie. Tap bio to shop!",
        facebook: "Stay warm in style. Our 100% Organic Cotton Hoodie is now live. Check out the comfort details.",
        twitter: "Fresh drop! Double-lined comfort in classic Navy. Shop the Cozy Knit Hoodie today."
      },
      adCopy: {
        metaHeadline: "Cozy Cotton Knit Hoodie - 100% Organic",
        metaBody: "Soft, warm, and sustainably crafted. Free worldwide shipping for a limited time.",
        googleHeadline: "Organic Cozy Hoodie - Shop Online"
      },
      emailNewsletter: "Hi there!\n\nWe are excited to share our latest sustainable drop..."
    },
    imagePrompts: {
      lifestylePrompts: ["Model walking in park wearing cozy blue hoodie, fall season, high-resolution lifestyle photograph"],
      studioPrompts: ["Flat lay photography of blue hoodie surrounded by autumn leaves, bright studio lighting"]
    },
    validation: {
      isValid: true,
      policyCheckPassed: true,
      suggestions: ["Declare washing instructions explicitly."],
      logs: ["Spelling: OK", "Shopify policy compliance: Passed", "AI Content Guidelines: Met"]
    },
    publication: {
      shopifyProductId: "shopify-prod-9988",
      publishedUrl: "https://mock-shop.myshopify.com/products/premium-cozy-cotton-knit-hoodie",
      publishedAt: new Date(Date.now() - 3600000 * 22).toISOString(),
      verificationStatus: "verified"
    }
  },
  {
    id: "wf-02",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    state: "VALIDATED",
    productDetails: {
      title: "Eco Bamboo Tumbler",
      rawDescription: "Bamboo wood tumbler with steel vacuum insulation. Keeps drinks hot for 12 hours.",
      category: "Kitchenware",
      targetAudience: "Eco-conscious Professionals",
      price: 29.99,
      sku: "TB-BAMB-02",
      images: ["https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=60"]
    },
    imageAnalysis: {
      productType: "Drinkware / Tumbler",
      features: ["Bamboo outer sleeve", "Stainless steel interior", "Leaktight lid"],
      suggestedColors: ["Natural Wood", "Steel"],
      materials: ["Organic Bamboo", "Food-Grade Stainless Steel"],
      styleKeywords: ["Eco-friendly", "Modern", "Office Accessory"],
      rawSummary: "Visual displays highlight a natural wood grain bamboo tumbler with a brushed metal rim..."
    },
    generatedDescription: {
      title: "Eco-Friendly Bamboo Insulated Tumbler",
      descriptionHtml: "<p>Stay hydrated sustainably. Features a double-wall stainless steel vacuum chamber wrapped in a real, organic bamboo sleeve.</p>",
      seoTitle: "Bamboo Insulated Mug | 12Hr Hot/Cold Tumbler",
      seoDescription: "Double-walled steel insulation meets eco-friendly bamboo wood. Keeps drinks hot for 12h.",
      tags: ["tumbler", "bamboo", "eco-friendly", "coffee-mug"]
    },
    marketingContent: {
      socialCopy: {
        instagram: "Ditch plastic, choose bamboo 🎋 Keep your drinks hot/cold for 12 hours. Link in bio!",
        facebook: "Your morning coffee deserves better. Bring natural bamboo aesthetics to your desk.",
        twitter: "Vacuum insulated. Wrapped in real bamboo wood. Stay warm responsibly."
      },
      adCopy: {
        metaHeadline: "Bamboo Thermal Tumbler - Eco Desk Essential",
        metaBody: "Vacuum insulated steel interior with premium organic bamboo shell. Leaktight design.",
        googleHeadline: "Bamboo Thermal Travel Mug"
      },
      emailNewsletter: "Meet your new favorite desk companion..."
    },
    imagePrompts: {
      lifestylePrompts: ["Warm hands holding a bamboo tumbler on a snowy winter morning, close up visual"],
      studioPrompts: ["Bamboo travel mug standing on a marble kitchen counter, clean modern interior"]
    },
    validation: {
      isValid: true,
      policyCheckPassed: true,
      suggestions: ["Specify dishwasher compatibility in description."],
      logs: ["Spelling: OK", "Policies: Clear"]
    }
  }
]

export const useLaunchStore = create<LaunchState>((set, get) => ({
  user: {
    username: "Alex Staff",
    role: "reviewer",
    isAuthenticated: true
  },
  workflows: mockWorkflows,
  activeWorkflowId: null,
  settings: {
    shopifyShopUrl: "nexus-launch.myshopify.com",
    shopifyAccessToken: "shpat_********************",
    defaultLanguage: "en",
    brandVoice: "playful",
    primaryColor: "#3b82f6"
  },

  login: (username: string) => {
    set({
      user: {
        username,
        role: username.toLowerCase().includes("admin") ? "administrator" : "reviewer",
        isAuthenticated: true
      }
    })
  },

  logout: () => {
    set({
      user: {
        username: "",
        role: "reviewer",
        isAuthenticated: false
      }
    })
  },

  addWorkflow: (details: ProductDetails) => {
    const id = `wf-${Math.random().toString(36).substr(2, 9)}`
    const newWorkflow: LaunchWorkflow = {
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      state: "UPLOADED",
      productDetails: details
    }
    set((state) => ({
      workflows: [newWorkflow, ...state.workflows],
      activeWorkflowId: id
    }))
    return id
  },

  deleteWorkflow: (id: string) => {
    set((state) => ({
      workflows: state.workflows.filter((w) => w.id !== id),
      activeWorkflowId: state.activeWorkflowId === id ? null : state.activeWorkflowId
    }))
  },

  updateWorkflowState: (id: string, state: WorkflowState) => {
    set((stateStore) => ({
      workflows: stateStore.workflows.map((w) =>
        w.id === id
          ? { ...w, state, updatedAt: new Date().toISOString() }
          : w
      )
    }))
  },

  runAIPipeline: async (id: string) => {
    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
    
    // Helper to edit active workflow nested structures
    const updateWorkflowData = (data: Partial<LaunchWorkflow>) => {
      set((stateStore) => ({
        workflows: stateStore.workflows.map((w) =>
          w.id === id
            ? { ...w, ...data, updatedAt: new Date().toISOString() }
            : w
        )
      }))
    }

    const workflow = get().workflows.find((w) => w.id === id)
    if (!workflow) return

    // Stage 1: Image Analysis
    get().updateWorkflowState(id, "ANALYZING")
    await sleep(1500)
    updateWorkflowData({
      state: "ANALYZED",
      imageAnalysis: {
        productType: `Fashion / ${workflow.productDetails.category}`,
        features: ["Premium stitch", "Comfort fit", "Durable wash"],
        suggestedColors: ["Charcoal", "Emerald", "Teal"],
        materials: ["100% Organic Eco Fibers"],
        styleKeywords: ["Modern", "Urban", "Premium"],
        rawSummary: `The AI visual engine inspected ${workflow.productDetails.title} and detected dynamic organic lines, custom stitching details, and optimized color balances.`
      }
    })

    // Stage 2: Description Generation
    get().updateWorkflowState(id, "GENERATING_DESC")
    await sleep(1800)
    const active = get().workflows.find((w) => w.id === id)!
    updateWorkflowData({
      state: "DESC_GENERATED",
      generatedDescription: {
        title: `AI-Enhanced ${active.productDetails.title}`,
        descriptionHtml: `<p>Introducing the <strong>${active.productDetails.title}</strong>, curated for premium aesthetics. Designed with focus on organic materials, durability, and standard modern tailoring.</p><p><em>Details: ${active.productDetails.rawDescription}</em></p>`,
        seoTitle: `${active.productDetails.title} | Premium ${active.productDetails.category}`,
        seoDescription: `Get the outstanding ${active.productDetails.title}. Shop ${active.productDetails.category} responsibly designed for comfort and modern lifestyles.`,
        tags: [active.productDetails.category.toLowerCase(), "eco-conscious", "premium-grade"]
      }
    })

    // Stage 3: Marketing Copy
    get().updateWorkflowState(id, "GENERATING_MKTG")
    await sleep(1500)
    const active2 = get().workflows.find((w) => w.id === id)!
    updateWorkflowData({
      state: "MKTG_GENERATED",
      marketingContent: {
        socialCopy: {
          instagram: `Elevate your aesthetics with ${active2.productDetails.title} ✨ Responsibly sourced. Tap link in bio.`,
          facebook: `Sustainable comfort has a new name. Meet the ${active2.productDetails.title}. Engineered for durability.`,
          twitter: `Style shouldn't compromise values. Discover the new ${active2.productDetails.title} today.`
        },
        adCopy: {
          metaHeadline: `Shop ${active2.productDetails.title} - Free Shipping`,
          metaBody: `Ethical, comfortable, and tailored to fit. Discover our latest collection today.`,
          googleHeadline: `Order Premium ${active2.productDetails.title}`
        },
        emailNewsletter: `Subject: Introducing ${active2.productDetails.title}\n\nHi Family,\n\nWe just dropped a brand new item...`
      }
    })

    // Stage 4: Prompts Generation
    get().updateWorkflowState(id, "GENERATING_PROMPTS")
    await sleep(1200)
    const active3 = get().workflows.find((w) => w.id === id)!
    updateWorkflowData({
      state: "PROMPTS_GENERATED",
      imagePrompts: {
        lifestylePrompts: [
          `Model showcasing ${active3.productDetails.title} in a high-end chic loft apartment, architectural digest interior, golden hour lighting`
        ],
        studioPrompts: [
          `Clean studio packaging flat lay, natural wood blocks, organic cotton threads next to ${active3.productDetails.title}`
        ]
      }
    })

    // Stage 5: Content Validation
    get().updateWorkflowState(id, "VALIDATING")
    await sleep(1500)
    updateWorkflowData({
      state: "VALIDATED",
      validation: {
        isValid: true,
        policyCheckPassed: true,
        suggestions: [
          "Include organic care tags in physical items.",
          "Add size chart link near checkout."
        ],
        logs: [
          "Spelling checks completed: 0 issues.",
          "Brand compliance verified: Matches friendly tone.",
          "Shopify terms of service verification: Compliant."
        ]
      }
    })
  },

  submitReview: (id: string, isApproved: boolean, notes: string) => {
    set((stateStore) => ({
      workflows: stateStore.workflows.map((w) =>
        w.id === id
          ? {
              ...w,
              state: isApproved ? "APPROVED" : "REJECTED",
              feedbackNotes: notes,
              updatedAt: new Date().toISOString()
            }
          : w
      )
    }))
  },

  publishToShopify: async (id: string) => {
    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
    
    get().updateWorkflowState(id, "PUBLISHING")
    await sleep(2000)

    const workflow = get().workflows.find((w) => w.id === id)!
    const shopifyId = `shopify-prod-${Math.floor(1000 + Math.random() * 9000)}`

    set((stateStore) => ({
      workflows: stateStore.workflows.map((w) =>
        w.id === id
          ? {
              ...w,
              state: "VERIFYING",
              publication: {
                shopifyProductId: shopifyId,
                publishedUrl: `https://${stateStore.settings.shopifyShopUrl}/products/${workflow.productDetails.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
                publishedAt: new Date().toISOString(),
                verificationStatus: "pending"
              },
              updatedAt: new Date().toISOString()
            }
          : w
      )
    }))

    await sleep(1500)

    set((stateStore) => ({
      workflows: stateStore.workflows.map((w) =>
        w.id === id
          ? {
              ...w,
              state: "COMPLETED",
              publication: {
                ...w.publication!,
                verificationStatus: "verified"
              },
              updatedAt: new Date().toISOString()
            }
          : w
      )
    }))
  },

  updateSettings: (newSettings: Partial<PlatformSettings>) => {
    set((stateStore) => ({
      settings: { ...stateStore.settings, ...newSettings }
    }))
  }
}))
