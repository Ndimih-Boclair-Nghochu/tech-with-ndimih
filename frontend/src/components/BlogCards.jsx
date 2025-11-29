import React from 'react'
import { Link } from 'react-router-dom'

export default function BlogCards({ posts = [] }){
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

  const next = ()=> setStart(s => (s + visible) % Math.max(1, posts.length))
  const prev = ()=> setStart(s => (s - visible + Math.max(1, posts.length)) % Math.max(1, posts.length))

  const slice = Array.from({length: Math.min(visible, posts.length)}).map((_, i)=> posts[(start + i) % posts.length])

  // auto rotate right-to-left and pause on hover
  const [paused, setPaused] = React.useState(false)
  React.useEffect(()=>{
    if(paused || posts.length <= 1) return
    const t = setInterval(()=> setStart(s => (s + 1) % Math.max(1, posts.length)), 3500)
    return ()=> clearInterval(t)
  }, [paused, posts.length])

  return (
    <section id="blog" className="py-12 px-6 w-full">
      <div className="text-center">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between items-center gap-3 mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-white">Blog</h2>
            <p className="text-gray-300 mt-2">Latest insights and tutorials.</p>
          </div>
          <Link to="/blog" className="hero-cta secondary text-sm" style={{textDecoration:'none'}}>View blog</Link>
        </div>

        <div className="mt-6 flex flex-col items-center justify-center gap-4 w-full" onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {posts.length === 0 && <div className="glass-card p-6 text-gray-300 col-span-full">No posts yet — subscribe for updates.</div>}
            {slice.map(p => (
              <article key={p.id} className="glass-card p-4 rounded-lg card-hover">
                <div className="w-full h-40 bg-gray-800 overflow-hidden rounded">
                  {p.cover ? <img src={p.cover} alt={p.title} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-gray-500">No image</div>}
                </div>
                <div className="mt-3 text-center">
                  <h3 className="text-lg font-semibold text-white"><Link to={`/blog/${p.slug}`}>{p.title}</Link></h3>
                  <p className="text-gray-300 mt-1 text-sm">{p.excerpt}</p>
                </div>
                <div className="mt-4 flex justify-center gap-3">
                  <Link to={`/blog/${p.slug}`} className="hero-cta secondary" style={{textDecoration:'none'}}>View more</Link>
                </div>
              </article>
            ))}
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
