const API_BASE_URL = import.meta.env.PROD ? '/api' : '/api';

export const workoutService = {
  async getWorkouts(filters = {}) {
    const queryParams = new URLSearchParams();
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.per_page) queryParams.append('per_page', filters.per_page);
    if (filters.time_range) queryParams.append('time_range', filters.time_range);
    if (filters.start_date) queryParams.append('start_date', filters.start_date);
    if (filters.end_date) queryParams.append('end_date', filters.end_date);
    
    const url = `${API_BASE_URL}/workouts${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch workouts');
    }
    return response.json();
  },

  async getWorkout(id) {
    const response = await fetch(`${API_BASE_URL}/workouts/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch workout');
    }
    return response.json();
  },

  async updateWorkout(id, updates) {
    const response = await fetch(`${API_BASE_URL}/workouts/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ workout: updates }),
    });
    if (!response.ok) {
      throw new Error('Failed to update workout');
    }
    return response.json();
  },

  async deleteWorkout(id) {
    const response = await fetch(`${API_BASE_URL}/workouts/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete workout');
    }
  }
};
