import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

export const fetchStock = (ticker, period = '3mo') => api.get(`/stock/${ticker}`, { params: { period } })
export const fetchSentiment = (ticker) => api.get(`/sentiment/${ticker}`)
export const fetchSignal = (ticker) => api.get(`/signal/${ticker}`)
export const fetchPrediction = (ticker) => api.get(`/predict/${ticker}`)
