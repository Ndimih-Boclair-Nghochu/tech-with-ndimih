import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import '../styles/BlogDetail.css'
import { fetchBlogBySlug, purchaseProduct } from '../lib/api'

export default function BlogDetail(){
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    let mounted = true
    setLoading(true)
    fetchBlogBySlug(slug)
      .then(data => { if(!mounted) return; setPost(data) })
      .catch(()=>{})
      .finally(()=>{ if(mounted) setLoading(false) })
    return ()=> mounted = false
  }, [slug])

  async function handleBuy(product){
    try{
      const res = await purchaseProduct(product.id)
      if(res.type === 'download' && res.url){
        window.open(res.url, '_blank')
      }else if(res.type === 'stripe' && res.checkout_url){
        window.location.href = res.checkout_url
      }else if(res.type === 'external' && res.url){
        // external affiliate link
        window.location.href = res.url
      }else if(res.detail){
        alert(res.detail)
      }
    }catch(e){
      alert('Purchase failed')
    }
  }

  if(loading) {
    return (
      <div className="blog-detail-page bg-[linear-gradient(180deg,#071225,rgba(10,15,31,0.95))] min-h-screen text-white">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="spinner mx-auto mb-4"></div>
              <p className="text-gray-300">Loading post…</p>
            </div>
          </div>
        </main>
      </div>
    )
  }
  if(!post) {
    return (
      <div className="blog-detail-page bg-[linear-gradient(180deg,#071225,rgba(10,15,31,0.95))] min-h-screen text-white">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Post Not Found</h1>
            <p className="text-gray-300 mb-6">The blog post you are looking for does not exist.</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="blog-detail-page bg-[linear-gradient(180deg,#071225,rgba(10,15,31,0.95))] min-h-screen text-white">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <article className="blog-detail">
          {post.cover && (
            <div className="blog-cover mb-8 animate-pop-scale" style={{ animationDelay: '0.1s' }}>
              <img src={post.cover} alt={post.title} className="w-full h-auto rounded-xl" />
            </div>
          )}
          <h1 className="text-4xl md:text-5xl font-bold gradient-accent mb-4 animate-pop-fade-in-up" style={{ animationDelay: '0.2s' }}>{post.title}</h1>
          {post.excerpt && <p className="text-xl text-gray-300 mb-6 animate-pop-fade-in-up" style={{ animationDelay: '0.3s' }}>{post.excerpt}</p>}
          <div className="blog-body prose prose-invert max-w-none animate-pop-fade-in-up animate-float" style={{ animationDelay: '0.4s' }} dangerouslySetInnerHTML={{ __html: post.body }} />

          {post.products && post.products.length > 0 && (
            <section className="mt-12 pt-8 border-t border-white/10">
              <h2 className="text-2xl font-semibold mb-6 animate-pop-bounce" style={{ animationDelay: '0.5s' }}>Related Products</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {post.products.map((prod, idx) => (
                  <div key={prod.id} className="product-card glass-card rounded-xl border border-blue-500/10 p-6 card-hover animate-pop-fade-in-up animate-sway lift-on-hover" style={{ animationDelay: `${0.6 + idx * 0.1}s` }}>
                    <h3 className="text-xl font-semibold text-white mb-2">{prod.title}</h3>
                    <p className="text-gray-300 mb-4">{prod.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-cyan-400">
                        {prod.price_cents ? `$${(prod.price_cents/100).toFixed(2)}` : 'Free'}
                      </div>
                      <button 
                        className="btn btn--primary px-6 py-2 rounded-lg font-semibold transition hover:shadow-lg" 
                        onClick={()=>handleBuy(prod)}
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </article>
      </main>
    </div>
  )
}
