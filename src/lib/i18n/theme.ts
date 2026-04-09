import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark' | 'system'

interface ThemeStore {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
}

export const useTheme = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'system',
      resolvedTheme: 'light',

      setTheme: (theme) => {
        set({ theme })

        // Apply theme to document
        const root = document.documentElement
        root.classList.remove('light', 'dark')

        if (theme === 'system') {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          root.classList.add(prefersDark ? 'dark' : 'light')
          set({ resolvedTheme: prefersDark ? 'dark' : 'light' })
        } else {
          root.classList.add(theme)
          set({ resolvedTheme: theme })
        }
      },
    }),
    {
      name: 'tshirt-theme',
    }
  )
)

// Initialize theme on module load (runs in browser)
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('tshirt-theme')
  let theme: Theme = 'system'

  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      theme = parsed.state?.theme ?? 'system'
    } catch {}
  }

  const root = document.documentElement
  root.classList.remove('light', 'dark')

  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    root.classList.add(prefersDark ? 'dark' : 'light')

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      const store = useTheme.getState()
      if (store.theme === 'system') {
        root.classList.remove('light', 'dark')
        root.classList.add(e.matches ? 'dark' : 'light')
        useTheme.setState({ resolvedTheme: e.matches ? 'dark' : 'light' })
      }
    })
  } else {
    root.classList.add(theme)
  }
}
