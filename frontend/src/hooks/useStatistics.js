import { useState, useEffect, useRef } from 'react'
import {
  fetchPortfolioList,
  fetchBlogList,
  fetchRecentReviews,
  fetchProducts,
} from '../lib/api'

/**
 * Custom hook to fetch and calculate statistics
 * Gathers data from multiple API endpoints to provide real-time stats
 * for projects, reviews, blog posts, and products for sale
 */
export function useStatistics() {
  const [stats, setStats] = useState({
    projects_completed: 0,
    projects_for_sale: 0,
    total_reviews: 0,
    blog_posts: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const listenerRef = useRef(null)
  const intervalRef = useRef(null)

  const fetchAllStats = async () => {
    try {
      console.log('🔄 Fetching statistics... (timestamp:', new Date().toISOString(), ')')

      // Fetch all required data in parallel
      const results = await Promise.allSettled([
        fetchPortfolioList(),
        fetchProducts(),
        fetchRecentReviews(),
        fetchBlogList(),
      ])

      // Extract data from results
      let portfolioItems = []
      let productItems = []
      let reviewItems = []
      let blogItems = []

      if (results[0].status === 'fulfilled') {
        const data = results[0].value
        portfolioItems = Array.isArray(data) ? data : data?.results || []
      }
      if (results[1].status === 'fulfilled') {
        const data = results[1].value
        productItems = Array.isArray(data) ? data : data?.results || []
      }
      if (results[2].status === 'fulfilled') {
        const data = results[2].value
        reviewItems = Array.isArray(data) ? data : data?.results || []
      }
      if (results[3].status === 'fulfilled') {
        const data = results[3].value
        blogItems = Array.isArray(data) ? data : data?.results || []
      }

      const newStats = {
        projects_completed: portfolioItems.length,
        projects_for_sale: productItems.length,
        total_reviews: reviewItems.length,
        blog_posts: blogItems.length,
      }

      console.log('📊 Statistics updated:', newStats)
      console.log('   Portfolios:', portfolioItems.length)
      console.log('   Products:', productItems.length)
      console.log('   Reviews:', reviewItems.length)
      console.log('   Blogs:', blogItems.length)

      setStats(newStats)
      setLoading(false)
    } catch (err) {
      console.error('❌ Error fetching statistics:', err)
      setError(err.message)
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('✅ Statistics hook mounted')

    // Fetch immediately
    fetchAllStats()

    // Create event listener
    listenerRef.current = () => {
      console.log('📢 Data update event received!')
      fetchAllStats()
    }

    // Attach listener
    window.addEventListener('data-updated', listenerRef.current)
    console.log('🎧 Event listener attached')

    // Set up polling every 2 seconds
    intervalRef.current = setInterval(() => {
      console.log('⏱️ Auto-refresh triggered (polling)')
      fetchAllStats()
    }, 2000)

    // Cleanup function
    return () => {
      console.log('🧹 Statistics hook cleaning up')
      if (listenerRef.current) {
        window.removeEventListener('data-updated', listenerRef.current)
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return { stats, loading, error }
}
