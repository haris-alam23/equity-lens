import { useState, useCallback } from 'react'
import { fetchStock, fetchSentiment, fetchSignal, fetchPrediction } from '../api/client'

const initialState = {
  stock: null,
  sentiment: null,
  signal: null,
  prediction: null,
}

const initialLoading = {
  stock: false,
  sentiment: false,
  signal: false,
  prediction: false,
}

export function useStockData() {
  const [data, setData] = useState(initialState)
  const [loading, setLoading] = useState(initialLoading)
  const [errors, setErrors] = useState(initialState)
  const [activeTicker, setActiveTicker] = useState(null)

  const search = useCallback(async (ticker, period = '3mo') => {
    const t = ticker.trim().toUpperCase()
    if (!t) return

    setActiveTicker(t)
    setData(initialState)
    setErrors(initialState)
    setLoading({ stock: true, sentiment: true, signal: true, prediction: true })

    // Fire all requests concurrently
    const handle = (key, promise) =>
      promise
        .then((res) => {
          setData((prev) => ({ ...prev, [key]: res.data }))
        })
        .catch((err) => {
          const msg = err.response?.data?.detail || err.message || 'Request failed'
          setErrors((prev) => ({ ...prev, [key]: msg }))
        })
        .finally(() => {
          setLoading((prev) => ({ ...prev, [key]: false }))
        })

    await Promise.all([
      handle('stock', fetchStock(t, period)),
      handle('sentiment', fetchSentiment(t)),
      handle('signal', fetchSignal(t)),
      handle('prediction', fetchPrediction(t)),
    ])
  }, [])

  const isAnyLoading = Object.values(loading).some(Boolean)
  const hasResults = Object.values(data).some(Boolean)

  return { data, loading, errors, activeTicker, isAnyLoading, hasResults, search }
}
