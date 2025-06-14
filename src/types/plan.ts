export type duration_type = 'daily' | 'weekly' | 'monthly';
export type PlanStatus = 'active' | 'completed' | 'cancelled';

export interface Plan {
  id: string;
  name: string;
  unit: string;
  quality: number;
  sub_unit?: string;
  sub_quality?: number;
  duration_type: duration_type;
  duration_value: number;
  start_date: string;
  end_date: string;
  status: PlanStatus;
  description?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PlanRecord {
  id: string;
  planId: string;
  value: number;
  date: string;
  notes?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PlanProgress {
  plan: Plan;
  progress: number;
  remaining_value: number;
  remaining_days: number;
  records: PlanRecord[];
} 