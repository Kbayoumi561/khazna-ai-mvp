import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

interface KPICardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: number
  subtitle?: string
  accentColor?: string
}

export function KPICard({ title, value, icon: Icon, trend, subtitle, accentColor = 'hsl(158, 64%, 48%)' }: KPICardProps) {
  return (
    <div
      className="card-hover relative rounded-lg p-5 overflow-hidden"
      style={{
        background: 'hsl(222, 35%, 7%)',
        border: '1px solid hsl(220, 18%, 11%)',
      }}
    >
      {/* accent top bar */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}60, transparent)` }}
      />

      {/* corner glow */}
      <div
        className="absolute top-0 right-0 w-20 h-20 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${accentColor}10 0%, transparent 70%)`,
          transform: 'translate(30%, -30%)',
        }}
      />

      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium tracking-wide uppercase text-muted-foreground/80">
          {title}
        </p>
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center"
          style={{ background: `${accentColor}14`, border: `1px solid ${accentColor}25` }}
        >
          <Icon className="h-3.5 w-3.5" style={{ color: accentColor }} strokeWidth={2} />
        </div>
      </div>

      <div className="font-data text-3xl font-medium tracking-tight text-foreground">
        {value}
      </div>

      {subtitle && (
        <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
      )}

      {trend !== undefined && (
        <div className="mt-3 flex items-center gap-1">
          {trend > 0
            ? <TrendingUp className="h-3 w-3 text-success" />
            : <TrendingDown className="h-3 w-3 text-destructive" />
          }
          <span className={`text-xs font-mono ${trend > 0 ? 'text-success' : 'text-destructive'}`}>
            {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
          </span>
          <span className="text-xs text-muted-foreground">vs last period</span>
        </div>
      )}
    </div>
  )
}
