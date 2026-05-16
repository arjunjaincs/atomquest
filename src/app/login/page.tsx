'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import ParticleBackground from '@/components/ParticleBackground'
import { LogIn, Mail, Lock, User, Shield, Users, ArrowLeft } from 'lucide-react'

const demoCreds = [
  { label: 'Admin', email: 'admin@atomberg.com', icon: Shield, color: '#8b5cf6', desc: 'HR Director — Full access' },
  { label: 'Manager', email: 'manager@atomberg.com', icon: Users, color: '#06b6d4', desc: 'Eng Manager — Team view' },
  { label: 'Employee', email: 'employee@atomberg.com', icon: User, color: '#10b981', desc: 'Software Engineer' },
]

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(email, password)
    setLoading(false)
    if (result.success) {
      router.push('/dashboard')
    } else {
      setError(result.error || 'Login failed')
    }
  }

  const quickLogin = async (demoEmail: string) => {
    setEmail(demoEmail)
    setPassword('password123')
    setError('')
    setLoading(true)
    const result = await login(demoEmail, 'password123')
    setLoading(false)
    if (result.success) {
      router.push('/dashboard')
    } else {
      setError(result.error || 'Login failed')
    }
  }

  return (
    <div className="login-page">
      <div className="login-bg">
        <ParticleBackground />
      </div>

      <div className="login-card animate-in">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <div className="sidebar-logo-icon" style={{ width: 48, height: 48, fontSize: 18 }}>GF</div>
        </div>
        <h1 className="login-title">Welcome to GoalFlow</h1>
        <p className="login-subtitle">AI-Powered Goal Setting & Tracking Portal</p>

        {error && (
          <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: 'var(--danger)', fontSize: 13, marginBottom: 16, textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label"><Mail size={14} style={{ display: 'inline', marginRight: 4 }} />Email</label>
            <input
              className="form-input"
              type="email"
              placeholder="you@atomberg.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label"><Lock size={14} style={{ display: 'inline', marginRight: 4 }} />Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? <span className="spinner" /> : <><LogIn size={18} /> Sign In</>}
          </button>
        </form>

        <div className="demo-creds">
          <h4>Quick Demo Access</h4>
          {demoCreds.map(cred => {
            const Icon = cred.icon
            return (
              <button key={cred.email} className="demo-cred-btn" onClick={() => quickLogin(cred.email)}>
                <div className="avatar avatar-sm" style={{ background: cred.color }}>
                  <Icon size={14} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{cred.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{cred.desc}</div>
                </div>
              </button>
            )
          })}
        </div>

        <button
          onClick={() => router.push('/')}
          style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', width: '100%', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', padding: 8 }}
        >
          <ArrowLeft size={14} /> Back to Home
        </button>
      </div>
    </div>
  )
}
