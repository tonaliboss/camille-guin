'use client'

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'

const sections = [
  { id: 'galerie', label: 'Galerie' },
  { id: 'livre-or', label: "Livre d'or" },
  { id: 'voeux-audio', label: 'Messages audio' },
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
    <div className="px-5 -mt-8 z-40 sticky top-0 pt-2 pb-4">
      <nav
        className="bg-white/95 backdrop-blur-xl border border-stone-100/80 shadow-[0_4px_24px_rgb(0,0,0,0.06)] rounded-full flex overflow-x-auto px-6 py-4 justify-center items-center gap-8"
        style={{ scrollbarWidth: 'none' }}
      >
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            className={`relative flex flex-col items-center text-[12px] font-['Inter'] tracking-[0.05em] leading-4 transition-colors duration-300 ${
              activeSection === section.id ? 'text-black' : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            {section.label}
            {activeSection === section.id && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-[3px] h-[3px] bg-black rounded-full"
              />
            )}
          </button>
        ))}
      </nav>
    </div>
  )
}