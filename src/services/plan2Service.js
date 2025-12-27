const API_BASE_URL = import.meta.env.PROD ? '/api' : '/api';

export const plan2Service = {
  async getPlan2s(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.state) {
      queryParams.append('state', params.state);
    }
    
    const url = `${API_BASE_URL}/plan2s${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch plan2s');
    }
    return response.json();
  },

  async getPlan2(id) {
    const response = await fetch(`${API_BASE_URL}/plan2s/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch plan2');
    }
    return response.json();
  },

  async createPlan2(plan2, tags = []) {
    const response = await fetch(`${API_BASE_URL}/plan2s`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      },
      body: JSON.stringify({ plan2, tags }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create plan2');
    }
    return response.json();
  },

  async updatePlan2(id, plan2, tags = null) {
    const body = { plan2 };
    if (tags !== null) {
      body.tags = tags;
    }
    
    const response = await fetch(`${API_BASE_URL}/plan2s/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update plan2');
    }
    return response.json();
  },

  async deletePlan2(id) {
    const response = await fetch(`${API_BASE_URL}/plan2s/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete plan2');
    }
  },
};

