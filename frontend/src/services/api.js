import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api'

const API = axios.create({ baseURL })

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Return response.data directly
API.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error?.response?.data?.message || error.message || 'Something went wrong'
    return Promise.reject(new Error(message))
  }
)

// ---------------- AUTH ----------------
export const login = (data) => API.post('/auth/login', data)
export const register = (data) => API.post('/auth/register', data)

// ---------------- OWNERS ----------------
export const getOwners = (params) => API.get('/owners', { params })
export const getOwner = (id) => API.get(`/owners/${id}`)
export const createOwner = (data) => API.post('/owners', data)
export const updateOwner = (id, data) => API.put(`/owners/${id}`, data)
export const deleteOwner = (id) => API.delete(`/owners/${id}`)

// ---------------- COWS ----------------
export const getCows = (params) => API.get('/cows', { params })
export const getCow = (id) => API.get(`/cows/${id}`)
export const createCow = (data) => API.post('/cows', data)
export const updateCow = (id, data) => API.put(`/cows/${id}`, data)
export const deleteCow = (id) => API.delete(`/cows/${id}`)

// ---------------- VISITS ----------------
export const getVisits = (params) => API.get('/visits', { params })
export const getVisit = (id) => API.get(`/visits/${id}`)
export const createVisit = (data) => API.post('/visits', data)
export const updateVisit = (id, data) => API.put(`/visits/${id}`, data)
export const deleteVisit = (id) => API.delete(`/visits/${id}`)

// ---------------- BILLING ----------------
export const getBills = (params) => API.get('/billing', { params })
export const getBill = (id) => API.get(`/billing/${id}`)
export const updateBill = (id, data) => API.put(`/billing/${id}`, data)
export const getDashboard = () => API.get('/billing/dashboard')

export default API