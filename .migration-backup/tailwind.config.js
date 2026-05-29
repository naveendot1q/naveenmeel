/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        body: ['DM Sans', 'sans-serif'],
      },
      colors: {
        brand: {
          orange: '#FF6B1A',
          'orange-light': '#FF8C42',
          blue: '#00D4FF',
          green: '#00FF88',
        },
        gh: {
          bg: '#0d1117',
          surface: '#161b22',
          surface2: '#21262d',
          border: '#30363d',
          border2: '#21262d',
          text: '#e6edf3',
          muted: '#8b949e',
          accent: '#58a6ff',
        }
      },
    },
  },
  plugins: [],
}
