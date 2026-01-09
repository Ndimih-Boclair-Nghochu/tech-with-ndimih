import { useEffect, useRef, useState } from 'react'

/**
 * Hook for scroll-triggered animations
 * Triggers animations when elements come into view
 */
export function useScrollAnimation(options = {}) {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          // Optionally unobserve after first trigger
          if (options.triggerOnce) {
            observer.unobserve(element)
          }
        } else if (!options.triggerOnce) {
          setIsVisible(false)
        }
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '0px 0px -100px 0px',
        ...options.observerOptions
      }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [options])

  return { ref, isVisible }
}

/**
 * Hook for parallax scroll effect
 */
export function useParallax(speed = 0.5) {
  const ref = useRef(null)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return
      const element = ref.current
      const elementTop = element.getBoundingClientRect().top
      const windowHeight = window.innerHeight
      
      // Only apply parallax when element is visible
      if (elementTop < windowHeight && elementTop > -element.offsetHeight) {
        const newOffset = (windowHeight - elementTop) * speed
        setOffset(newOffset)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [speed])

  return { ref, offset }
}
