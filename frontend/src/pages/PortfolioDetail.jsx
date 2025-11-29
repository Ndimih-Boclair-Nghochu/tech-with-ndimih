import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Lightbox from '../components/Lightbox'
import { fetchPortfolioBySlug } from '../lib/api'
import '../styles/PortfolioDetail.css'

export default function PortfolioDetail(){
  const { slug } = useParams()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(()=>{
    let mounted = true
    fetchPortfolioBySlug(slug)
      .then(d=> { if(mounted){ setItem(d); setLoading(false) } })
      .catch(e => { if(mounted){ setError(e); setLoading(false) } })
    return ()=> mounted = false
  }, [slug])

  if(loading) return <div>Loading...</div>
  if(error || !item) return <div className="text-red-600">Not found</div>

  const images = (item.images || []).map(img => img.image)

  return (
    <div className="portfolio-detail-page bg-[linear-gradient(180deg,#071225,rgba(10,15,31,0.95))] min-h-screen text-white w-full">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 w-full">
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold gradient-accent mb-4">{item.title}</h1>
          {(item.live_url || item.github_url) && (
            <div className="flex gap-3 flex-wrap mb-6">
              {item.live_url && (
                <a 
                  href={item.live_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="portfolio-btn portfolio-btn-live"
                >
                  🌐 View Live Project
                </a>
              )}
              {item.github_url && (
                <a 
                  href={item.github_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="portfolio-btn portfolio-btn-github"
                >
                  💻 View on GitHub
                </a>
              )}
            </div>
          )}
        </div>
        {item.excerpt && <p className="text-xl text-gray-300 mb-6">{item.excerpt}</p>}
        {item.body && (
          <div 
            className="prose prose-invert max-w-none mb-8" 
            dangerouslySetInnerHTML={{ __html: item.body }} 
          />
        )}
        {images.length > 0 && (
          <div className="mt-6 portfolio-media">
            <div className="grid md:grid-cols-2 gap-4">
              {images.map((src, i) => (
                <img key={i} src={src} alt={item.title} className="w-full h-64 object-cover rounded-lg" loading="lazy" />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
