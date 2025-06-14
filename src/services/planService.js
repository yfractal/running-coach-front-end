const API_BASE_URL = import.meta.env.PROD ? '/api' : '/api';

export const planService = {
  async getPlans() {
    const response = await fetch(`${API_BASE_URL}/plans`);
    if (!response.ok) {
      throw new Error('Failed to fetch plans');
    }
    return response.json();
  },

  async getPlan(id) {
    const response = await fetch(`${API_BASE_URL}/plans/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch plan');
    }
    return response.json();
  },

  async createPlan(plan) {
    const response = await fetch(`${API_BASE_URL}/plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ plan }),
    });
    if (!response.ok) {
      throw new Error('Failed to create plan');
    }
    return response.json();
  },

  async updatePlan(id, plan) {
    const response = await fetch(`${API_BASE_URL}/plans/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ plan }),
    });
    if (!response.ok) {
      throw new Error('Failed to update plan');
    }
    return response.json();
  },

  async deletePlan(id) {
    const response = await fetch(`${API_BASE_URL}/plans/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete plan');
    }
  },

  async getPlanProgress(id) {
    const response = await fetch(`${API_BASE_URL}/plans/${id}/progress`);
    if (!response.ok) {
      throw new Error('Failed to fetch plan progress');
    }
    return response.json();
  },

  async createPlanRecord(planId, record) {
    console.log('createPlanRecord');
    console.log(planId);
    console.log(record);
    const response = await fetch(`${API_BASE_URL}/plans/${planId}/records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ plan_record: record }),
    });
    if (!response.ok) {
      throw new Error('Failed to create record');
    }
    return response.json();
  },
}; 