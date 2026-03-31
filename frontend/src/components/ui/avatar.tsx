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
  "bg-red-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-yellow-500",
  "bg-lime-500",
  "bg-green-500",
  "bg-emerald-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-sky-500",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-purple-500",
  "bg-fuchsia-500",
  "bg-pink-500",
  "bg-rose-500",
]

const sizeClasses = {
  sm: "size-7 text-xs",
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
