import React from 'react'
import { Link } from 'react-router-dom'
import '../styles/PortfolioCard.css'

export default function PortfolioGrid({ items = [] }){
  const [start, setStart] = React.useState(0)
  const [visible, setVisible] = React.useState(3)

  React.useEffect(()=>{
    function update(){
      const w = window.innerWidth
      if(w >= 1200) setVisible(3)
      else if(w >= 900) setVisible(2)
      else setVisible(1)
    }
    update()
    window.addEventListener('resize', update)
    return ()=> window.removeEventListener('resize', update)
  }, [])

  const next = ()=> setStart(s => (s + visible) % Math.max(1, items.length))
  const prev = ()=> setStart(s => (s - visible + Math.max(1, items.length)) % Math.max(1, items.length))

  const slice = Array.from({length: Math.min(visible, items.length)}).map((_, i)=> items[(start + i) % items.length])

  // auto rotate right-to-left and pause on hover
  const [paused, setPaused] = React.useState(false)
  React.useEffect(()=>{
    if(paused || items.length <= 1) return
    const t = setInterval(()=> setStart(s => (s + 1) % Math.max(1, items.length)), 3600)
    return ()=> clearInterval(t)
  }, [paused, items.length])

  return (
    <section id="portfolio" className="py-12 px-6 w-full">
      <div className="text-center">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between items-center gap-3 mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-white">Portfolio</h2>
            <p className="text-gray-300 mt-2">Selected projects and products.</p>
          </div>
          <Link to="/portfolio" className="hero-cta secondary text-sm" style={{textDecoration:'none'}}>View portfolio</Link>
        </div>

        <div className="mt-6 flex flex-col items-center justify-center gap-4 w-full" onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {items.length === 0 ? (
              <div className="glass-card p-8 rounded-md text-gray-300 col-span-full">No portfolio items yet — check back soon.</div>
            ) : (
              slice.map(it => (
                <div key={it.id} className="glass-card overflow-hidden rounded-lg card-hover">
                  <Link to={`/portfolio/${it.slug || it.id}`} className="block">
                    <div className="w-full h-40 bg-gray-800">
                      {it.cover ? <img src={it.cover} alt={it.title} className="w-full h-full object-cover"/> : <div className="w-full h-full bg-gradient-to-br from-[#071225] to-[#032033] flex items-center justify-center text-gray-500">No image</div>}
                    </div>
                    <div className="p-4 text-center">
                      <h3 className="text-lg font-semibold text-white">{it.title}</h3>
                      <p className="text-gray-300 mt-1 text-sm">{it.excerpt}</p>
                    </div>
                  </Link>
                  <div className="px-4 pb-4">
                    <div className="flex flex-col gap-2">
                      {(it.live_url || it.github_url) && (
                        <div className="flex gap-2 flex-wrap justify-center">
                          {it.live_url && (
                            <a 
                              href={it.live_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="portfolio-btn portfolio-btn-live"
                              onClick={(e) => e.stopPropagation()}
                            >
                              🌐 View Live
                            </a>
                          )}
                          {it.github_url && (
                            <a 
                              href={it.github_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="portfolio-btn portfolio-btn-github"
                              onClick={(e) => e.stopPropagation()}
                            >
                              💻 GitHub
                            </a>
                          )}
                        </div>
                      )}
                      <div className="flex justify-center">
                        <Link to={`/portfolio/${it.slug || it.id}`} className="hero-cta secondary" style={{textDecoration:'none'}} onClick={(e) => e.stopPropagation()}>View more</Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="flex items-center gap-2 mt-4">
            <button onClick={prev} className="px-3 py-2 border rounded">◀</button>
            <button onClick={next} className="px-3 py-2 border rounded">▶</button>
          </div>
        </div>
      </div>
    </section>
  )
}
