import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/Providers'

export const metadata: Metadata = {
  title: 'GoalFlow — AI-Powered Goal Tracking Portal',
  description: 'Streamline goal setting, tracking, and performance reviews with AI-powered insights. Built for Atomberg Technologies.',
  keywords: 'goal tracking, performance management, OKR, KPI, HR tech',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
