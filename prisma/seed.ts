import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import bcrypt from 'bcryptjs'
import path from 'path'

const dbPath = path.join(process.cwd(), 'dev.db')
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await prisma.notification.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.escalationRule.deleteMany()
  await prisma.checkIn.deleteMany()
  await prisma.goalApproval.deleteMany()
  await prisma.goal.deleteMany()
  await prisma.goalCycle.deleteMany()
  await prisma.thrustArea.deleteMany()
  await prisma.user.deleteMany()

  const hashedPassword = await bcrypt.hash('password123', 10)

  // Create Users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@atomberg.com',
      password: hashedPassword,
      name: 'Priya Sharma',
      role: 'ADMIN',
      department: 'Human Resources',
      designation: 'HR Director',
      avatarColor: '#8b5cf6',
    },
  })

  const manager1 = await prisma.user.create({
    data: {
      email: 'manager@atomberg.com',
      password: hashedPassword,
      name: 'Rajesh Kumar',
      role: 'MANAGER',
      department: 'Engineering',
      designation: 'Engineering Manager',
      avatarColor: '#06b6d4',
    },
  })

  const manager2 = await prisma.user.create({
    data: {
      email: 'manager2@atomberg.com',
      password: hashedPassword,
      name: 'Anita Desai',
      role: 'MANAGER',
      department: 'Sales',
      designation: 'Sales Head',
      avatarColor: '#f59e0b',
    },
  })

  const emp1 = await prisma.user.create({
    data: {
      email: 'employee@atomberg.com',
      password: hashedPassword,
      name: 'Arjun Jain',
      role: 'EMPLOYEE',
      department: 'Engineering',
      designation: 'Software Engineer',
      managerId: manager1.id,
      avatarColor: '#10b981',
    },
  })

  const emp2 = await prisma.user.create({
    data: {
      email: 'emp2@atomberg.com',
      password: hashedPassword,
      name: 'Meera Patel',
      role: 'EMPLOYEE',
      department: 'Engineering',
      designation: 'Frontend Developer',
      managerId: manager1.id,
      avatarColor: '#ec4899',
    },
  })

  const emp3 = await prisma.user.create({
    data: {
      email: 'emp3@atomberg.com',
      password: hashedPassword,
      name: 'Vikram Singh',
      role: 'EMPLOYEE',
      department: 'Sales',
      designation: 'Sales Executive',
      managerId: manager2.id,
      avatarColor: '#f97316',
    },
  })

  const emp4 = await prisma.user.create({
    data: {
      email: 'emp4@atomberg.com',
      password: hashedPassword,
      name: 'Sneha Reddy',
      role: 'EMPLOYEE',
      department: 'Sales',
      designation: 'Account Manager',
      managerId: manager2.id,
      avatarColor: '#14b8a6',
    },
  })

  // Create Thrust Areas
  const thrustAreas = await Promise.all([
    prisma.thrustArea.create({
      data: { name: 'Revenue Growth', description: 'Drive top-line revenue through new and existing channels', color: '#10b981' },
    }),
    prisma.thrustArea.create({
      data: { name: 'Product Innovation', description: 'Launch new products and improve existing ones', color: '#6366f1' },
    }),
    prisma.thrustArea.create({
      data: { name: 'Operational Excellence', description: 'Optimize processes, reduce costs, improve efficiency', color: '#f59e0b' },
    }),
    prisma.thrustArea.create({
      data: { name: 'Customer Satisfaction', description: 'Enhance customer experience and retention', color: '#ec4899' },
    }),
    prisma.thrustArea.create({
      data: { name: 'People Development', description: 'Build team capabilities and foster growth', color: '#06b6d4' },
    }),
  ])

  // Create Goal Cycle
  const cycle = await prisma.goalCycle.create({
    data: {
      name: 'FY 2026-27',
      year: 2026,
      phase: 'Q1',
      startDate: new Date('2026-04-01'),
      endDate: new Date('2027-03-31'),
      status: 'ACTIVE',
    },
  })

  // Create Goals for emp1 (Arjun) — fully approved
  const goals1 = await Promise.all([
    prisma.goal.create({
      data: {
        employeeId: emp1.id,
        cycleId: cycle.id,
        thrustAreaId: thrustAreas[1].id,
        title: 'Deliver GoalFlow MVP',
        description: 'Build and deploy the goal tracking portal with all Phase 1 and Phase 2 features',
        uom: 'PERCENTAGE',
        uomType: 'MIN',
        target: 100,
        weightage: 30,
        status: 'APPROVED',
        isLocked: true,
      },
    }),
    prisma.goal.create({
      data: {
        employeeId: emp1.id,
        cycleId: cycle.id,
        thrustAreaId: thrustAreas[0].id,
        title: 'Reduce API Response Time',
        description: 'Optimize backend APIs to achieve sub-200ms response times across all endpoints',
        uom: 'NUMERIC',
        uomType: 'MAX',
        target: 200,
        weightage: 25,
        status: 'APPROVED',
        isLocked: true,
      },
    }),
    prisma.goal.create({
      data: {
        employeeId: emp1.id,
        cycleId: cycle.id,
        thrustAreaId: thrustAreas[2].id,
        title: 'Achieve 90% Test Coverage',
        description: 'Write unit and integration tests to achieve minimum 90% code coverage',
        uom: 'PERCENTAGE',
        uomType: 'MIN',
        target: 90,
        weightage: 20,
        status: 'APPROVED',
        isLocked: true,
      },
    }),
    prisma.goal.create({
      data: {
        employeeId: emp1.id,
        cycleId: cycle.id,
        thrustAreaId: thrustAreas[4].id,
        title: 'Mentor 2 Junior Developers',
        description: 'Conduct weekly code reviews and pair programming sessions with junior team members',
        uom: 'NUMERIC',
        uomType: 'MIN',
        target: 2,
        weightage: 15,
        status: 'APPROVED',
        isLocked: true,
      },
    }),
    prisma.goal.create({
      data: {
        employeeId: emp1.id,
        cycleId: cycle.id,
        thrustAreaId: thrustAreas[3].id,
        title: 'Zero Critical Bugs in Production',
        description: 'Maintain zero critical/P0 bugs in production environment throughout the quarter',
        uom: 'ZERO',
        uomType: 'MIN',
        target: 0,
        weightage: 10,
        status: 'APPROVED',
        isLocked: true,
      },
    }),
  ])

  // Create approvals for emp1's goals
  for (const goal of goals1) {
    await prisma.goalApproval.create({
      data: {
        goalId: goal.id,
        managerId: manager1.id,
        status: 'APPROVED',
        comments: 'Well-defined goal with clear measurable targets. Approved.',
      },
    })
  }

  // Create Q1 check-ins for emp1
  await Promise.all([
    prisma.checkIn.create({
      data: {
        goalId: goals1[0].id,
        quarter: 'Q1',
        achievement: 75,
        status: 'ON_TRACK',
        employeeComment: 'MVP is 75% complete. Core goal creation and approval workflow done. Working on check-in module.',
        managerComment: 'Good progress. Focus on completing the check-in module this week.',
        employeeId: emp1.id,
        managerId: manager1.id,
        score: 75,
      },
    }),
    prisma.checkIn.create({
      data: {
        goalId: goals1[1].id,
        quarter: 'Q1',
        achievement: 180,
        status: 'ON_TRACK',
        employeeComment: 'Achieved 180ms average response time after implementing Redis caching.',
        managerComment: 'Excellent work on the caching strategy.',
        employeeId: emp1.id,
        managerId: manager1.id,
        score: 90,
      },
    }),
    prisma.checkIn.create({
      data: {
        goalId: goals1[2].id,
        quarter: 'Q1',
        achievement: 72,
        status: 'ON_TRACK',
        employeeComment: 'Currently at 72% coverage. Need to add integration tests for auth module.',
        employeeId: emp1.id,
        score: 80,
      },
    }),
  ])

  // Create Goals for emp2 (Meera) — submitted, pending approval
  await Promise.all([
    prisma.goal.create({
      data: {
        employeeId: emp2.id,
        cycleId: cycle.id,
        thrustAreaId: thrustAreas[1].id,
        title: 'Redesign Dashboard UI',
        description: 'Create a modern, responsive dashboard with data visualization components',
        uom: 'PERCENTAGE',
        uomType: 'MIN',
        target: 100,
        weightage: 35,
        status: 'SUBMITTED',
      },
    }),
    prisma.goal.create({
      data: {
        employeeId: emp2.id,
        cycleId: cycle.id,
        thrustAreaId: thrustAreas[3].id,
        title: 'Improve Accessibility Score to 95+',
        description: 'Ensure all UI components meet WCAG 2.1 AA standards',
        uom: 'NUMERIC',
        uomType: 'MIN',
        target: 95,
        weightage: 25,
        status: 'SUBMITTED',
      },
    }),
    prisma.goal.create({
      data: {
        employeeId: emp2.id,
        cycleId: cycle.id,
        thrustAreaId: thrustAreas[2].id,
        title: 'Reduce Bundle Size by 30%',
        description: 'Optimize front-end build to reduce initial load time',
        uom: 'PERCENTAGE',
        uomType: 'MIN',
        target: 30,
        weightage: 20,
        status: 'SUBMITTED',
      },
    }),
    prisma.goal.create({
      data: {
        employeeId: emp2.id,
        cycleId: cycle.id,
        thrustAreaId: thrustAreas[4].id,
        title: 'Create Component Library Documentation',
        description: 'Document all reusable UI components with usage examples',
        uom: 'PERCENTAGE',
        uomType: 'MIN',
        target: 100,
        weightage: 20,
        status: 'SUBMITTED',
      },
    }),
  ])

  // Create Goals for emp3 (Vikram) — approved with check-ins
  const goals3 = await Promise.all([
    prisma.goal.create({
      data: {
        employeeId: emp3.id,
        cycleId: cycle.id,
        thrustAreaId: thrustAreas[0].id,
        title: 'Achieve ₹2Cr Quarterly Revenue',
        description: 'Close deals worth ₹2 crore in Q1 through enterprise accounts',
        uom: 'NUMERIC',
        uomType: 'MIN',
        target: 20000000,
        weightage: 40,
        status: 'APPROVED',
        isLocked: true,
      },
    }),
    prisma.goal.create({
      data: {
        employeeId: emp3.id,
        cycleId: cycle.id,
        thrustAreaId: thrustAreas[3].id,
        title: 'Maintain 95% Client Retention',
        description: 'Ensure minimum 95% renewal rate for existing enterprise clients',
        uom: 'PERCENTAGE',
        uomType: 'MIN',
        target: 95,
        weightage: 30,
        status: 'APPROVED',
        isLocked: true,
      },
    }),
    prisma.goal.create({
      data: {
        employeeId: emp3.id,
        cycleId: cycle.id,
        thrustAreaId: thrustAreas[2].id,
        title: 'Reduce Sales Cycle to 30 Days',
        description: 'Optimize the sales process to close deals within 30 days average',
        uom: 'NUMERIC',
        uomType: 'MAX',
        target: 30,
        weightage: 30,
        status: 'APPROVED',
        isLocked: true,
      },
    }),
  ])

  for (const goal of goals3) {
    await prisma.goalApproval.create({
      data: {
        goalId: goal.id,
        managerId: manager2.id,
        status: 'APPROVED',
        comments: 'Targets are aligned with department objectives. Approved.',
      },
    })
  }

  // Create Goals for emp4 (Sneha) — draft
  await Promise.all([
    prisma.goal.create({
      data: {
        employeeId: emp4.id,
        cycleId: cycle.id,
        thrustAreaId: thrustAreas[0].id,
        title: 'Grow Account Portfolio by 15%',
        description: 'Expand managed accounts from 20 to 23 through strategic upselling',
        uom: 'PERCENTAGE',
        uomType: 'MIN',
        target: 15,
        weightage: 35,
        status: 'DRAFT',
      },
    }),
    prisma.goal.create({
      data: {
        employeeId: emp4.id,
        cycleId: cycle.id,
        thrustAreaId: thrustAreas[3].id,
        title: 'Achieve NPS Score of 80+',
        description: 'Improve customer satisfaction across all managed accounts',
        uom: 'NUMERIC',
        uomType: 'MIN',
        target: 80,
        weightage: 30,
        status: 'DRAFT',
      },
    }),
  ])

  // Create Escalation Rules
  await Promise.all([
    prisma.escalationRule.create({
      data: {
        name: 'Goal Submission Reminder',
        conditionType: 'GOAL_NOT_SUBMITTED',
        daysThreshold: 7,
        notifyRole: 'EMPLOYEE',
        isActive: true,
      },
    }),
    prisma.escalationRule.create({
      data: {
        name: 'Manager Approval Overdue',
        conditionType: 'GOAL_NOT_APPROVED',
        daysThreshold: 5,
        notifyRole: 'MANAGER',
        isActive: true,
      },
    }),
    prisma.escalationRule.create({
      data: {
        name: 'Check-in Incomplete',
        conditionType: 'CHECKIN_NOT_COMPLETED',
        daysThreshold: 10,
        notifyRole: 'ADMIN',
        isActive: true,
      },
    }),
  ])

  // Create Notifications
  await Promise.all([
    prisma.notification.create({
      data: {
        userId: manager1.id,
        type: 'GOAL_SUBMITTED',
        title: 'Goals Submitted for Review',
        message: 'Meera Patel has submitted 4 goals for your approval.',
        link: '/manager/approvals',
      },
    }),
    prisma.notification.create({
      data: {
        userId: emp1.id,
        type: 'CHECKIN_DUE',
        title: 'Q1 Check-in Reminder',
        message: 'Your Q1 check-in window is open. Please update your goal progress.',
        link: '/employee/checkin',
      },
    }),
    prisma.notification.create({
      data: {
        userId: admin.id,
        type: 'ESCALATION',
        title: 'Escalation: Goals Not Submitted',
        message: 'Sneha Reddy has not submitted goals within the deadline.',
        link: '/admin/audit',
      },
    }),
  ])

  // Create Audit Logs
  await Promise.all([
    prisma.auditLog.create({
      data: {
        userId: emp1.id,
        action: 'CREATE',
        entityType: 'GOAL',
        entityId: goals1[0].id,
        newValue: JSON.stringify({ title: 'Deliver GoalFlow MVP', weightage: 30 }),
      },
    }),
    prisma.auditLog.create({
      data: {
        userId: manager1.id,
        action: 'APPROVE',
        entityType: 'GOAL',
        entityId: goals1[0].id,
        newValue: JSON.stringify({ status: 'APPROVED', comments: 'Well-defined goal' }),
      },
    }),
    prisma.auditLog.create({
      data: {
        userId: manager1.id,
        action: 'LOCK',
        entityType: 'GOAL',
        entityId: goals1[0].id,
        oldValue: JSON.stringify({ isLocked: false }),
        newValue: JSON.stringify({ isLocked: true }),
      },
    }),
  ])

  console.log('✅ Database seeded successfully!')
  console.log('')
  console.log('📋 Demo Credentials:')
  console.log('  Admin:    admin@atomberg.com / password123')
  console.log('  Manager:  manager@atomberg.com / password123')
  console.log('  Employee: employee@atomberg.com / password123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
