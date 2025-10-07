const API_BASE_URL = import.meta.env.PROD ? '/api' : '/api';

export const goalService = {
  async getGoals(filters = {}) {
    const queryParams = new URLSearchParams();
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.status) queryParams.append('status', filters.status);
    
    const url = `${API_BASE_URL}/goals${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch goals');
    }
    return response.json();
  },

  async getGoal(id) {
    const response = await fetch(`${API_BASE_URL}/goals/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch goal');
    }
    return response.json();
  },

  async createGoal(goalData) {
    const response = await fetch(`${API_BASE_URL}/goals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(goalData),
    });
    if (!response.ok) {
      throw new Error('Failed to create goal');
    }
    return response.json();
  },

  async updateGoal(id, updates) {
    const response = await fetch(`${API_BASE_URL}/goals/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      throw new Error('Failed to update goal');
    }
    return response.json();
  },

  async deleteGoal(id) {
    const response = await fetch(`${API_BASE_URL}/goals/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete goal');
    }
  },

  async getTags() {
    const response = await fetch(`${API_BASE_URL}/goals/tags`);
    if (!response.ok) {
      throw new Error('Failed to fetch tags');
    }
    return response.json();
  },

  // Progress Records
  async getProgressRecords(goalId) {
    const response = await fetch(`${API_BASE_URL}/goals/${goalId}/progress_records`);
    if (!response.ok) {
      throw new Error('Failed to fetch progress records');
    }
    return response.json();
  },

  async createProgressRecord(goalId, progressRecord) {
    const response = await fetch(`${API_BASE_URL}/goals/${goalId}/progress_records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(progressRecord),
    });
    if (!response.ok) {
      throw new Error('Failed to create progress record');
    }
    return response.json();
  },

  async updateProgressRecord(progressRecordId, updates) {
    const response = await fetch(`${API_BASE_URL}/progress_records/${progressRecordId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ progress_record: updates }),
    });
    if (!response.ok) {
      throw new Error('Failed to update progress record');
    }
    return response.json();
  },

  async deleteProgressRecord(progressRecordId) {
    const response = await fetch(`${API_BASE_URL}/progress_records/${progressRecordId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete progress record');
    }
  }
};
