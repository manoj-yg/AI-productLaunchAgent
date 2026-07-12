import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "./button"

export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { hoverGlow?: boolean }
>(({ className, hoverGlow = false, ...props }, ref) => (
  <motion.div
    ref={ref as any}
    className={cn(
      "rounded-2xl border border-slate-800/80 bg-slate-950/45 p-6 backdrop-blur-xl shadow-lg",
      hoverGlow && "hover:border-primary/30 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5",
      className
    )}
    {...(props as any)}
  />
))
Card.displayName = "Card"

export const CardHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 pb-4", className)} {...props} />
)
CardHeader.displayName = "CardHeader"

export const CardTitle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={cn(
      "text-lg font-bold leading-none tracking-tight text-slate-100",
      className
    )}
    {...props}
  />
)
CardTitle.displayName = "CardTitle"

export const CardDescription = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p
    className={cn("text-xs text-muted-foreground", className)}
    {...props}
  />
)
CardDescription.displayName = "CardDescription"

export const CardContent = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("pt-0", className)} {...props} />
)
CardContent.displayName = "CardContent"

export const CardFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex items-center pt-4 border-t border-slate-900", className)}
    {...props}
  />
)
CardFooter.displayName = "CardFooter"
