import axios from 'axios'

const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

export async function predict(symbols){
  const payload = { symbols, horizons: [15,30,60] }
  const res = await axios.post(`${BASE}/predict`, payload, { headers: { 'Content-Type': 'application/json' }})
  return res.data
}
