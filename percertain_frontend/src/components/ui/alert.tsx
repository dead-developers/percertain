import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        error:
          "border-red-500/50 text-red-700 bg-red-50 dark:bg-red-950/30 dark:text-red-400",
        success:
          "border-green-500/50 text-green-700 bg-green-50 dark:bg-green-950/30 dark:text-green-400",
        warning:
          "border-yellow-500/50 text-yellow-700 bg-yellow-50 dark:bg-yellow-950/30 dark:text-yellow-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string
  onClose?: () => void
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, title, onClose, children, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-2 top-2 text-current opacity-70 hover:opacity-100"
        >
          ×
        </button>
      )}
      {title && <AlertTitle>{title}</AlertTitle>}
      {children}
    </div>
  )
)
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
