'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useCallback, Suspense } from 'react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { Target, Plus, Send, Trash2, Sparkles, Lock, AlertCircle, Zap } from 'lucide-react'

function GoalsContent() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [goals, setGoals] = useState<any[]>([])
  const [thrustAreas, setThrustAreas] = useState<any[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ thrustAreaId: '', title: '', description: '', uom: 'NUMERIC', uomType: 'MIN', target: '', weightage: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // AI states
  const [aiRefineLoading, setAiRefineLoading] = useState<'title' | 'desc' | null>(null)
  const [aiKpiLoading, setAiKpiLoading] = useState(false)

  useEffect(() => { if (!loading && !user) router.push('/login') }, [user, loading, router])
  useEffect(() => { if (searchParams.get('new') === 'true') setShowCreate(true) }, [searchParams])

  const fetchGoals = useCallback(() => {
    if (!user) return
    fetch(`/api/goals?userId=${user.id}&role=${user.role}`)
      .then(r => r.json())
      .then(setGoals)
      .catch(() => {})
  }, [user])

  useEffect(() => { fetchGoals() }, [fetchGoals])
  useEffect(() => {
    fetch('/api/thrust-areas').then(r => r.json()).then(setThrustAreas).catch(() => {})
  }, [])

  const totalWeightage = goals.filter((g: any) => g.employeeId === user?.id).reduce((sum: number, g: any) => sum + g.weightage, 0)

  // --- AI Functions ---
  const aiRefine = async (field: 'title' | 'desc') => {
    const text = field === 'title' ? form.title : form.description
    if (!text.trim()) { setError(`Write a ${field === 'title' ? 'title' : 'description'} first, then AI can refine it`); return }
    setAiRefineLoading(field)
    const ta = thrustAreas.find((t: any) => t.id === form.thrustAreaId)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: field === 'title' ? 'refine_title' : 'rewrite_description',
          goalTitle: form.title,
          goalDescription: form.description,
          thrustArea: ta?.name,
          department: user?.department,
        }),
      })
      const data = await res.json()
      if (data.suggestion) {
        setForm(prev => ({ ...prev, [field === 'title' ? 'title' : 'description']: data.suggestion }))
      }
    } catch {}
    setAiRefineLoading(null)
  }

  const aiAutoFillMetrics = async () => {
    if (!form.title) { setError('Enter a goal title first'); return }
    setAiKpiLoading(true)
    const ta = thrustAreas.find((t: any) => t.id === form.thrustAreaId)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'suggest_kpi', goalTitle: form.title, thrustArea: ta?.name }),
      })
      const data = await res.json()
      const text = data.suggestion || ''
      const targetMatch = text.match(/Target:\s*(\d+)/i)
      const uomMatch = text.match(/UoM:\s*(Numeric|Percentage|Timeline|Zero)/i)
      const dirMatch = text.match(/Direction:\s*(Higher|Lower)/i)
      const weightMatch = text.match(/Weightage:\s*(\d+)/i)

      setForm(prev => ({
        ...prev,
        target: targetMatch?.[1] || prev.target,
        uom: uomMatch ? uomMatch[1].toUpperCase() : prev.uom,
        uomType: dirMatch ? (dirMatch[1] === 'Lower' ? 'MAX' : 'MIN') : prev.uomType,
        weightage: weightMatch?.[1] || prev.weightage,
      }))
    } catch {}
    setAiKpiLoading(false)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.thrustAreaId || !form.title || !form.target || !form.weightage) {
      setError('All fields are required')
      return
    }
    setSubmitting(true)
    const activeCycle = await fetch('/api/cycles').then(r => r.json()).then(d => d[0]?.id).catch(() => null)
    const res = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, target: parseFloat(form.target), weightage: parseFloat(form.weightage), employeeId: user!.id, cycleId: activeCycle }),
    })
    const data = await res.json()
    setSubmitting(false)
    if (!res.ok) { setError(data.error); return }
    setShowCreate(false)
    setForm({ thrustAreaId: '', title: '', description: '', uom: 'NUMERIC', uomType: 'MIN', target: '', weightage: '' })
    fetchGoals()
  }

  const handleSubmitAll = async () => {
    const draftGoal = goals.find((g: any) => g.employeeId === user?.id && g.status === 'DRAFT')
    if (!draftGoal) return
    if (totalWeightage !== 100) { setError('Total weightage must equal 100% before submitting'); return }
    const res = await fetch('/api/goals', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: draftGoal.id, action: 'SUBMIT' }),
    })
    if (res.ok) fetchGoals()
    else { const d = await res.json(); setError(d.error) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this goal?')) return
    await fetch(`/api/goals?id=${id}`, { method: 'DELETE' })
    fetchGoals()
  }

  if (loading || !user) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}><div className="spinner" /></div>

  const hasDrafts = goals.some((g: any) => g.employeeId === user.id && g.status === 'DRAFT')

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <Header />
        <div className="app-content">
          <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 className="page-title">{user.role === 'EMPLOYEE' ? 'My Goals' : 'Team Goals'}</h1>
              <p className="page-desc">
                {user.role === 'EMPLOYEE'
                  ? `${goals.length} goals • Total weightage: ${totalWeightage}%`
                  : `${goals.length} goals across your team`}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {user.role === 'EMPLOYEE' && hasDrafts && (
                <button className="btn btn-success btn-sm" onClick={handleSubmitAll}>
                  <Send size={14} /> Submit All for Approval
                </button>
              )}
              {user.role === 'EMPLOYEE' && (
                <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
                  <Plus size={14} /> New Goal
                </button>
              )}
            </div>
          </div>

          {error && (
            <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: 'var(--danger)', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={14} /> {error}
              <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>×</button>
            </div>
          )}

          {/* ========== CREATE GOAL MODAL ========== */}
          {showCreate && (
            <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowCreate(false) }}>
              <div className="modal" style={{ maxWidth: 640 }}>
                <div className="modal-header">
                  <h2 className="modal-title">Create New Goal</h2>
                  <button className="btn btn-ghost btn-icon" onClick={() => setShowCreate(false)}>×</button>
                </div>
                <form onSubmit={handleCreate}>
                  <div className="modal-body">
                    {/* Thrust Area */}
                    <div className="form-group">
                      <label className="form-label">Thrust Area</label>
                      <select className="form-select" value={form.thrustAreaId} onChange={e => setForm({...form, thrustAreaId: e.target.value})}>
                        <option value="">Select thrust area...</option>
                        {thrustAreas.map((ta: any) => <option key={ta.id} value={ta.id}>{ta.name}</option>)}
                      </select>
                    </div>

                    {/* Goal Title + Refine with AI */}
                    <div className="form-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label className="form-label">Goal Title</label>
                        {form.title.trim() && (
                          <button type="button" className="btn btn-ghost btn-sm" onClick={() => aiRefine('title')} disabled={aiRefineLoading === 'title'} style={{ fontSize: 12, color: 'var(--accent)' }}>
                            <Sparkles size={12} /> {aiRefineLoading === 'title' ? 'Refining...' : 'Refine with AI'}
                          </button>
                        )}
                      </div>
                      <input className="form-input" placeholder="e.g., Increase quarterly revenue by 20%" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                    </div>

                    {/* Description + Rewrite with AI */}
                    <div className="form-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label className="form-label">Description</label>
                        {form.description.trim() && (
                          <button type="button" className="btn btn-ghost btn-sm" onClick={() => aiRefine('desc')} disabled={aiRefineLoading === 'desc'} style={{ fontSize: 12, color: 'var(--accent)' }}>
                            <Sparkles size={12} /> {aiRefineLoading === 'desc' ? 'Rewriting...' : 'Rewrite with AI'}
                          </button>
                        )}
                      </div>
                      <textarea className="form-textarea" placeholder="Describe the goal in detail..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} />
                    </div>

                    {/* UoM + Direction + AI KPI assist */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <label className="form-label" style={{ marginBottom: 0 }}>Measurement & Target</label>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={aiAutoFillMetrics} disabled={aiKpiLoading} style={{ fontSize: 12, color: 'var(--accent)' }}>
                        <Zap size={12} /> {aiKpiLoading ? 'Analyzing...' : 'AI Auto-fill'}
                      </button>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: 12 }}>Unit of Measurement</label>
                        <select className="form-select" value={form.uom} onChange={e => setForm({...form, uom: e.target.value})}>
                          <option value="NUMERIC">Numeric</option>
                          <option value="PERCENTAGE">Percentage (%)</option>
                          <option value="TIMELINE">Timeline (Date)</option>
                          <option value="ZERO">Zero-Based</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: 12 }}>Direction</label>
                        <select className="form-select" value={form.uomType} onChange={e => setForm({...form, uomType: e.target.value})} disabled={form.uom === 'ZERO' || form.uom === 'TIMELINE'}>
                          <option value="MIN">Higher is Better (Min)</option>
                          <option value="MAX">Lower is Better (Max)</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: 12 }}>Target</label>
                        <input className="form-input" type="number" step="any" placeholder="e.g., 100" value={form.target} onChange={e => setForm({...form, target: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: 12 }}>Weightage (%)</label>
                        <input className="form-input" type="number" min="10" max="100" placeholder="Min 10%" value={form.weightage} onChange={e => setForm({...form, weightage: e.target.value})} />
                        <div className="form-hint">Remaining: {100 - totalWeightage}%</div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                      {submitting ? <span className="spinner" /> : <><Plus size={14} /> Create Goal</>}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ========== GOALS LIST ========== */}
          {goals.length === 0 ? (
            <div className="card empty-state">
              <Target size={48} />
              <h3>No goals found</h3>
              <p>{user.role === 'EMPLOYEE' ? 'Create your first goal to get started with this cycle.' : 'Your team has no goals yet.'}</p>
              {user.role === 'EMPLOYEE' && <button className="btn btn-primary" onClick={() => setShowCreate(true)}><Plus size={14} /> Create Goal</button>}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {goals.map((goal: any) => (
                <div key={goal.id} className="goal-card animate-in">
                  <div className="goal-card-header">
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="goal-card-title">{goal.title}</div>
                        {goal.isLocked && <Lock size={12} style={{ color: 'var(--text-muted)' }} />}
                      </div>
                      {goal.description && <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{goal.description}</div>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="goal-weightage">{goal.weightage}%</div>
                      <span className={`badge badge-${goal.status === 'APPROVED' ? 'success' : goal.status === 'SUBMITTED' ? 'info' : goal.status === 'REJECTED' ? 'danger' : goal.status === 'REWORK' ? 'warning' : 'neutral'}`}>
                        {goal.status}
                      </span>
                    </div>
                  </div>
                  <div className="goal-card-meta">
                    <span style={{ color: goal.thrustArea?.color }}>● {goal.thrustArea?.name}</span>
                    <span>UoM: {goal.uom} ({goal.uomType === 'MIN' ? '↑ Higher=Better' : '↓ Lower=Better'})</span>
                    <span>Target: {goal.target}</span>
                    {goal.employee && <span>👤 {goal.employee.name}</span>}
                  </div>
                  {goal.checkIns?.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <div className="progress-bar">
                        <div className={`progress-fill ${(goal.checkIns[0]?.score || 0) >= 80 ? 'green' : (goal.checkIns[0]?.score || 0) >= 50 ? 'amber' : 'red'}`} style={{ width: `${Math.min(goal.checkIns[0]?.score || 0, 100)}%` }} />
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Score: {Math.round(goal.checkIns[0]?.score || 0)}% • {goal.checkIns[0]?.quarter}</div>
                    </div>
                  )}
                  {user.role === 'EMPLOYEE' && goal.status === 'DRAFT' && !goal.isLocked && (
                    <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(goal.id)}><Trash2 size={12} /> Delete</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function GoalsPage() {
  return <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}><div className="spinner" /></div>}><GoalsContent /></Suspense>
}
