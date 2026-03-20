type LoadingIndicatorProps = {
  label: string
}

export function LoadingIndicator({ label }: LoadingIndicatorProps) {
  return (
    <div
      className="inline-flex items-center gap-2 text-sm text-muted-foreground"
      role="status"
      aria-live="polite"
    >
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
      <span>{label}</span>
    </div>
  )
}
