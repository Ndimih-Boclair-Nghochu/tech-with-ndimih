// Intersection Observer for fade-in animations on scroll
export function initScrollAnimations() {
  const elements = document.querySelectorAll('[class*="animate-fade-in"]')
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1'
        entry.target.style.transform = 'translateY(0)'
        observer.unobserve(entry.target)
      }
    })
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  })

  elements.forEach(element => {
    observer.observe(element)
  })

  return observer
}

// Smooth scroll on anchor clicks
export function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href')
      if (href === '#') return
      
      e.preventDefault()
      const target = document.querySelector(href)
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }
    })
  })
}

// Parallax effect on mouse move
export function initParallaxEffect() {
  const parallaxElements = document.querySelectorAll('[data-parallax]')
  
  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth) * 100
    const y = (e.clientY / window.innerHeight) * 100
    
    parallaxElements.forEach(el => {
      const speed = el.dataset.parallax || '5'
      el.style.transform = `translate(${(x - 50) * speed / 100}px, ${(y - 50) * speed / 100}px)`
    })
  })
}
