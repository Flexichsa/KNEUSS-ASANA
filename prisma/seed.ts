import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clean existing data
  await prisma.notification.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.subtask.deleteMany()
  await prisma.task.deleteMany()
  await prisma.section.deleteMany()
  await prisma.projectMember.deleteMany()
  await prisma.project.deleteMany()
  await prisma.teamMember.deleteMany()
  await prisma.team.deleteMany()
  await prisma.workspace.deleteMany()
  await prisma.user.deleteMany()

  // Create users
  const passwordHash = await bcrypt.hash('password', 10)

  const demoUser = await prisma.user.create({
    data: {
      name: 'Demo User',
      email: 'demo@asana.com',
      password: passwordHash,
      role: 'admin',
      plan: 'starter',
    },
  })

  const sarah = await prisma.user.create({
    data: {
      name: 'Sarah Mueller',
      email: 'sarah@kneuss.ch',
      password: passwordHash,
    },
  })

  const thomas = await prisma.user.create({
    data: {
      name: 'Thomas Weber',
      email: 'thomas@kneuss.ch',
      password: passwordHash,
    },
  })

  const anna = await prisma.user.create({
    data: {
      name: 'Anna Schmidt',
      email: 'anna@kneuss.ch',
      password: passwordHash,
    },
  })

  const marco = await prisma.user.create({
    data: {
      name: 'Marco Keller',
      email: 'marco@kneuss.ch',
      password: passwordHash,
    },
  })

  console.log('Users created')

  // Create workspace
  const workspace = await prisma.workspace.create({
    data: { name: 'Kneuss Betrieb' },
  })

  // Create teams
  const engineering = await prisma.team.create({
    data: {
      name: 'Engineering',
      workspaceId: workspace.id,
      members: {
        create: [
          { userId: demoUser.id, role: 'admin' },
          { userId: thomas.id },
          { userId: marco.id },
        ],
      },
    },
  })

  const marketing = await prisma.team.create({
    data: {
      name: 'Marketing',
      workspaceId: workspace.id,
      members: {
        create: [
          { userId: demoUser.id, role: 'admin' },
          { userId: sarah.id },
          { userId: anna.id },
        ],
      },
    },
  })

  const operations = await prisma.team.create({
    data: {
      name: 'Operations',
      workspaceId: workspace.id,
      members: {
        create: [
          { userId: demoUser.id, role: 'admin' },
          { userId: sarah.id },
          { userId: thomas.id },
          { userId: anna.id },
          { userId: marco.id },
        ],
      },
    },
  })

  console.log('Teams created')

  // Create Projects
  const websiteRedesign = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      description: 'Complete redesign of the company website with modern UI/UX',
      color: '#4573D2',
      teamId: engineering.id,
      members: {
        create: [
          { userId: demoUser.id, role: 'owner' },
          { userId: thomas.id },
          { userId: marco.id },
        ],
      },
      sections: {
        create: [
          { name: 'Backlog', position: 0 },
          { name: 'In Progress', position: 1 },
          { name: 'Review', position: 2 },
          { name: 'Done', position: 3 },
        ],
      },
    },
    include: { sections: true },
  })

  const marketingCampaign = await prisma.project.create({
    data: {
      name: 'Q1 Marketing Campaign',
      description: 'Plan and execute Q1 marketing initiatives',
      color: '#F06A6A',
      teamId: marketing.id,
      members: {
        create: [
          { userId: demoUser.id, role: 'owner' },
          { userId: sarah.id },
          { userId: anna.id },
        ],
      },
      sections: {
        create: [
          { name: 'Planning', position: 0 },
          { name: 'In Progress', position: 1 },
          { name: 'Completed', position: 2 },
        ],
      },
    },
    include: { sections: true },
  })

  const productLaunch = await prisma.project.create({
    data: {
      name: 'Product Launch 2026',
      description: 'Launch new product line in March 2026',
      color: '#AA62E3',
      teamId: operations.id,
      members: {
        create: [
          { userId: demoUser.id, role: 'owner' },
          { userId: sarah.id },
          { userId: thomas.id },
          { userId: anna.id },
        ],
      },
      sections: {
        create: [
          { name: 'To Do', position: 0 },
          { name: 'In Progress', position: 1 },
          { name: 'Testing', position: 2 },
          { name: 'Done', position: 3 },
        ],
      },
    },
    include: { sections: true },
  })

  const bugTracker = await prisma.project.create({
    data: {
      name: 'Bug Tracker',
      description: 'Track and fix application bugs',
      color: '#E8384F',
      teamId: engineering.id,
      members: {
        create: [
          { userId: demoUser.id, role: 'owner' },
          { userId: thomas.id },
          { userId: marco.id },
        ],
      },
      sections: {
        create: [
          { name: 'New', position: 0 },
          { name: 'Investigating', position: 1 },
          { name: 'Fix in Progress', position: 2 },
          { name: 'Resolved', position: 3 },
        ],
      },
    },
    include: { sections: true },
  })

  console.log('Projects created')

  // Helper dates
  const today = new Date()
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
  const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7)
  const nextMonth = new Date(today); nextMonth.setDate(today.getDate() + 30)
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1)
  const lastWeek = new Date(today); lastWeek.setDate(today.getDate() - 7)

  // Website Redesign Tasks
  const wrSections = websiteRedesign.sections
  const tasks = await Promise.all([
    // Backlog
    prisma.task.create({
      data: {
        title: 'Research competitor websites',
        description: 'Analyze top 5 competitor websites for design inspiration and best practices',
        status: 'todo', priority: 'medium', position: 0,
        projectId: websiteRedesign.id, sectionId: wrSections[0].id,
        assigneeId: demoUser.id, creatorId: demoUser.id,
        dueDate: nextWeek,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Create wireframes for homepage',
        description: 'Design wireframes for the new homepage layout including hero section, features, and testimonials',
        status: 'todo', priority: 'high', position: 1,
        projectId: websiteRedesign.id, sectionId: wrSections[0].id,
        assigneeId: thomas.id, creatorId: demoUser.id,
        dueDate: nextWeek,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Design new color palette',
        status: 'todo', priority: 'medium', position: 2,
        projectId: websiteRedesign.id, sectionId: wrSections[0].id,
        assigneeId: marco.id, creatorId: demoUser.id,
        dueDate: nextMonth,
      },
    }),
    // In Progress
    prisma.task.create({
      data: {
        title: 'Implement responsive navigation',
        description: 'Build the new responsive nav bar with hamburger menu for mobile',
        status: 'in_progress', priority: 'high', position: 0,
        projectId: websiteRedesign.id, sectionId: wrSections[1].id,
        assigneeId: demoUser.id, creatorId: demoUser.id,
        dueDate: tomorrow,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Set up CI/CD pipeline',
        description: 'Configure GitHub Actions for automated testing and deployment',
        status: 'in_progress', priority: 'urgent', position: 1,
        projectId: websiteRedesign.id, sectionId: wrSections[1].id,
        assigneeId: thomas.id, creatorId: demoUser.id,
        dueDate: today,
      },
    }),
    // Review
    prisma.task.create({
      data: {
        title: 'Review landing page design',
        status: 'review', priority: 'medium', position: 0,
        projectId: websiteRedesign.id, sectionId: wrSections[2].id,
        assigneeId: sarah.id, creatorId: demoUser.id,
        dueDate: yesterday,
      },
    }),
    // Done
    prisma.task.create({
      data: {
        title: 'Set up Next.js project',
        status: 'done', priority: 'high', position: 0, completed: true, completedAt: lastWeek,
        projectId: websiteRedesign.id, sectionId: wrSections[3].id,
        assigneeId: demoUser.id, creatorId: demoUser.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Configure Tailwind CSS',
        status: 'done', priority: 'medium', position: 1, completed: true, completedAt: lastWeek,
        projectId: websiteRedesign.id, sectionId: wrSections[3].id,
        assigneeId: thomas.id, creatorId: demoUser.id,
      },
    }),
  ])

  // Marketing Campaign Tasks
  const mcSections = marketingCampaign.sections
  await Promise.all([
    prisma.task.create({
      data: {
        title: 'Write blog post about new features',
        description: 'Draft a 1500-word blog post highlighting the new product features',
        status: 'todo', priority: 'high', position: 0,
        projectId: marketingCampaign.id, sectionId: mcSections[0].id,
        assigneeId: sarah.id, creatorId: demoUser.id,
        dueDate: nextWeek,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Design social media graphics',
        status: 'todo', priority: 'medium', position: 1,
        projectId: marketingCampaign.id, sectionId: mcSections[0].id,
        assigneeId: anna.id, creatorId: demoUser.id,
        dueDate: nextWeek,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Plan email newsletter',
        description: 'Create content plan for the monthly newsletter targeting existing customers',
        status: 'in_progress', priority: 'medium', position: 0,
        projectId: marketingCampaign.id, sectionId: mcSections[1].id,
        assigneeId: demoUser.id, creatorId: demoUser.id,
        dueDate: tomorrow,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Update product landing page',
        status: 'in_progress', priority: 'high', position: 1,
        projectId: marketingCampaign.id, sectionId: mcSections[1].id,
        assigneeId: demoUser.id, creatorId: sarah.id,
        dueDate: today,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Finalize Q1 budget allocation',
        status: 'done', priority: 'urgent', position: 0, completed: true, completedAt: lastWeek,
        projectId: marketingCampaign.id, sectionId: mcSections[2].id,
        assigneeId: demoUser.id, creatorId: demoUser.id,
      },
    }),
  ])

  // Product Launch Tasks
  const plSections = productLaunch.sections
  await Promise.all([
    prisma.task.create({
      data: {
        title: 'Finalize product requirements document',
        description: 'Complete the PRD with all stakeholder feedback incorporated',
        status: 'todo', priority: 'urgent', position: 0,
        projectId: productLaunch.id, sectionId: plSections[0].id,
        assigneeId: demoUser.id, creatorId: demoUser.id,
        dueDate: tomorrow,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Order packaging materials',
        status: 'todo', priority: 'high', position: 1,
        projectId: productLaunch.id, sectionId: plSections[0].id,
        assigneeId: anna.id, creatorId: demoUser.id,
        dueDate: nextWeek,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Coordinate with suppliers',
        status: 'in_progress', priority: 'high', position: 0,
        projectId: productLaunch.id, sectionId: plSections[1].id,
        assigneeId: thomas.id, creatorId: demoUser.id,
        dueDate: nextWeek,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Set up distribution channels',
        status: 'in_progress', priority: 'medium', position: 1,
        projectId: productLaunch.id, sectionId: plSections[1].id,
        assigneeId: demoUser.id, creatorId: demoUser.id,
        dueDate: nextMonth,
      },
    }),
  ])

  // Bug Tracker Tasks
  const btSections = bugTracker.sections
  await Promise.all([
    prisma.task.create({
      data: {
        title: 'Fix login redirect loop on Safari',
        description: 'Users on Safari are experiencing infinite redirect loops when logging in',
        status: 'todo', priority: 'urgent', position: 0,
        projectId: bugTracker.id, sectionId: btSections[0].id,
        assigneeId: demoUser.id, creatorId: thomas.id,
        dueDate: today,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Fix broken image upload on mobile',
        status: 'todo', priority: 'high', position: 1,
        projectId: bugTracker.id, sectionId: btSections[0].id,
        assigneeId: marco.id, creatorId: demoUser.id,
        dueDate: tomorrow,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Investigate memory leak in dashboard',
        status: 'in_progress', priority: 'high', position: 0,
        projectId: bugTracker.id, sectionId: btSections[1].id,
        assigneeId: thomas.id, creatorId: demoUser.id,
        dueDate: nextWeek,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Fix CSV export encoding issue',
        status: 'done', priority: 'medium', position: 0, completed: true, completedAt: yesterday,
        projectId: bugTracker.id, sectionId: btSections[3].id,
        assigneeId: demoUser.id, creatorId: demoUser.id,
      },
    }),
  ])

  console.log('Tasks created')

  // Add subtasks to first task
  await prisma.subtask.createMany({
    data: [
      { title: 'Analyze competitor A website', position: 0, taskId: tasks[0].id },
      { title: 'Analyze competitor B website', position: 1, taskId: tasks[0].id },
      { title: 'Analyze competitor C website', position: 2, taskId: tasks[0].id },
      { title: 'Create comparison document', position: 3, taskId: tasks[0].id },
      { title: 'Present findings to team', position: 4, taskId: tasks[0].id, completed: false },
    ],
  })

  // Add comments
  await prisma.comment.createMany({
    data: [
      {
        content: 'I started looking at competitor A - they have a really clean design. Will share screenshots tomorrow.',
        taskId: tasks[0].id, userId: demoUser.id,
      },
      {
        content: 'Great, make sure to also check their mobile experience!',
        taskId: tasks[0].id, userId: thomas.id,
      },
      {
        content: 'The responsive nav is coming along well. Just need to fix the mobile menu animation.',
        taskId: tasks[3].id, userId: demoUser.id,
      },
      {
        content: 'Looks good! Can you also add a smooth scroll behavior?',
        taskId: tasks[3].id, userId: marco.id,
      },
    ],
  })

  // Add notifications for demo user
  await prisma.notification.createMany({
    data: [
      {
        type: 'task_assigned',
        message: 'Thomas Weber assigned you to "Fix login redirect loop on Safari"',
        userId: demoUser.id, taskId: tasks[0].id,
      },
      {
        type: 'comment',
        message: 'Marco Keller commented on "Implement responsive navigation"',
        userId: demoUser.id, taskId: tasks[3].id,
      },
      {
        type: 'task_assigned',
        message: 'Sarah Mueller assigned you to "Update product landing page"',
        userId: demoUser.id, taskId: tasks[0].id,
      },
      {
        type: 'due_date',
        message: 'Task "Set up CI/CD pipeline" is due today',
        userId: demoUser.id, taskId: tasks[4].id, read: true,
      },
    ],
  })

  console.log('Subtasks, comments, and notifications created')
  console.log('')
  console.log('Seed completed!')
  console.log('')
  console.log('Demo login:')
  console.log('  Email: demo@asana.com')
  console.log('  Password: password')
  console.log('')
  console.log('Other users: sarah@kneuss.ch, thomas@kneuss.ch, anna@kneuss.ch, marco@kneuss.ch (all password: "password")')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
