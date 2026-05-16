# GoalFlow — AI-Powered Goal Setting & Tracking Portal

> Built for **AtomQuest Hackathon 2026** by Atomberg Technologies

GoalFlow is a comprehensive Goal Setting & Tracking Portal that digitizes the entire employee goal lifecycle — from creation and alignment to quarterly check-ins and performance visibility. Powered by **Groq AI (Llama 3.3 70B)** for ultra-fast intelligent goal suggestions and insights.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+ installed
- **npm** package manager

### Local Development

```bash
# 1. Install dependencies
npm install

# 2. Initialize the database
npx prisma db push

# 3. Seed demo data (creates 3 demo accounts)
npx tsx prisma/seed.ts

# 4. Start the development server
npm run dev
```

Open **http://localhost:3000** in your browser.

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@atomberg.com | password123 |
| **Manager** | manager@atomberg.com | password123 |
| **Employee** | employee@atomberg.com | password123 |

> 💡 Use the **Quick Demo Access** buttons on the login page for one-click login.

---

## 🏗 Architecture

```
Next.js 16 (App Router + TypeScript)
├── Frontend:  React 19 + CSS Custom Properties (Dark/Light themes)
├── Backend:   Next.js API Routes (RESTful)
├── AI:        Groq API (Llama 3.3 70B Versatile) — sub-2s inference
├── Database:  SQLite via Prisma ORM + better-sqlite3 adapter
├── Charts:    Recharts
├── Icons:     Lucide React
└── Animation: CSS Animations + Canvas (Particle Background)
```

### File Structure
```
src/
├── app/                    # Next.js App Router pages + API routes
│   ├── api/               # 12 API endpoints
│   │   ├── ai/            # Gemini AI suggestions
│   │   ├── analytics/     # Org-wide analytics
│   │   ├── audit/         # Audit trail
│   │   ├── auth/          # Authentication
│   │   ├── checkins/      # Quarterly check-ins
│   │   ├── cycles/        # Goal cycles
│   │   ├── dashboard/     # Dashboard stats
│   │   ├── escalation/    # Escalation rules
│   │   ├── export/        # CSV export
│   │   ├── goals/         # Goal CRUD + approval workflow
│   │   ├── notifications/ # Notifications
│   │   ├── thrust-areas/  # Thrust area lookup
│   │   └── users/         # User management
│   ├── analytics/         # Analytics dashboard page
│   ├── approvals/         # Manager approval page
│   ├── audit/             # Audit trail page
│   ├── checkins/          # Check-in page
│   ├── cycles/            # Cycle management page
│   ├── dashboard/         # Main dashboard
│   ├── escalation/        # Escalation rules page
│   ├── goals/             # Goal management page
│   ├── login/             # Login page
│   ├── notifications/     # Notifications page
│   ├── users/             # User management page
│   ├── globals.css        # Complete design system
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # Reusable components
│   ├── Header.tsx         # Top header bar
│   ├── ParticleBackground.tsx  # Animated canvas background
│   ├── Providers.tsx      # Context providers wrapper
│   └── Sidebar.tsx        # Navigation sidebar
├── context/               # React contexts
│   ├── AuthContext.tsx     # Authentication state
│   └── ThemeContext.tsx    # Dark/Light theme state
├── lib/
│   └── prisma.ts          # Database client singleton
└── types/
    └── index.ts           # TypeScript types + scoring functions
```

---

## ⚙️ Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Database (SQLite for local, PostgreSQL for production)
DATABASE_URL="file:./dev.db"

# Auth secret (change in production)
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Groq AI (optional - fallback suggestions work without it)
GROQ_API_KEY="your-groq-api-key-here"
```

### Getting a Groq API Key
1. Go to https://console.groq.com/keys
2. Click "Create API Key"
3. Copy the key and paste it in `.env` as `GROQ_API_KEY`
4. Model used: `llama-3.3-70b-versatile` (ultra-fast, free tier: 30 RPM)

> ⚠️ The app works fully without the Groq key — AI features will use intelligent fallback suggestions.

---

## 📋 Features — BRD Compliance Matrix

### Phase 1: Goal Creation & Approval ✅
| Requirement | Status | Implementation |
|-------------|--------|----------------|
| Employee creates goals with Thrust Area, Title, Description | ✅ | `/goals` page with creation modal |
| UoM: Numeric, %, Timeline, Zero-based | ✅ | Dropdown selection in goal form |
| Set Targets and Weightage per goal | ✅ | Input fields with validation |
| Total weightage = 100% validation | ✅ | Server-side validation in `/api/goals` |
| Min weightage per goal = 10% | ✅ | Server-side validation |
| Max 8 goals per employee | ✅ | Server-side validation |
| Manager (L1) approval workflow | ✅ | `/approvals` page with Approve/Reject/Rework |
| Inline editing during approval | ✅ | Manager can edit targets/weightage |
| Goals locked after approval | ✅ | `isLocked` flag, enforced in API |
| Shared Goals | ✅ | Schema supports shared goals via `sharedGoalId` |

### Phase 2: Achievement Tracking & Check-ins ✅
| Requirement | Status | Implementation |
|-------------|--------|----------------|
| Quarterly check-in interface | ✅ | `/checkins` page with Q1-Q4 tabs |
| Log Achievement vs Target | ✅ | Inline form per goal |
| Status: Not Started / On Track / Completed | ✅ | Dropdown selection |
| Manager check-in review | ✅ | Manager view in `/checkins` |
| Manager comments | ✅ | Comment field in check-in review |
| Score computation (Min/Max/Timeline/Zero) | ✅ | `computeScore()` in types/index.ts |

### Reporting & Governance ✅
| Requirement | Status | Implementation |
|-------------|--------|----------------|
| Achievement report (CSV export) | ✅ | `/api/export?format=csv` |
| Completion dashboard | ✅ | `/analytics` with charts |
| Audit trail | ✅ | `/audit` with filterable logs |

### Bonus Features ✅
| Feature | Status | Implementation |
|---------|--------|----------------|
| AI Goal Writing Assistant | ✅ | Gemini API integration in goal creation |
| Analytics Module | ✅ | Recharts: pie, bar, horizontal bar charts |
| Escalation Rules | ✅ | `/escalation` with CRUD + toggle |
| Notifications | ✅ | In-app notifications with unread count |
| Dark/Light Mode | ✅ | Theme toggle with CSS custom properties |
| Audit Trail | ✅ | Full action logging with user attribution |

---

## 💰 Cost Optimization

| Component | Cost | Details |
|-----------|------|---------|
| **Hosting** | $0 | Vercel free tier (100GB bandwidth) |
| **Database** | $0 | SQLite (local) / Supabase free tier (500MB) |
| **AI** | $0 | Groq API free tier (30 RPM, Llama 3.3 70B) |
| **Domain** | $0 | Vercel provides *.vercel.app subdomain |
| **Total** | **$0** | Complete production deployment at zero cost |

### Optimization Strategies
- **SQLite in development** — zero config, instant startup
- **Static page generation** — landing + login pages are pre-rendered
- **Client-side auth** — no session server needed
- **Smart AI fallbacks** — app works fully without API calls
- **CSS-only theming** — no runtime JS for dark/light mode

---

## 🚢 Deployment

### Vercel (Recommended)

For Vercel deployment, switch to PostgreSQL:

1. Create a free PostgreSQL database on [Supabase](https://supabase.com), [Neon](https://neon.tech), or [Vercel Postgres](https://vercel.com/storage/postgres)

2. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
   }
   ```

3. Update `prisma.config.ts` with your PostgreSQL URL

4. Update `src/lib/prisma.ts` to use `@prisma/adapter-pg` instead of `@prisma/adapter-better-sqlite3`

5. Deploy:
   ```bash
   npx vercel
   ```

6. Set environment variables in Vercel dashboard

### Alternative: Self-Hosted

```bash
npm run build
npm start
```

---

## 🔐 Security

- Passwords hashed with **bcrypt** (10 rounds)
- Role-based access control on all API routes
- Input validation on all form submissions
- SQL injection prevention via Prisma ORM
- XSS prevention via React's default escaping
- Audit trail logs all sensitive actions

---

## 🎨 Design System

The app uses CSS Custom Properties for theming with 2 complete color schemes:
- **Dark Mode**: Deep navy/purple with glassmorphism effects
- **Light Mode**: Clean white with subtle shadows

Key design elements:
- **Inter** font (Google Fonts) for premium typography
- **Particle network** animated background on landing/login
- **Micro-animations** with CSS keyframes (fadeIn, slideIn, pulse)
- **Glass morphism** cards with backdrop blur
- **Color-coded** thrust areas and status badges

---

*Built with ❤️ for AtomQuest Hackathon 2026*
