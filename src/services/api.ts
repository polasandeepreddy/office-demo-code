// API Service for Jayarama Associates PropertyFlow
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Token management
const TOKEN_KEY = 'jayarama_propertyflow_token';

const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

const removeAuthToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

// API request helper
const apiRequest = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const token = getAuthToken();

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      if (response.status === 401) {
        removeAuthToken();
        window.location.href = '/login';
        throw new Error('Authentication required');
      }

      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }

    return response.text();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// File upload helper
const apiUpload = async (endpoint: string, formData: FormData): Promise<any> => {
  const token = getAuthToken();

  const config: RequestInit = {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      if (response.status === 401) {
        removeAuthToken();
        window.location.href = '/login';
        throw new Error('Authentication required');
      }

      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('API Upload Error:', error);
    throw error;
  }
};

// Authentication API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.access_token) {
      setAuthToken(response.access_token);
    }

    return response;
  },

  logout: async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      removeAuthToken();
    }
  },

  getCurrentUser: () => {
    const token = getAuthToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch {
      removeAuthToken();
      return null;
    }
  },

  isAuthenticated: () => {
    return !!getAuthToken();
  },
};

// Users API
export const usersAPI = {
  getAll: (params?: any) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiRequest(`/users${queryString}`);
  },

  getByPosition: (position: string) => apiRequest(`/users/position/${position}`),

  create: (userData: any) => apiRequest('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  update: (id: string, userData: any) => apiRequest(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(userData),
  }),

  delete: (id: string) => apiRequest(`/users/${id}`, {
    method: 'DELETE',
  }),
};

// Banks API
export const banksAPI = {
  getAll: (params?: any) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiRequest(`/banks${queryString}`);
  },

  create: (bankData: any) => apiRequest('/banks', {
    method: 'POST',
    body: JSON.stringify(bankData),
  }),

  update: (id: string, bankData: any) => apiRequest(`/banks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(bankData),
  }),

  delete: (id: string) => apiRequest(`/banks/${id}`, {
    method: 'DELETE',
  }),
};

// Property Types API
export const propertyTypesAPI = {
  getAll: (params?: any) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiRequest(`/property-types${queryString}`);
  },

  create: (typeData: any) => apiRequest('/property-types', {
    method: 'POST',
    body: JSON.stringify(typeData),
  }),

  update: (id: string, typeData: any) => apiRequest(`/property-types/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(typeData),
  }),

  delete: (id: string) => apiRequest(`/property-types/${id}`, {
    method: 'DELETE',
  }),
};

// Locations API
export const locationsAPI = {
  getAll: (params?: any) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiRequest(`/locations${queryString}`);
  },

  create: (locationData: any) => apiRequest('/locations', {
    method: 'POST',
    body: JSON.stringify(locationData),
  }),

  update: (id: string, locationData: any) => apiRequest(`/locations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(locationData),
  }),

  delete: (id: string) => apiRequest(`/locations/${id}`, {
    method: 'DELETE',
  }),
};

// System Configuration API
export const configAPI = {
  getAll: (params?: any) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiRequest(`/config${queryString}`);
  },

  create: (configData: any) => apiRequest('/config', {
    method: 'POST',
    body: JSON.stringify(configData),
  }),

  update: (id: string, configData: any) => apiRequest(`/config/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(configData),
  }),

  delete: (id: string) => apiRequest(`/config/${id}`, {
    method: 'DELETE',
  }),
};

// Files API
export const filesAPI = {
  getAll: (params?: any) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiRequest(`/files${queryString}`);
  },

  getById: (id: string) => apiRequest(`/files/${id}`),

  create: (fileData: any, documents: File[]) => {
    const formData = new FormData();

    Object.keys(fileData).forEach(key => {
      if (fileData[key] !== null && fileData[key] !== undefined) {
        formData.append(key, fileData[key]);
      }
    });

    documents.forEach((file) => {
      formData.append('documents', file);
    });

    return apiUpload('/files', formData);
  },

  update: (id: string, fileData: any) => apiRequest(`/files/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(fileData),
  }),

  updateStatus: (id: string, status: string, notes?: string) => apiRequest(`/files/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, notes }),
  }),

  saveValidationData: (id: string, validationData: any, photos: File[]) => {
    const formData = new FormData();
    formData.append('validation_data', JSON.stringify(validationData));

    photos.forEach((photo) => {
      formData.append('photos', photo);
    });

    return apiUpload(`/files/${id}/validation`, formData);
  },

  savePropertyData: (id: string, propertyData: any) => apiRequest(`/files/${id}/property-data`, {
    method: 'POST',
    body: JSON.stringify(propertyData),
  }),

  delete: (id: string) => apiRequest(`/files/${id}`, {
    method: 'DELETE',
  }),
};

// Notifications API
export const notificationsAPI = {
  getAll: (params?: any) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiRequest(`/notifications${queryString}`);
  },

  markAsRead: (id: string) => apiRequest(`/notifications/${id}/read`, {
    method: 'PATCH',
  }),

  delete: (id: string) => apiRequest(`/notifications/${id}`, {
    method: 'DELETE',
  }),
};

// Statistics API
export const statsAPI = {
  getOverall: () => apiRequest('/stats/overall'),
  getDashboard: () => apiRequest('/stats/dashboard'),
};

// Helper functions
export const handleApiError = (error: any) => {
  if (error.message.includes('Authentication required')) {
    window.location.href = '/login';
  }

  if (error.message.includes('fetch')) {
    return 'Network error. Please check your connection and ensure the server is running.';
  }

  return error.message || 'An unexpected error occurred.';
};

export const exportData = async (type: string = 'all') => {
  try {
    console.log('Export data:', type);
    return true;
  } catch (error) {
    console.error('Export error:', error);
    return false;
  }
};
