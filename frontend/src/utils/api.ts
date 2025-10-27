// API Configuration for Production Deployment
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// API Client
export const apiClient = {
  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    // Add auth token if available
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      }
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  },

  // Authentication endpoints
  async register(userData: any) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  },

  async login(email: string, password: string) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },

  async getCurrentUser() {
    return this.request('/api/users/me')
  },

  // Project endpoints
  async getProjects() {
    return this.request('/api/projects')
  },

  async createProject(projectData: any) {
    return this.request('/api/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    })
  },

  async getProject(projectId: string) {
    return this.request(`/api/projects/${projectId}`)
  },

  async updateProject(projectId: string, projectData: any) {
    return this.request(`/api/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    })
  },

  async deleteProject(projectId: string) {
    return this.request(`/api/projects/${projectId}`, {
      method: 'DELETE',
    })
  },

  // AI endpoints
  async generateScript(data: any) {
    return this.request('/api/generate/script', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async generateAudio(data: any) {
    return this.request('/api/generate/audio', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // Credits endpoint
  async getCredits() {
    return this.request('/api/credits')
  }
}

export default apiClient