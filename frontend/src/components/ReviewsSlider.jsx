import React, { useEffect, useState, useRef } from 'react'
import { createReview, fetchRecentReviews } from '../lib/api'

export default function ReviewsSlider({ items = [], onReviewAdded = null }){
  const [reviews, setReviews] = useState(items || [])
  const [start, setStart] = useState(0)
  const [visible, setVisible] = useState(3)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', rating: 5, message: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const syncTimerRef = useRef(null)

  useEffect(()=>{ 
    // initialize: merge server items with any locally queued reviews
    const local = JSON.parse(localStorage.getItem('unsyncedReviews') || '[]') || []
    const merged = [...(items || [])]
    // place locally queued items at the front so user sees them
    if(local.length) merged.unshift(...local)
    setReviews(merged)
    setStart(0)
  }, [items])

  // responsive visible count for reviews - at least 2 on mobile, 3 on larger screens
  useEffect(()=>{
    function update(){
      const w = window.innerWidth
      if(w >= 1200) setVisible(3)
      else if(w >= 768) setVisible(3)
      else setVisible(2) // At least 2 on mobile
    }
    update()
    window.addEventListener('resize', update)
    return ()=> window.removeEventListener('resize', update)
  }, [])

  useEffect(()=>{
    // attempt to sync any stored unsynced reviews periodically
    async function trySync(){
      const queue = JSON.parse(localStorage.getItem('unsyncedReviews') || '[]') || []
      if(!queue.length) return
      const remaining = []
      for(const q of queue){
        try{
          const saved = await createReview({ name: q.name, rating: q.rating, message: q.message })
          // replace local placeholder if present
          setReviews(prev => {
            const withoutLocal = prev.filter(r => !(r && r.id && String(r.id).startsWith('local-') && r.message === q.message && r.name === q.name))
            return [saved, ...withoutLocal]
          })
        }catch(err){
          remaining.push(q)
        }
      }
      localStorage.setItem('unsyncedReviews', JSON.stringify(remaining))
    }

    // try on mount
    trySync()
    // schedule periodic sync every 30s
    syncTimerRef.current = setInterval(trySync, 30000)
    return ()=> clearInterval(syncTimerRef.current)
  }, [])

  async function submit(e){
    e.preventDefault()
    setError('')
    setLoading(true)
    const payload = { name: form.name, rating: Number(form.rating), message: form.message }
    // optimistic UI
    const optimistic = { ...payload, created_at: new Date().toISOString(), id: `local-${Date.now()}` }
    setReviews(prev => [optimistic, ...prev])
    setForm({ name:'', rating:5, message: '' })
    setShowForm(false)
    try{
      const saved = await createReview(payload)
      console.log('✅ Successfully saved review, replacing optimistic with:', saved)
      // Replace optimistic review with saved one, ensuring it's at the front
      setReviews(prev => {
        // Remove the optimistic review
        const filtered = prev.filter(r => !(String(r.id || '').startsWith('local-') && r.message === payload.message))
        // Add the saved review at the front
        return [saved, ...filtered]
      })
      // clear any matching unsynced entries
      const queue = JSON.parse(localStorage.getItem('unsyncedReviews') || '[]') || []
      const remaining = queue.filter(q => !(q.name===payload.name && q.message===payload.message))
      localStorage.setItem('unsyncedReviews', JSON.stringify(remaining))
      // Reset to show the new review
      setStart(0)
      // notify parent to refetch reviews
      if(onReviewAdded) onReviewAdded()
    }catch(err){
      // store in localStorage queue for later sync
      const errMsg = err.response?.data?.detail || err.response?.data?.message || err.message || 'Failed to save review'
      console.error('❌ Failed to save review, queuing for sync', err)
      setError(errMsg)
      const q = JSON.parse(localStorage.getItem('unsyncedReviews') || '[]') || []
      q.push(optimistic)
      localStorage.setItem('unsyncedReviews', JSON.stringify(q))
    } finally {
      setLoading(false)
    }
  }

  const has = reviews && reviews.length > 0

  // Navigation functions - right to left rotation
  const next = () => setStart(s => reviews.length > 0 ? (s + 1) % reviews.length : 0)
  const prev = () => setStart(s => reviews.length > 0 ? (s - 1 + reviews.length) % reviews.length : 0)

  // auto-rotate right-to-left (like skills)
  const [paused, setPaused] = useState(false)
  useEffect(()=>{
    if(paused || reviews.length === 0 || reviews.length <= visible) return
    const t = setInterval(() => setStart(s => (s + 1) % reviews.length), 4000)
    return ()=> clearInterval(t)
  }, [paused, reviews.length, visible])

  // Get visible reviews for horizontal carousel
  const itemsToShow = reviews.length > 0 
    ? Array.from({length: Math.min(visible, reviews.length)}).map((_, i) => reviews[(start + i) % reviews.length])
    : []

  return (
    <section id="reviews" className="py-8 px-6 w-full" onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)}>
      <div className="text-center">
        <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between items-center gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-white">Reviews</h2>
            <p className="text-gray-300 mt-1">Client feedback and testimonials.</p>
          </div>
          <button onClick={()=> setShowForm(s => !s)} className="hero-cta">Add review</button>
        </div>

        {showForm && (
          <form onSubmit={submit} className="glass-card p-6 rounded mb-6 max-w-3xl mx-auto text-left">
            <h3 className="text-lg font-semibold text-white mb-2">Add a review</h3>
            {error && (
              <div className="mb-4 p-3 rounded bg-red-500/20 border border-red-500/50 text-red-300">
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <input required value={form.name} onChange={e=> setForm({...form, name: e.target.value})} placeholder="Your name" className="p-3 rounded bg-transparent border border-white/6 w-full" disabled={loading} />
              <select value={form.rating} onChange={e=> setForm({...form, rating: e.target.value})} className="p-3 rounded bg-transparent border border-white/6 w-full" disabled={loading}>
                <option value={5}>5 - Excellent</option>
                <option value={4}>4 - Good</option>
                <option value={3}>3 - Average</option>
                <option value={2}>2 - Poor</option>
                <option value={1}>1 - Terrible</option>
              </select>
              <div className="flex items-center justify-end gap-2">
                <button type="button" onClick={()=> { setShowForm(false); setError(''); }} className="px-3 py-2 mr-2 border rounded" disabled={loading}>Cancel</button>
                <button type="submit" className="hero-cta" disabled={loading}>{loading ? 'Submitting...' : 'Submit review'}</button>
              </div>
            </div>
            <textarea required value={form.message} onChange={e=> setForm({...form, message: e.target.value})} placeholder="Your review" className="w-full mt-2 p-3 rounded bg-transparent border border-white/6" rows={5} disabled={loading}></textarea>
          </form>
        )}

        {has ? (
          <div className="mt-6 flex items-center justify-center gap-4 scroll-stagger">
            <button onClick={prev} className="px-3 py-2 border rounded hover:bg-white/10 transition">◀</button>
            <div
              className="reviews-grid-container"
              style={{display: 'grid', gridTemplateColumns: `repeat(${itemsToShow.length}, minmax(0, 1fr))`, gap: '1rem', alignItems: 'stretch'}}
            >
              {itemsToShow.length === 0 ? (
                <div className="col-span-full text-center text-gray-400">No reviews available</div>
              ) : (
                itemsToShow.map((r, i) => {
                  const popAnimations = ['animate-pop-fade-in-up', 'animate-pop-bounce', 'animate-pop-elastic', 'animate-pop-scale']
                  const randomAnimation = popAnimations[i % popAnimations.length]
                  const motionAnimations = ['animate-float', 'animate-sway', 'animate-pulse-glow']
                  const motionAnimation = motionAnimations[i % motionAnimations.length]
                  
                  return (
                    <div key={r.id || `review-${start}-${i}`} className={`group rounded-xl overflow-hidden flex flex-col mx-2 transition-all duration-400 ${randomAnimation} ${motionAnimation} lift-on-hover`} style={{ animationDelay: `${i * 100}ms` }}>
                      <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-700/50 rounded-xl flex flex-col items-center gap-4 p-5 h-full backdrop-blur-sm hover:border-blue-500/30">
                        <div className="text-white font-bold text-center text-sm group-hover:text-blue-400 transition-colors">{r.name}</div>
                        <div className="text-yellow-400 text-lg">{Array.from({length: r.rating||5}).map((_,i)=> '★')}</div>
                        <p className="text-slate-400 text-sm text-center line-clamp-3">{r.message}</p>
                        <div className="text-slate-500 text-xs mt-auto">{r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}</div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
            <button onClick={next} className="px-3 py-2 border rounded hover:bg-white/10 transition">▶</button>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-slate-900/80 to-slate-950/90 border border-slate-700/50 p-6 rounded-xl text-slate-300 backdrop-blur-sm animate-pop-fade-in-up">No reviews yet — be the first to share feedback.</div>
        )}
      </div>
    </section>
  )
}
