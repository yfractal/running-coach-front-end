export interface Goal {
  id: string;
  title: string;
  description: string;
  target: number;
  initial_value: number;
  unit: string;
  category: string;
  tags: string[];
  sub_goals: any[];
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  target_date: string;
  progress_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface WorkRecord {
  id: string;
  date: string;
  activity: string;
  quantity: number;
  unit: string;
  notes: string;
  created_at: string;
}

export interface ProgressRecord {
  id: string;
  date: string;
  value: number;
  unit: string;
  is_benchmark: boolean;
  notes: string;
  created_at: string;
}

export interface GoalDetails extends Goal {
  work_records: WorkRecord[];
  progress_records: ProgressRecord[];
  stats: {
    progress_percentage: number;
    total_work_quantity: number;
    work_records_count: number;
    latest_progress: string;
  };
}

export interface GoalsResponse {
  goals: Goal[];
  meta: {
    total: number;
    categories: string[];
    statuses: string[];
  };
}

export interface CreateGoalData {
  title: string;
  description: string;
  target: number;
  initial_value: number;
  unit: string;
  category: string;
  tags: string[];
  target_date: string;
}
