import React, { useEffect, useState } from 'react'
import { fetchPortfolioList, fetchBlogList, fetchRecentReviews, fetchProducts } from '../lib/api'

export default function Statistics() {
  const [stats, setStats] = useState({
    portfolio: 0,
    blog: 0,
    reviews: 0,
    products: 0
  })
  const [loading, setLoading] = useState(true)
  const [displayStats, setDisplayStats] = useState({
    portfolio: 0,
    blog: 0,
    reviews: 0,
    products: 0
  })

  useEffect(() => {
    let mounted = true

    // Fetch all statistics in parallel
    Promise.all([
      fetchPortfolioList().catch(() => ({ results: [] })),
      fetchBlogList().catch(() => ({ results: [] })),
      fetchRecentReviews().catch(() => ({ results: [] })),
      fetchProducts().catch(() => ({ results: [] }))
    ])
      .then(([portfolioData, blogData, reviewsData, productsData]) => {
        if (!mounted) return

        const portfolioCount = (portfolioData.results || []).length
        const blogCount = (blogData.results || []).length
        const reviewsCount = (reviewsData.results || []).length
        const productsCount = (productsData.results || []).length

        setStats({
          portfolio: portfolioCount,
          blog: blogCount,
          reviews: reviewsCount,
          products: productsCount
        })

        // Animate counters
        animateCounters(
          { portfolio: portfolioCount, blog: blogCount, reviews: reviewsCount, products: productsCount }
        )
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => { mounted = false }
  }, [])

  const animateCounters = (targetStats) => {
    const duration = 1500 // 1.5 seconds
    const steps = 60
    const stepDuration = duration / steps
    let currentStep = 0

    const interval = setInterval(() => {
      currentStep++
      const progress = currentStep / steps

      setDisplayStats({
        portfolio: Math.floor(targetStats.portfolio * progress),
        blog: Math.floor(targetStats.blog * progress),
        reviews: Math.floor(targetStats.reviews * progress),
        products: Math.floor(targetStats.products * progress)
      })

      if (currentStep >= steps) {
        clearInterval(interval)
        setDisplayStats(targetStats)
      }
    }, stepDuration)
  }

  const statItems = [
    { label: 'Projects Completed', value: displayStats.portfolio, icon: '📁' },
    { label: 'Blog Posts', value: displayStats.blog, icon: '📝' },
    { label: 'Happy Clients', value: displayStats.reviews, icon: '⭐' },
    { label: 'Products', value: displayStats.products, icon: '🛍️' }
  ]

  return (
    <section className="py-16 px-6 w-full">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
          {statItems.map((item, idx) => (
            <div
              key={idx}
              className="text-center p-6 rounded-xl border border-blue-500/20 bg-gradient-to-br from-slate-900/50 to-slate-950/50 hover:border-blue-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 animate-fade-in-up"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="text-4xl mb-3">{item.icon}</div>
              <div className="text-4xl font-bold text-blue-400 mb-2">
                {loading ? (
                  <span className="animate-pulse">-</span>
                ) : (
                  item.value
                )}
              </div>
              <p className="text-gray-300 text-sm">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
