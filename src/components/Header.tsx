'use client'

import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { useRouter } from 'next/navigation'
import { Sun, Moon, Bell, Sparkles } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Header() {
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()
  const [notifications, setNotifications] = useState(0)

  useEffect(() => {
    if (!user) return
    fetch(`/api/notifications?userId=${user.id}&unread=true`)
      .then(r => r.ok ? r.json() : { count: 0 })
      .then(d => setNotifications(d.count || 0))
      .catch(() => {})
  }, [user])

  if (!user) return null

  return (
    <header className="app-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Sparkles size={18} style={{ color: 'var(--accent)' }} />
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          AI-Powered Goal Management
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '4px 12px', background: 'var(--bg-input)', borderRadius: 6 }}>
          {user.department} • {user.role}
        </div>

        <button
          className="btn-icon btn-ghost"
          style={{ position: 'relative' }}
          aria-label="Notifications"
          onClick={() => router.push('/notifications')}
        >
          <Bell size={18} />
          {notifications > 0 && <span className="notif-dot" />}
        </button>

        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          <div className="theme-toggle-knob" />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 4 }}>
          {theme === 'dark' ? <Moon size={14} style={{ color: 'var(--text-muted)' }} /> : <Sun size={14} style={{ color: 'var(--warning)' }} />}
        </div>
      </div>
    </header>
  )
}
