const API_BASE_URL = import.meta.env.PROD ? '/api' : '/api';

export const recordService = {
  async getRecords(filters = {}) {
    const queryParams = new URLSearchParams();
    
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.per_page) queryParams.append('per_page', filters.per_page);
    if (filters.start_date) queryParams.append('start_date', filters.start_date);
    if (filters.end_date) queryParams.append('end_date', filters.end_date);
    
    const url = `${API_BASE_URL}/records${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch records');
    }
    return response.json();
  },

  async getRecord(id) {
    const response = await fetch(`${API_BASE_URL}/records/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch record');
    }
    return response.json();
  },

  async createRecord(recordData) {
    const response = await fetch(`${API_BASE_URL}/records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(recordData),
    });
    if (!response.ok) {
      throw new Error('Failed to create record');
    }
    return response.json();
  },

  async updateRecord(id, updates) {
    const response = await fetch(`${API_BASE_URL}/records/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      throw new Error('Failed to update record');
    }
    return response.json();
  },

  async deleteRecord(id) {
    const response = await fetch(`${API_BASE_URL}/records/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete record');
    }
  }
};
