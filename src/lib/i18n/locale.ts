import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Locale } from './translations'

interface LocaleStore {
  locale: Locale
  setLocale: (locale: Locale) => void
}

export const useLocale = create<LocaleStore>()(
  persist(
    (set) => ({
      locale: 'id',
      setLocale: (locale) => {
        set({ locale })

        // Update html lang attribute
        document.documentElement.lang = locale === 'id' ? 'id' : 'en'
      },
    }),
    {
      name: 'tshirt-locale',
    }
  )
)

// Initialize locale on module load
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('tshirt-locale')
  let locale: Locale = 'id'

  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      locale = parsed.state?.locale ?? 'id'
    } catch {}
  }

  document.documentElement.lang = locale === 'id' ? 'id' : 'en'
}
