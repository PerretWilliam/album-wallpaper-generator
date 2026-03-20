import type { ReactNode } from "react"

type EmptyStateProps = {
  icon: ReactNode
  title: string
  description: string
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  )
}
