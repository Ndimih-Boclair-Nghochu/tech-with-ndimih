import React, { useEffect, useState } from 'react'
import { fetchServices } from '../lib/api'

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
      <section id="services" className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-semibold text-white">Services</h2>
          <p className="text-gray-300 mt-2">Focused services for cloud-first products and brands.</p>
          <div className="mt-6 text-center text-gray-400">Loading services...</div>
        </div>
      </section>
    )
  }

  return (
    <section id="services" className="py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-semibold text-white">Services</h2>
        <p className="text-gray-300 mt-2">Focused services for cloud-first products and brands.</p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {services.length === 0 ? (
            <div className="col-span-full text-center text-gray-400">No services available</div>
          ) : (
            services.map(s => {
              const hasSubItems = s.title === 'Cloud Services' || (s.subItems && s.subItems.length > 0)
              return (
                <article key={s.id || s.title} className="glass-card p-3 rounded-lg card-hover">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl bg-white/6 text-white">
                      {s.icon || '💼'}
                    </div>
                    <h3 className="text-sm font-semibold text-white">{s.title}</h3>
                    <p className="text-gray-300 text-xs leading-relaxed">{s.description || s.desc}</p>
                    {hasSubItems && (
                      <div className="mt-2 w-full border-t border-white/10 pt-2">
                        <ul className="flex flex-col gap-1.5 text-left w-full">
                          {(s.subItems || ['Cloud Engineering', 'Cloud Architecture', 'Cloud Security']).map((item, idx) => (
                            <li key={idx} className="text-gray-300 text-xs flex items-center gap-1.5">
                              <span className="text-blue-400">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </article>
              )
            })
          )}
        </div>
      </div>
    </section>
  )
}
