/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        aero: {
          bg: '#070b14',
          panel: '#0d1527',
          card: '#111c33',
          border: '#1f2e4d',
          accent: '#00f0ff',
          muted: '#64748b',
          text: '#f1f5f9',
          green: '#00e676',
          amber: '#ffab00',
          red: '#ff1744',
          cyan: '#00f0ff',
          blue: '#2979ff',
          purple: '#b388ff'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Roboto Mono', 'Fira Code', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'radar-sweep': 'radarSweep 4s linear infinite',
      },
      keyframes: {
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}
