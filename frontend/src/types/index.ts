export interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type Severity = 'TRIVIAL' | 'MINOR' | 'MAJOR' | 'CRITICAL' | 'BLOCKER';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'BLOCKED';

export interface Attachment {
  id: number;
  task_id: number;
  uploader_id?: number;
  filename: string;
  file_url: string;
  file_size_bytes: number;
  file_type: string;
  version: number;
  uploaded_at: string;
}

export interface ChecklistItem {
  id: number;
  checklist_id: number;
  content: string;
  is_completed: boolean;
  assignee_id?: number;
}

export interface Checklist {
  id: number;
  task_id: number;
  title: string;
  items: ChecklistItem[];
}

export interface EmojiReaction {
  id: number;
  comment_id: number;
  user_id: number;
  emoji: string;
}

export interface Comment {
  id: number;
  task_id: number;
  user_id: number;
  content: string;
  created_at: string;
  user?: User;
  reactions: EmojiReaction[];
}

export interface CustomFieldValue {
  id: number;
  task_id: number;
  field_id: number;
  value_text?: string;
}

export interface Task {
  id: number;
  user_id: number;
  assignee_id?: number;
  reporter_id?: number;
  project_id?: number;
  column_id?: number;
  sprint_id?: number;
  parent_id?: number;
  title: string;
  description?: string;
  is_completed: boolean;
  status: TaskStatus;
  priority: Priority;
  severity: Severity;
  story_points: number;
  estimated_hours: number;
  actual_hours: number;
  start_date?: string;
  end_date?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
  assignee?: User;
  reporter?: User;
  attachments: Attachment[];
  checklists: Checklist[];
  comments: Comment[];
  custom_field_values: CustomFieldValue[];
}

export interface BoardColumn {
  id: number;
  project_id: number;
  name: string;
  position: number;
  wip_limit: number;
}

export interface Milestone {
  id: number;
  project_id: number;
  title: string;
  description?: string;
  target_date: string;
  is_completed: boolean;
}

export interface Roadmap {
  id: number;
  project_id: number;
  title: string;
  quarter: string;
  start_date: string;
  end_date: string;
  progress_percentage: number;
}

export interface Release {
  id: number;
  project_id: number;
  version_tag: string;
  release_date: string;
  status: string;
  notes?: string;
}

export interface Project {
  id: number;
  workspace_id: number;
  name: string;
  key: string;
  description?: string;
  status: string;
  health_score: number;
  start_date?: string;
  end_date?: string;
  created_at: string;
  columns?: BoardColumn[];
  milestones?: Milestone[];
  roadmaps?: Roadmap[];
  releases?: Release[];
}

export interface BurndownPoint {
  date_point: string;
  remaining_story_points: number;
  ideal_remaining: number;
}

export interface Sprint {
  id: number;
  project_id: number;
  name: string;
  goal?: string;
  start_date: string;
  end_date: string;
  status: string;
  burndown_points?: BurndownPoint[];
}

export interface WorkspaceAnalytics {
  total_projects: number;
  completed_projects: number;
  total_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  productivity_score: number;
  last_updated: string;
}

export interface Workspace {
  id: number;
  organization_id: number;
  name: string;
  description?: string;
  color: string;
  is_private: boolean;
  created_at: string;
  analytics?: WorkspaceAnalytics;
}

export interface OrgSetting {
  primary_color: string;
  secondary_color: string;
  allow_guest_invite: boolean;
  require_2fa: boolean;
  default_wip_limit: number;
}

export interface Organization {
  id: number;
  name: string;
  slug: string;
  logo_url?: string;
  custom_domain?: string;
  plan: string;
  is_active: boolean;
  created_at: string;
  settings?: OrgSetting;
}

export interface TimeLog {
  id: number;
  task_id: number;
  user_id: number;
  start_time: string;
  end_time?: string;
  duration_hours: number;
  description?: string;
  is_billable: boolean;
  is_running: boolean;
  user?: User;
}

export interface NotificationItem {
  id: number;
  user_id: number;
  title: string;
  message: string;
  notification_type: string;
  link_url?: string;
  is_read: boolean;
  created_at: string;
}
