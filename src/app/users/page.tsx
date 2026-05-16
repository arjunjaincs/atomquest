'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { Users } from 'lucide-react'

export default function UsersPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => { if (!loading && !user) router.push('/login') }, [user, loading, router])
  useEffect(() => { fetch('/api/users').then(r => r.json()).then(setUsers).catch(() => {}) }, [])

  if (loading || !user) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}><div className="spinner" /></div>

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <Header />
        <div className="app-content">
          <div className="page-header">
            <h1 className="page-title">User Management</h1>
            <p className="page-desc">{users.length} users in the organization</p>
          </div>
          <div className="table-container">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Manager</th><th>Goals</th></tr></thead>
              <tbody>
                {users.map((u: any) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar avatar-sm" style={{ background: u.avatarColor }}>{u.name?.split(' ').map((n: string) => n[0]).join('')}</div>
                        <div><div style={{ fontWeight: 600 }}>{u.name}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.designation}</div></div>
                      </div>
                    </td>
                    <td style={{ fontSize: 13 }}>{u.email}</td>
                    <td><span className={`badge badge-${u.role === 'ADMIN' ? 'purple' : u.role === 'MANAGER' ? 'info' : 'neutral'}`}>{u.role}</span></td>
                    <td>{u.department}</td>
                    <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{u.manager?.name || '—'}</td>
                    <td><span className="badge badge-neutral">{u._count?.goals ?? 0}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
