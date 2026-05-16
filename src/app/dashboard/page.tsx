'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { Target, CheckSquare, Clock, TrendingUp, Users, AlertTriangle, BarChart3, Sparkles } from 'lucide-react'

interface DashboardStats {
  totalGoals: number
  approvedGoals: number
  pendingApprovals: number
  checkInsCompleted: number
  avgScore: number
  teamMembers?: number
}

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [goals, setGoals] = useState<any[]>([])

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    fetch(`/api/dashboard?userId=${user.id}&role=${user.role}`)
      .then(r => r.json())
      .then(d => { setStats(d.stats); setGoals(d.recentGoals || []) })
      .catch(() => {})
  }, [user])

  if (loading || !user) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}><div className="spinner" /></div>

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <Header />
        <div className="app-content">
          <div className="page-header">
            <h1 className="page-title">
              {user.role === 'ADMIN' ? 'Organization Overview' : user.role === 'MANAGER' ? 'Team Dashboard' : 'My Dashboard'}
            </h1>
            <p className="page-desc">Welcome back, {user.name.split(' ')[0]}! Here&apos;s your goal performance summary.</p>
          </div>

          <div className="stats-grid">
            <div className="stat-card animate-in">
              <div className="stat-icon purple"><Target size={22} /></div>
              <div><div className="stat-value">{stats?.totalGoals ?? '—'}</div><div className="stat-label">Total Goals</div></div>
            </div>
            <div className="stat-card animate-in" style={{ animationDelay: '0.05s' }}>
              <div className="stat-icon green"><CheckSquare size={22} /></div>
              <div><div className="stat-value">{stats?.approvedGoals ?? '—'}</div><div className="stat-label">Approved</div></div>
            </div>
            <div className="stat-card animate-in" style={{ animationDelay: '0.1s' }}>
              <div className="stat-icon amber"><Clock size={22} /></div>
              <div><div className="stat-value">{stats?.pendingApprovals ?? '—'}</div><div className="stat-label">Pending Review</div></div>
            </div>
            <div className="stat-card animate-in" style={{ animationDelay: '0.15s' }}>
              <div className="stat-icon cyan"><TrendingUp size={22} /></div>
              <div><div className="stat-value">{stats?.avgScore != null ? `${Math.round(stats.avgScore)}%` : '—'}</div><div className="stat-label">Avg Score</div></div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div className="card animate-in" style={{ animationDelay: '0.2s' }}>
              <div className="card-header">
                <div><div className="card-title">Recent Goals</div><div className="card-subtitle">Latest goal activity</div></div>
                <button className="btn btn-sm btn-secondary" onClick={() => router.push('/goals')}>View All</button>
              </div>
              {goals.length === 0 ? (
                <div className="empty-state" style={{ padding: 40 }}>
                  <Target size={40} style={{ opacity: 0.3 }} />
                  <h3>No goals yet</h3>
                  <p>Create your first goal to get started</p>
                  {user.role === 'EMPLOYEE' && <button className="btn btn-primary btn-sm" onClick={() => router.push('/goals?new=true')}>Create Goal</button>}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {goals.slice(0, 5).map((goal: any) => (
                    <div key={goal.id} className="goal-card" style={{ padding: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div className="goal-card-title" style={{ fontSize: 14 }}>{goal.title}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{goal.thrustArea?.name}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span className="goal-weightage" style={{ fontSize: 16 }}>{goal.weightage}%</span>
                          <span className={`badge badge-${goal.status === 'APPROVED' ? 'success' : goal.status === 'SUBMITTED' ? 'info' : goal.status === 'REJECTED' ? 'danger' : 'neutral'}`}>
                            {goal.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card animate-in" style={{ animationDelay: '0.25s' }}>
              <div className="card-header">
                <div><div className="card-title"><Sparkles size={16} style={{ display: 'inline', marginRight: 6, color: 'var(--accent)' }} />AI Insights</div><div className="card-subtitle">Smart recommendations</div></div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ padding: 14, background: 'var(--accent-glow)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', marginBottom: 4 }}>💡 Goal Balance</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Your goals are well distributed across thrust areas. Consider adding a People Development goal for a balanced scorecard.</div>
                </div>
                <div style={{ padding: 14, background: 'var(--accent-glow)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--success)', marginBottom: 4 }}>📈 On Track</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>You&apos;re ahead of schedule on 3 out of 5 goals. Keep up the momentum for Q1!</div>
                </div>
                {user.role !== 'EMPLOYEE' && (
                  <div style={{ padding: 14, background: 'var(--accent-glow)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--warning)', marginBottom: 4 }}>⚠️ Action Needed</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>2 team members have pending goal submissions. Send a reminder to keep the cycle on track.</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
