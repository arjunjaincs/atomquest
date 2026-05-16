'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { Clock } from 'lucide-react'

export default function CyclesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [cycles, setCycles] = useState<any[]>([])

  useEffect(() => { if (!loading && !user) router.push('/login') }, [user, loading, router])
  useEffect(() => { fetch('/api/cycles').then(r => r.json()).then(setCycles).catch(() => {}) }, [])

  if (loading || !user) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}><div className="spinner" /></div>

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <Header />
        <div className="app-content">
          <div className="page-header">
            <h1 className="page-title">Goal Cycles</h1>
            <p className="page-desc">Manage goal-setting periods and check-in windows</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {cycles.map((c: any) => (
              <div key={c.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div className="stat-icon purple"><Clock size={22} /></div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{c.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      {new Date(c.startDate).toLocaleDateString()} → {new Date(c.endDate).toLocaleDateString()} • Phase: {c.phase}
                    </div>
                  </div>
                </div>
                <span className={`badge badge-${c.status === 'ACTIVE' ? 'success' : 'neutral'}`}>{c.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
