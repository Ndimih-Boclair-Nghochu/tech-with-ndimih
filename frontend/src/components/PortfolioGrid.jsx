import React from 'react'
import { Link } from 'react-router-dom'
import '../styles/PortfolioCard.css'

export default function PortfolioGrid({ items = [] }){
  // auto rotate right-to-left and pause on hover
  const [paused, setPaused] = React.useState(false)

  return (
    <section id="portfolio" className="py-16 px-6 w-full relative overflow-hidden bg-gradient-to-b from-transparent via-blue-500/5 to-transparent">
      {/* Professional gradient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between items-center gap-3 mb-12 animate-fade-in-up">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Featured Projects</h2>
            <p className="text-gray-300 mt-2 text-lg">Showcase of my best work.</p>
          </div>
          <Link to="/portfolio" className="hero-cta secondary text-sm" style={{textDecoration:'none'}}>View all projects</Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full scroll-stagger" onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)}>
          {items.length === 0 ? (
            <div className="bg-gradient-to-br from-slate-900/80 to-slate-950/90 border border-slate-700/50 p-8 rounded-xl text-slate-300 col-span-full animate-pop-fade-in-up backdrop-blur-sm">No portfolio items yet — check back soon.</div>
          ) : (
            items.map((it, idx) => {
              const isYoutubeUrl = it.live_url?.includes('youtube.com') || it.live_url?.includes('youtu.be')
              const popAnimations = ['animate-pop-fade-in-up', 'animate-pop-scale', 'animate-pop-bounce', 'animate-pop-elastic', 'animate-pop-rotate']
              const randomAnimation = popAnimations[idx % popAnimations.length]
              const motionAnimations = ['animate-float', 'animate-sway', 'animate-zoom-pulse']
              const motionAnimation = motionAnimations[idx % motionAnimations.length]
              
              return (
                <div
                  key={it.id} 
                  className="lift-on-hover scroll-fade-in-up in-view"
                >
                  <div className={`group overflow-hidden rounded-xl transition-all duration-400 ${randomAnimation} ${motionAnimation}`} style={{ animationDelay: `${idx * 80}ms` }}>
                    <div className="relative bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-700/50 rounded-xl overflow-hidden h-full backdrop-blur-sm hover:border-blue-500/30">
                      <div className="relative w-full h-56 bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
                        {it.cover ? (
                          <img src={it.cover} alt={it.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"/>
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#071225] to-[#032033] flex items-center justify-center text-gray-500">
                            <span className="text-4xl">📁</span>
                          </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <p className="text-white text-sm font-semibold">Click to explore</p>
                      </div>
                    </div>
                    <div className="p-5 border-t border-slate-700/50">
                      <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors duration-300">{it.title}</h3>
                      <p className="text-slate-400 mt-2 text-sm leading-relaxed line-clamp-2">{it.excerpt}</p>

                      <div className="mt-5 flex flex-col gap-3">
                        <div className="flex gap-2 justify-center">
                          {it.live_url && (
                            <a 
                              href={it.live_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/40 transform hover:scale-105"
                            >
                              {isYoutubeUrl ? (
                                <>
                                  <span>▶</span>
                                  <span>Demo</span>
                                </>
                              ) : (
                                <>
                                  <span>🌐</span>
                                  <span>Live</span>
                                </>
                              )}
                            </a>
                          )}
                          {it.github_url && (
                            <a 
                              href={it.github_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-slate-500/40 transform hover:scale-105"
                            >
                              <span>{'</>'}</span>
                              <span>Code</span>
                            </a>
                          )}
                        </div>

                        <Link 
                          to={`/portfolio/${it.slug || it.id}`} 
                          className="w-full text-center px-4 py-2 text-blue-400 font-semibold border border-blue-500/30 hover:border-blue-500/60 rounded-lg transition-all duration-300 hover:bg-blue-600/20 text-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View Details →
                        </Link>
                      </div>
                    </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </section>
  )
}