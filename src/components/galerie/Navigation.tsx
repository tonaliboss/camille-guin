'use client'

import { useEffect, useState } from 'react'

const sections = [
  { id: 'galerie', label: 'GALERIE' },
  { id: 'livre-or', label: "LIVRE D'OR" },
  { id: 'voeux-audio', label: 'MESSAGES AUDIOS' },
]

export default function Navigation() {
  const [activeSection, setActiveSection] = useState('galerie')

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 3
      for (const section of sections) {
        const element = document.getElementById(section.id)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id)
            break
          }
        }
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className="sticky top-0 z-[60] bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-center space-x-8 py-4">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`relative py-2 px-4 font-sans text-sm tracking-wider transition-colors ${
                activeSection === section.id ? 'text-stone-800' : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              {section.label}
              {activeSection === section.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-800" />
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}