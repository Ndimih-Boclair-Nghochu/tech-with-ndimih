import React, { useState } from 'react'
import '../styles/Donate.css'
import { createDonationSession } from '../lib/api'

export default function Donate(){
  const presets = [500, 1000, 2500, 5000] // cents: $5, $10, $25, $50
  const [amount, setAmount] = useState(presets[1])
  const [custom, setCustom] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const paypal = import.meta.env.VITE_PAYPAL_ME || ''

  function selectPreset(cents){
    setAmount(cents)
    setCustom('')
  }

  function handleCustomChange(e){
    const v = e.target.value
    setCustom(v)
    const cleaned = v.replace(/[^0-9.]/g, '')
    if(cleaned) {
      const cents = Math.round(parseFloat(cleaned) * 100)
      if(!Number.isNaN(cents)) setAmount(cents)
    }
  }

  async function handleDonate(e){
    e.preventDefault()
    setLoading(true)
    setError(null)
    try{
      const res = await createDonationSession(amount, { source: 'donate_page' })
      if(res.checkout_url){
        window.location.href = res.checkout_url
        return
      }
      if(res.detail){
        setError(res.detail)
      } else {
        setError('Payment gateway not configured.')
      }
    }catch(err){
      setError(err?.response?.data?.detail || err.message || String(err))
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="donate-page">
      <h1>Support the project</h1>
      <p className="lead">If you find this site or the content useful, a small donation keeps things running and funds improvements.</p>

      <form className="donate-form" onSubmit={handleDonate}>
        <div className="preset-grid">
          {presets.map(p => (
            <button type="button" key={p} onClick={()=>selectPreset(p)} className={`preset ${amount===p ? 'active' : ''}`}>${(p/100).toFixed(0)}</button>
          ))}
        </div>

        <label className="custom-label">Custom amount (USD)</label>
        <div className="custom-input">
          <span className="dollar">$</span>
          <input aria-label="Custom amount in USD" value={custom} onChange={handleCustomChange} placeholder="10.00" />
        </div>

        <div className="donate-actions">
          <button className="donate-btn" type="submit" disabled={loading}>{loading ? 'Redirecting…' : `Donate $${(amount/100).toFixed(2)}`}</button>
        </div>

        {error && <div className="error">{error}</div>}
      </form>

      <hr />

      <div className="fallback">
        <h3>Other ways to donate</h3>
        {paypal ? (
          <p>You can also donate via PayPal: <a href={paypal} target="_blank" rel="noreferrer">PayPal.me</a></p>
        ) : (
          <p>If the payment gateway isn't configured, please reach out via the <a href="/contact">contact page</a> to arrange a donation.</p>
        )}
      </div>
    </div>
  )
}
