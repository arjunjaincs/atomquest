'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { Bell, Plus, ToggleLeft, ToggleRight } from 'lucide-react'

export default function EscalationPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [rules, setRules] = useState<any[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', conditionType: 'GOAL_NOT_SUBMITTED', daysThreshold: '7', notifyRole: 'EMPLOYEE' })

  useEffect(() => { if (!loading && !user) router.push('/login') }, [user, loading, router])
  useEffect(() => {
    fetch('/api/escalation').then(r => r.json()).then(setRules).catch(() => {})
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/escalation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, daysThreshold: parseInt(form.daysThreshold) }),
    })
    setShowCreate(false)
    setForm({ name: '', conditionType: 'GOAL_NOT_SUBMITTED', daysThreshold: '7', notifyRole: 'EMPLOYEE' })
    fetch('/api/escalation').then(r => r.json()).then(setRules)
  }

  const toggleRule = async (id: string, isActive: boolean) => {
    await fetch('/api/escalation', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isActive: !isActive }),
    })
    fetch('/api/escalation').then(r => r.json()).then(setRules)
  }

  if (loading || !user) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}><div className="spinner" /></div>

  const conditionLabels: Record<string, string> = {
    GOAL_NOT_SUBMITTED: 'Goals not submitted within N days',
    GOAL_NOT_APPROVED: 'Goals not approved within N days',
    CHECKIN_NOT_COMPLETED: 'Check-in not completed within window',
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <Header />
        <div className="app-content">
          <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <h1 className="page-title">Escalation Rules</h1>
              <p className="page-desc">Configure automated escalation triggers</p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}><Plus size={14} /> New Rule</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {rules.map((rule: any) => (
              <div key={rule.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{rule.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    {conditionLabels[rule.conditionType] || rule.conditionType} • Threshold: {rule.daysThreshold} days • Notify: {rule.notifyRole}
                  </div>
                </div>
                <button className="btn btn-ghost" onClick={() => toggleRule(rule.id, rule.isActive)}>
                  {rule.isActive ? <ToggleRight size={28} style={{ color: 'var(--success)' }} /> : <ToggleLeft size={28} style={{ color: 'var(--text-muted)' }} />}
                </button>
              </div>
            ))}
          </div>

          {showCreate && (
            <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowCreate(false) }}>
              <div className="modal">
                <div className="modal-header">
                  <h2 className="modal-title">Create Escalation Rule</h2>
                  <button className="btn btn-ghost btn-icon" onClick={() => setShowCreate(false)}>×</button>
                </div>
                <form onSubmit={handleCreate}>
                  <div className="modal-body">
                    <div className="form-group">
                      <label className="form-label">Rule Name</label>
                      <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Condition</label>
                      <select className="form-select" value={form.conditionType} onChange={e => setForm({...form, conditionType: e.target.value})}>
                        <option value="GOAL_NOT_SUBMITTED">Goals not submitted</option>
                        <option value="GOAL_NOT_APPROVED">Goals not approved by manager</option>
                        <option value="CHECKIN_NOT_COMPLETED">Check-in not completed</option>
                      </select>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Days Threshold</label>
                        <input className="form-input" type="number" min="1" value={form.daysThreshold} onChange={e => setForm({...form, daysThreshold: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Notify Role</label>
                        <select className="form-select" value={form.notifyRole} onChange={e => setForm({...form, notifyRole: e.target.value})}>
                          <option value="EMPLOYEE">Employee</option>
                          <option value="MANAGER">Manager</option>
                          <option value="ADMIN">Admin / HR</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary"><Plus size={14} /> Create Rule</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
