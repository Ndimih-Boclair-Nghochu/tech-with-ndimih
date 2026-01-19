import React, { useEffect, useState } from 'react'
import { fetchProjectsForSale } from '../lib/api'
import ReadMore from './ReadMore'
import '../styles/PortfolioCard.css'

export default function ProjectsForSaleGrid({ preview=false, limit=3 }){
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    let mounted = true
    fetchProjectsForSale()
      .then(data => {
        if(!mounted) return
        const all = data.results || []
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
    <div style={{textAlign: 'center', padding: '2rem', color: '#94a3b8'}}>
      Loading projects...
    </div>
  )

  if(items.length === 0) return (
    <div style={{textAlign: 'center', padding: '2rem', color: '#94a3b8'}}>
      No projects available yet.
    </div>
  )

  return (
    <section className={`projects-for-sale-section home-section ${preview ? 'preview' : ''}`}>
      <div className="section-head">
        <h2>Projects Available</h2>
        <p className="muted">Sell or collaborate on amazing projects</p>
      </div>
      <div className="projects-for-sale-grid">
        {items.map((p, idx) => {
          const popAnimations = ['animate-pop-fade-in-up', 'animate-pop-scale', 'animate-pop-bounce', 'animate-pop-elastic', 'animate-pop-rotate']
          const randomAnimation = popAnimations[idx % popAnimations.length]
          const motionAnimations = ['animate-float', 'animate-sway', 'animate-zoom-pulse']
          const motionAnimation = motionAnimations[idx % motionAnimations.length]
          return (
            <article key={p.id} className={`portfolio-card overflow-hidden card-3d ${randomAnimation} ${motionAnimation} lift-on-hover`} style={{ animationDelay: `${idx * 80}ms` }}>
              <div className="thumb">
                <img src={p.image || '/placeholder.png'} alt={p.title} className="w-full object-cover" loading="lazy" />
              </div>
              <div className="p-6 meta bg-gradient-to-b from-slate-900/80 to-slate-950/90 backdrop-blur-sm border-t border-white/10">
                <h3 className="font-bold text-white text-lg leading-snug">{p.title}</h3>
                <p className="text-sm text-slate-300 mt-3 line-clamp-2">
                  <ReadMore text={p.description || 'No description'} maxLength={80} />
                </p>
                {p.price && (
                  <div className="mt-3 text-lg font-semibold text-cyan-400">
                    ${parseFloat(p.price).toFixed(2)}
                  </div>
                )}
              </div>
              {(p.live_url || p.whatsapp_url) && (
                <div className="px-4 pb-4 portfolio-actions">
                  <div className="flex gap-2 flex-wrap">
                    {p.whatsapp_url && (
                      <a 
                        href={p.whatsapp_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="portfolio-btn portfolio-btn-whatsapp"
                      >
                        💬 WhatsApp
                      </a>
                    )}
                    {p.live_url && (
                      <a 
                        href={p.live_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="portfolio-btn portfolio-btn-live"
                      >
                        ▶️ View
                      </a>
                    )}
                  </div>
                </div>
              )}
            </article>
          )
        })}
      </div>
      {!preview && <div style={{textAlign: 'center', marginTop: '2rem'}}><a className="btn btn--primary" href="/projects-for-sale">View all projects</a></div>}
    </section>
  )
}
