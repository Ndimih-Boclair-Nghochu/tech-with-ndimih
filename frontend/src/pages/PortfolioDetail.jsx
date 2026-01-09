import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Lightbox from '../components/Lightbox'
import { fetchPortfolioBySlug } from '../lib/api'
import '../styles/PortfolioDetail.css'

export default function PortfolioDetail(){
  const { slug } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  useEffect(()=>{
    let mounted = true
    setLoading(true)
    setError(null)
    fetchPortfolioBySlug(slug)
      .then(d=> { 
        if(mounted){ 
          setItem(d); 
          setLoading(false) 
        } 
      })
      .catch(e => { 
        if(mounted){ 
          setError(e); 
          setLoading(false) 
        } 
      })
    return ()=> mounted = false
  }, [slug])

  const images = item ? (item.images || []).map(img => img.image) : []
  const allImages = item?.cover ? [item.cover, ...images] : images

  const openLightbox = (index) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  if(loading) {
    return (
      <div className="portfolio-detail-page bg-[linear-gradient(180deg,#071225,rgba(10,15,31,0.95))] min-h-screen text-white w-full">
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 w-full">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="loading-spinner mb-4"></div>
              <p className="text-gray-300 text-lg">Loading portfolio...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if(error || !item) {
    return (
      <div className="portfolio-detail-page bg-[linear-gradient(180deg,#071225,rgba(10,15,31,0.95))] min-h-screen text-white w-full">
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 w-full">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="glass-card p-8 rounded-xl max-w-md">
              <h2 className="text-2xl font-bold text-red-400 mb-4">Portfolio Not Found</h2>
              <p className="text-gray-300 mb-6">{error?.message || 'The portfolio item you are looking for does not exist.'}</p>
              <Link to="/portfolio" className="hero-cta secondary inline-block" style={{textDecoration:'none'}}>
                ← Back to Portfolio
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="portfolio-detail-page bg-[linear-gradient(180deg,#071225,rgba(10,15,31,0.95))] min-h-screen text-white w-full">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
        {/* Back Button */}
        <div className="mb-6 animate-pop-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <button 
            onClick={() => navigate(-1)}
            className="back-button flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <span>←</span>
            <span>Back</span>
          </button>
        </div>

        {/* Cover Image */}
        {item.cover && (
          <div className="portfolio-cover mb-8 rounded-xl overflow-hidden shadow-2xl animate-pop-scale" style={{ animationDelay: '0.2s' }}>
            <img 
              src={item.cover} 
              alt={item.title} 
              className="w-full h-auto max-h-[600px] object-cover cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => openLightbox(0)}
            />
          </div>
        )}

        {/* Header Section */}
        <div className="portfolio-header mb-8 animate-pop-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold gradient-accent mb-4 leading-tight">
            {item.title}
          </h1>
          
          {item.excerpt && (
            <p className="text-xl sm:text-2xl text-gray-300 mb-6 leading-relaxed max-w-4xl">
              {item.excerpt}
            </p>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {item.tags.map((tag, i) => (
                <Link
                  key={i}
                  to={`/portfolio?tag=${encodeURIComponent(tag)}`}
                  className="tag-badge animate-pop-bounce lift-on-hover"
                  style={{ animationDelay: `${0.4 + i * 0.1}s` }}
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          {(item.live_url || item.github_url) && (
            <div className="flex flex-wrap gap-4 mb-8">
              {item.live_url && (
                <a 
                  href={item.live_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="portfolio-btn portfolio-btn-live animate-pop-fade-in-up lift-on-hover"
                  style={{ animationDelay: '0.5s' }}
                >
                  <span className="mr-2">🌐</span>
                  View Live Project
                </a>
              )}
              {item.github_url && (
                <a 
                  href={item.github_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="portfolio-btn portfolio-btn-github animate-pop-fade-in-up lift-on-hover"
                  style={{ animationDelay: '0.6s' }}
                >
                  <span className="mr-2">💻</span>
                  View on GitHub
                </a>
              )}
            </div>
          )}
        </div>

        {/* Content Section */}
        {item.body && (
          <div className="portfolio-content glass-card p-6 sm:p-8 rounded-xl mb-8 animate-pop-fade-in-up animate-float" style={{ animationDelay: '0.7s' }}>
            <div 
              className="prose prose-invert max-w-none" 
              dangerouslySetInnerHTML={{ __html: item.body }} 
            />
          </div>
        )}

        {/* Gallery Section */}
        {images.length > 0 && (
          <div className="portfolio-gallery mt-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 gradient-accent animate-pop-bounce" style={{ animationDelay: '0.8s' }}>Project Gallery</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((src, i) => (
                <div 
                  key={i} 
                  className="gallery-item glass-card rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform animate-pop-fade-in-up animate-sway lift-on-hover"
                  onClick={() => openLightbox(item.cover ? i + 1 : i)}
                  style={{ animationDelay: `${0.9 + i * 0.1}s` }}
                >
                  <img 
                    src={src} 
                    alt={`${item.title} - Image ${i + 1}`} 
                    className="w-full h-64 object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lightbox */}
        {lightboxOpen && allImages.length > 0 && (
          <Lightbox 
            images={allImages} 
            current={lightboxIndex} 
            onClose={() => setLightboxOpen(false)} 
          />
        )}
      </main>
    </div>
  )
}
