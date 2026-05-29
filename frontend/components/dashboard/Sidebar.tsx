'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ScrollText,
  Building2,
  Cpu,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'




interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

const NAV: NavItem[] = [
  { label: 'Threat Feed', href: '/dashboard', icon: LayoutDashboard },
  { label: 'All Bills', href: '/bills', icon: ScrollText },
  { label: 'Company Profile', href: '/profile', icon: Building2 },
  { label: 'Model Router', href: '/dashboard/model-router', icon: Cpu },
]





export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col gap-8 border-r border-[var(--color-border-soft)] bg-[var(--color-ink-900)]/40 px-5 py-7">
      <Link href="/" className="group flex cursor-pointer items-center gap-3 select-none">
        <span className="text-2xl font-bold tracking-tight text-white transition-transform duration-300 group-hover:scale-105">
          見先
        </span>
        <span className="text-base font-semibold text-white/90">Misaki</span>
      </Link>

      <nav className="flex flex-col gap-1.5">
        {NAV.map((item) => {
          const active = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5',
                'text-base font-medium transition-all duration-200',
                active
                  ? 'bg-white/[0.06] text-white'
                  : 'text-white/65 hover:bg-white/[0.04] hover:text-white',
              )}
            >
              <Icon
                size={20}
                strokeWidth={1.75}
                className="shrink-0 transition-transform duration-200 group-hover:scale-110"
              />
              <span>{item.label}</span>
              {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white" aria-hidden />}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto rounded-xl border border-[var(--color-border-soft)] bg-white/[0.02] p-4">
        <div className="text-[13px] font-medium text-white/55">Monitoring</div>
        <div className="mt-1 text-base font-semibold text-white">NovaTech, Inc.</div>
        <div className="mt-0.5 text-[13px] text-white/55">Series C · SaaS · 38 states + EU</div>
      </div>
    </aside>
  )
}
