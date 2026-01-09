import React from 'react'
import { Link } from 'react-router-dom'
import '../styles/PortfolioCard.css'

export default function PortfolioCard({ item, index = 0 }){
  const popAnimations = ['animate-pop-fade-in-up', 'animate-pop-scale', 'animate-pop-bounce', 'animate-pop-elastic', 'animate-pop-rotate']
  const randomAnimation = popAnimations[index % popAnimations.length]
  const motionAnimations = ['animate-float', 'animate-sway', 'animate-zoom-pulse']
  const motionAnimation = motionAnimations[index % motionAnimations.length]
  
  return (
    <article className={`portfolio-card overflow-hidden card-3d ${randomAnimation} ${motionAnimation} lift-on-hover`} style={{ animationDelay: `${index * 80}ms` }}>
      <Link to={`/portfolio/${item.slug}`} className="portfolio-link">
        <div className="thumb">
          <img src={item.cover || '/placeholder.png'} alt={item.title} className="w-full h-48 object-cover" loading="lazy" />
        </div>
        <div className="p-6 meta bg-gradient-to-b from-slate-900/80 to-slate-950/90 backdrop-blur-sm border-t border-white/10">
          <h3 className="font-bold text-white text-lg leading-snug">{item.title}</h3>
          <p className="text-sm text-slate-300 mt-3 line-clamp-2">{item.excerpt}</p>
        </div>
      </Link>
      {(item.live_url || item.github_url) && (
        <div className="px-4 pb-4 portfolio-actions">
          <div className="flex gap-2 flex-wrap">
            {item.live_url && (
              <a 
                href={item.live_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="portfolio-btn portfolio-btn-live"
                onClick={(e) => e.stopPropagation()}
              >
                🌐 View Live
              </a>
            )}
            {item.github_url && (
              <a 
                href={item.github_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="portfolio-btn portfolio-btn-github"
                onClick={(e) => e.stopPropagation()}
              >
                💻 GitHub
              </a>
            )}
          </div>
        </div>
      )}
    </article>
  )
}
