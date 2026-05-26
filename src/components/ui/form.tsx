"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

function FormItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="form-item" className={cn("flex flex-col gap-1.5", className)} {...props} />
}

function FormLabel({
  className,
  required,
  children,
  ...props
}: React.ComponentProps<typeof Label> & { required?: boolean }) {
  return (
    <Label
      className={cn("text-xs font-medium uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1.5", className)}
      {...props}
    >
      {children}
      {required && <span className="text-destructive font-bold text-sm leading-none">*</span>}
    </Label>
  )
}

function FormControl({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="form-control" className={cn("w-full", className)} {...props} />
}

function FormDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p data-slot="form-description" className={cn("text-xs text-muted-foreground", className)} {...props} />
}

function FormMessage({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  if (!children) return null
  return (
    <p data-slot="form-message" className={cn("text-xs text-destructive font-medium", className)} {...props}>
      {children}
    </p>
  )
}

export { FormItem, FormLabel, FormControl, FormDescription, FormMessage }
