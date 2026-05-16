'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { Shield } from 'lucide-react'

function formatAuditDetails(log: any): string {
  try {
    const val = log.newValue ? JSON.parse(log.newValue) : null
    if (!val) return '—'

    // Format based on action type
    if (log.action === 'CREATE') {
      const parts: string[] = []
      if (val.title) parts.push(`"${val.title}"`)
      if (val.weightage) parts.push(`${val.weightage}% weightage`)
      if (val.uom) parts.push(val.uom)
      return parts.length > 0 ? parts.join(' • ') : '—'
    }
    if (log.action === 'APPROVE' || log.action === 'REJECT') {
      const parts: string[] = []
      if (val.status) parts.push(`→ ${val.status}`)
      if (val.comments) parts.push(`"${val.comments}"`)
      return parts.length > 0 ? parts.join(' • ') : '—'
    }
    if (log.action === 'LOCK' || log.action === 'UNLOCK') {
      return val.isLocked ? 'Goal locked for editing' : 'Goal unlocked'
    }
    if (log.action === 'UPDATE') {
      const parts: string[] = []
      if (val.status) parts.push(`Status → ${val.status}`)
      if (val.weightage) parts.push(`Weightage: ${val.weightage}%`)
      if (val.target) parts.push(`Target: ${val.target}`)
      return parts.length > 0 ? parts.join(' • ') : 'Updated'
    }
    // Fallback: show key-value pairs nicely
    return Object.entries(val)
      .filter(([, v]) => v !== null && v !== undefined)
      .map(([k, v]) => `${k}: ${v}`)
      .join(' • ')
      .slice(0, 100)
  } catch {
    return log.newValue?.slice(0, 80) || '—'
  }
}

export default function AuditPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [logs, setLogs] = useState<any[]>([])
  const [filter, setFilter] = useState('')

  useEffect(() => { if (!loading && !user) router.push('/login') }, [user, loading, router])

  useEffect(() => {
    fetch('/api/audit').then(r => r.json()).then(setLogs).catch(() => {})
  }, [])

  const filtered = filter ? logs.filter((l: any) => l.action === filter || l.entityType === filter) : logs

  if (loading || !user) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}><div className="spinner" /></div>

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <Header />
        <div className="app-content">
          <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 className="page-title">Audit Trail</h1>
              <p className="page-desc">{logs.length} logged actions • Immutable record of all system changes</p>
            </div>
            <select className="form-select" style={{ width: 180 }} value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="APPROVE">Approve</option>
              <option value="REJECT">Reject</option>
              <option value="LOCK">Lock</option>
              <option value="UNLOCK">Unlock</option>
            </select>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr><th>Timestamp</th><th>User</th><th>Action</th><th>Entity</th><th>Details</th></tr>
              </thead>
              <tbody>
                {filtered.map((log: any) => (
                  <tr key={log.id}>
                    <td style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{new Date(log.createdAt).toLocaleString()}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="avatar avatar-sm" style={{ background: log.user?.avatarColor || '#6366f1' }}>{log.user?.name?.[0] || '?'}</div>
                        {log.user?.name || 'System'}
                      </div>
                    </td>
                    <td><span className={`badge badge-${log.action === 'APPROVE' ? 'success' : log.action === 'REJECT' ? 'danger' : log.action === 'LOCK' ? 'warning' : 'info'}`}>{log.action}</span></td>
                    <td><span className="badge badge-neutral">{log.entityType}</span></td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 300 }}>
                      {formatAuditDetails(log)}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No audit logs found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
