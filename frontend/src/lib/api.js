import axios from 'axios'

// In development, use the Vite proxy. In production, use the full API URL
const getBaseURL = () => {
  // If VITE_API_URL is explicitly set, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  // In development, use relative path to leverage Vite proxy
  // This will proxy /api/* requests to http://127.0.0.1:8000/api/*
  if (import.meta.env.DEV) {
    return '/api'
  }
  // Fallback for production - should be set via VITE_API_URL
  // If not set, try to infer from current origin
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api`
  }
  return '/api'
}

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Accept': 'application/json',
  }
})

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      // Clear token from localStorage
      localStorage.removeItem('token')
      // Clear authorization header
      delete api.defaults.headers.common['Authorization']
      // Optionally redirect to login or refresh token
      // For now, just let the error propagate so components can handle it
    }
    // Log error for debugging in development
    if (import.meta.env.DEV) {
      console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      })
    }
    return Promise.reject(error)
  }
)

export function setAuthToken(token){
  if(token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  else delete api.defaults.headers.common['Authorization']
}

export async function login(username, password){
  const res = await api.post('/auth/token/', { username, password })
  return res.data
}

export async function fetchPortfolioList(){
  const res = await api.get('/portfolio/')
  // DRF pagination returns results in res.data.results when pagination is enabled
  if(res.data && res.data.results) return res.data
  return { results: res.data, next: null, previous: null }
}

export async function fetchPortfolioListByTag(tag){
  if(!tag || tag === 'all') return fetchPortfolioList()
  const res = await api.get('/portfolio/', { params: { tag } })
  if(res.data && res.data.results) return res.data
  return { results: res.data, next: null, previous: null }
}

export async function fetchPortfolioPage({ tag = null, page = 1 } = {}){
  const params = { page }
  if(tag && tag !== 'all') params.tag = tag
  const res = await api.get('/portfolio/', { params })
  if(res.data && res.data.results) return res.data
  return { results: res.data, next: null, previous: null }
}

export async function fetchTags(){
  const res = await api.get('/tags/')
  return res.data
}

export async function updatePortfolio(id, data){
  // id should be slug (backend uses lookup_field='slug')
  // Handle tags: convert comma-separated string to array if needed
  const tagsValue = data.tags
  let tagsArray = []
  if(tagsValue){
    if(Array.isArray(tagsValue)){
      tagsArray = tagsValue
    } else if(typeof tagsValue === 'string'){
      tagsArray = tagsValue.split(',').map(t => t.trim()).filter(t => t)
    }
  }
  
  if(data.cover){
    const form = new FormData()
    if(data.title) form.append('title', data.title)
    if(data.excerpt) form.append('excerpt', data.excerpt)
    if(data.body) form.append('body', data.body)
    tagsArray.forEach(t => form.append('tags', t))
    if(data.live_url) form.append('live_url', data.live_url)
    if(data.github_url) form.append('github_url', data.github_url)
    form.append('cover', data.cover)
    const res = await api.patch(`/portfolio/${id}/`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
    return res.data
  }
  
  // No cover file - send as JSON
  const jsonData = {
    title: data.title,
    excerpt: data.excerpt,
    body: data.body,
    tags: tagsArray,
    live_url: data.live_url,
    github_url: data.github_url
  }
  const res = await api.patch(`/portfolio/${id}/`, jsonData)
  return res.data
}

export async function deletePortfolio(id){
  // Backend uses slug as lookup_field, so id should be slug
  const res = await api.delete(`/portfolio/${id}/`)
  return res.data
}

export async function fetchPortfolioBySlug(slug){
  const res = await api.get(`/portfolio/${slug}/`)
  return res.data
}

/* Blog & product API */
export async function fetchBlogList(){
  const res = await api.get('/blog/')
  if(res.data && res.data.results) return res.data
  return { results: res.data, next: null, previous: null }
}

export async function fetchRecentReviews(){
  // Fetch ALL reviews - pagination is disabled for reviews in backend
  // All reviews are returned in a single request
  const res = await api.get('/reviews/')
  // Backend returns all reviews as an array (no pagination)
  if(Array.isArray(res.data)) {
    return { results: res.data, next: null, previous: null }
  }
  // Fallback for paginated response (shouldn't happen, but just in case)
  if(res.data && res.data.results) {
    return res.data
  }
  return { results: res.data || [], next: null, previous: null }
}

export async function createReview(data){
  // data: { name, rating, message, product }
  const res = await api.post('/reviews/', data)
  return res.data
}

export async function fetchBlogBySlug(slug){
  const res = await api.get(`/blog/${slug}/`)
  return res.data
}

export async function createBlog(data){
  // data: { title, excerpt, body, cover (file), tags, products }
  const form = new FormData()
  form.append('title', data.title)
  if(data.excerpt) form.append('excerpt', data.excerpt)
  if(data.body) form.append('body', data.body)
  if(data.cover) form.append('cover', data.cover)
  if(data.tags) {
    if(Array.isArray(data.tags)) {
      data.tags.forEach(tag => form.append('tags', tag))
    } else if(typeof data.tags === 'string') {
      data.tags.split(',').map(t => t.trim()).forEach(tag => form.append('tags', tag))
    }
  }
  if(data.products && Array.isArray(data.products)) {
    data.products.forEach(id => form.append('products', id))
  }
  const res = await api.post('/blog/', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  return res.data
}

export async function updateBlog(id, data){
  // id should be slug (backend uses lookup_field='slug' for reads but numeric id for writes)
  // For updates, use numeric id if available, otherwise use slug
  const form = new FormData()
  if(data.title) form.append('title', data.title)
  if(data.excerpt !== undefined) form.append('excerpt', data.excerpt)
  if(data.body !== undefined) form.append('body', data.body)
  if(data.cover) form.append('cover', data.cover)
  if(data.tags) {
    if(Array.isArray(data.tags)) {
      data.tags.forEach(tag => form.append('tags', tag))
    } else if(typeof data.tags === 'string') {
      data.tags.split(',').map(t => t.trim()).forEach(tag => form.append('tags', tag))
    }
  }
  if(data.products && Array.isArray(data.products)) {
    data.products.forEach(pid => form.append('products', pid))
  }
  const res = await api.patch(`/blog/${id}/`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
  return res.data
}

export async function deleteBlog(id){
  const res = await api.delete(`/blog/${id}/`)
  return res.data
}

export async function fetchAllReviews(){
  // Fetch all reviews including unpublished (for admin)
  const res = await api.get('/reviews/')
  if(Array.isArray(res.data)) {
    return { results: res.data, next: null, previous: null }
  }
  if(res.data && res.data.results) {
    return res.data
  }
  return { results: res.data || [], next: null, previous: null }
}

export async function updateReview(id, data){
  // data: { name, rating, message, product, is_published }
  const res = await api.patch(`/reviews/${id}/`, data)
  return res.data
}

export async function deleteReview(id){
  const res = await api.delete(`/reviews/${id}/`)
  return res.data
}

export async function fetchProducts(){
  const res = await api.get('/products/')
  if(res.data && res.data.results) return res.data
  return { results: res.data || [], next: null, previous: null }
}

export async function createDonationSession(amount_cents, metadata={}){
  // amount_cents: integer (e.g., 500 for $5.00)
  const payload = { amount_cents, metadata }
  const res = await api.post('/donate/create-session/', payload)
  return res.data
}

export async function createProduct(data){
  // data: { title, description, price_cents, file }
  const form = new FormData()
  form.append('title', data.title)
  if(data.description) form.append('description', data.description)
  if(data.price_cents !== undefined) form.append('price_cents', String(data.price_cents))
  if(data.file) form.append('file', data.file)
  if(data.affiliate_url) form.append('affiliate_url', data.affiliate_url)
  if(data.stripe_price_id) form.append('stripe_price_id', data.stripe_price_id)
  const res = await api.post('/products/', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  return res.data
}

export async function deleteProduct(id){
  const res = await api.delete(`/products/${id}/`)
  return res.data
}

export async function purchaseProduct(id){
  const res = await api.post(`/products/${id}/purchase/`)
  return res.data
}

export async function updateProduct(id, data){
  // data may contain file => use multipart
  const hasFile = data && data.file
  if(hasFile){
    const form = new FormData()
    if(data.title) form.append('title', data.title)
    if(data.description) form.append('description', data.description)
    if(data.price_cents !== undefined) form.append('price_cents', String(data.price_cents))
    if(data.affiliate_url) form.append('affiliate_url', data.affiliate_url)
    if(data.is_published !== undefined) form.append('is_published', String(data.is_published))
    form.append('file', data.file)
    const res = await api.patch(`/products/${id}/`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
    return res.data
  }
  const res = await api.patch(`/products/${id}/`, data)
  return res.data
}

export async function createPortfolio(data){
  // data: { title, excerpt, body, tags, cover (optional file) }
  // send multipart if includes file
  // normalize tags: accept comma-separated string or array
  let tagsPayload = []
  if(data.tags){
    if(Array.isArray(data.tags)) tagsPayload = data.tags
    else if(typeof data.tags === 'string') tagsPayload = data.tags.split(',').map(t=>t.trim()).filter(Boolean)
  }
  if(data.cover){
    const form = new FormData()
    form.append('title', data.title)
    form.append('excerpt', data.excerpt)
    form.append('body', data.body)
    // append tags as repeated fields
    tagsPayload.forEach(t => form.append('tags', t))
    form.append('cover', data.cover)
    const res = await api.post('/portfolio/', form, { headers: { 'Content-Type': 'multipart/form-data' } })
    return res.data
  }
  const payload = { ...data, tags: tagsPayload }
  const res = await api.post('/portfolio/', payload)
  return res.data
}

export async function uploadFile(file, portfolio_id=null){
  const form = new FormData()
  form.append('file', file)
  if(portfolio_id) form.append('portfolio_id', portfolio_id)
  const res = await api.post('/upload/', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  return res.data
}

/* Services API */
export async function fetchServices(){
  // Fetch all services - backend has pagination disabled for services endpoint
  const res = await api.get('/services/')
  // Services endpoint returns all results without pagination
  if(Array.isArray(res.data)) return { results: res.data, next: null, previous: null }
  // Fallback for paginated response
  if(res.data && res.data.results) return res.data
  return { results: res.data || [], next: null, previous: null }
}

export async function createService(data){
  const res = await api.post('/services/', data)
  return res.data
}

export async function updateService(id, data){
  const res = await api.patch(`/services/${id}/`, data)
  return res.data
}

export async function deleteService(id){
  const res = await api.delete(`/services/${id}/`)
  return res.data
}

/* Skills API */
export async function fetchSkills(){
  const res = await api.get('/skills/')
  if(res.data && res.data.results) return res.data
  return { results: res.data || [], next: null, previous: null }
}

export async function createSkill(data){
  const res = await api.post('/skills/', data)
  return res.data
}

export async function updateSkill(id, data){
  const res = await api.patch(`/skills/${id}/`, data)
  return res.data
}

export async function deleteSkill(id){
  const res = await api.delete(`/skills/${id}/`)
  return res.data
}

/* CV API */
export async function fetchCV(){
  const res = await api.get('/cv/')
  if(res.data && res.data.results) return res.data.results[0] || null
  return res.data[0] || null
}

export async function createCV(data){
  const form = new FormData()
  form.append('file', data.file)
  if(data.title) form.append('title', data.title)
  if(data.is_active !== undefined) form.append('is_active', data.is_active)
  // Don't set Content-Type manually - let axios set it with boundary for FormData
  // This ensures Authorization header is preserved
  const res = await api.post('/cv/', form)
  return res.data
}

export async function updateCV(id, data){
  const form = new FormData()
  if(data.file) form.append('file', data.file)
  if(data.title) form.append('title', data.title)
  if(data.is_active !== undefined) form.append('is_active', data.is_active)
  // Don't set Content-Type manually - let axios set it with boundary for FormData
  // This ensures Authorization header is preserved
  const res = await api.patch(`/cv/${id}/`, form)
  return res.data
}

export async function deleteCV(id){
  const res = await api.delete(`/cv/${id}/`)
  return res.data
}

/* Certifications API */
export async function fetchCertifications(){
  const res = await api.get('/certifications/')
  if(res.data && res.data.results) return res.data
  return { results: res.data || [], next: null, previous: null }
}

export async function createCertification(data){
  const form = new FormData()
  form.append('file', data.file)
  form.append('title', data.title)
  if(data.issuer) form.append('issuer', data.issuer)
  if(data.issue_date) form.append('issue_date', data.issue_date)
  if(data.expiry_date) form.append('expiry_date', data.expiry_date)
  if(data.is_published !== undefined) form.append('is_published', data.is_published)
  if(data.order !== undefined) form.append('order', data.order)
  // Don't set Content-Type manually - let axios set it with boundary for FormData
  // This ensures Authorization header is preserved
  const res = await api.post('/certifications/', form)
  return res.data
}

export async function updateCertification(id, data){
  const form = new FormData()
  if(data.file) form.append('file', data.file)
  if(data.title) form.append('title', data.title)
  if(data.issuer) form.append('issuer', data.issuer)
  if(data.issue_date) form.append('issue_date', data.issue_date)
  if(data.expiry_date) form.append('expiry_date', data.expiry_date)
  if(data.is_published !== undefined) form.append('is_published', data.is_published)
  if(data.order !== undefined) form.append('order', data.order)
  // Don't set Content-Type manually - let axios set it with boundary for FormData
  // This ensures Authorization header is preserved
  const res = await api.patch(`/certifications/${id}/`, form)
  return res.data
}

export async function deleteCertification(id){
  const res = await api.delete(`/certifications/${id}/`)
  return res.data
}

/* About Page API */
export async function fetchAbout(){
  const res = await api.get('/about/')
  if(res.data && res.data.results) return res.data.results[0] || null
  return res.data[0] || null
}

export async function createAbout(data){
  const form = new FormData()
  form.append('name', data.name)
  form.append('title', data.title)
  if(data.profile_image) form.append('profile_image', data.profile_image)
  form.append('bio', data.bio)
  if(data.long_description) form.append('long_description', data.long_description)
  if(data.location) form.append('location', data.location)
  if(data.email) form.append('email', data.email)
  if(data.website) form.append('website', data.website)
  if(data.linkedin_url) form.append('linkedin_url', data.linkedin_url)
  if(data.github_url) form.append('github_url', data.github_url)
  if(data.twitter_url) form.append('twitter_url', data.twitter_url)
  if(data.resume_url) form.append('resume_url', data.resume_url)
  form.append('is_published', String(data.is_published))
  const res = await api.post('/about/', form)
  return res.data
}

export async function updateAbout(id, data){
  const form = new FormData()
  if(data.name) form.append('name', data.name)
  if(data.title) form.append('title', data.title)
  if(data.profile_image) form.append('profile_image', data.profile_image)
  if(data.bio) form.append('bio', data.bio)
  if(data.long_description !== undefined) form.append('long_description', data.long_description)
  if(data.location !== undefined) form.append('location', data.location)
  if(data.email !== undefined) form.append('email', data.email)
  if(data.website !== undefined) form.append('website', data.website)
  if(data.linkedin_url !== undefined) form.append('linkedin_url', data.linkedin_url)
  if(data.github_url !== undefined) form.append('github_url', data.github_url)
  if(data.twitter_url !== undefined) form.append('twitter_url', data.twitter_url)
  if(data.resume_url !== undefined) form.append('resume_url', data.resume_url)
  if(data.is_published !== undefined) form.append('is_published', String(data.is_published))
  const res = await api.patch(`/about/${id}/`, form)
  return res.data
}

/* Hero Section API */
export async function fetchHero(){
  const res = await api.get('/hero/')
  if(res.data && res.data.results) return res.data.results[0] || null
  return res.data[0] || null
}

export async function createHero(data){
  const form = new FormData()
  form.append('greeting', data.greeting)
  form.append('typing_prefix', data.typing_prefix)
  form.append('typing_strings', data.typing_strings)
  form.append('main_title', data.main_title)
  form.append('button1_text', data.button1_text)
  form.append('button1_link', data.button1_link)
  form.append('button2_text', data.button2_text)
  form.append('button2_link', data.button2_link)
  if(data.background_video) form.append('background_video', data.background_video)
  if(data.background_image) form.append('background_image', data.background_image)
  if(data.scroll_text) form.append('scroll_text', data.scroll_text)
  form.append('is_published', String(data.is_published))
  const res = await api.post('/hero/', form)
  return res.data
}

export async function updateHero(id, data){
  const form = new FormData()
  if(data.greeting !== undefined) form.append('greeting', data.greeting)
  if(data.typing_prefix !== undefined) form.append('typing_prefix', data.typing_prefix)
  if(data.typing_strings !== undefined) form.append('typing_strings', data.typing_strings)
  if(data.main_title !== undefined) form.append('main_title', data.main_title)
  if(data.button1_text !== undefined) form.append('button1_text', data.button1_text)
  if(data.button1_link !== undefined) form.append('button1_link', data.button1_link)
  if(data.button2_text !== undefined) form.append('button2_text', data.button2_text)
  if(data.button2_link !== undefined) form.append('button2_link', data.button2_link)
  if(data.background_video) form.append('background_video', data.background_video)
  if(data.background_image) form.append('background_image', data.background_image)
  if(data.scroll_text !== undefined) form.append('scroll_text', data.scroll_text)
  if(data.is_published !== undefined) form.append('is_published', String(data.is_published))
  const res = await api.patch(`/hero/${id}/`, form)
  return res.data
}

// Donation Info API
export async function fetchDonationInfo(){
  const res = await api.get('/donation-info/')
  return res.data.results?.[0] || null
}

export async function createDonationInfo(data){
  const res = await api.post('/donation-info/', data)
  return res.data
}

export async function updateDonationInfo(id, data){
  const res = await api.patch(`/donation-info/${id}/`, data)
  return res.data
}

// Bank Details API
export async function fetchBankDetails(){
  const res = await api.get('/bank-details/')
  return res.data.results || []
}

export async function createBankDetail(data){
  const res = await api.post('/bank-details/', data)
  return res.data
}

export async function updateBankDetail(id, data){
  const res = await api.patch(`/bank-details/${id}/`, data)
  return res.data
}

export async function deleteBankDetail(id){
  const res = await api.delete(`/bank-details/${id}/`)
  return res.data
}

// Gift Cards API
export async function fetchGiftCards(){
  const res = await api.get('/gift-cards/')
  return res.data.results || []
}

export async function createGiftCard(data){
  // If data is already FormData, use it directly
  if (data instanceof FormData) {
    const res = await api.post('/gift-cards/', data)
    return res.data
  }
  // Otherwise, create FormData from object
  const form = new FormData()
  for (const key in data) {
    if (data[key] !== null && data[key] !== undefined) {
      if (key === 'card_image' && data[key] instanceof File) {
        form.append(key, data[key])
      } else if (key !== 'card_image') {
        form.append(key, data[key])
      }
    }
  }
  const res = await api.post('/gift-cards/', form)
  return res.data
}

export async function deleteGiftCard(id){
  const res = await api.delete(`/gift-cards/${id}/`)
  return res.data
}

export async function updateGiftCard(id, data){
  const form = new FormData()
  for (const key in data) {
    if (data[key] !== null && data[key] !== undefined) {
      if (key === 'card_image' && data[key] instanceof File) {
        form.append(key, data[key])
      } else if (key !== 'card_image') {
        form.append(key, data[key])
      }
    }
  }
  const res = await api.patch(`/gift-cards/${id}/`, form)
  return res.data
}

export default api
