/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Palette legacy galerie (on garde pour ne pas casser)
        brown: '#3C1F0F',
        sage: '#71805C',
        beige: '#C8B1A0',
      },
      fontFamily: {
        lora: ['Lora', 'serif'],
        inter: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        card: 'var(--radius-card)',
        'card-sm': 'var(--radius-card-sm)',
        button: 'var(--radius-button)',
        icon: 'var(--radius-icon)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        nav: 'var(--shadow-nav)',
        button: 'var(--shadow-button)',
      },
    },
  },
  plugins: [],
}