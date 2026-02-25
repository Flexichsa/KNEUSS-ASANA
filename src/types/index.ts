export type Priority = 'low' | 'medium' | 'high' | 'urgent'
export type Status = 'todo' | 'in_progress' | 'review' | 'done'
export type Privacy = 'public' | 'private'
export type UserPlan = 'personal' | 'starter' | 'advanced' | 'enterprise'

export interface UserType {
  id: string
  name: string
  email: string
  avatar: string | null
  role: string
  plan: string
}

export interface ProjectType {
  id: string
  name: string
  description: string | null
  color: string
  privacy: string
  teamId: string
  createdAt: string
  team?: TeamType
  sections?: SectionType[]
  members?: ProjectMemberType[]
  _count?: { tasks: number }
}

export interface TeamType {
  id: string
  name: string
  workspaceId: string
  projects?: ProjectType[]
  members?: TeamMemberType[]
}

export interface TeamMemberType {
  userId: string
  teamId: string
  role: string
  user?: UserType
}

export interface ProjectMemberType {
  userId: string
  projectId: string
  role: string
  user?: UserType
}

export interface SectionType {
  id: string
  name: string
  position: number
  projectId: string
  tasks?: TaskType[]
}

export interface TaskType {
  id: string
  title: string
  description: string | null
  status: Status
  priority: Priority
  dueDate: string | null
  position: number
  completed: boolean
  completedAt: string | null
  sectionId: string | null
  projectId: string
  assigneeId: string | null
  creatorId: string
  createdAt: string
  updatedAt: string
  assignee?: UserType | null
  creator?: UserType
  project?: ProjectType
  section?: SectionType | null
  subtasks?: SubtaskType[]
  comments?: CommentType[]
}

export interface SubtaskType {
  id: string
  title: string
  completed: boolean
  position: number
  taskId: string
}

export interface CommentType {
  id: string
  content: string
  taskId: string
  userId: string
  createdAt: string
  user?: UserType
}

export interface NotificationType {
  id: string
  type: string
  message: string
  read: boolean
  userId: string
  taskId: string | null
  createdAt: string
  task?: TaskType | null
}
