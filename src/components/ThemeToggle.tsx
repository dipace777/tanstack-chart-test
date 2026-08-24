import { useColorMode } from '#/theme'

export function ThemeToggle() {
  const { mode, setColorMode } = useColorMode()

  return (
    <div className="theme-toggle" role="group" aria-label="Color mode">
      <button
        type="button"
        className={mode === 'dark' ? 'is-active' : undefined}
        aria-pressed={mode === 'dark'}
        aria-label="Dark mode"
        onClick={() => setColorMode('dark')}
      >
        <MoonIcon />
        Dark
      </button>
      <button
        type="button"
        className={mode === 'light' ? 'is-active' : undefined}
        aria-pressed={mode === 'light'}
        aria-label="Light mode"
        onClick={() => setColorMode('light')}
      >
        <SunIcon />
        Light
      </button>
    </div>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
      <path
        fill="currentColor"
        d="M13.6 9.3A6 6 0 0 1 6.7 2.4 6.2 6.2 0 1 0 13.6 9.3Z"
      />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
      <path
        fill="currentColor"
        d="M8 11.2A3.2 3.2 0 1 0 8 4.8a3.2 3.2 0 0 0 0 6.4ZM8 1.2a.8.8 0 0 1 .8.8v1.2a.8.8 0 0 1-1.6 0V2a.8.8 0 0 1 .8-.8Zm0 11.6a.8.8 0 0 1 .8.8V15a.8.8 0 0 1-1.6 0v-1.4a.8.8 0 0 1 .8-.8Zm6.8-5.8a.8.8 0 0 1-.8.8h-1.2a.8.8 0 0 1 0-1.6H14a.8.8 0 0 1 .8.8ZM3.2 8a.8.8 0 0 1-.8.8H1a.8.8 0 0 1 0-1.6h1.4a.8.8 0 0 1 .8.8Zm9.3 4.5a.8.8 0 0 1 0 1.1l-1 1a.8.8 0 0 1-1.1-1.1l1-1a.8.8 0 0 1 1.1 0ZM5.6 2.4a.8.8 0 0 1 0 1.1l-1 1A.8.8 0 1 1 3.5 3.4l1-1a.8.8 0 0 1 1.1 0Zm0 9.1-1 1a.8.8 0 0 1-1.1-1.1l1-1a.8.8 0 1 1 1.1 1.1Zm6.8-8-1 1a.8.8 0 1 1-1.1-1.1l1-1a.8.8 0 0 1 1.1 1.1Z"
      />
    </svg>
  )
}
