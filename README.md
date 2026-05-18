# GoalFlow — AI-Powered Goal Setting & Tracking Portal

> Built for the **AtomQuest Hackathon 2026** by Atomberg Technologies

GoalFlow is a full-stack portal that digitizes the complete employee goal lifecycle — from creation and alignment to quarterly check-ins and performance analytics. Powered by **Groq AI (Llama 3.3 70B)** for ultra-fast intelligent goal refinement and insights.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+ installed
- **npm** package manager

### Local Development

```bash
# 1. Clone and install
git clone https://github.com/YOUR_USERNAME/atomquest.git
cd atomquest
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env and add your GROQ_API_KEY

# 3. Initialize database + seed demo data
npx prisma db push
npx tsx prisma/seed.ts

# 4. Start the development server
npm run dev
```

Open **http://localhost:3000** in your browser.

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** (HR Director) | admin@atomberg.com | password123 |
| **Manager** (Eng Manager) | manager@atomberg.com | password123 |
| **Employee** (Software Engineer) | employee@atomberg.com | password123 |

---

## 🏗️ Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Next.js (App Router + Turbopack) | 16.2.6 |
| UI | React | 19.2.4 |
| Language | TypeScript (Strict) | 5.x |
| Styling | Vanilla CSS + CSS Variables | — |
| Database | SQLite via Prisma ORM | 7.8.0 |
| AI Engine | Groq SDK (Llama 3.3 70B) | 1.2.0 |
| Charts | Recharts | 3.8.1 |
| Auth | Custom session + bcryptjs | — |
| Icons | Lucide React | 1.16.0 |
| Animations | Framer Motion | 12.38.0 |

---

## ✅ Evaluation Criteria Alignment

### 1. Functionality of the Portal
| Feature | Status |
|---------|--------|
| Goal Creation (Title, Desc, UoM, Target, Weightage) | ✅ |
| Validation (100% total, 10% min, 8 goals max) | ✅ |
| Manager Approval (Approve / Reject / Rework) | ✅ |
| Goal Locking post-approval | ✅ |
| Quarterly Check-ins (Q1–Q4) | ✅ |
| Progress Score Computation (formula-based) | ✅ |
| CSV Export | ✅ |
| Analytics Dashboard (charts + KPIs) | ✅ |
| Escalation Rules | ✅ |
| AI Copilot (Refine / Rewrite / Auto-fill) | ✅ |
| Dark/Light Theme | ✅ |
| Notifications | ✅ |
| Audit Trail (immutable, human-readable) | ✅ |
| Mobile Responsive | ✅ |

### 2. Adherence to Problem Statement
- **Phase 1** (Goal Creation & Approval): 100% complete
- **Phase 2** (Achievement Tracking & Check-ins): 100% complete
- **Bonus**: AI copilot, analytics, audit trail, escalation, CSV export, mobile responsive

### 3. User Friendliness
- Persistent sidebar with role-specific navigation
- One-click demo login (Admin / Manager / Employee)
- AI refinement appears only when needed — no AI slop
- Inline validation, loading states, error feedback
- Glassmorphism design, smooth animations, particle background
- Responsive: works on desktop, tablet, and mobile

### 4. Technical Robustness
- Zero TypeScript errors in strict mode
- Clean production build (16 static + 12 dynamic routes)
- Try/catch on every API route with structured error responses
- Server-side validation for all business rules
- Immutable audit logging on every mutation

### 5. Cost Optimization
| Resource | Choice | Cost |
|----------|--------|------|
| Hosting | Vercel (Free) | **$0** |
| Database | SQLite | **$0** |
| AI | Groq Free Tier (14.4K req/day) | **$0** |
| **Total** | | **$0/month** |

---

## 📐 Architecture

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for full Mermaid diagrams (system architecture, ERD, request flow).

---

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | Yes | Get from [console.groq.com](https://console.groq.com) |
| `DATABASE_URL` | No | Defaults to SQLite `file:./dev.db` |

---

## 🚢 Deployment (Vercel)

1. Push code to GitHub
2. Import repository at [vercel.com](https://vercel.com)
3. Add environment variable: `GROQ_API_KEY`
4. Deploy — Vercel auto-runs `prisma generate && next build`

> **Note**: SQLite is ephemeral on serverless. For persistent production data, migrate to PostgreSQL (Supabase/Neon free tier).

---

## 📊 Score Computation Formulas

| UoM | Direction | Formula |
|-----|-----------|---------|
| Numeric | Higher is Better | `(Achievement / Target) × 100` |
| Numeric | Lower is Better | `(Target / Achievement) × 100` |
| Percentage | — | `Achievement` (direct) |
| Timeline | — | `On-time = 100, Late = partial` |
| Zero-Based | — | `Achievement == 0 ? 100 : 0` |

---

## 📁 Project Structure

```
atomquest/
├── prisma/
│   ├── schema.prisma      # Database schema (13 models)
│   └── seed.ts            # Demo data seeder
├── src/
│   ├── app/
│   │   ├── api/           # 13 API routes
│   │   ├── dashboard/     # Role-based dashboard
│   │   ├── goals/         # Goal CRUD + AI refine
│   │   ├── checkins/      # Quarterly check-ins
│   │   ├── approvals/     # Manager approval workflow
│   │   ├── analytics/     # Charts + insights
│   │   ├── audit/         # Immutable audit trail
│   │   └── ...            # notifications, cycles, users, escalation
│   ├── components/        # Sidebar, Header, ParticleBackground
│   ├── context/           # AuthContext, ThemeContext
│   ├── lib/               # Prisma client setup
│   └── types/             # TypeScript types + score computation
├── ARCHITECTURE.md        # Mermaid architecture diagrams
├── SUBMISSION.md          # Hackathon submission links
└── README.md              # This file
```

---

*Built with ❤️ for the AtomQuest Hackathon 2026*
