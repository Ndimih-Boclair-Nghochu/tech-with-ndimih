import React, { useEffect, useState } from 'react'
import { fetchProjectsForSale } from '../lib/api'
import ReadMore from '../components/ReadMore'
import '../styles/PortfolioCard.css'

export default function ProjectsForSale(){
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    let mounted = true
    fetchProjectsForSale()
      .then(data => {
        if(!mounted) return
        const all = data.results || []
        const published = all.filter(p => p.is_published)
        setItems(published)
      })
      .catch(()=>{
        if(mounted) setItems([])
      })
      .finally(()=>{ if(mounted) setLoading(false) })
    return ()=> mounted = false
  },[])

  return (
    <div className="projects-for-sale-page bg-[linear-gradient(180deg,#071225,rgba(10,15,31,0.95))] min-h-screen text-white pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Projects Available
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Sell or collaborate on amazing projects. Connect via WhatsApp or view the live demo.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-slate-400">Loading projects...</div>
          </div>
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-slate-400">No projects available yet.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
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
                    <p className="text-sm text-slate-300 mt-3 line-clamp-3">
                      <ReadMore text={p.description || 'No description'} maxLength={100} />
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
        )}
      </div>
    </div>
  )
}
