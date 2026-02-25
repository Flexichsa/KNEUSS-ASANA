import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        asana: {
          coral: '#F06A6A',
          'coral-hover': '#E05555',
          sidebar: '#1E1F21',
          'sidebar-hover': '#2E2E30',
          'sidebar-text': '#A2A0A2',
          'sidebar-active': '#FFFFFF',
          bg: '#FFFFFF',
          'bg-secondary': '#F6F8F9',
          'text-primary': '#1E1F21',
          'text-secondary': '#6D6E6F',
          border: '#E8ECEE',
          link: '#4573D2',
          success: '#36B37E',
          warning: '#FFC107',
          danger: '#E8384F',
          'project-red': '#E8384F',
          'project-orange': '#FD9A00',
          'project-yellow': '#EEC300',
          'project-green': '#4ECBC4',
          'project-blue': '#4573D2',
          'project-purple': '#AA62E3',
          'project-pink': '#F06A6A',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'xxs': '11px',
      },
    },
  },
  plugins: [],
}
export default config
