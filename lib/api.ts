// API configuration and base functions
const API_BASE_URL = "https://1ad5f39a-7c6d-4d67-a9cc-7923fd07b12a-00-owc4pivv8zuc.spock.replit.dev"
// const API_BASE_URL = "http://localhost:5000"

// Get JWT token from localStorage or your auth system
const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token")
  }
  return null
}

// API response types matching backend documentation
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
  code?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Base API function with error handling and authentication
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const token = getAuthToken()
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    // Add authentication header if token exists
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers,
      ...options,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || data.message || "API request failed")
    }

    return data
  } catch (error) {
    console.error("API Error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      code: "NETWORK_ERROR",
    }
  }
}

// Public Survey APIs (No Authentication Required)
export const publicSurveyApi = {
  // GET /api/public/survey/:id
  getSurvey: async (
    id: string,
  ): Promise<
    ApiResponse<{
      id: string
      title: string
      description: string
      category: string
      questions: Array<{
        id: string
        type: "single_choice" | "checkbox" | "text" | "rating"
        question: string
        options?: string[]
        required: boolean
      }>
      status: "active" | "completed" | "draft"
    }>
  > => {
    // Public API doesn't require authentication
    return fetch(`${API_BASE_URL}/api/public/survey/${id}`)
      .then((response) => response.json())
      .catch((error) => ({
        success: false,
        error: error.message,
        code: "NETWORK_ERROR",
      }))
  },

  // POST /api/public/survey/:id/submit
  submitResponse: async (
    id: string,
    responseData: {
      answers: Array<{
        questionId: string
        question: string
        answer: string | string[]
      }>
      completionTime: number
      respondentInfo?: {
        name?: string
        email?: string
      }
    },
  ): Promise<
    ApiResponse<{
      id: string
      message: string
      submittedAt: string
    }>
  > => {
    return fetch(`${API_BASE_URL}/api/public/survey/${id}/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(responseData),
    })
      .then((response) => response.json())
      .catch((error) => ({
        success: false,
        error: error.message,
        code: "NETWORK_ERROR",
      }))
  },

  // GET /api/public/survey/:id/thank-you
  getThankYouMessage: async (
    id: string,
  ): Promise<
    ApiResponse<{
      title: string
      message: string
      category: string
    }>
  > => {
    return fetch(`${API_BASE_URL}/api/public/survey/${id}/thank-you`)
      .then((response) => response.json())
      .catch((error) => ({
        success: false,
        error: error.message,
        code: "NETWORK_ERROR",
      }))
  },
}

// Question Generation APIs (NEW)
export const questionGenerationApi = {
  // POST /api/questions/generate
  generateQuestions: async (requestData: {
    category: string
    description?: string
    questionCount?: number
  }): Promise<
    ApiResponse<{
      category: string
      description: string
      questionCount: number
      questions: Array<{
        id: string
        type: "single_choice" | "checkbox" | "text" | "rating" | "yes_no"
        question: string
        options: string[]
        required: boolean
      }>
      generatedWith: "openai" | "static"
    }>
  > => {
    return apiRequest("/api/questions/generate", {
      method: "POST",
      body: JSON.stringify(requestData),
    })
  },

  // GET /api/questions/categories
  getCategories: async (): Promise<ApiResponse<string[]>> => {
    return apiRequest("/api/questions/categories")
  },

  // GET /api/questions/static/:category
  getStaticQuestions: async (
    category: string,
  ): Promise<
    ApiResponse<{
      category: string
      questions: Array<{
        id: string
        type: "single_choice" | "checkbox" | "text" | "rating" | "yes_no"
        question: string
        options: string[]
        required: boolean
      }>
      generatedWith: "static"
    }>
  > => {
    return apiRequest(`/api/questions/static/${encodeURIComponent(category)}`)
  },

  // GET /api/questions/config
  getConfig: async (): Promise<
    ApiResponse<{
      mode: "openai" | "static"
      openaiConnected: boolean
      openaiError?: string
      availableCategories: string[]
      settings: {
        openai: {
          model: string
          maxQuestions: number
          temperature: number
          questionTypes: string[]
        }
        static: {
          defaultQuestionsPerCategory: number
        }
      }
    }>
  > => {
    return apiRequest("/api/questions/config")
  },
}

// Dashboard APIs
export const dashboardApi = {
  // GET /api/dashboard/stats
  getStats: async (): Promise<
    ApiResponse<{
      totalSurveys: number
      surveyGrowth: number
      totalResponses: number
      responseGrowth: number
      completionRate: number
      completionRateGrowth: number
      avgResponseTime: number
      responseTimeImprovement: number
    }>
  > => {
    return apiRequest("/api/dashboard/stats")
  },

  // GET /api/dashboard/charts
  getCharts: async (): Promise<
    ApiResponse<{
      barChart: Array<{ category: string; responses: number }>
      lineChart: Array<{ month: string; surveys: number; responses: number }>
      pieChart: Array<{ category: string; value: number }>
    }>
  > => {
    return apiRequest("/api/dashboard/charts")
  },

  // GET /api/dashboard/recent-surveys
  getRecentSurveys: async (): Promise<
    ApiResponse<
      Array<{
        id: string
        title: string
        category: string
        responses: number
        target: number
        completionRate: number
        createdAt: string
        status: "active" | "completed" | "draft"
      }>
    >
  > => {
    return apiRequest("/api/dashboard/recent-surveys")
  },
}

// Survey APIs
export const surveyApi = {
  // GET /api/surveys
  getAllSurveys: async (params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
    category?: string
  }): Promise<
    PaginatedResponse<{
      id: string
      title: string
      category: string
      status: "active" | "completed" | "draft"
      responses: number
      target: number
      completionRate: number
      createdAt: string
      updatedAt: string
    }>
  > => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append("page", params.page.toString())
    if (params?.limit) queryParams.append("limit", params.limit.toString())
    if (params?.search) queryParams.append("search", params.search)
    if (params?.status) queryParams.append("status", params.status)
    if (params?.category) queryParams.append("category", params.category)

    const endpoint = `/api/surveys${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    return apiRequest(endpoint)
  },

  // GET /api/surveys/:id
  getSurvey: async (
    id: string,
  ): Promise<
    ApiResponse<{
      id: string
      title: string
      description: string
      category: string
      status: "active" | "completed" | "draft"
      questions: Array<{
        id: string
        type: "single_choice" | "checkbox" | "text" | "rating"
        question: string
        options?: string[]
        required: boolean
      }>
      audience: {
        ageGroups: string[]
        genders: string[]
        locations: string[]
        industries: string[]
        targetCount: number
        dataSource: string
      }
      responses: number
      target: number
      completionRate: number
      createdAt: string
      updatedAt: string
    }>
  > => {
    return apiRequest(`/api/surveys/${id}`)
  },

  // POST /api/surveys
  createSurvey: async (surveyData: {
    title: string
    description: string
    category: string
    questions: Array<{
      type: "single_choice" | "checkbox" | "text" | "rating"
      question: string
      options?: string[]
      required: boolean
    }>
    audience: {
      ageGroups: string[]
      genders: string[]
      locations: string[]
      industries: string[]
      targetCount: number
      dataSource: string
    }
  }): Promise<
    ApiResponse<{
      id: string
      title: string
      status: string
      createdAt: string
    }>
  > => {
    return apiRequest("/api/surveys", {
      method: "POST",
      body: JSON.stringify(surveyData),
    })
  },


  // Create HTML

  // Post /api/surveys/:id/create-html

  htmlCreate: async (
    id: string,
    data: {
      campaignName?: string
      selectedAudience?: string[]
    },
  ): Promise<ApiResponse<{
    survey: {
      surveyId: string;
      publicUrl: string;
      htmlContent: string;
      updatedAt: string;
    }, email: {
      sent: number;
      failed: number;
      errors: string[];
      campaignId: string;
    }
  }>> => {
    return apiRequest(`/api/surveys/${id}/create-html`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  },


  // PUT /api/surveys/:id
  updateSurvey: async (
    id: string,
    updates: {
      title?: string
      description?: string
      status?: "active" | "completed" | "draft"
      questions?: Array<{
        id?: string
        type: "single_choice" | "checkbox" | "text" | "rating"
        question: string
        options?: string[]
        required: boolean
      }>
    },
  ): Promise<ApiResponse<{ id: string; updatedAt: string }>> => {
    return apiRequest(`/api/surveys/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    })
  },

  // DELETE /api/surveys/:id
  deleteSurvey: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    return apiRequest(`/api/surveys/${id}`, {
      method: "DELETE",
    })
  },

  // POST /api/surveys/:id/duplicate
  duplicateSurvey: async (
    id: string,
  ): Promise<
    ApiResponse<{
      id: string
      title: string
      createdAt: string
    }>
  > => {
    return apiRequest(`/api/surveys/${id}/duplicate`, {
      method: "POST",
    })
  },

  // POST /api/surveys/:id/send
  sendSurvey: async (
    id: string,
  ): Promise<
    ApiResponse<{
      sentCount: number
      message: string
    }>
  > => {
    return apiRequest(`/api/surveys/${id}/send`, {
      method: "POST",
    })
  },
}

// Survey Results APIs
export const surveyResultsApi = {
  // GET /api/surveys/:id/results
  getSurveyResults: async (
    id: string,
  ): Promise<
    ApiResponse<{
      survey: {
        id: string
        title: string
        description: string
        category: string
        createdAt: string
      }
      stats: {
        totalResponses: number
        completionRate: number
        avgTime: number
        npsScore: number
      }
      questionResults: Array<{
        questionId: string
        question: string
        type: "single_choice" | "checkbox" | "text" | "rating"
        responses: number
        data: Array<{ option: string; count: number; percentage: number }>
        averageRating?: number
        sampleResponses?: string[]
      }>
      demographics: {
        age: Array<{ ageGroup: string; count: number }>
        gender: Array<{ gender: string; count: number }>
        location: Array<{ location: string; count: number }>
      }
      responseTimeline: Array<{ date: string; responses: number }>
    }>
  > => {
    return apiRequest(`/api/surveys/${id}/results`)
  },

  // GET /api/surveys/:id/responses
  getIndividualResponses: async (
    id: string,
    params?: {
      page?: number
      limit?: number
    },
  ): Promise<
    PaginatedResponse<{
      id: string
      submittedAt: string
      completionTime: number
      answers: Array<{
        questionId: string
        question: string
        answer: string
      }>
    }>
  > => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append("page", params.page.toString())
    if (params?.limit) queryParams.append("limit", params.limit.toString())

    const endpoint = `/api/surveys/${id}/responses${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    return apiRequest(endpoint)
  },

  // GET /api/surveys/:id/export
  exportSurveyData: async (id: string, format: "csv" | "excel" | "pdf" | "json"): Promise<Blob> => {
    const token = getAuthToken()
    const headers: HeadersInit = {}

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}/api/surveys/${id}/export?format=${format}`, {
      headers,
    })

    if (!response.ok) {
      throw new Error("Export failed")
    }

    return response.blob()
  },
}

// Audience APIs
export const audienceApi = {
  // GET /api/audience
  getAudience: async (params?: {
    page?: number
    limit?: number
    search?: string
    ageGroup?: string
    gender?: string
    country?: string
    industry?: string
  }): Promise<
    PaginatedResponse<{
      id: string
      firstName: string
      lastName: string
      email: string
      phone: string
      ageGroup: string
      gender: string
      city: string
      state: string
      country: string
      industry: string
      jobTitle: string
      education: string
      income: string
      joinedDate: string
      isActive: boolean
      lastActivity: string
      tags: string[]
    }>
  > => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append("page", params.page.toString())
    if (params?.limit) queryParams.append("limit", params.limit.toString())
    if (params?.search) queryParams.append("search", params.search)
    if (params?.ageGroup) queryParams.append("ageGroup", params.ageGroup)
    if (params?.gender) queryParams.append("gender", params.gender)
    if (params?.country) queryParams.append("country", params.country)
    if (params?.industry) queryParams.append("industry", params.industry)

    const endpoint = `/api/audience${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    return apiRequest(endpoint)
  },

  // GET /api/audience/stats
  getAudienceStats: async (): Promise<
    ApiResponse<{
      total: number
      active: number
      byAgeGroup: Record<string, number>
      byGender: Record<string, number>
      byCountry: Record<string, number>
      byState: Record<string, number>
      byIndustry: Record<string, number>
    }>
  > => {
    return apiRequest("/api/audience/stats")
  },

  // POST /api/audience/import
  importAudience: async (
    file: File,
  ): Promise<
    ApiResponse<{
      imported: number
      skipped: number
      errors: string[]
    }>
  > => {
    const token = getAuthToken()
    const formData = new FormData()
    formData.append("file", file)

    const headers: HeadersInit = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    return apiRequest("/api/audience/import", {
      method: "POST",
      body: formData,
      headers,
    })
  },

  // GET /api/audience/export
  exportAudience: async (params?: {
    format?: "csv" | "excel"
    ageGroup?: string
    gender?: string
    country?: string
    industry?: string
  }): Promise<Blob> => {
    const token = getAuthToken()
    const queryParams = new URLSearchParams()
    if (params?.format) queryParams.append("format", params.format)
    if (params?.ageGroup) queryParams.append("ageGroup", params.ageGroup)
    if (params?.gender) queryParams.append("gender", params.gender)
    if (params?.country) queryParams.append("country", params.country)
    if (params?.industry) queryParams.append("industry", params.industry)

    const headers: HeadersInit = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const endpoint = `/api/audience/export${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers })

    if (!response.ok) {
      throw new Error("Export failed")
    }

    return response.blob()
  },

  // POST /api/audience/segments
  createSegment: async (segmentData: {
    name: string
    description: string
    criteria: {
      ageGroups?: string[]
      genders?: string[]
      countries?: string[]
      industries?: string[]
    }
  }): Promise<
    ApiResponse<{
      id: string
      name: string
      memberCount: number
    }>
  > => {
    return apiRequest("/api/audience/segments", {
      method: "POST",
      body: JSON.stringify(segmentData),
    })
  },

  // GET /api/audience/segments
  getSegments: async (): Promise<
    ApiResponse<
      Array<{
        id: string
        name: string
        description: string
        memberCount: number
        createdAt: string
      }>
    >
  > => {
    return apiRequest("/api/audience/segments")
  },
}

// Categories API
export const categoriesApi = {
  // GET /api/categories
  getCategories: async (): Promise<ApiResponse<string[]>> => {
    return apiRequest("/api/categories")
  },
}

// Demo data for testing (fallback when API is not available)
export const demoData = {
  dashboardStats: {
    totalSurveys: 24,
    surveyGrowth: 12,
    totalResponses: 1842,
    responseGrowth: 8,
    completionRate: 76,
    completionRateGrowth: 3,
    avgResponseTime: 4.2,
    responseTimeImprovement: 12,
  },

  dashboardCharts: {
    barChart: [
      { category: "IT Sector", responses: 320 },
      { category: "Automotive", responses: 240 },
      { category: "Healthcare", responses: 280 },
      { category: "Education", responses: 180 },
      { category: "Retail", responses: 220 },
    ],
    lineChart: [
      { month: "Jan", surveys: 10, responses: 320 },
      { month: "Feb", surveys: 12, responses: 380 },
      { month: "Mar", surveys: 14, responses: 420 },
      { month: "Apr", surveys: 18, responses: 550 },
      { month: "May", surveys: 20, responses: 620 },
      { month: "Jun", surveys: 24, responses: 700 },
    ],
    pieChart: [
      { category: "IT Sector", value: 32 },
      { category: "Automotive", value: 24 },
      { category: "Healthcare", value: 18 },
      { category: "Education", value: 14 },
      { category: "Retail", value: 12 },
    ],
  },

  surveys: [
    {
      id: "survey-1",
      title: "IT Professional Work Satisfaction",
      category: "IT Sector",
      status: "active" as const,
      responses: 320,
      target: 500,
      completionRate: 76,
      createdAt: "2023-06-15",
      updatedAt: "2023-06-20",
    },
    {
      id: "survey-2",
      title: "Automotive Customer Experience",
      category: "Automotive",
      status: "completed" as const,
      responses: 240,
      target: 250,
      completionRate: 96,
      createdAt: "2023-06-10",
      updatedAt: "2023-06-18",
    },
  ],

  categories: [
    "IT Sector",
    "Automotive",
    "Healthcare",
    "Education",
    "Retail",
    "Finance",
    "Manufacturing",
    "Entertainment",
    "Food & Beverage",
    "Travel & Tourism",
    "Real Estate",
    "Media",
    "Sports",
    "Technology",
    "Energy",
  ],

  audienceStats: {
    total: 10000,
    active: 9000,
    byAgeGroup: {
      "18-24": 1500,
      "25-34": 3000,
      "35-44": 2500,
      "45-54": 2000,
      "55-64": 800,
      "65+": 200,
    },
    byGender: {
      Male: 5200,
      Female: 4500,
      "Non-binary": 200,
      "Prefer not to say": 100,
    },
    byCountry: {
      "United States": 6000,
      Canada: 1500,
      "United Kingdom": 1200,
      Germany: 800,
      Australia: 500,
    },
    byIndustry: {
      "IT Sector": 2000,
      Healthcare: 1500,
      Finance: 1200,
      Education: 1000,
      Retail: 800,
    },
  },

  generatedQuestions: {
    category: "IT Sector",
    description: "Survey about remote work satisfaction and productivity in tech companies",
    questionCount: 5,
    questions: [
      {
        id: "demo_q1",
        type: "single_choice" as const,
        question: "How satisfied are you with your current remote work setup?",
        options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
        required: true,
      },
      {
        id: "demo_q2",
        type: "rating" as const,
        question: "Rate your productivity while working remotely (1-5)",
        options: ["1", "2", "3", "4", "5"],
        required: true,
      },
      {
        id: "demo_q3",
        type: "text" as const,
        question: "What tools or resources would improve your remote work experience?",
        options: [],
        required: false,
      },
    ],
    generatedWith: "static" as const,
  },
}

// Utility function to use demo data when API fails
export async function apiWithFallback<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  fallbackData: T,
): Promise<ApiResponse<T>> {
  try {
    const result = await apiCall()
    if (result.success) {
      return result
    } else {
      console.warn("API call failed, using demo data:", result.error)
      return { success: true, data: fallbackData }
    }
  } catch (error) {
    console.warn("API call failed, using demo data:", error)
    return { success: true, data: fallbackData }
  }
}

// Authentication helper functions
export const authApi = {
  // Store JWT token
  setAuthToken: (token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token)
    }
  },

  // Remove JWT token
  removeAuthToken: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
    }
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return getAuthToken() !== null
  },
}
