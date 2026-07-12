import { create } from "zustand"
import { workflowApi } from "../services/api"

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
  loading: boolean
  error: string | null

  // Actions
  login: (username: string) => void
  logout: () => void
  fetchWorkflows: () => Promise<void>
  addWorkflow: (details: ProductDetails, imageFiles?: File[]) => Promise<string>
  deleteWorkflow: (id: string) => void
  updateWorkflowState: (id: string, state: WorkflowState) => void
  updateWorkflowData: (id: string, data: Partial<LaunchWorkflow>) => void
  runAIPipeline: (id: string) => Promise<void>
  submitReview: (id: string, isApproved: boolean, notes: string) => Promise<void>
  publishProduct: (id: string) => Promise<void>
  updateSettings: (settings: Partial<PlatformSettings>) => void
}

/**
 * Maps the snake_case API response into the camelCase frontend structures.
 */
function mapApiToWorkflow(data: any): LaunchWorkflow {
  const pd = data.product_details || {}
  const ia = data.image_analysis || {}
  const gd = data.generated_description || {}
  const mc = data.marketing_content || {}
  const ip = data.image_prompts || {}
  const val = data.validation || {}
  const pub = data.publication || {}

  // Normalize state
  let state: WorkflowState = "UPLOADED"
  const rawState = (data.state || "UPLOADED").toUpperCase()
  if (rawState in ["UPLOADED","ANALYZING","ANALYZED","GENERATING_DESC","DESC_GENERATED",
    "GENERATING_MKTG","MKTG_GENERATED","GENERATING_PROMPTS","PROMPTS_GENERATED",
    "VALIDATING","VALIDATED","APPROVED","REJECTED","PUBLISHING","PUBLISHED",
    "VERIFYING","COMPLETED","FAILED"]) {
    state = rawState as WorkflowState
  } else {
    state = rawState as WorkflowState
  }

  return {
    id: data.id || data.workflow_id || "",
    createdAt: data.created_at ? new Date(data.created_at).toISOString() : new Date().toISOString(),
    updatedAt: data.updated_at ? new Date(data.updated_at).toISOString() : new Date().toISOString(),
    state,
    productDetails: {
      title: pd.title || "",
      rawDescription: pd.raw_description || "",
      category: pd.category || "",
      targetAudience: pd.target_audience || "",
      price: pd.price || 0,
      sku: pd.sku || data.id || "",
      images: pd.images || []
    },
    imageAnalysis: ia && ia.product_type ? {
      productType: ia.product_type || "",
      features: ia.detected_features || ia.features || [],
      suggestedColors: ia.suggested_colors || ia.colors || [],
      materials: ia.materials || [],
      styleKeywords: ia.style_keywords || [ia.style || ""],
      rawSummary: ia.raw_analysis || ia.summary || ""
    } : undefined,
    generatedDescription: gd && gd.title ? {
      title: gd.title || "",
      descriptionHtml: gd.description_html || gd.long_description || "",
      seoTitle: gd.seo_title || gd.title || "",
      seoDescription: gd.seo_description || gd.short_description || "",
      tags: gd.tags || []
    } : undefined,
    marketingContent: mc && (mc.social_copy || mc.instagram_caption) ? {
      socialCopy: {
        instagram: mc.social_copy?.instagram || mc.instagram_caption || "",
        facebook: mc.social_copy?.facebook || mc.facebook_post || "",
        twitter: mc.social_copy?.twitter || mc.twitter_x_post || ""
      },
      adCopy: {
        metaHeadline: mc.ad_copy?.meta_headline || mc.promotional_headline || "",
        metaBody: mc.ad_copy?.meta_body || mc.banner_text || "",
        googleHeadline: mc.ad_copy?.google_headline || mc.cta || ""
      },
      emailNewsletter: mc.email_newsletter || mc.email_campaign || ""
    } : undefined,
    imagePrompts: ip && (ip.lifestyle_prompts || ip.lifestyle_image) ? {
      lifestylePrompts: ip.lifestyle_prompts || [ip.lifestyle_image || ""],
      studioPrompts: ip.studio_prompts || [ip.course_thumbnail || "", ip.hero_banner || ""]
    } : undefined,
    validation: val && val.is_valid !== undefined ? {
      isValid: val.is_valid || false,
      policyCheckPassed: val.policy_check_passed || false,
      suggestions: val.suggestions || [],
      logs: val.validation_logs || []
    } : undefined,
    publication: pub && pub.shopify_product_id ? {
      shopifyProductId: pub.shopify_product_id || "",
      publishedUrl: pub.published_url || "",
      publishedAt: pub.published_at ? new Date(pub.published_at).toISOString() : "",
      verificationStatus: pub.verification_status || "pending"
    } : undefined,
    errorMessage: data.error_message || undefined
  }
}

export const useLaunchStore = create<LaunchState>((set, get) => ({
  user: {
    username: "Alex Admin",
    role: "administrator",
    isAuthenticated: true
  },
  workflows: [],
  activeWorkflowId: null,
  settings: {
    shopifyShopUrl: "kiddypi.myshopify.com",
    shopifyAccessToken: "",
    defaultLanguage: "en",
    brandVoice: "playful",
    primaryColor: "#3b82f6"
  },
  loading: false,
  error: null,

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
      user: { username: "", role: "reviewer", isAuthenticated: false }
    })
  },

  fetchWorkflows: async () => {
    set({ loading: true, error: null })
    try {
      const res = await workflowApi.listWorkflows(30, 0)
      const workflows = (res.workflows || []).map((w: any) => mapApiToWorkflow(w))
      set({ workflows, loading: false })
    } catch (e: any) {
      set({ error: e.message || "Failed to fetch workflows", loading: false })
    }
  },

  addWorkflow: async (details: ProductDetails, imageFiles?: File[]) => {
    set({ loading: true, error: null })
    try {
      // 1. Create workflow first to get an ID
      const res = await workflowApi.initiateWorkflow({
        title: details.title,
        raw_description: details.rawDescription,
        category: details.category,
        target_audience: details.targetAudience,
        price: details.price,
        sku: details.sku,
        images: []
      })

      const workflowId = res.workflow?.id || res.id
      const uploadedUrls: string[] = []

      // 2. Upload image files to backend
      if (imageFiles && imageFiles.length > 0) {
        for (const file of imageFiles) {
          try {
            const uploadRes = await workflowApi.uploadImage(workflowId, file)
            uploadedUrls.push(uploadRes.image_url)
          } catch (uploadErr) {
            console.warn("Image upload failed, skipping:", uploadErr)
          }
        }
      }

      // 3. If no uploads succeeded, use a placeholder
      if (uploadedUrls.length === 0) {
        uploadedUrls.push(
          "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80"
        )
      }

      // 4. Build local workflow object
      const newWorkflow: LaunchWorkflow = {
        id: workflowId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        state: "UPLOADED",
        productDetails: { ...details, images: uploadedUrls }
      }

      set((s) => ({
        workflows: [newWorkflow, ...s.workflows],
        activeWorkflowId: workflowId,
        loading: false
      }))

      return workflowId
    } catch (e: any) {
      set({ error: e.message || "Failed to create workflow", loading: false })
      throw e
    }
  },

  deleteWorkflow: (id: string) => {
    set((s) => ({
      workflows: s.workflows.filter((w) => w.id !== id),
      activeWorkflowId: s.activeWorkflowId === id ? null : s.activeWorkflowId
    }))
  },

  updateWorkflowState: (id: string, state: WorkflowState) => {
    set((s) => ({
      workflows: s.workflows.map((w) =>
        w.id === id ? { ...w, state, updatedAt: new Date().toISOString() } : w
      )
    }))
  },

  updateWorkflowData: (id: string, data: Partial<LaunchWorkflow>) => {
    set((s) => ({
      workflows: s.workflows.map((w) =>
        w.id === id ? { ...w, ...data, updatedAt: new Date().toISOString() } : w
      )
    }))
  },

  runAIPipeline: async (id: string) => {
    set({ loading: true, error: null })
    const steps: Array<{ state: WorkflowState; api: () => Promise<any> }> = [
      { state: "ANALYZING",          api: () => workflowApi.analyzeImage(id) },
      { state: "GENERATING_DESC",    api: () => workflowApi.generateDescription(id) },
      { state: "GENERATING_MKTG",    api: () => workflowApi.generateMarketing(id) },
      { state: "GENERATING_PROMPTS", api: () => workflowApi.generatePrompts(id) },
      { state: "VALIDATING",         api: () => workflowApi.validateContent(id) },
    ]

    try {
      for (const step of steps) {
        get().updateWorkflowState(id, step.state)
        const res = await step.api()
        if (res?.workflow) {
          const mapped = mapApiToWorkflow(res.workflow)
          get().updateWorkflowData(id, mapped)
        }
      }

      // Final fetch to get fully populated workflow
      const finalRes = await workflowApi.getWorkflow(id)
      const mapped = mapApiToWorkflow(finalRes.workflow || finalRes)
      set((s) => ({
        workflows: s.workflows.map((w) => w.id === id ? { ...mapped, state: "VALIDATED" } : w),
        loading: false
      }))
    } catch (e: any) {
      set({ error: e.message || "AI pipeline failed", loading: false })
      get().updateWorkflowState(id, "FAILED")
    }
  },

  submitReview: async (id: string, isApproved: boolean, notes: string) => {
    set({ loading: true, error: null })
    try {
      const res = await workflowApi.submitReview(id, {
        review_notes: notes,
        is_approved: isApproved,
        reviewer: get().user.username || "Admin"
      })

      const newState: WorkflowState = isApproved ? "APPROVED" : "REJECTED"
      set((s) => ({
        workflows: s.workflows.map((w) =>
          w.id === id ? { ...w, state: newState, feedbackNotes: notes, updatedAt: new Date().toISOString() } : w
        ),
        loading: false
      }))
    } catch (e: any) {
      set({ error: e.message || "Review submission failed", loading: false })
    }
  },

  publishProduct: async (id: string) => {
    set({ loading: true, error: null })
    try {
      get().updateWorkflowState(id, "PUBLISHING")
      await workflowApi.publishToShopify(id)
      get().updateWorkflowState(id, "VERIFYING")
      const verifyRes = await workflowApi.verifyPublication(id)
      const mapped = mapApiToWorkflow(verifyRes.workflow || verifyRes)
      set((s) => ({
        workflows: s.workflows.map((w) => w.id === id ? { ...mapped, state: "COMPLETED" } : w),
        loading: false
      }))
    } catch (e: any) {
      set({ error: e.message || "Publication failed", loading: false })
      get().updateWorkflowState(id, "FAILED")
    }
  },

  updateSettings: (newSettings: Partial<PlatformSettings>) => {
    set((s) => ({ settings: { ...s.settings, ...newSettings } }))
  }
}))
