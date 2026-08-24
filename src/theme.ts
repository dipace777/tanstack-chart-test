import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { ColorMode } from '#/charts/direct-engagement'

export const THEME_STORAGE_KEY = 'engagement-theme'

export const themeBootScript = `(function(){try{var stored=window.localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});var theme=stored==='light'||stored==='dark'?stored:(window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');document.documentElement.dataset.theme=theme;document.documentElement.style.colorScheme=theme;}catch(e){document.documentElement.dataset.theme='dark'}})();`

function readColorMode(): ColorMode {
  if (typeof document === 'undefined') return 'dark'
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
}

interface ColorModeContextValue {
  mode: ColorMode
  setColorMode: (mode: ColorMode) => void
}

const ColorModeContext = createContext<ColorModeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ColorMode>(readColorMode)

  useEffect(() => {
    document.documentElement.dataset.theme = mode
    document.documentElement.style.colorScheme = mode
    window.localStorage.setItem(THEME_STORAGE_KEY, mode)
  }, [mode])

  const setColorMode = useCallback((next: ColorMode) => {
    setMode(next)
  }, [])

  const value = useMemo(
    () => ({ mode, setColorMode }),
    [mode, setColorMode],
  )

  return createElement(ColorModeContext.Provider, { value }, children)
}

export function useColorMode() {
  const context = useContext(ColorModeContext)
  if (!context) {
    throw new Error('useColorMode must be used within ThemeProvider')
  }
  return context
}
