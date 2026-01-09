import React, { useEffect, useState } from 'react'
import { fetchServices } from '../lib/api'
import Card3D from './3DCard'

export default function ServicesGrid(){
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    fetchServices()
      .then(data => {
        if (!mounted) return
        const servicesData = Array.isArray(data) ? data : (data.results || [])
        // Transform "Cloud Architecture" to "Cloud Services" with sub-items
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
        // Fallback to default services if API fails
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

  if (loading && services.length === 0) {
    return (
      <section id="services" className="py-16 px-6 w-full relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-semibold text-white">Services</h2>
          <p className="text-gray-300 mt-2">Focused services for cloud-first products and brands.</p>
          <div className="mt-6 text-center text-gray-400">Loading services...</div>
        </div>
      </section>
    )
  }

  return (
    <section id="services" className="py-16 px-6 w-full relative overflow-hidden bg-gradient-to-b from-transparent via-blue-500/5 to-transparent">
      {/* Professional gradient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold text-white">Services</h2>
          <p className="text-gray-300 mt-2 text-lg">Focused services for cloud-first products and brands.</p>
        </div>

        {/* Why Us Image Section */}
        <div className="mb-16 flex justify-center">
          <div className="w-full max-w-2xl rounded-2xl overflow-hidden border border-blue-500/30 shadow-2xl hover:shadow-blue-500/30 transition-shadow duration-300">
            <img 
              src="https://skye8.tech/assets/img/why-us.png" 
              alt="Why Us"
              className="w-full h-auto object-cover rounded-2xl hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 perspective-1200 scroll-stagger">
          {services.length === 0 ? (
            <div className="col-span-full text-center text-gray-400 py-8">No services available</div>
          ) : (
            services.map((s, idx) => {
              const hasSubItems = s.title === 'Cloud Services' || (s.subItems && s.subItems.length > 0)
              const popAnimations = ['animate-pop-fade-in-up', 'animate-pop-scale', 'animate-pop-bounce', 'animate-pop-elastic', 'animate-pop-rotate', 'animate-pop-heartbeat']
              const randomAnimation = popAnimations[idx % popAnimations.length]
              const motionAnimations = ['animate-float-rotate', 'animate-float', 'animate-glow-pulse']
              const motionAnimation = motionAnimations[idx % motionAnimations.length]
              
              return (
                <Card3D 
                  key={s.id || s.title}
                  className={`h-full ${randomAnimation} ${motionAnimation} lift-on-hover`}
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <article className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-700/50 p-6 rounded-xl h-full flex flex-col transition-all duration-400 hover:border-blue-500/40 hover:shadow-2xl hover:shadow-blue-500/10">
                    <div className="flex flex-col items-center gap-4 flex-1">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl bg-gradient-to-br from-blue-600/30 to-purple-600/30 text-blue-300 transform transition-transform duration-300 group-hover:scale-110 border border-blue-500/30">
                        {s.icon || '💼'}
                      </div>
                      <h3 className="text-lg font-bold text-white text-center group-hover:text-blue-400 transition-colors">{s.title}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed text-center flex-1">{s.description || s.desc}</p>
                      {hasSubItems && (
                        <div className="mt-4 w-full border-t border-slate-700/50 pt-4">
                          <ul className="flex flex-col gap-2">
                            {(s.subItems || ['Cloud Engineering', 'Cloud Architecture', 'Cloud Security']).map((item, sidx) => (
                              <li key={sidx} className="text-slate-400 text-xs flex items-center gap-2 transform transition-transform duration-200 hover:translate-x-1">
                                <span className="text-blue-400 font-bold">→</span>
                                <span className="text-sm">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </article>
                </Card3D>
              )
            })
          )}
        </div>
      </div>
    </section>
  )
}
