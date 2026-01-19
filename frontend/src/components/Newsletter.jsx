import React, { useState } from 'react'
import '../styles/Newsletter.css'
import api from '../lib/api'

export default function Newsletter(){
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState(null) // 'loading', 'success', 'error'
  const [message, setMessage] = useState('')

  async function handleSubscribe(e){
    e.preventDefault()
    if(!email || !email.includes('@')){
      setStatus('error')
      setMessage('Please enter a valid email')
      return
    }
    
    setStatus('loading')
    try{
      await api.post('/newsletter/', { email, is_active: true })
      setStatus('success')
      setMessage('✓ Check your email to confirm subscription!')
      setEmail('')
      setTimeout(() => setStatus(null), 5000)
    }catch(err){
      setStatus('error')
      setMessage(err.response?.data?.email?.[0] || 'Already subscribed or error occurred')
      setTimeout(() => setStatus(null), 5000)
    }
  }

  return (
    <section className="newsletter-section">
      <div className="newsletter-content">
        <h2>📬 Stay Updated</h2>
        <p className="newsletter-subtitle">Get notified about new projects and insights I share</p>
        
        <form onSubmit={handleSubscribe} className="newsletter-form">
          <div className="newsletter-input-group">
            <input 
              type="email" 
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={status === 'loading'}
              className={status ? status : ''}
            />
            <button 
              type="submit" 
              disabled={status === 'loading'}
              className="newsletter-btn"
            >
              {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </button>
          </div>

          {status === 'success' && (
            <div className="newsletter-message success">
              {message}
            </div>
          )}
          {status === 'error' && (
            <div className="newsletter-message error">
              {message}
            </div>
          )}
        </form>

        <p className="newsletter-note">No spam, just quality content. Unsubscribe anytime.</p>
      </div>

      {/* Decorative blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl"></div>
      </div>
    </section>
  )
}
