import { cn } from "@/lib/utils"

interface FilterChipProps {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}

export function FilterChip({ active, onClick, children }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 h-7 rounded-full px-3 text-xs font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-card text-foreground",
      )}
    >
      {children}
    </button>
  )
}
