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
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-4">
        <Link to="/" className="text-sm text-gray-600">← Back</Link>
      </div>
      <h1 className="text-2xl font-semibold mb-2">Add review</h1>
      <p className="text-gray-600 mb-4">Share your experience. Reviews may be moderated before appearing publicly.</p>

      <form className="bg-white p-4 rounded shadow-sm" onSubmit={handleSubmit}>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <label className="block text-sm font-medium">Name</label>
        <input className="w-full border rounded px-2 py-1 mt-1" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} />

        <label className="block text-sm font-medium mt-2">Rating</label>
        <select className="w-full border rounded px-2 py-1 mt-1" value={form.rating} onChange={e=>setForm({...form, rating: Number(e.target.value)})}>
          {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} ★</option>)}
        </select>

        <label className="block text-sm font-medium mt-2">Message</label>
        <textarea className="w-full border rounded px-2 py-1 mt-1" rows={6} value={form.message} onChange={e=>setForm({...form, message: e.target.value})} />

        <div className="mt-3 flex gap-2 justify-end">
          <Link to="/" className="px-3 py-2 border rounded">Cancel</Link>
          <button className="px-3 py-2 bg-blue-600 text-white rounded" type="submit" disabled={loading}>{loading ? 'Saving…' : 'Submit'}</button>
        </div>
      </form>
    </div>
  )
}
