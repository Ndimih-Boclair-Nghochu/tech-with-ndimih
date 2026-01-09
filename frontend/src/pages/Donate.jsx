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
    <div className="donate-page bg-[linear-gradient(180deg,#071225,rgba(10,15,31,0.95))] min-h-screen text-white w-full">
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16 w-full">
        <div className="text-center mb-8 sm:mb-12 animate-pop-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-3xl sm:text-4xl font-bold gradient-accent mb-3">Support the Project</h1>
          <p className="text-base sm:text-lg text-gray-300">If you find this site or the content useful, a small donation keeps things running and funds improvements.</p>
        </div>

        <div className="glass-card rounded-xl border border-blue-500/10 p-6 sm:p-8 animate-pop-scale animate-float lift-on-hover" style={{ animationDelay: '0.2s' }}>
          <form className="donate-form" onSubmit={handleDonate}>
            <div className="preset-grid mb-6">
              {presets.map((p, idx) => (
                <button 
                  type="button" 
                  key={p} 
                  onClick={()=>selectPreset(p)} 
                  className={`preset ${amount===p ? 'active' : ''} animate-pop-bounce`}
                  style={{ animationDelay: `${0.3 + idx * 0.08}s` }}
                >
                  ${(p/100).toFixed(0)}
                </button>
              ))}
            </div>

            <label className="custom-label block text-white mb-2">Custom amount (USD)</label>
            <div className="custom-input mb-6 animate-pop-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <span className="dollar">$</span>
              <input 
                aria-label="Custom amount in USD" 
                value={custom} 
                onChange={handleCustomChange} 
                placeholder="10.00"
                className="bg-transparent text-white"
              />
            </div>

            <div className="donate-actions">
              <button 
                className="donate-btn w-full sm:w-auto animate-pop-fade-in-up lift-on-hover" 
                type="submit" 
                disabled={loading}
                style={{ animationDelay: '0.6s' }}
              >
                {loading ? 'Redirecting…' : `Donate $${(amount/100).toFixed(2)}`}
              </button>
            </div>

            {error && (
              <div className="error bg-red-900/30 border border-red-500/50 rounded p-3 text-red-300 text-sm mt-4 animate-pop-bounce" style={{ animationDelay: '0.7s' }}>
                {error}
              </div>
            )}
          </form>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10 animate-pop-fade-in-up" style={{ animationDelay: '0.8s' }}>
          <div className="fallback text-center">
            <h3 className="text-xl font-semibold mb-4">Other ways to donate</h3>
            {paypal ? (
              <p className="text-gray-300">
                You can also donate via PayPal: <a href={paypal} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300">PayPal.me</a>
              </p>
            ) : (
              <p className="text-gray-300">
                If the payment gateway isn't configured, please reach out via the <a href="/contact" className="text-blue-400 hover:text-blue-300">contact page</a> to arrange a donation.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
