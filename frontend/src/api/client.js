import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

export const fetchStock = (ticker) => api.get(`/stock/${ticker}`)
export const fetchSentiment = (ticker) => api.get(`/sentiment/${ticker}`)
export const fetchSignal = (ticker) => api.get(`/signal/${ticker}`)
export const fetchPrediction = (ticker) => api.get(`/predict/${ticker}`)
