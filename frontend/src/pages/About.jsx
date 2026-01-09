import React, { useEffect, useState } from 'react'
import { fetchAbout } from '../lib/api'
import '../styles/About.css'

export default function About(){
  const [about, setAbout] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAbout()
  }, [])

  async function loadAbout() {
    setLoading(true)
    try {
      const data = await fetchAbout()
      setAbout(data)
    } catch (error) {
      console.error('Error loading about page:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="about-page bg-[linear-gradient(180deg,#071225,rgba(10,15,31,0.95))] min-h-screen text-white">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-300">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!about) {
    return (
      <div className="about-page bg-[linear-gradient(180deg,#071225,rgba(10,15,31,0.95))] min-h-screen text-white">
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold gradient-accent mb-3">About</h1>
            <p className="text-base sm:text-lg muted">About page content is not available yet. Please add content from the Admin Dashboard.</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="about-page bg-[linear-gradient(180deg,#071225,rgba(10,15,31,0.95))] min-h-screen text-white">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Hero Section */}
        <div className="about-hero text-center mb-8 sm:mb-12 md:mb-16">
          <div className="profile-image-container mb-8 animate-pop-scale" style={{ animationDelay: '0.1s' }}>
            {about.profile_image_url ? (
              <div className="profile-image-wrapper">
                <img 
                  src={about.profile_image_url} 
                  alt={about.name}
                  className="profile-image"
                />
              </div>
            ) : (
              <div className="profile-image-placeholder">
                <span className="text-6xl">👤</span>
              </div>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-accent mb-4 animate-pop-fade-in-up" style={{ animationDelay: '0.2s' }}>{about.name}</h1>
          <p className="text-xl sm:text-2xl text-cyan-300 mb-4 animate-pop-bounce" style={{ animationDelay: '0.3s' }}>{about.title}</p>
          {about.location && (
            <p className="text-lg muted flex items-center justify-center gap-2 animate-pop-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <span>📍</span> {about.location}
            </p>
          )}
        </div>

        {/* Social Links */}
        {(about.linkedin_url || about.github_url || about.twitter_url || about.website || about.email) && (
          <div className="social-links mb-8 sm:mb-12 flex flex-wrap justify-center gap-3 sm:gap-4">
            {about.email && (
              <a 
                href={`mailto:${about.email}`}
                className="social-link glass-card animate-pop-fade-in-up lift-on-hover"
                style={{ animationDelay: '0.5s' }}
                aria-label="Email"
              >
                <span className="text-2xl">📧</span>
                <span>Email</span>
              </a>
            )}
            {about.website && (
              <a 
                href={about.website}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link glass-card animate-pop-scale lift-on-hover"
                style={{ animationDelay: '0.6s' }}
                aria-label="Website"
              >
                <span className="text-2xl">🌐</span>
                <span>Website</span>
              </a>
            )}
            {about.linkedin_url && (
              <a 
                href={about.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link glass-card animate-pop-bounce lift-on-hover"
                style={{ animationDelay: '0.7s' }}
                aria-label="LinkedIn"
              >
                <span className="text-2xl">💼</span>
                <span>LinkedIn</span>
              </a>
            )}
            {about.github_url && (
              <a 
                href={about.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link glass-card animate-pop-elastic lift-on-hover"
                style={{ animationDelay: '0.8s' }}
                aria-label="GitHub"
              >
                <span className="text-2xl">💻</span>
                <span>GitHub</span>
              </a>
            )}
            {about.twitter_url && (
              <a 
                href={about.twitter_url}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link glass-card animate-pop-rotate lift-on-hover"
                style={{ animationDelay: '0.9s' }}
                aria-label="Twitter"
              >
                <span className="text-2xl">🐦</span>
                <span>Twitter</span>
              </a>
            )}
            {about.resume_url && (
              <a 
                href={about.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link glass-card animate-pop-wobble lift-on-hover"
                style={{ animationDelay: '1.0s' }}
                aria-label="Resume"
              >
                <span className="text-2xl">📄</span>
                <span>Resume</span>
              </a>
            )}
          </div>
        )}

        {/* Bio Section */}
        <div className="about-content">
          <div className="content-card glass-card mb-8 animate-pop-fade-in-up animate-float" style={{ animationDelay: '1.1s' }}>
            <h2 className="section-title">About Me</h2>
            <p className="bio-text">{about.bio}</p>
          </div>

          {about.long_description && (
            <div className="content-card glass-card animate-pop-fade-in-up animate-sway" style={{ animationDelay: '1.2s' }}>
              <h2 className="section-title">More About Me</h2>
              <div 
                className="long-description"
                dangerouslySetInnerHTML={{ __html: about.long_description.replace(/\n/g, '<br />') }}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
