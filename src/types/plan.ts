export type DurationType = 'daily' | 'weekly' | 'monthly';
export type PlanStatus = 'active' | 'completed' | 'cancelled';

export interface Plan {
  id: string;
  name: string;
  unit: string;
  quality: number;
  subUnit?: string;
  subQuality?: number;
  durationType: DurationType;
  durationValue: number;
  startDate: string;
  endDate: string;
  status: PlanStatus;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface PlanRecord {
  id: string;
  planId: string;
  value: number;
  date: string;
  notes?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface PlanProgress {
  plan: Plan;
  progress: number;
  remainingValue: number;
  remainingDays: number;
  records: PlanRecord[];
} 