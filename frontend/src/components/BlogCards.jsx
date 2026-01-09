import React from 'react'
import { Link } from 'react-router-dom'

export default function BlogCards({ posts = [] }){
  const [paused, setPaused] = React.useState(false)

  return (
    <section id="blog" className="py-16 px-6 w-full relative overflow-hidden bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent">
      {/* Professional gradient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between items-center gap-3 mb-12 animate-fade-in-up">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Blog</h2>
            <p className="text-gray-300 mt-2 text-lg">Latest insights and tutorials.</p>
          </div>
          <Link to="/blog" className="hero-cta secondary text-sm" style={{textDecoration:'none'}}>View blog</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full scroll-stagger" onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)}>
          {posts.length === 0 && <div className="glass-card backdrop-blur-md bg-white/5 border border-white/10 p-6 text-gray-300 col-span-full rounded-lg animate-pop-fade-in-up">No posts yet — subscribe for updates.</div>}
          {posts.map((p, idx) => {
            const popAnimations = ['animate-pop-fade-in-up', 'animate-pop-bounce', 'animate-pop-elastic', 'animate-pop-scale', 'animate-pop-heartbeat']
            const randomAnimation = popAnimations[idx % popAnimations.length]
            const motionAnimations = ['animate-float', 'animate-sway', 'animate-zoom-pulse', 'animate-tilt']
            const motionAnimation = motionAnimations[idx % motionAnimations.length]
            
            return (
              <article key={p.id} className={`group overflow-hidden rounded-xl transition-all duration-400 ${randomAnimation} ${motionAnimation} lift-on-hover`} style={{ animationDelay: `${idx * 80}ms` }}>
                <div className="relative bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-700/50 rounded-xl overflow-hidden h-full flex flex-col backdrop-blur-sm hover:border-blue-500/30">
                  <div className="w-full h-48 bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden relative">
                    {p.cover ? (
                      <img src={p.cover} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"/>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600 text-sm">No image</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="flex-1 p-5 flex flex-col justify-between border-t border-slate-700/50">
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors duration-300 line-clamp-2">
                        <Link to={`/blog/${p.slug}`} className="hover:underline">{p.title}</Link>
                      </h3>
                      <p className="text-slate-400 mt-2 text-sm line-clamp-2">{p.excerpt}</p>
                    </div>
                    <Link to={`/blog/${p.slug}`} className="inline-block mt-4 px-4 py-2 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 text-sm font-semibold hover:bg-blue-600/40 hover:border-blue-500/60 transition-all duration-300" style={{textDecoration:'none'}}>Read more →</Link>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
