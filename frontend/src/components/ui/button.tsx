import * as React from "react"
import { motion } from "framer-motion"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "glow"
  size?: "default" | "sm" | "lg" | "icon"
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
    
    const variants = {
      default: "bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/20",
      destructive: "bg-destructive text-white hover:bg-destructive/90 shadow-md shadow-destructive/20",
      outline: "border border-slate-800 bg-transparent hover:bg-slate-900 text-slate-300",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      ghost: "hover:bg-slate-950 text-slate-300 hover:text-slate-100",
      link: "text-primary underline-offset-4 hover:underline",
      glow: "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:shadow-[0_0_20px_rgba(59,130,246,0.7)]"
    }

    const sizes = {
      default: "h-11 px-5 py-2",
      sm: "h-9 px-3 rounded-lg text-xs",
      lg: "h-12 px-8 rounded-xl text-base",
      icon: "h-10 w-10"
    }

    return (
      <motion.button
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref as any}
        {...(props as any)}
      />
    )
  }
)
Button.displayName = "Button"
