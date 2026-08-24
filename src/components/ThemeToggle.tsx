import { useColorMode } from '#/theme'

export function ThemeToggle() {
  const { mode, setColorMode } = useColorMode()

  return (
    <div className="theme-toggle" role="group" aria-label="Color mode">
      <button
        type="button"
        className={mode === 'dark' ? 'is-active' : undefined}
        aria-pressed={mode === 'dark'}
        onClick={() => setColorMode('dark')}
      >
        Dark
      </button>
      <button
        type="button"
        className={mode === 'light' ? 'is-active' : undefined}
        aria-pressed={mode === 'light'}
        onClick={() => setColorMode('light')}
      >
        Light
      </button>
    </div>
  )
}
