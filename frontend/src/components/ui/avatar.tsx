import { cn } from "@/lib/utils"

interface AvatarProps {
  name: string
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeClasses = {
  sm: "size-8 text-sm",
  md: "size-9 text-sm",
  lg: "size-11 text-base",
}

function Avatar({ name, size = "md", className }: AvatarProps) {
  const initial = name.charAt(0)

  return (
    <span
      data-slot="avatar"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold select-none bg-black text-white dark:bg-white dark:text-black",
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
