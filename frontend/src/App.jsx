import React, { useState } from 'react'
import { predict } from './api'

export default function App() {
  const [input, setInput] = useState('RELIANCE.NS')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)

  const handlePredict = async () => {
    setLoading(true)
    setError(null)
    setResults(null)
    const symbols = input.split(',').map(s => s.trim()).filter(Boolean)
    if (symbols.length === 0) {
      setError('Enter at least one ticker')
      setLoading(false)
      return
    }
    try {
      const res = await predict(symbols)
      setResults(res)
    } catch (err) {
      setError(err.message || 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{padding:20,fontFamily:'Arial'}}>
      <h2>Share Prediction — Prototype</h2>
      <p>Enter comma-separated tickers (e.g., RELIANCE.NS, TCS.NS)</p>
      <div style={{display:'flex',gap:8}}>
        <input value={input} onChange={e => setInput(e.target.value)} style={{flex:1,padding:8}} />
        <button onClick={handlePredict} disabled={loading} style={{padding:'8px 12px'}}>Predict</button>
      </div>

      {loading && <p>Loading…</p>}
      {error && <p style={{color:'red'}}>{error}</p>}

      {results && (
        <div style={{marginTop:20}}>
          {Object.keys(results).map(sym => {
            const r = results[sym]
            if (r.error) return <div key={sym}><h3>{sym}</h3><p style={{color:'red'}}>Error: {r.error}</p></div>
            return (
              <div key={sym} style={{border:'1px solid #eee',padding:12,marginBottom:12}}>
                <h3>{sym}</h3>
                <p>Latest close: {r.latest_close}</p>
                <p>MA20: {r.ma20 ? r.ma20.toFixed(2) : 'n/a'} | MA50: {r.ma50 ? r.ma50.toFixed(2) : 'n/a'}</p>
                <p>RSI14: {r.rsi14 ? r.rsi14.toFixed(2) : 'n/a'}</p>
                <h4>Predictions</h4>
                <ul>
                  {Object.entries(r.horizons).map(([h, val]) => (
                    <li key={h}>{h} days: {val.predicted_return_pct}% — confidence: {val.confidence}</li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      )}

    </div>
  )
}
