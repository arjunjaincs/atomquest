'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { BarChart3, TrendingUp, Users, Target } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6']

export default function AnalyticsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<any>(null)

  useEffect(() => { if (!loading && !user) router.push('/login') }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    fetch('/api/analytics')
      .then(r => r.json())
      .then(setData)
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
            <h1 className="page-title">Analytics Dashboard</h1>
            <p className="page-desc">Organization-wide goal performance insights</p>
          </div>

          <div className="stats-grid">
            <div className="stat-card"><div className="stat-icon purple"><Target size={22} /></div><div><div className="stat-value">{data?.totalGoals ?? '—'}</div><div className="stat-label">Total Goals</div></div></div>
            <div className="stat-card"><div className="stat-icon green"><TrendingUp size={22} /></div><div><div className="stat-value">{data?.avgCompletion ? `${Math.round(data.avgCompletion)}%` : '—'}</div><div className="stat-label">Avg Completion</div></div></div>
            <div className="stat-card"><div className="stat-icon cyan"><Users size={22} /></div><div><div className="stat-value">{data?.totalEmployees ?? '—'}</div><div className="stat-label">Employees</div></div></div>
            <div className="stat-card"><div className="stat-icon amber"><BarChart3 size={22} /></div><div><div className="stat-value">{data?.checkInRate ? `${Math.round(data.checkInRate)}%` : '—'}</div><div className="stat-label">Check-in Rate</div></div></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
            <div className="card animate-in">
              <div className="card-header"><div className="card-title">Goals by Status</div></div>
              <div style={{ height: 300 }}>
                {data?.statusDistribution ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={data.statusDistribution} cx="50%" cy="50%" outerRadius={100} dataKey="count" nameKey="status" label={({ status, count }: any) => `${status}: ${count}`}>
                        {data.statusDistribution.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <div className="skeleton" style={{ height: '100%' }} />}
              </div>
            </div>

            <div className="card animate-in" style={{ animationDelay: '0.1s' }}>
              <div className="card-header"><div className="card-title">Goals by Thrust Area</div></div>
              <div style={{ height: 300 }}>
                {data?.thrustAreaDistribution ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.thrustAreaDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                      <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                      <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                      <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <div className="skeleton" style={{ height: '100%' }} />}
              </div>
            </div>
          </div>

          <div className="card animate-in" style={{ animationDelay: '0.2s' }}>
            <div className="card-header"><div className="card-title">Department Completion Rates</div></div>
            <div style={{ height: 300 }}>
              {data?.departmentCompletion ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.departmentCompletion} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                    <YAxis dataKey="department" type="category" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} width={120} />
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                    <Bar dataKey="rate" fill="#10b981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="skeleton" style={{ height: '100%' }} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
