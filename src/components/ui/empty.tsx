import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface EmptyProps {
  icon?: ReactNode
  title: string
  description?: string
  children?: ReactNode
  className?: string
}

export function Empty({
  icon,
  title,
  description,
  children,
  className,
}: EmptyProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-12",
        className
      )}
    >
      {icon && <div className="mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-6">{description}</p>
      )}
      {children}
    </div>
  )
}
