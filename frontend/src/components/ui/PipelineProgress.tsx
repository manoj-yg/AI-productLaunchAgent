import { motion } from "framer-motion"
import { CheckCircle, Loader2, Clock, AlertCircle } from "lucide-react"
import { WorkflowState } from "../../store/useLaunchStore"

interface PipelineStep {
  id: string
  label: string
  description: string
  activeStates: WorkflowState[]
  completedStates: WorkflowState[]
}

const PIPELINE_STEPS: PipelineStep[] = [
  {
    id: "intake",
    label: "Product Intake",
    description: "Validating & cataloging product details",
    activeStates: ["UPLOADED"],
    completedStates: ["ANALYZING","ANALYZED","GENERATING_DESC","DESC_GENERATED","GENERATING_MKTG","MKTG_GENERATED","GENERATING_PROMPTS","PROMPTS_GENERATED","VALIDATING","VALIDATED","APPROVED","REJECTED","PUBLISHING","PUBLISHED","VERIFYING","COMPLETED"]
  },
  {
    id: "vision",
    label: "Vision Analysis",
    description: "Gemini AI analyzing product images",
    activeStates: ["ANALYZING"],
    completedStates: ["ANALYZED","GENERATING_DESC","DESC_GENERATED","GENERATING_MKTG","MKTG_GENERATED","GENERATING_PROMPTS","PROMPTS_GENERATED","VALIDATING","VALIDATED","APPROVED","REJECTED","PUBLISHING","PUBLISHED","VERIFYING","COMPLETED"]
  },
  {
    id: "description",
    label: "Description Copy",
    description: "Generating SEO product description & tags",
    activeStates: ["ANALYZED","GENERATING_DESC"],
    completedStates: ["DESC_GENERATED","GENERATING_MKTG","MKTG_GENERATED","GENERATING_PROMPTS","PROMPTS_GENERATED","VALIDATING","VALIDATED","APPROVED","REJECTED","PUBLISHING","PUBLISHED","VERIFYING","COMPLETED"]
  },
  {
    id: "marketing",
    label: "Marketing Content",
    description: "Creating social media & ad campaign copy",
    activeStates: ["DESC_GENERATED","GENERATING_MKTG"],
    completedStates: ["MKTG_GENERATED","GENERATING_PROMPTS","PROMPTS_GENERATED","VALIDATING","VALIDATED","APPROVED","REJECTED","PUBLISHING","PUBLISHED","VERIFYING","COMPLETED"]
  },
  {
    id: "prompts",
    label: "Image Prompts",
    description: "Building AI image generation prompts",
    activeStates: ["MKTG_GENERATED","GENERATING_PROMPTS"],
    completedStates: ["PROMPTS_GENERATED","VALIDATING","VALIDATED","APPROVED","REJECTED","PUBLISHING","PUBLISHED","VERIFYING","COMPLETED"]
  },
  {
    id: "validation",
    label: "Safety Validation",
    description: "Policy & content compliance audit",
    activeStates: ["PROMPTS_GENERATED","VALIDATING"],
    completedStates: ["VALIDATED","APPROVED","REJECTED","PUBLISHING","PUBLISHED","VERIFYING","COMPLETED"]
  },
  {
    id: "review",
    label: "Human Review",
    description: "Awaiting human approval",
    activeStates: ["VALIDATED"],
    completedStates: ["APPROVED","PUBLISHING","PUBLISHED","VERIFYING","COMPLETED"]
  },
  {
    id: "publish",
    label: "Published",
    description: "Product live in local catalog",
    activeStates: ["APPROVED","PUBLISHING","VERIFYING","PUBLISHED"],
    completedStates: ["COMPLETED"]
  }
]

interface PipelineProgressProps {
  state: WorkflowState
  compact?: boolean
}

export default function PipelineProgress({ state, compact = false }: PipelineProgressProps) {
  const isFailed = state === "FAILED"

  const getStepStatus = (step: PipelineStep): "completed" | "active" | "pending" | "failed" => {
    if (isFailed) {
      if (step.activeStates.includes(state as WorkflowState)) return "failed"
    }
    if (step.completedStates.includes(state)) return "completed"
    if (step.activeStates.includes(state)) return "active"
    return "pending"
  }

  if (compact) {
    const completedCount = PIPELINE_STEPS.filter(s => s.completedStates.includes(state)).length
    const totalSteps = PIPELINE_STEPS.length
    const pct = Math.round((completedCount / totalSteps) * 100)

    return (
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-500 font-medium">Pipeline Progress</span>
          <span className="font-bold text-primary">{pct}%</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <p className="text-[10px] text-slate-400">
          {completedCount}/{totalSteps} stages complete
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {PIPELINE_STEPS.map((step, idx) => {
        const status = getStepStatus(step)
        return (
          <div key={step.id} className="flex items-start gap-3">
            {/* Step icon */}
            <div className="flex flex-col items-center">
              <motion.div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                  status === "completed" ? "bg-green-100" :
                  status === "active" ? "bg-blue-100" :
                  status === "failed" ? "bg-red-100" :
                  "bg-slate-100"
                }`}
                animate={status === "active" ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                {status === "completed" && <CheckCircle className="w-4 h-4 text-green-600" />}
                {status === "active" && <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />}
                {status === "pending" && <Clock className="w-4 h-4 text-slate-400" />}
                {status === "failed" && <AlertCircle className="w-4 h-4 text-red-500" />}
              </motion.div>
              {idx < PIPELINE_STEPS.length - 1 && (
                <div className={`w-0.5 h-6 mt-1 ${status === "completed" ? "bg-green-200" : "bg-slate-100"}`} />
              )}
            </div>

            {/* Step content */}
            <div className="pb-2 min-w-0">
              <p className={`text-xs font-semibold ${
                status === "completed" ? "text-green-700" :
                status === "active" ? "text-blue-700" :
                status === "failed" ? "text-red-600" :
                "text-slate-400"
              }`}>
                {step.label}
              </p>
              {(status === "active" || status === "completed") && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[10px] text-slate-500 mt-0.5 leading-tight"
                >
                  {step.description}
                </motion.p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
