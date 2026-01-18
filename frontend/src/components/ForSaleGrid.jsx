import React, { useEffect, useState } from 'react'
import { fetchProducts } from '../lib/api'
import Card3D from './3DCard'
import '../styles/ForSale.css'

export default function ForSaleGrid({ preview=false, limit=3 }){
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    let mounted = true
    fetchProducts()
      .then(data => {
        if(!mounted) return
        const all = data.results || []
        // Backend already filters to published for non-authenticated users,
        // but we filter again for safety in case user logs in/out
        const published = all.filter(p => p.is_published)
        setItems(published.slice(0, limit))
      })
      .catch(()=>{
        if(mounted) setItems([])
      })
      .finally(()=>{ if(mounted) setLoading(false) })
    return ()=> mounted = false
  },[limit])

  if(loading && items.length === 0) return (
    <div className="for-sale-preview">Loading projects for sale...</div>
  )

  if(items.length === 0) return (
    <div className="for-sale-preview">No projects for sale yet.</div>
  )

  return (
    <section className={`for-sale-section home-section ${preview ? 'preview' : ''}`}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-16 left-4 w-72 h-72 bg-blue-600/6 rounded-full blur-3xl"></div>
        <div className="absolute bottom-8 right-8 w-56 h-56 bg-purple-600/6 rounded-full blur-3xl"></div>
      </div>

      <div className="section-head">
        <h2>Projects For Sale</h2>
        <p className="muted">Select projects available for purchase or hire — no prices shown.</p>
      </div>
      <div className="for-sale-grid">
        {items.map((p, idx) => (
          <Card3D key={p.id || p.slug} className={`lift-on-hover`} style={{ animationDelay: `${idx * 80}ms` }}>
            <div className="sale-card glass">
              {p.cover && (
                <div className="card-image mb-4 rounded-lg overflow-hidden">
                  <img 
                    src={p.cover} 
                    alt={p.title} 
                    className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="card-body">
                <div className="card-title">{p.title}</div>
                <div className="card-desc">{p.description || 'No description provided.'}</div>
              </div>
              <div className="card-actions">
                {p.live_url && (
                  <a 
                    className="btn btn-live" 
                    href={p.live_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Live Demo
                  </a>
                )}
                {p.github_url && (
                  <a 
                    className="btn btn-primary" 
                    href={p.github_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    GitHub
                  </a>
                )}
                {p.affiliate_url && (
                  <a 
                    className="btn btn-ghost whatsapp" 
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`I'm interested in your project: ${p.title}. Please share details.`)}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          </Card3D>
        ))}
      </div>
      {!preview && <div className="for-sale-cta"><a className="btn btn--primary" href="/for-sale">View all projects for sale</a></div>}
    </section>
  )
}
