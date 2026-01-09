import React, { useEffect, useState } from 'react'
import PortfolioCard from '../components/PortfolioCard'
import { fetchPortfolioPage, fetchTags } from '../lib/api'
import '../styles/Portfolio.css'

export default function Portfolio(){
  const [items, setItems] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // paginated loading when filter (tag) changes
  const [nextPageUrl, setNextPageUrl] = useState(null)
  const [page, setPage] = useState(1)
  useEffect(()=>{
    let mounted = true
    setLoading(true)
    setItems([])
    setPage(1)
    // fetch first page of portfolio (by tag)
    fetchPortfolioPage({ tag: filter, page: 1 })
      .then(data => {
        if(!mounted) return
        setItems(data.results || [])
        setNextPageUrl(data.next)
        setOffline(false)
      })
      .catch((err) => {
        if(!mounted) return
        // surface an error instead of switching to demo items
        setItems([])
        setError(err)
        setOffline(true)
      })
      .finally(() => { if(mounted) setLoading(false) })
    return ()=> mounted = false
  },[filter])

  // load tag categories
  const [tags, setTags] = useState([])
  useEffect(()=>{
    let mounted = true
    fetchTags().then(data => { if(mounted) setTags(data) }).catch(()=>{})
    return ()=> mounted = false
  },[])

  // offline flag becomes true when initial fetch fails
  const [offline, setOffline] = useState(false)

  return (
    <div className="portfolio-page bg-[linear-gradient(180deg,#071225,rgba(10,15,31,0.95))] min-h-screen text-white w-full">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 w-full">
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold gradient-accent mb-3">Completed Projects</h1>
        <p className="text-base sm:text-lg muted">Explore my recent projects and work.</p>
      </div>
      
      <div className="mt-4 sm:mt-6 flex gap-2 flex-wrap justify-center sm:justify-start">
        <button onClick={()=>setFilter('all')} className={`px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg font-semibold transition ${filter==='all'?'bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg':'bg-white/10 text-white hover:bg-white/20'}`}>All</button>
        {tags.map(t => (
          <button
            key={t.name}
            onClick={()=>setFilter(t.name)}
            className={`px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg font-semibold transition ${filter===t.name?'bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg':'bg-white/10 text-white hover:bg-white/20'}`}
            aria-pressed={filter===t.name}
          >
            {t.name.charAt(0).toUpperCase() + t.name.slice(1)} {t.count ? `(${t.count})` : ''}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {loading && <div className="text-center text-lg text-gray-300 py-12">Loading portfolio...</div>}
        {error && (
          <div className="text-red-400 p-4 glass-card rounded-lg">
            <div className="font-semibold">Failed to load portfolio — {error.message || 'backend unreachable'}</div>
            <div className="mt-2 text-sm text-gray-300">If you are running locally, make sure the backend is started.</div>
          </div>
        )}
        {!loading && !error && items.length === 0 && !offline && (
          <div className="mt-6 text-center text-gray-400 py-12">No portfolio items found. If this is your first time, create a portfolio item in the Admin.</div>
        )}
        {!loading && offline && (
          <div className="mt-6 text-sm text-gray-400 text-center py-12">Backend appears offline — portfolio may be out of sync.</div>
        )}
        <div className="mt-4 portfolio-grid">
          {items.map((item, idx) => <PortfolioCard key={item.id} item={item} index={idx} />)}
        </div>
        {nextPageUrl && (
          <div className="mt-6 text-center">
            <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold rounded-lg hover:shadow-lg transition" onClick={async ()=>{
              setLoading(true)
              const nextPage = page + 1
              try{
                const data = await fetchPortfolioPage({ tag: filter, page: nextPage })
                setItems(prev => [...prev, ...(data.results || [])])
                setNextPageUrl(data.next)
                setPage(nextPage)
              }catch(e){ setError(e) }
              setLoading(false)
            }}>Load more</button>
          </div>
        )}
      </div>
      </main>
    </div>
  )
}
