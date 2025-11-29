import React, { useEffect, useState } from 'react'
import SkillsBar from '../components/SkillsBar'
import { fetchSkills } from '../lib/api'
import '../styles/Skills.css'

export default function Skills(){
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    fetchSkills()
      .then(data => {
        if (!mounted) return
        const skillsData = Array.isArray(data) ? data : (data.results || [])
        // Filter only published skills and sort by order
        const published = skillsData
          .filter(s => s.is_published !== false)
          .sort((a, b) => (a.order || 0) - (b.order || 0))
        setSkills(published)
      })
      .catch(() => {
        // Fallback to default skills if API fails
        if (mounted) {
          setSkills([
            { name: 'React', proficiency: 90 },
            { name: 'Django', proficiency: 85 },
            { name: 'AWS', proficiency: 80 },
            { name: 'Design', proficiency: 75 }
          ])
        }
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => { mounted = false }
  }, [])

  return (
    <div className="skills-page bg-[linear-gradient(180deg,#071225,rgba(10,15,31,0.95))] min-h-screen text-white">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold gradient-accent mb-3">Skills</h1>
          <p className="text-base sm:text-lg muted">Technology stack and expertise</p>
        </div>
        {loading ? (
          <div className="text-center py-12">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-300">Loading skills...</p>
          </div>
        ) : skills.length === 0 ? (
          <div className="text-center text-gray-400 py-12">No skills available</div>
        ) : (
          <div className="mt-6 max-w-2xl mx-auto skills-grid">
            {skills.map(s => (
              <SkillsBar 
                key={s.id || s.name} 
                skill={s.name} 
                percent={s.proficiency || 0} 
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
