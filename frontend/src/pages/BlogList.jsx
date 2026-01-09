import React, { useEffect, useState } from 'react'
import '../styles/BlogList.css'
import { fetchBlogList } from '../lib/api'
import { Link } from 'react-router-dom'

export default function BlogList(){
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    let mounted = true
    setLoading(true)
    fetchBlogList()
      .then(data => { if(!mounted) return; setPosts(data.results || []) })
      .catch(()=>{})
      .finally(()=>{ if(mounted) setLoading(false) })
    return ()=> mounted = false
  }, [])

  return (
    <div className="blog-list-page bg-[linear-gradient(180deg,#071225,rgba(10,15,31,0.95))] min-h-screen text-white w-full">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 w-full">
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold gradient-accent mb-3">Blog</h1>
        <p className="text-base sm:text-lg muted">Insights, tutorials, and thoughts on design and development.</p>
      </div>
      <div className="blog-list">
        {loading && <div className="text-center text-lg text-gray-300 py-12">Loading posts…</div>}
        {!loading && posts.length === 0 && <div className="text-center muted text-lg py-12">No posts yet</div>}
        {posts.map((p, idx) => {
          const popAnimations = ['animate-pop-fade-in-up', 'animate-pop-bounce', 'animate-pop-elastic', 'animate-pop-scale', 'animate-pop-heartbeat']
          const randomAnimation = popAnimations[idx % popAnimations.length]
          const motionAnimations = ['animate-float', 'animate-sway', 'animate-zoom-pulse', 'animate-tilt']
          const motionAnimation = motionAnimations[idx % motionAnimations.length]
          return (
            <article key={p.id} className={`post-card glass-card rounded-xl border border-blue-500/10 overflow-hidden card-hover ${randomAnimation} ${motionAnimation} lift-on-hover`} style={{ animationDelay: `${idx * 80}ms` }}>
            <Link to={`/blog/${p.slug}`} className="block">
              {p.cover && (
                <div className="post-thumb w-full h-48 overflow-hidden">
                  <img src={p.cover} alt={p.title} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
                </div>
              )}
              <div className="post-meta p-6">
                <h3 className="post-title text-xl font-semibold text-white mb-3 hover:text-cyan-300 transition">
                  {p.title}
                </h3>
                <p className="post-excerpt text-gray-300">{p.excerpt}</p>
                {p.tags && p.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {p.tags.map((tag, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
            </article>
          )
        })}
      </div>
      </main>
    </div>
  )
}
