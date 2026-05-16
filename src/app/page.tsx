'use client'

import ParticleBackground from '@/components/ParticleBackground'
import { useRouter } from 'next/navigation'
import { BarChart3, Shield, Sparkles, ArrowRight, Zap, Target, Users } from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="landing-page">
      <div className="login-bg"><ParticleBackground /></div>
      <div className="landing-hero" style={{ paddingTop: 40, paddingBottom: 20, gap: 16 }}>
        <div style={{ marginBottom: 8 }}>
          <span className="badge badge-purple" style={{ fontSize: 12, padding: '5px 14px' }}>
            <Sparkles size={13} /> AtomQuest Hackathon 2026
          </span>
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', marginBottom: 8, lineHeight: 1.1 }}>
          Goal Setting,<br />
          <span>Reimagined with AI</span>
        </h1>
        <p style={{ fontSize: 15, maxWidth: 520, margin: '0 auto', lineHeight: 1.5 }}>
          GoalFlow transforms how organizations set, track, and achieve goals.
          AI-powered insights, real-time dashboards, and seamless workflows.
        </p>
        <div className="landing-cta" style={{ marginTop: 16 }}>
          <button className="btn btn-primary btn-lg" onClick={() => router.push('/login')}>
            Get Started <ArrowRight size={18} />
          </button>
          <button className="btn btn-secondary btn-lg" onClick={() => router.push('/login')}>
            View Demo
          </button>
        </div>

        <div className="landing-features" style={{ marginTop: 24, gap: 16 }}>
          <div className="landing-feature animate-in" style={{ padding: 20 }}>
            <div className="stat-icon purple" style={{ marginBottom: 8 }}><Sparkles size={20} /></div>
            <h3 style={{ fontSize: 14 }}>AI-Powered Goals</h3>
            <p style={{ fontSize: 12 }}>Smart goal refinement and KPI recommendations powered by Groq AI.</p>
          </div>
          <div className="landing-feature animate-in" style={{ animationDelay: '0.1s', padding: 20 }}>
            <div className="stat-icon green" style={{ marginBottom: 8 }}><BarChart3 size={20} /></div>
            <h3 style={{ fontSize: 14 }}>Real-Time Analytics</h3>
            <p style={{ fontSize: 12 }}>Live dashboards and QoQ trend analysis for data-driven decisions.</p>
          </div>
          <div className="landing-feature animate-in" style={{ animationDelay: '0.2s', padding: 20 }}>
            <div className="stat-icon cyan" style={{ marginBottom: 8 }}><Shield size={20} /></div>
            <h3 style={{ fontSize: 14 }}>Enterprise Ready</h3>
            <p style={{ fontSize: 12 }}>Role-based access, audit trails, and compliance-grade governance.</p>
          </div>
        </div>

        <div style={{ marginTop: 20, display: 'flex', gap: 32, alignItems: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Zap size={13} /> Zero Cost</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Target size={13} /> BRD Compliant</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Users size={13} /> 3 Roles</div>
        </div>
      </div>
    </div>
  )
}
