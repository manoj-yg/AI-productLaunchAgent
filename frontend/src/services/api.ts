import axios from "axios"

// Base configuration for Axios, reading from Vite environments
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1"

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 120000, // 2 minutes for AI pipeline calls
})

export interface ApiProductDetails {
  title: string
  raw_description: string
  category: string
  target_audience: string
  price: number
  sku: string
  images: string[]
}

export interface ApiHumanReviewRequest {
  review_notes: string
  is_approved: boolean
  reviewer: string
}

export const workflowApi = {
  /**
   * Initializes a launch workflow by uploading product details.
   */
  initiateWorkflow: async (productDetails: ApiProductDetails) => {
    const res = await api.post("/workflows", { product_details: productDetails })
    return res.data
  },

  /**
   * Uploads a product image file to the backend and attaches it to the workflow.
   * Returns { image_url, filename, workflow_id }
   */
  uploadImage: async (workflowId: string, file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    const res = await axios.post(
      `${API_BASE_URL}/workflows/${workflowId}/upload-image`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" }, timeout: 30000 }
    )
    return res.data
  },

  /**
   * Triggers the full 6-agent automated pipeline using the Intake Agent payload.
   */
  startAgentWorkflow: async (payload: {
    product_name: string
    category: string
    age_group: string
    difficulty: string
    price: number
    duration?: string
    language: string
    tags: string[]
    learning_outcomes: string[]
    prerequisites: string[]
    product_images: string[]
    optional_notes?: string
  }) => {
    const res = await api.post("/agent-workflows", payload)
    return res.data
  },

  /**
   * Triggers the multi-stage AI agent launch pipeline in one go on an existing workflow.
   */
  orchestrateWorkflow: async (workflowId: string) => {
    const res = await api.post(`/workflows/${workflowId}/orchestrate`)
    return res.data
  },

  /**
   * Fetches an active workflow status / report document by ID.
   */
  getWorkflow: async (workflowId: string) => {
    const res = await api.get(`/workflows/${workflowId}`)
    return res.data
  },

  /**
   * Runs the Stage 2 Multimodal AI image analysis on product images.
   */
  analyzeImage: async (workflowId: string) => {
    const res = await api.post(`/workflows/${workflowId}/analyze`)
    return res.data
  },

  /**
   * Runs the Stage 3 description copywriting generator.
   */
  generateDescription: async (workflowId: string) => {
    const res = await api.post(`/workflows/${workflowId}/generate-description`)
    return res.data
  },

  /**
   * Runs the Stage 4 social media marketing copy generator.
   */
  generateMarketing: async (workflowId: string) => {
    const res = await api.post(`/workflows/${workflowId}/generate-marketing`)
    return res.data
  },

  /**
   * Runs the Stage 5 text-to-image generator prompts builder.
   */
  generatePrompts: async (workflowId: string) => {
    const res = await api.post(`/workflows/${workflowId}/generate-prompts`)
    return res.data
  },

  /**
   * Runs the Stage 6 validation audit guidelines compliance checker.
   */
  validateContent: async (workflowId: string) => {
    const res = await api.post(`/workflows/${workflowId}/validate`)
    return res.data
  },

  /**
   * Submits human review approval/rejection notes.
   */
  submitReview: async (workflowId: string, review: ApiHumanReviewRequest) => {
    const res = await api.post(`/workflows/${workflowId}/review`, review)
    return res.data
  },

  /**
   * Publishes the approved product to local catalog.
   */
  publishToShopify: async (workflowId: string) => {
    const res = await api.post(`/workflows/${workflowId}/publish`)
    return res.data
  },

  /**
   * Verifies the publication status.
   */
  verifyPublication: async (workflowId: string) => {
    const res = await api.post(`/workflows/${workflowId}/verify`)
    return res.data
  },

  /**
   * Lists the most recent active or finished workflows.
   */
  listWorkflows: async (limit: number = 30, offset: number = 0) => {
    const res = await api.get("/workflows", { params: { limit, offset } })
    return res.data
  },

  /**
   * Deletes a workflow document from database.
   */
  deleteWorkflow: async (workflowId: string) => {
    const res = await api.delete(`/workflows/${workflowId}`)
    return res.data
  },
}
