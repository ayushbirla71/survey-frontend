"use client"

// Custom React hooks for API calls
import { useState, useEffect } from "react"
import type { ApiResponse, PaginatedResponse } from "@/lib/api"

// Generic hook for API calls
export function useApi<T>(apiCall: () => Promise<ApiResponse<T>>, dependencies: any[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiCall()

      if (response.success && response.data !== undefined) {
        setData(response.data)
      } else {
        setError(response.error || "Failed to fetch data")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, dependencies)

  return { data, loading, error, refetch: fetchData }
}

// Hook for paginated API calls
export function usePaginatedApi<T>(apiCall: (params: any) => Promise<PaginatedResponse<T>>, initialParams: any = {}) {
  const [data, setData] = useState<T[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [params, setParams] = useState(initialParams)

  const fetchData = async (newParams = params) => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiCall(newParams)

      if (response.success) {
        setData(response.data)
        setPagination(response.pagination)
      } else {
        setError("Failed to fetch data")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const updateParams = (newParams: any) => {
    const updatedParams = { ...params, ...newParams }
    setParams(updatedParams)
    fetchData(updatedParams)
  }

  return {
    data,
    pagination,
    loading,
    error,
    updateParams,
    refetch: () => fetchData(),
  }
}

// Hook for mutations (POST, PUT, DELETE)
export function useMutation<T, P = any>(mutationFn: (params: P) => Promise<ApiResponse<T>>) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = async (params: P, htmlData: { audience: string[]; campaignName: string }): Promise<T | null> => {
    try {
      setLoading(true)
      setError(null)

      const response = await mutationFn(params)

      if (response.success && response.data !== undefined) {
        return response.data
      } else {
        setError(response.error || "Mutation failed")
        return null
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      return null
    } finally {
      setLoading(false)
    }
  }

  return { mutate, loading, error }
}
