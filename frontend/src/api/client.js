import axios from 'axios'

// In production (Vercel), VITE_API_URL points to the Railway backend.
// In development, requests go through the Vite proxy at /api.
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api'

const api = axios.create({ baseURL, timeout: 30000 })

export const fetchStock = (ticker, period = '3mo') => api.get(`/stock/${ticker}`, { params: { period } })
export const fetchSentiment = (ticker) => api.get(`/sentiment/${ticker}`)
export const fetchSignal = (ticker) => api.get(`/signal/${ticker}`)
export const fetchPrediction = (ticker) => api.get(`/predict/${ticker}`)
