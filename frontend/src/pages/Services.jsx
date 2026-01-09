import React, { useEffect, useState } from 'react'
import { fetchServices } from '../lib/api'
import '../styles/Services.css'

export default function Services(){
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    fetchServices()
      .then(data => {
        if (!mounted) return
        const servicesData = Array.isArray(data) ? data : (data.results || [])
        // Transform "Cloud Architecture" to "Cloud Services" with sub-items (same logic as home page)
        const transformed = servicesData.map(s => {
          if (s.title === 'Cloud Architecture') {
            return {
              ...s,
              title: 'Cloud Services',
              description: s.description || 'Comprehensive cloud solutions for modern businesses.',
              subItems: ['Cloud Engineering', 'Cloud Architecture', 'Cloud Security']
            }
          }
          // If already "Cloud Services", ensure it has sub-items
          if (s.title === 'Cloud Services' && !s.subItems) {
            return {
              ...s,
              subItems: ['Cloud Engineering', 'Cloud Architecture', 'Cloud Security']
            }
          }
          return s
        })
        setServices(transformed)
      })
      .catch(() => {
        // Fallback to default services if API fails (same as home page)
        if (mounted) {
          setServices([
            { title: 'Cloud Services', description: 'Comprehensive cloud solutions for modern businesses.', icon: '☁️', subItems: ['Cloud Engineering', 'Cloud Architecture', 'Cloud Security'] },
            { title: 'Web Development', description: 'Modern React + Django applications with CI/CD and testing.', icon: '💻' },
            { title: 'Graphic & Logo Design', description: 'Branding, logos and visual assets tuned for web and social.', icon: '🎨' },
          ])
        }
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => { mounted = false }
  }, [])

  return (
    <div className="services-page bg-[linear-gradient(180deg,#071225,rgba(10,15,31,0.95))] min-h-screen text-white w-full">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 w-full">
        <div className="text-center mb-8 sm:mb-12 animate-pop-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-3xl sm:text-4xl font-bold gradient-accent mb-3">Services</h1>
          <p className="text-base sm:text-lg muted">Specialized expertise in web development, cloud infrastructure, and design.</p>
        </div>

        {/* Why Us Section with Image */}
        <div className="mb-16 flex justify-center animate-pop-scale" style={{ animationDelay: '0.2s' }}>
          <div className="w-full max-w-3xl rounded-2xl overflow-hidden border border-blue-500/30 shadow-2xl hover:scale-105 transition-transform duration-300">
            <img 
              src="https://skye8.tech/assets/img/why-us.png" 
              alt="Why Us"
              className="w-full h-auto object-cover rounded-2xl"
            />
          </div>
        </div>
        
        {loading && services.length === 0 ? (
          <div className="text-center py-12">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-300">Loading services...</p>
          </div>
        ) : (
          <div className="services-grid">
            {services.length === 0 ? (
              <div className="col-span-full text-center text-gray-400 py-12">No services available</div>
            ) : (
              services.map((s, idx) => {
                const popAnimations = ['animate-pop-fade-in-up', 'animate-pop-scale', 'animate-pop-bounce', 'animate-pop-elastic', 'animate-pop-rotate', 'animate-pop-heartbeat']
                const motionAnimations = ['animate-float-rotate', 'animate-float', 'animate-glow-pulse']
                const randomAnimation = popAnimations[idx % popAnimations.length]
                const randomMotion = motionAnimations[idx % motionAnimations.length]
                const hasSubItems = s.title === 'Cloud Services' || (s.subItems && s.subItems.length > 0)
                return (
                  <div key={s.id || s.title} className={`service-card card-3d glass rounded-2xl border border-blue-500/10 p-8 ${randomAnimation} ${randomMotion} lift-on-hover`} style={{ animationDelay: `${0.3 + idx * 0.1}s` }}>
                    <div className="flex flex-col items-center text-center mb-4">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl bg-white/6 text-white mb-4">
                        {s.icon || '💼'}
                      </div>
                      <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                      <p className="muted mb-4">{s.description || s.desc}</p>
                    </div>
                    {hasSubItems && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <ul className="list-none space-y-2">
                          {(s.subItems || ['Cloud Engineering', 'Cloud Architecture', 'Cloud Security']).map((item, idx) => (
                            <li key={idx} className="text-gray-300 text-sm flex items-center gap-2">
                              <span className="text-blue-400">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}
      </main>
    </div>
  )
}
