'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { CheckSquare, Check, X, RotateCcw, MessageSquare } from 'lucide-react'

export default function ApprovalsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [goals, setGoals] = useState<any[]>([])
  const [selectedGoal, setSelectedGoal] = useState<any>(null)
  const [comment, setComment] = useState('')
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | 'REWORK' | null>(null)

  useEffect(() => { if (!loading && !user) router.push('/login') }, [user, loading, router])

  const fetchGoals = useCallback(() => {
    if (!user) return
    fetch(`/api/goals?userId=${user.id}&role=${user.role}&status=SUBMITTED`)
      .then(r => r.json())
      .then(setGoals)
      .catch(() => {})
  }, [user])

  useEffect(() => { fetchGoals() }, [fetchGoals])

  const handleAction = async (goalId: string, action: string) => {
    const res = await fetch('/api/goals', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: goalId, action, managerId: user!.id, comments: comment }),
    })
    if (res.ok) {
      setSelectedGoal(null)
      setComment('')
      setActionType(null)
      fetchGoals()
    }
  }

  const pendingGoals = goals.filter(g => g.status === 'SUBMITTED')

  // Group by employee
  const grouped = pendingGoals.reduce((acc: any, goal: any) => {
    const empId = goal.employee?.id || 'unknown'
    if (!acc[empId]) acc[empId] = { employee: goal.employee, goals: [] }
    acc[empId].goals.push(goal)
    return acc
  }, {})

  if (loading || !user) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}><div className="spinner" /></div>

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <Header />
        <div className="app-content">
          <div className="page-header">
            <h1 className="page-title">Goal Approvals</h1>
            <p className="page-desc">{pendingGoals.length} goals pending your review</p>
          </div>

          {Object.keys(grouped).length === 0 ? (
            <div className="card empty-state">
              <CheckSquare size={48} />
              <h3>All caught up!</h3>
              <p>No goals are pending your approval.</p>
            </div>
          ) : (
            Object.values(grouped).map((group: any) => (
              <div key={group.employee?.id} className="card animate-in" style={{ marginBottom: 16 }}>
                <div className="card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="avatar" style={{ background: group.employee?.avatarColor }}>
                      {group.employee?.name?.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div>
                      <div className="card-title">{group.employee?.name}</div>
                      <div className="card-subtitle">{group.employee?.department} • {group.goals.length} goals • Total: {group.goals.reduce((s: number, g: any) => s + g.weightage, 0)}%</div>
                    </div>
                  </div>
                </div>

                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Goal</th>
                        <th>Thrust Area</th>
                        <th>UoM</th>
                        <th>Target</th>
                        <th>Weight</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.goals.map((goal: any) => (
                        <tr key={goal.id}>
                          <td>
                            <div style={{ fontWeight: 600 }}>{goal.title}</div>
                            {goal.description && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{goal.description.slice(0, 80)}</div>}
                          </td>
                          <td><span style={{ color: goal.thrustArea?.color }}>● {goal.thrustArea?.name}</span></td>
                          <td>{goal.uom} ({goal.uomType})</td>
                          <td>{goal.target}</td>
                          <td><span className="goal-weightage" style={{ fontSize: 16 }}>{goal.weightage}%</span></td>
                          <td>
                            <div style={{ display: 'flex', gap: 4 }}>
                              <button className="btn btn-success btn-sm" onClick={() => handleAction(goal.id, 'APPROVE')} title="Approve">
                                <Check size={14} />
                              </button>
                              <button className="btn btn-sm" style={{ background: 'var(--warning)', color: 'white' }} onClick={() => { setSelectedGoal(goal); setActionType('REWORK') }} title="Send Back">
                                <RotateCcw size={14} />
                              </button>
                              <button className="btn btn-danger btn-sm" onClick={() => { setSelectedGoal(goal); setActionType('REJECT') }} title="Reject">
                                <X size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}

          {/* Comment Modal */}
          {selectedGoal && actionType && (
            <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) { setSelectedGoal(null); setActionType(null) } }}>
              <div className="modal">
                <div className="modal-header">
                  <h2 className="modal-title">{actionType === 'REJECT' ? 'Reject Goal' : 'Return for Rework'}</h2>
                  <button className="btn btn-ghost btn-icon" onClick={() => { setSelectedGoal(null); setActionType(null) }}>×</button>
                </div>
                <div className="modal-body">
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
                    <strong>{selectedGoal.title}</strong> by {selectedGoal.employee?.name}
                  </p>
                  <div className="form-group">
                    <label className="form-label"><MessageSquare size={14} style={{ display: 'inline', marginRight: 4 }} />Comments</label>
                    <textarea className="form-textarea" placeholder="Provide feedback..." value={comment} onChange={e => setComment(e.target.value)} rows={4} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => { setSelectedGoal(null); setActionType(null); setComment('') }}>Cancel</button>
                  <button className={`btn ${actionType === 'REJECT' ? 'btn-danger' : 'btn-primary'}`} onClick={() => handleAction(selectedGoal.id, actionType)}>
                    {actionType === 'REJECT' ? 'Reject' : 'Send Back for Rework'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
