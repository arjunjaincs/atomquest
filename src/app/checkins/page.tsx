'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { CheckSquare, Save, Sparkles, MessageSquare } from 'lucide-react'

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4']
const STATUSES = ['NOT_STARTED', 'ON_TRACK', 'COMPLETED']

export default function CheckInsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [goals, setGoals] = useState<any[]>([])
  const [selectedQuarter, setSelectedQuarter] = useState('Q1')
  const [checkInData, setCheckInData] = useState<Record<string, { achievement: string; status: string; comment: string }>>({})
  const [saving, setSaving] = useState(false)
  const [checkIns, setCheckIns] = useState<any[]>([])

  useEffect(() => { if (!loading && !user) router.push('/login') }, [user, loading, router])

  const fetchData = useCallback(() => {
    if (!user) return
    if (user.role === 'EMPLOYEE') {
      fetch(`/api/goals?userId=${user.id}&role=EMPLOYEE`)
        .then(r => r.json())
        .then(data => {
          const approved = data.filter((g: any) => g.status === 'APPROVED')
          setGoals(approved)
          const existing: Record<string, any> = {}
          approved.forEach((g: any) => {
            const ci = g.checkIns?.find((c: any) => c.quarter === selectedQuarter)
            existing[g.id] = {
              achievement: ci?.achievement?.toString() || '',
              status: ci?.status || 'NOT_STARTED',
              comment: ci?.employeeComment || '',
            }
          })
          setCheckInData(existing)
        })
    } else {
      fetch(`/api/checkins?managerId=${user.id}`)
        .then(r => r.json())
        .then(setCheckIns)
    }
  }, [user, selectedQuarter])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSave = async (goalId: string) => {
    setSaving(true)
    const data = checkInData[goalId]
    if (!data) return
    await fetch('/api/checkins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        goalId, quarter: selectedQuarter,
        achievement: parseFloat(data.achievement) || 0,
        status: data.status, employeeComment: data.comment,
        employeeId: user!.id,
      }),
    })
    setSaving(false)
    fetchData()
  }

  const handleManagerComment = async (checkInId: string, comment: string) => {
    await fetch('/api/checkins', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: checkInId, managerComment: comment, managerId: user!.id }),
    })
    fetchData()
  }

  if (loading || !user) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}><div className="spinner" /></div>

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <Header />
        <div className="app-content">
          <div className="page-header">
            <h1 className="page-title">{user.role === 'EMPLOYEE' ? 'Quarterly Check-ins' : 'Check-in Reviews'}</h1>
            <p className="page-desc">{user.role === 'EMPLOYEE' ? 'Update your goal progress for the current quarter' : 'Review team check-in submissions'}</p>
          </div>

          <div className="tabs">
            {QUARTERS.map(q => (
              <button key={q} className={`tab ${selectedQuarter === q ? 'active' : ''}`} onClick={() => setSelectedQuarter(q)}>{q}</button>
            ))}
          </div>

          {user.role === 'EMPLOYEE' ? (
            goals.length === 0 ? (
              <div className="card empty-state">
                <CheckSquare size={48} />
                <h3>No approved goals</h3>
                <p>Goals must be approved before you can submit check-ins.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {goals.map((goal: any) => (
                  <div key={goal.id} className="card animate-in">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 600 }}>{goal.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                          {goal.thrustArea?.name} • Target: {goal.target} • Weight: {goal.weightage}% • UoM: {goal.uom} ({goal.uomType})
                        </div>
                      </div>
                      <div className="goal-weightage">{goal.weightage}%</div>
                    </div>

                    <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr 2fr', gap: 12 }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Achievement</label>
                        <input className="form-input" type="number" step="any" placeholder="Actual value"
                          value={checkInData[goal.id]?.achievement || ''}
                          onChange={e => setCheckInData({ ...checkInData, [goal.id]: { ...checkInData[goal.id], achievement: e.target.value } })}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Status</label>
                        <select className="form-select"
                          value={checkInData[goal.id]?.status || 'NOT_STARTED'}
                          onChange={e => setCheckInData({ ...checkInData, [goal.id]: { ...checkInData[goal.id], status: e.target.value } })}
                        >
                          {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                        </select>
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Comment</label>
                        <input className="form-input" placeholder="Progress notes..."
                          value={checkInData[goal.id]?.comment || ''}
                          onChange={e => setCheckInData({ ...checkInData, [goal.id]: { ...checkInData[goal.id], comment: e.target.value } })}
                        />
                      </div>
                    </div>
                    <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                      <button className="btn btn-primary btn-sm" onClick={() => handleSave(goal.id)} disabled={saving}>
                        <Save size={14} /> Save Check-in
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* Manager view */
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Goal</th>
                    <th>Target</th>
                    <th>Achievement</th>
                    <th>Score</th>
                    <th>Status</th>
                    <th>Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {checkIns.filter(c => c.quarter === selectedQuarter).map((ci: any) => (
                    <tr key={ci.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="avatar avatar-sm" style={{ background: ci.goal?.employee?.avatarColor }}>{ci.goal?.employee?.name?.[0]}</div>
                          {ci.goal?.employee?.name}
                        </div>
                      </td>
                      <td style={{ maxWidth: 200 }}>{ci.goal?.title}</td>
                      <td>{ci.goal?.target}</td>
                      <td style={{ fontWeight: 600 }}>{ci.achievement}</td>
                      <td>
                        <span className={`badge badge-${(ci.score || 0) >= 80 ? 'success' : (ci.score || 0) >= 50 ? 'warning' : 'danger'}`}>
                          {Math.round(ci.score || 0)}%
                        </span>
                      </td>
                      <td><span className={`badge badge-${ci.status === 'COMPLETED' ? 'success' : ci.status === 'ON_TRACK' ? 'info' : 'neutral'}`}>{ci.status?.replace(/_/g, ' ')}</span></td>
                      <td style={{ fontSize: 13 }}>{ci.employeeComment?.slice(0, 60)}</td>
                    </tr>
                  ))}
                  {checkIns.filter(c => c.quarter === selectedQuarter).length === 0 && (
                    <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No check-ins for {selectedQuarter}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
