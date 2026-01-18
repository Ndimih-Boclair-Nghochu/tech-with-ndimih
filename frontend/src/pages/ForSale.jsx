import React, { useEffect, useState } from 'react'
import { fetchProducts } from '../lib/api'
import ReadMore from '../components/ReadMore'
import '../styles/PortfolioCard.css'

export default function ForSale(){
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    let mounted = true
    fetchProducts().then(data => {
      if(!mounted) return
      const all = data.results || []
      // Backend already filters to published for non-authenticated users,
      // but we filter again for safety in case user logs in/out
      setItems(all.filter(p => p.is_published))
    }).catch(()=>{ if(mounted) setItems([]) }).finally(()=>{ if(mounted) setLoading(false) })
    return ()=> mounted = false
  },[])

  return (
    <div className="for-sale-page bg-[linear-gradient(180deg,#071225,rgba(10,15,31,0.95))] min-h-screen text-white">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 w-full">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/6 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/6 rounded-full blur-3xl"></div>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold gradient-accent mb-3">Projects For Sale</h1>
          <p className="muted">Browse available projects. Connect with me on WhatsApp or visit the live demo.</p>
        </div>

        {loading ? (
          <div className="text-center py-12"><div className="spinner mx-auto mb-4"></div><p className="text-gray-300">Loading...</p></div>
        ) : items.length === 0 ? (
          <div className="text-center text-gray-400 py-12">No projects available for sale yet.</div>
        ) : (
          <div className="for-sale-grid">
            {items.map((p, idx) => {
              const popAnimations = ['animate-pop-fade-in-up', 'animate-pop-scale', 'animate-pop-bounce']
              const randomAnimation = popAnimations[idx % popAnimations.length]
              return (
                <article key={p.id || p.slug} className={`portfolio-card overflow-hidden card-3d ${randomAnimation} lift-on-hover`} style={{ animationDelay: `${idx * 80}ms` }}>
                  {p.cover ? (
                    <div className="thumb">
                      <img src={p.cover} alt={p.title} className="w-full h-48 object-cover" loading="lazy" />
                    </div>
                  ) : (
                    <div className="thumb bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                      <div className="text-4xl text-slate-400">📦</div>
                    </div>
                  )}
                  <div className="p-6 meta bg-gradient-to-b from-slate-900/80 to-slate-950/90 backdrop-blur-sm border-t border-white/10">
                    <h3 className="font-bold text-white text-lg leading-snug">{p.title}</h3>
                    <p className="text-sm text-slate-300 mt-3 line-clamp-3">
                      <ReadMore text={p.description || 'No description'} maxLength={100} />
                    </p>
                    {p.price_cents && (
                      <div className="mt-3 text-lg font-semibold text-cyan-400">
                        ${(p.price_cents / 100).toFixed(2)}
                      </div>
                    )}
                  </div>
                  {(p.live_url || p.youtube_url || p.whatsapp_url || p.affiliate_url) && (
                    <div className="px-4 pb-4 portfolio-actions">
                      <div className="flex gap-2 flex-wrap">
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
                        {(p.whatsapp_url || p.affiliate_url) && (
                          <a 
                            href={p.whatsapp_url || p.affiliate_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="portfolio-btn portfolio-btn-whatsapp"
                            onClick={(e) => e.stopPropagation()}
                          >
                            💬 WhatsApp
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
      </main>
    </div>
  )
}
