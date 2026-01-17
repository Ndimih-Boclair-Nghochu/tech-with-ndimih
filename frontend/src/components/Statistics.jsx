import React, { useEffect, useRef, useState } from 'react';
import { useStatistics } from '../hooks/useStatistics';

export default function Statistics() {
  const { stats, loading } = useStatistics();
  const [hasAnimated, setHasAnimated] = useState(false);
  const [displayValues, setDisplayValues] = useState({ projects_for_sale: 0, projects_completed: 0, total_reviews: 0, blog_posts: 0 });
  const sectionRef = useRef(null);

  const handleManualRefresh = () => {
    console.log('🔄 Manual refresh triggered')
    window.dispatchEvent(new Event('data-updated'))
  }

  // Initialize displayValues with actual stats when they load
  useEffect(() => {
    setDisplayValues({
      projects_for_sale: stats.projects_for_sale,
      projects_completed: stats.projects_completed,
      total_reviews: stats.total_reviews,
      blog_posts: stats.blog_posts,
    });
  }, [stats]);

  // Scroll intersection observer for triggering animations
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          // Start counting animation
          animateCounters();
        }
      });
    }, { threshold: 0.2 });

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [hasAnimated]);

  // Counter animation function
  const animateCounters = () => {
    const duration = 1500; // 1.5 seconds
    const start = Date.now();

    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);

      setDisplayValues({
        projects_for_sale: Math.floor(stats.projects_for_sale * progress),
        projects_completed: Math.floor(stats.projects_completed * progress),
        total_reviews: Math.floor(stats.total_reviews * progress),
        blog_posts: Math.floor(stats.blog_posts * progress),
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // When animation completes, set final values
        setDisplayValues({
          projects_for_sale: stats.projects_for_sale,
          projects_completed: stats.projects_completed,
          total_reviews: stats.total_reviews,
          blog_posts: stats.blog_posts,
        });
      }
    };

    animate();
  }

  const statisticItems = [
    {
      icon: '📦',
      label: 'Projects For Sale',
      value: displayValues.projects_for_sale,
      color: 'from-blue-600 to-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      glowColor: 'bg-blue-500/20',
    },
    {
      icon: '✨',
      label: 'Projects Completed',
      value: displayValues.projects_completed,
      color: 'from-purple-600 to-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      glowColor: 'bg-purple-500/20',
    },
    {
      icon: '⭐',
      label: 'Customer Reviews',
      value: displayValues.total_reviews,
      color: 'from-amber-600 to-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      glowColor: 'bg-amber-500/20',
    },
    {
      icon: '📝',
      label: 'Blog Posts',
      value: displayValues.blog_posts,
      color: 'from-emerald-600 to-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      glowColor: 'bg-emerald-500/20',
    },
  ];

  return (
    <section ref={sectionRef} className="relative py-4 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-0 left-1/4 w-32 h-32 bg-blue-500/8 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-purple-500/8 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center mb-4 animate-pop-fade-in-up">
          <div className="inline-block mb-2">
            <div className="px-2 py-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full">
              <p className="text-xs font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                📊 PROVEN RESULTS
              </p>
            </div>
          </div>
          <h2 className="text-lg md:text-xl font-bold mb-1">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Professional Statistics
            </span>
          </h2>
          <p className="text-gray-400 text-xs max-w-2xl mx-auto mb-2">
            Real metrics showcasing my commitment to quality and client success.
          </p>
          <button 
            onClick={handleManualRefresh}
            className="inline-block px-2 py-0.5 text-xs bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded-full text-blue-300 transition-colors"
          >
            ⟲ Refresh Stats
          </button>
        </div>

        {/* Statistics grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          {statisticItems.map((item, index) => (
            <div
              key={index}
              className={`group relative ${hasAnimated ? 'animate-pop-scale' : 'opacity-0'} animate-float`}
              style={{ animationDelay: `${0.1 + index * 0.1}s`, '--float-delay': `${index * 0.3}s` }}
            >
              {/* Animated glow background on hover */}
              <div className={`absolute inset-0 ${item.glowColor} rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

              {/* Card border glow */}
              <div className={`absolute -inset-px bg-gradient-to-r ${item.color} rounded-xl opacity-0 group-hover:opacity-50 blur transition-opacity duration-300`}></div>

              {/* Main card */}
              <div
                className={`relative h-full ${item.bgColor} backdrop-blur-md border ${item.borderColor} rounded-lg p-2 transition-all duration-300 group-hover:border-opacity-100 group-hover:shadow-lg transform group-hover:scale-102 group-hover:-translate-y-0.5`}
              >
                {/* Top accent bar */}
                <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${item.color} rounded-t-lg`}></div>

                {/* Icon */}
                <div className="mb-1 relative">
                  <div className={`w-6 h-6 bg-gradient-to-br ${item.color} rounded flex items-center justify-center text-sm shadow-md transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300`}>
                    {item.icon}
                  </div>
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <div className="mb-1">
                    {loading ? (
                      <div className="h-5 w-8 bg-gray-700 rounded animate-pulse"></div>
                    ) : (
                      <div className="flex items-baseline">
                        <span className={`text-lg font-black bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                          {item.value}
                        </span>
                        <span className="text-xs ml-0.5 text-gray-400">+</span>
                      </div>
                    )}
                  </div>

                  <h3 className="text-xs font-semibold text-white group-hover:text-blue-200 transition-colors duration-300">
                    {item.label}
                  </h3>

                  {/* Subtle decorative line */}
                  <div className={`h-0.5 w-4 bg-gradient-to-r ${item.color} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-1`}></div>
                </div>

                {/* Corner accent */}
                <div className={`absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 rounded-tl-2xl transition-opacity duration-300`}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom accent text */}
        <div className="mt-2 text-center animate-pop-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <p className="text-gray-400 text-xs">
            <span className="text-gray-300 font-semibold">Constantly growing</span> — Updated in real-time
          </p>
        </div>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes pop-scale {
          0% {
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes pop-fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        .animate-pop-scale {
          animation: pop-scale 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          opacity: 0;
        }

        .animate-pop-fade-in-up {
          animation: pop-fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
          animation-delay: var(--float-delay, 0s);
        }
      `}</style>
    </section>
  );
}
