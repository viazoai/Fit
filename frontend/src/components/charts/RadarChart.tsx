interface RadarAxis {
  label: string
  value: number
  max: number
  target?: number  // 목표치 (없으면 목표선 미표시)
}

interface RadarChartProps {
  data: RadarAxis[]
  size?: number
}

export function RadarChart({ data, size = 200 }: RadarChartProps) {
  const cx = size / 2
  const cy = size / 2
  const r = (size / 2) * 0.72 // radius for max value
  const n = data.length

  function angleOf(i: number) {
    return (Math.PI * 2 * i) / n - Math.PI / 2
  }

  function pointAt(i: number, ratio: number) {
    const a = angleOf(i)
    return {
      x: cx + r * ratio * Math.cos(a),
      y: cy + r * ratio * Math.sin(a),
    }
  }

  // Reference rings at 25%, 50%, 75%, 100%
  const rings = [0.25, 0.5, 0.75, 1.0]

  function ringPath(ratio: number) {
    const pts = Array.from({ length: n }, (_, i) => pointAt(i, ratio))
    return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ") + " Z"
  }

  // Data polygon
  const dataPath = (() => {
    const pts = data.map((d, i) => {
      const ratio = d.max > 0 ? Math.min(d.value / d.max, 1) : 0
      return pointAt(i, ratio)
    })
    return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ") + " Z"
  })()

  // Target polygon (목표치가 하나라도 있을 때만 표시)
  const hasTarget = data.some((d) => d.target != null)
  const targetPath = hasTarget
    ? (() => {
        const pts = data.map((d, i) => {
          const t = d.target ?? d.value
          const ratio = d.max > 0 ? Math.min(t / d.max, 1) : 0
          return pointAt(i, ratio)
        })
        return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ") + " Z"
      })()
    : null

  const labelOffset = 1.18

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Reference rings */}
      {rings.map((ratio) => (
        <path
          key={ratio}
          d={ringPath(ratio)}
          fill="none"
          stroke="currentColor"
          strokeWidth={ratio === 1 ? 1 : 0.75}
          className="text-muted-foreground"
          opacity={ratio === 1 ? 0.4 : 0.2}
        />
      ))}

      {/* Axis lines */}
      {data.map((_, i) => {
        const outer = pointAt(i, 1)
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={outer.x.toFixed(2)}
            y2={outer.y.toFixed(2)}
            stroke="currentColor"
            strokeWidth="0.75"
            className="text-muted-foreground"
            opacity={0.25}
          />
        )
      })}

      {/* Target polygon (라임 점선) */}
      {targetPath && (
        <path
          d={targetPath}
          fill="rgb(204 255 0 / 0.06)"
          stroke="rgb(204 255 0 / 0.7)"
          strokeWidth="1.25"
          strokeDasharray="3 2.5"
          strokeLinejoin="round"
        />
      )}

      {/* Data polygon */}
      <path
        d={dataPath}
        fill="rgb(255 107 26 / 0.15)"
        stroke="rgb(255 107 26 / 0.8)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Data dots */}
      {data.map((d, i) => {
        const ratio = d.max > 0 ? Math.min(d.value / d.max, 1) : 0
        const pt = pointAt(i, ratio)
        return (
          <circle
            key={i}
            cx={pt.x}
            cy={pt.y}
            r="3"
            fill="rgb(255 107 26)"
          />
        )
      })}

      {/* Labels */}
      {data.map((d, i) => {
        const pt = pointAt(i, labelOffset)
        return (
          <text
            key={i}
            x={pt.x.toFixed(2)}
            y={pt.y.toFixed(2)}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="9"
            fill="currentColor"
            className="text-muted-foreground"
          >
            {d.label}
          </text>
        )
      })}
    </svg>
  )
}
