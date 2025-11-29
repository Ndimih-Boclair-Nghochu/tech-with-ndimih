import React, { useEffect, useRef, useState } from 'react'
import { fetchHero } from '../lib/api'
import heroVideo from '../assets/HERO.mp4'
import logo from '../assets/logo-cloud.svg'

// Fallback strings if API fails
const FALLBACK_STRINGS = ["Cloud Engineer", "Web Developer", "Graphics & Logo Designer"]

export default function HeroCloud(){
  const [hero, setHero] = useState(null)
  const [i, setI] = useState(0)
  const [sub, setSub] = useState('')
  const [typing, setTyping] = useState(true)
  const idxRef = useRef(0)
  const letterRef = useRef(0)

  // Fetch hero content from API
  useEffect(() => {
    let mounted = true
    fetchHero()
      .then(data => {
        if (mounted && data) {
          setHero(data)
        }
      })
      .catch(err => {
        console.error('Error loading hero:', err)
        // Use fallback if API fails
        if (mounted) {
          setHero({
            greeting: 'Hi — I design & operate cloud-first apps',
            typing_prefix: 'I am',
            typing_strings_list: FALLBACK_STRINGS,
            main_title: 'Building Cloud-Powered Digital Experiences That Scale',
            button1_text: 'Hire me',
            button1_link: '#contact',
            button2_text: 'View portfolio',
            button2_link: '/portfolio',
            scroll_text: 'Scroll to explore',
            background_video_url: null,
            background_image_url: null
          })
        }
      })
    return () => { mounted = false }
  }, [])

  // Typing animation effect
  useEffect(() => {
    if (!hero) return
    
    let mounted = true
    const strings = hero.typing_strings_list || FALLBACK_STRINGS
    
    function tick(){
      const current = strings[idxRef.current]
      if (!current) return
      
      if(typing){
        if(letterRef.current < current.length){
          letterRef.current += 1
          setSub(current.slice(0, letterRef.current))
        }else{
          setTyping(false)
          setTimeout(() => { if(mounted) setTyping(false) }, 500)
        }
      }else{
        // pause then delete
        setTimeout(() => {
          if(letterRef.current > 0){
            letterRef.current -= 1
            setSub(current.slice(0, letterRef.current))
          }else{
            idxRef.current = (idxRef.current + 1) % strings.length
            setTyping(true)
          }
        }, 80)
      }
    }
    const t = setInterval(tick, typing ? 80 : 120)
    return () => { mounted = false; clearInterval(t) }
  }, [typing, hero])

  // Use hero data or fallbacks
  const greeting = hero?.greeting || 'Hi — I design & operate cloud-first apps'
  const typingPrefix = hero?.typing_prefix || 'I am'
  const mainTitle = hero?.main_title || 'Building Cloud-Powered Digital Experiences That Scale'
  const button1Text = hero?.button1_text || 'Hire me'
  const button1Link = hero?.button1_link || '#contact'
  const button2Text = hero?.button2_text || 'View portfolio'
  const button2Link = hero?.button2_link || '/portfolio'
  const scrollText = hero?.scroll_text || 'Scroll to explore'
  const backgroundVideoUrl = hero?.background_video_url
  const backgroundImageUrl = hero?.background_image_url

  // Determine background media
  const hasVideo = backgroundVideoUrl || heroVideo
  const videoSrc = backgroundVideoUrl || heroVideo

  return (
    <header className="relative w-full min-h-[70vh] md:h-screen text-white hero-wrapper" aria-label="Hero">
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/30 z-10" />
      <div className="absolute inset-0 overflow-hidden">
        {hasVideo ? (
          <video 
            className="w-full h-full object-cover hero-video" 
            autoPlay 
            muted 
            loop 
            playsInline 
            poster={backgroundImageUrl || logo} 
            aria-hidden
          >
            <source src={videoSrc} type="video/mp4" />
            {backgroundImageUrl && (
              <img src={backgroundImageUrl} alt="" className="w-full h-full object-cover" />
            )}
          </video>
        ) : backgroundImageUrl ? (
          <img 
            src={backgroundImageUrl} 
            alt="" 
            className="w-full h-full object-cover hero-video"
            style={{objectFit: 'cover'}}
          />
        ) : (
          <video 
            className="w-full h-full object-cover hero-video" 
            autoPlay 
            muted 
            loop 
            playsInline 
            poster={logo} 
            aria-hidden
          >
            <source src={heroVideo} type="video/mp4" />
          </video>
        )}
      </div>

      <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 h-full flex items-center justify-center">
        <div className="w-full md:w-3/4 text-center flex flex-col items-center justify-center">
          <p className="text-xs sm:text-sm text-gray-300 mb-2 text-center w-full">{greeting}</p>
          <div className="text-base sm:text-lg md:text-xl font-medium text-gray-200 mb-3 text-center w-full flex items-center justify-center">
            <span className="mr-2 opacity-80">{typingPrefix}</span>
            <span className="typewriter-cursor text-amber-50" aria-live="polite">{sub}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mx-auto max-w-3xl px-2 text-center" style={{color:'white'}}>
            {mainTitle}
          </h1>

          <div className="mt-6 flex flex-wrap justify-center items-center gap-3 px-4 w-full">
            <a 
              href={button1Link} 
              className="hero-cta glow-on-hover inline-flex items-center gap-2 text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3" 
              style={{backdropFilter:'blur(8px)'}}
            >
              {button1Text}
            </a>
            <a 
              href={button2Link} 
              className="hero-cta secondary glow-on-hover inline-flex items-center gap-2 text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
            >
              {button2Text}
            </a>
          </div>
        </div>
      </div>

      {scrollText && (
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-20 text-xs sm:text-sm text-gray-300">
          {scrollText}
        </div>
      )}
    </header>
  )
}
