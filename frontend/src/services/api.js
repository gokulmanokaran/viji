import axios from 'axios'

// Backendimport axios from 'axios'

const baseURL = import.meta.env.PROD 
  ? 'https://vet-clinic-backend-x48c.onrender.com/api' 
  : '/api'

const API = axios.create({ baseURL })

// 🚀 OPTIMIZATION 1: Axios Response Interceptor (strips boilerplate payload)
API.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
)

// 🚀 OPTIMIZATION 2: In-Memory Frontend Cache for GET Requests
const cache = new Map();

// Helper to instantly return cached GETs, preventing network spam
const cachedGet = async (url, params) => {
  const key = `${url}?${JSON.stringify(params || {})}`;
  if (cache.has(key)) return cache.get(key); // RAM Hit
  const data = await API.get(url, { params }); // Interceptor returns .data naturally
  cache.set(key, data);
  return data;
}

// ---------------- AUTH ----------------
export const login = (data) => API.post('/auth/login', data)
export const register = (data) => API.post('/auth/register', data)

// ---------------- OWNERS ----------------// Owners
export const getOwners = (params) => cachedGet('/owners', params)
export const getOwner = (id) => cachedGet(`/owners/${id}`)
export const createOwner = (data) => API.post('/owners', data)
export const updateOwner = (id, data) => API.put(`/owners/${id}`, data)
export const deleteOwner = (id) => API.delete(`/owners/${id}`)

// Cows
export const getCows = (params) => cachedGet('/cows', params)
export const getCow = (id) => cachedGet(`/cows/${id}`)
export const createCow = (data) => API.post('/cows', data)
export const updateCow = (id, data) => API.put(`/cows/${id}`, data)
export const deleteCow = (id) => API.delete(`/cows/${id}`)

// Visits
export const getVisits = (params) => cachedGet('/visits', params)
export const getVisit = (id) => cachedGet(`/visits/${id}`)
export const createVisit = (data) => API.post('/visits', data)
export const updateVisit = (id, data) => API.put(`/visits/${id}`, data)
export const deleteVisit = (id) => API.delete(`/visits/${id}`)

// Billing
export const getBills = (params) => cachedGet('/billing', params)
export const getBill = (id) => cachedGet(`/billing/${id}`)
export const updateBill = (id, data) => API.put(`/billing/${id}`, data)
export const getDashboard = () => cachedGet('/billing/dashboard')

// ---------------- EXPORT INSTANCE (optional) ----------------
export default API