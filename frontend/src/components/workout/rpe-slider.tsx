import { cn } from "@/lib/utils"

const RPE_LABELS: Record<number, string> = {
  1: "매우 쉬움",
  2: "쉬움",
  3: "가벼움",
  4: "적당",
  5: "보통",
  6: "약간 힘듦",
  7: "힘듦",
  8: "매우 힘듦",
  9: "극한",
  10: "최대",
}

export function RpeSlider({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-xs text-muted-foreground">운동 강도 (RPE)</label>
        <span className="text-sm font-medium">
          RPE {value}{" "}
          <span className="text-xs text-muted-foreground font-normal">
            {RPE_LABELS[value]}
          </span>
        </span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={cn(
              "flex-1 h-9 rounded-lg text-xs font-medium transition-colors",
              n <= value
                ? n <= 3
                  ? "bg-primary/60 text-primary-foreground"
                  : n <= 6
                  ? "bg-primary text-primary-foreground"
                  : n <= 8
                  ? "bg-accent-heat/80 text-white"
                  : "bg-red-500/80 text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}
