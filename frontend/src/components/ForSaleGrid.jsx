import React, { useEffect, useState } from 'react'
import { fetchProducts } from '../lib/api'
import Card3D from './3DCard'
import ReadMore from './ReadMore'
import '../styles/ForSale.css'
import '../styles/PortfolioCard.css'

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
        {items.map((p, idx) => {
          const popAnimations = ['animate-pop-fade-in-up', 'animate-pop-scale', 'animate-pop-bounce', 'animate-pop-elastic', 'animate-pop-rotate']
          const randomAnimation = popAnimations[idx % popAnimations.length]
          const motionAnimations = ['animate-float', 'animate-sway', 'animate-zoom-pulse']
          const motionAnimation = motionAnimations[idx % motionAnimations.length]
          return (
            <article key={p.id || p.slug} className={`portfolio-card overflow-hidden card-3d ${randomAnimation} ${motionAnimation} lift-on-hover`} style={{ animationDelay: `${idx * 80}ms` }}>
              <div className="thumb">
                <img src={p.cover || '/placeholder.png'} alt={p.title} className="w-full h-48 object-cover" loading="lazy" />
              </div>
              <div className="p-6 meta bg-gradient-to-b from-slate-900/80 to-slate-950/90 backdrop-blur-sm border-t border-white/10">
                <h3 className="font-bold text-white text-lg leading-snug">{p.title}</h3>
                <p className="text-sm text-slate-300 mt-3 line-clamp-2">
                  <ReadMore text={p.description || 'No description'} maxLength={80} />
                </p>
                {p.price_cents && (
                  <div className="mt-3 text-lg font-semibold text-cyan-400">
                    ${(p.price_cents / 100).toFixed(2)}
                  </div>
                )}
              </div>
              {(p.live_url || p.youtube_url || p.whatsapp_url || p.github_url || p.affiliate_url) && (
                <div className="px-4 pb-4 portfolio-actions">
                  <div className="flex gap-2 flex-wrap justify-center sm:justify-start">
                    {p.live_url && (
                      <a 
                        href={p.live_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="portfolio-btn portfolio-btn-live"
                        onClick={(e) => e.stopPropagation()}
                      >
                        🌐 View Live
                      </a>
                    )}
                    {p.youtube_url && (
                      <a 
                        href={p.youtube_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="portfolio-btn portfolio-btn-live"
                        onClick={(e) => e.stopPropagation()}
                      >
                        ▶️ Demo
                      </a>
                    )}
                    {p.github_url && (
                      <a 
                        href={p.github_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="portfolio-btn portfolio-btn-github"
                        onClick={(e) => e.stopPropagation()}
                      >
                        💻 GitHub
                      </a>
                    )}
                    {p.whatsapp_url && (
                      <a 
                        href={p.whatsapp_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="portfolio-btn portfolio-btn-whatsapp"
                        onClick={(e) => e.stopPropagation()}
                      >
                        💬 WhatsApp
                      </a>
                    )}
                    {p.affiliate_url && !p.whatsapp_url && (
                      <a 
                        href={p.affiliate_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="portfolio-btn portfolio-btn-whatsapp"
                        onClick={(e) => e.stopPropagation()}
                      >
                        🔗 Affiliate
                      </a>
                    )}
                  </div>
                </div>
              )}
            </article>
          )
        })}
      </div>
      {!preview && <div className="for-sale-cta"><a className="btn btn--primary" href="/for-sale">View all projects for sale</a></div>}
    </section>
  )
}
