import { cn } from "@/lib/utils"

interface AvatarProps {
  name: string
  size?: "sm" | "md" | "lg"
  className?: string
}

function hashName(name: string): number {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
    hash |= 0
  }
  return Math.abs(hash)
}

const AVATAR_COLORS = [
  "bg-accent-heat",   // brand orange
  "bg-violet-600",
  "bg-sky-500",
  "bg-emerald-600",
  "bg-rose-500",
  "bg-amber-600",
  "bg-cyan-600",
  "bg-fuchsia-600",
  "bg-indigo-500",
  "bg-teal-600",
  "bg-pink-600",
  "bg-blue-600",
]

const sizeClasses = {
  sm: "size-8 text-sm",
  md: "size-9 text-sm",
  lg: "size-11 text-base",
}

function Avatar({ name, size = "md", className }: AvatarProps) {
  const initial = name.charAt(0)
  const colorClass = AVATAR_COLORS[hashName(name) % AVATAR_COLORS.length]

  return (
    <span
      data-slot="avatar"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white select-none",
        colorClass,
        sizeClasses[size],
        className
      )}
      aria-label={name}
    >
      {initial}
    </span>
  )
}

export { Avatar }
export type { AvatarProps }
