import React from 'react'
import { Link } from 'react-router-dom'
import '../styles/PortfolioCard.css'

export default function PortfolioCard({ item }){
  return (
    <article className="portfolio-card bg-white rounded shadow-sm overflow-hidden card-3d">
      <Link to={`/portfolio/${item.slug}`} className="portfolio-link">
        <div className="thumb">
          <img src={item.cover || '/placeholder.png'} alt={item.title} className="w-full h-48 object-cover" loading="lazy" />
        </div>
        <div className="p-4 meta">
          <h3 className="font-semibold">{item.title}</h3>
          <p className="text-sm text-gray-500 mt-2">{item.excerpt}</p>
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
