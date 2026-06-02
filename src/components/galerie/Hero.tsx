'use client'

import { ChevronDown } from 'lucide-react'

export default function Hero() {
  const scrollToGallery = () => {
    document.getElementById('galerie')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center px-4">
      <div className="text-center max-w-3xl">
        <p className="text-xs text-stone-800 mb-12 tracking-wide">
          Galerie créée par CAMORIA MEMORIES
        </p>
        <h1 className="font-serif text-4xl md:text-5xl text-stone-800 mb-10 tracking-tight">
          Le Mariage de
        </h1>
        <h2 className="font-serif text-5xl md:text-7xl uppercase leading-none" style={{ color: '#4e5941' }}>
          Aurore
          <span className="block text-2xl md:text-3xl my-0">&</span>
          Laurent
        </h2>
        <div className="flex flex-col items-center mt-8">
          <div className="w-16 h-px bg-stone-800 mb-4" />
          <p className="text-base text-stone-800 italic">20 Décembre 2025</p>
        </div>
        <button onClick={scrollToGallery} className="group inline-flex flex-col items-center mt-16">
          <div className="w-12 h-12 border-2 border-stone-300 rounded-full flex items-center justify-center group-hover:border-stone-400 transition-colors animate-bounce">
            <ChevronDown className="w-6 h-6 text-stone-600" />
          </div>
        </button>
      </div>
    </section>
  )
}