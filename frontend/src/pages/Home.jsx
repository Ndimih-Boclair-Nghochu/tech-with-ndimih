import React, { useEffect, useState } from 'react'
import HeroCloud from '../components/HeroCloud'
import AboutPreview from '../components/AboutPreview'
import Statistics from '../components/Statistics'
import ServicesGrid from '../components/ServicesGrid'
import PortfolioGrid from '../components/PortfolioGrid'
import BlogCards from '../components/BlogCards'
import ReviewsSlider from '../components/ReviewsSlider'
import SkillsGrid from '../components/SkillsGrid'
import ForSaleGrid from '../components/ForSaleGrid'
import { fetchPortfolioPage, fetchBlogList, fetchRecentReviews } from '../lib/api'

export default function Home({ reduce3D, setReduce3D }){
  const [featured, setFeatured] = useState([])
  const [blogs, setBlogs] = useState([])
  const [reviews, setReviews] = useState([])
  const [reviewsKey, setReviewsKey] = useState(0)

  useEffect(()=>{
    let mounted = true
    Promise.all([fetchPortfolioPage({ page: 1 }), fetchBlogList(), fetchRecentReviews()])
      .then(([pData, bData, rData])=>{
        if(!mounted) return
        setFeatured((pData.results||[]).slice(0,6))
        setBlogs((bData.results||[]).slice(0,6))
        // Fetch ALL reviews - all reviews will rotate through the home page
        // Reviews are never deleted, so we display all of them
        const allReviews = rData.results || []
        // Sort by created_at descending to show newest first, but all will rotate
        const sortedReviews = [...allReviews].sort((a, b) => {
          const dateA = new Date(a.created_at || 0)
          const dateB = new Date(b.created_at || 0)
          return dateB - dateA
        })
        setReviews(sortedReviews)
      }).catch((err) => {
        console.error('Error loading home page data:', err)
        // Set empty arrays on error to prevent crashes
        if(mounted) {
          setFeatured([])
          setBlogs([])
          setReviews([])
        }
      })
    return ()=> mounted = false
  }, [reviewsKey])

  return (
    <div className="home-page bg-[linear-gradient(180deg,#071225,rgba(10,15,31,0.95))] min-h-screen text-white">
      <HeroCloud />
      <AboutPreview />

      <main className="-mt-8 z-30 relative">
        <div className="max-w-6xl mx-auto text-center px-4">
          <Statistics />
          <ServicesGrid />
          <SkillsGrid />
          <ForSaleGrid preview={true} limit={3} />
          <PortfolioGrid items={featured} />
          <ReviewsSlider items={reviews} onReviewAdded={()=> {
            setReviewsKey(k => k+1)
            window.dispatchEvent(new Event('data-updated'))
          }} />
          <BlogCards posts={blogs} />
        </div>
      </main>
    </div>
  )
}
