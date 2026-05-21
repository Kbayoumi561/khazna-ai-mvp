'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, MessageSquare, CheckSquare, Settings, Upload, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { name: 'Dashboard',    href: '/dashboard',      icon: LayoutDashboard },
  { name: 'Conversations', href: '/conversations',   icon: MessageSquare },
  { name: 'Audit',        href: '/audit',           icon: CheckSquare },
  { name: 'Import Data',  href: '/sheets-import',   icon: Upload },
  { name: 'Settings',     href: '/settings',        icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="w-56 h-screen sticky top-0 flex flex-col shrink-0"
      style={{
        background: 'hsl(222, 40%, 5%)',
        borderRight: '1px solid hsl(220, 18%, 10%)',
      }}
    >
      {/* Logo */}
      <div className="px-5 py-6 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, hsl(158, 64%, 48%) 0%, hsl(158, 64%, 36%) 100%)',
              boxShadow: '0 0 12px hsl(158, 64%, 48%, 0.35)',
            }}
          >
            <Activity className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <span className="text-sm font-semibold tracking-tight text-foreground">Khazna</span>
            <span className="block text-[10px] font-mono text-muted-foreground uppercase tracking-widest leading-none mt-0.5">
              Analytics
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group relative flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.04]'
              )}
            >
              {isActive && (
                <span
                  className="absolute left-0 inset-y-1 w-0.5 rounded-full"
                  style={{ background: 'hsl(158, 64%, 48%)', boxShadow: '0 0 8px hsl(158, 64%, 48%, 0.6)' }}
                />
              )}
              <span
                className={cn(
                  'flex items-center justify-center w-7 h-7 rounded-md transition-all duration-150',
                  isActive
                    ? 'bg-primary/10'
                    : 'group-hover:bg-white/[0.05]'
                )}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={isActive ? 2.5 : 2} />
              </span>
              <span className="tracking-tight">{item.name}</span>
              {item.name === 'Import Data' && (
                <span
                  className="ml-auto text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded"
                  style={{
                    background: 'hsl(158, 64%, 48%, 0.12)',
                    color: 'hsl(158, 64%, 55%)',
                    border: '1px solid hsl(158, 64%, 48%, 0.2)',
                  }}
                >
                  new
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-border/40">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full animate-pulse-dot"
            style={{ background: 'hsl(158, 64%, 48%)', boxShadow: '0 0 6px hsl(158, 64%, 48%, 0.5)' }}
          />
          <span className="text-[11px] font-mono text-muted-foreground">system · live</span>
        </div>
      </div>
    </aside>
  )
}
