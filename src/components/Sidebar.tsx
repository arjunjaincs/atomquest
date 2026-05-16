'use client'

import { useAuth } from '@/context/AuthContext'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Target, CheckSquare, Users, BarChart3, Shield, Clock, FileText, Settings, LogOut, Bell, ChevronRight } from 'lucide-react'

const navConfig = {
  EMPLOYEE: [
    { section: 'Overview', items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ]},
    { section: 'Goals', items: [
      { label: 'My Goals', href: '/goals', icon: Target },
      { label: 'Check-ins', href: '/checkins', icon: CheckSquare },
    ]},
    { section: 'Activity', items: [
      { label: 'Notifications', href: '/notifications', icon: Bell },
    ]},
  ],
  MANAGER: [
    { section: 'Overview', items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ]},
    { section: 'Team', items: [
      { label: 'Team Goals', href: '/goals', icon: Target },
      { label: 'Approvals', href: '/approvals', icon: CheckSquare },
      { label: 'Check-in Reviews', href: '/checkins', icon: FileText },
    ]},
    { section: 'Activity', items: [
      { label: 'Notifications', href: '/notifications', icon: Bell },
    ]},
  ],
  ADMIN: [
    { section: 'Overview', items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ]},
    { section: 'Management', items: [
      { label: 'All Goals', href: '/goals', icon: Target },
      { label: 'Users', href: '/users', icon: Users },
      { label: 'Cycles', href: '/cycles', icon: Clock },
    ]},
    { section: 'Insights', items: [
      { label: 'Analytics', href: '/analytics', icon: BarChart3 },
      { label: 'Audit Trail', href: '/audit', icon: Shield },
      { label: 'Escalation', href: '/escalation', icon: Bell },
    ]},
  ],
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  if (!user) return null

  const sections = navConfig[user.role] || navConfig.EMPLOYEE

  return (
    <aside className="app-sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">GF</div>
        <div>
          <div className="sidebar-logo-text">GoalFlow</div>
          <div className="sidebar-logo-badge">by Atomberg</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {sections.map((section) => (
          <div key={section.section} className="sidebar-section">
            <div className="sidebar-section-title">{section.section}</div>
            {section.items.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <button
                  key={item.href}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={() => router.push(item.href)}
                >
                  <Icon />
                  {item.label}
                  {isActive && <ChevronRight style={{ marginLeft: 'auto', width: 14, height: 14 }} />}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div className="avatar" style={{ background: user.avatarColor }}>
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user.role}</div>
          </div>
        </div>
        <button className="sidebar-link" onClick={() => { logout(); router.push('/login'); }} style={{ color: 'var(--danger)' }}>
          <LogOut />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
