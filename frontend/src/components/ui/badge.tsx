import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "./button"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info"
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const baseStyles =
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none"
  
  const variants = {
    default: "border-transparent bg-primary text-primary-foreground shadow",
    secondary: "border-transparent bg-secondary text-secondary-foreground",
    destructive:
      "border-transparent bg-red-500/10 text-red-400 border-red-500/20",
    outline: "text-slate-300 border-slate-700 bg-transparent",
    success: "border-green-500/20 bg-green-500/10 text-green-400",
    warning: "border-yellow-500/20 bg-yellow-500/10 text-yellow-400",
    info: "border-blue-500/20 bg-blue-500/10 text-blue-400"
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(baseStyles, variants[variant], className)}
      {...(props as any)}
    />
  )
}
