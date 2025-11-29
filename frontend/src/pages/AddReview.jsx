import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createReview } from '../lib/api'

export default function AddReview(){
  const [form, setForm] = useState({ name: '', rating: 5, message: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  async function handleSubmit(e){
    e.preventDefault()
    setError(null)
    if(!form.name.trim() || !form.message.trim()){
      setError('Name and message are required')
      return
    }
    setLoading(true)
    try{
      await createReview(form)
      // On success, go back to home where recent reviews are shown
      navigate('/')
    }catch(err){
      // fallback: persist locally and navigate back
      try{
        const stored = [form, ...JSON.parse(localStorage.getItem('reviews')||'[]')]
        localStorage.setItem('reviews', JSON.stringify(stored))
      }catch(e){}
      navigate('/')
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="add-review-page bg-[linear-gradient(180deg,#071225,rgba(10,15,31,0.95))] min-h-screen text-white w-full">
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16 w-full">
        <div className="mb-6">
          <Link to="/" className="text-sm text-gray-300 hover:text-white transition-colors inline-flex items-center gap-2">
            <span>←</span>
            <span>Back to Home</span>
          </Link>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold gradient-accent mb-3">Add Review</h1>
        <p className="text-base sm:text-lg text-gray-300 mb-8">Share your experience. Reviews may be moderated before appearing publicly.</p>

        <form className="glass-card rounded-xl border border-blue-500/10 p-6 sm:p-8" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-900/30 border border-red-500/50 rounded p-3 text-red-300 text-sm mb-4">
              {error}
            </div>
          )}
          <div className="form-group mb-4">
            <label className="block text-sm font-medium text-white mb-2">Name *</label>
            <input 
              className="w-full border border-gray-600 rounded-lg px-4 py-2 mt-1 bg-transparent text-gray-200 focus:border-blue-500 focus:outline-none" 
              value={form.name} 
              onChange={e=>setForm({...form, name: e.target.value})} 
              required
            />
          </div>

          <div className="form-group mb-4">
            <label className="block text-sm font-medium text-white mb-2">Rating</label>
            <select 
              className="w-full border border-gray-600 rounded-lg px-4 py-2 mt-1 bg-transparent text-gray-200 focus:border-blue-500 focus:outline-none" 
              value={form.rating} 
              onChange={e=>setForm({...form, rating: Number(e.target.value)})}
            >
              {[5,4,3,2,1].map(n => <option key={n} value={n} className="bg-gray-800">{n} ★</option>)}
            </select>
          </div>

          <div className="form-group mb-6">
            <label className="block text-sm font-medium text-white mb-2">Message *</label>
            <textarea 
              className="w-full border border-gray-600 rounded-lg px-4 py-2 mt-1 bg-transparent text-gray-200 focus:border-blue-500 focus:outline-none resize-y" 
              rows={6} 
              value={form.message} 
              onChange={e=>setForm({...form, message: e.target.value})} 
              required
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Link to="/" className="px-4 py-2 border border-gray-600 rounded-lg text-center text-gray-300 hover:bg-white/10 transition">
              Cancel
            </Link>
            <button 
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed" 
              type="submit" 
              disabled={loading}
            >
              {loading ? 'Saving…' : 'Submit Review'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
