import { Plan, PlanProgress, PlanRecord } from '@/types/plan';

const API_BASE_URL = '/api';

export const planService = {
  // Plans
  async getPlans(): Promise<Plan[]> {
    const response = await fetch(`${API_BASE_URL}/plans`);
    return response.json();
  },

  async getPlan(id: string): Promise<Plan> {
    const response = await fetch(`${API_BASE_URL}/plans/${id}`);
    return response.json();
  },

  async createPlan(plan: Omit<Plan, 'id' | 'createdAt' | 'updatedAt'>): Promise<Plan> {
    const response = await fetch(`${API_BASE_URL}/plans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    });
    return response.json();
  },

  async updatePlan(id: string, plan: Partial<Plan>): Promise<Plan> {
    const response = await fetch(`${API_BASE_URL}/plans/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    });
    return response.json();
  },

  async deletePlan(id: string): Promise<void> {
    await fetch(`${API_BASE_URL}/plans/${id}`, { method: 'DELETE' });
  },

  async getPlanProgress(id: string): Promise<PlanProgress> {
    const response = await fetch(`${API_BASE_URL}/plans/${id}/progress`);
    return response.json();
  },

  // Plan Records
  async getPlanRecords(planId: string): Promise<PlanRecord[]> {
    const response = await fetch(`${API_BASE_URL}/plans/${planId}/records`);
    return response.json();
  },

  async createPlanRecord(
    planId: string,
    record: Omit<PlanRecord, 'id' | 'planId' | 'createdAt' | 'updatedAt'>
  ): Promise<PlanRecord> {
    const response = await fetch(`${API_BASE_URL}/plans/${planId}/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan_record: record }),
    });
    return response.json();
  },

  async updatePlanRecord(
    planId: string,
    recordId: string,
    record: Partial<PlanRecord>
  ): Promise<PlanRecord> {
    const response = await fetch(`${API_BASE_URL}/plans/${planId}/records/${recordId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan_record: record }),
    });
    return response.json();
  },

  async deletePlanRecord(planId: string, recordId: string): Promise<void> {
    await fetch(`${API_BASE_URL}/plans/${planId}/records/${recordId}`, {
      method: 'DELETE',
    });
  },
}; 