import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'neon-cyan': '#0ff',
        'night-black': '#000',
      },
      dropShadow: {
        neon: ['0 0 5px #0ff', '0 0 10px #0ff'],
      },
    },
  },
  plugins: [],
}

export default config
