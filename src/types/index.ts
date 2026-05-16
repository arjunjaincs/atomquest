export type UserRole = 'EMPLOYEE' | 'MANAGER' | 'ADMIN'

export type GoalStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'REWORK'

export type UoMType = 'NUMERIC' | 'PERCENTAGE' | 'TIMELINE' | 'ZERO'

export type UoMDirection = 'MIN' | 'MAX'

export type CheckInStatus = 'NOT_STARTED' | 'ON_TRACK' | 'COMPLETED'

export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4'

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REWORK'

export type CyclePhase = 'GOAL_SETTING' | 'Q1' | 'Q2' | 'Q3' | 'Q4'

export interface SessionUser {
  id: string
  name: string
  email: string
  role: UserRole
  department: string
  managerId?: string
  avatarColor: string
}

export interface GoalFormData {
  thrustAreaId: string
  title: string
  description: string
  uom: UoMType
  uomType: UoMDirection
  target: number
  weightage: number
}

export interface CheckInFormData {
  goalId: string
  quarter: Quarter
  achievement: number
  status: CheckInStatus
  employeeComment: string
}

export interface AnalyticsData {
  completionRates: { department: string; rate: number }[]
  goalsByThrustArea: { name: string; count: number }[]
  quarterlyTrends: { quarter: string; avgScore: number }[]
  statusDistribution: { status: string; count: number }[]
}

export function computeScore(
  uom: UoMType,
  uomType: UoMDirection,
  target: number,
  achievement: number
): number {
  if (uom === 'ZERO') {
    return achievement === 0 ? 100 : 0
  }
  if (uom === 'TIMELINE') {
    // For timeline, achievement and target are timestamps
    return achievement <= target ? 100 : 0
  }
  if (target === 0) return 0
  if (uomType === 'MIN') {
    // Higher is better
    return Math.min((achievement / target) * 100, 100)
  } else {
    // Lower is better (MAX type)
    return achievement === 0 ? 100 : Math.min((target / achievement) * 100, 100)
  }
}
