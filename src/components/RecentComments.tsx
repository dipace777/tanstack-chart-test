import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  PLATFORM_NAMES,
  getPlatformAccent,
  type PlatformName,
} from '#/charts/direct-engagement'
import { RECENT_COMMENTS } from '#/data/recent-comments'
import { useColorMode } from '#/theme'

type PlatformFilter = 'all' | PlatformName

function initials(name: string) {
  const parts = name.replace('@', '').split(/[\s.]+/).filter(Boolean)
  const first = parts[0]?.[0] ?? '?'
  const second = parts.length > 1 ? parts[1]![0] : (parts[0]?.[1] ?? '')
  return (first + second).toUpperCase()
}

export function RecentComments() {
  const { mode } = useColorMode()
  const [filter, setFilter] = useState<PlatformFilter>('all')
  const listRef = useRef<HTMLUListElement>(null)
  const [edges, setEdges] = useState({ top: false, bottom: false })

  const comments = useMemo(() => {
    if (filter === 'all') return RECENT_COMMENTS
    return RECENT_COMMENTS.filter((comment) => comment.platform === filter)
  }, [filter])

  const syncEdges = useCallback(() => {
    const node = listRef.current
    if (!node) {
      setEdges({ top: false, bottom: false })
      return
    }

    const top = node.scrollTop > 8
    const bottom = node.scrollTop + node.clientHeight < node.scrollHeight - 8
    setEdges((current) =>
      current.top === top && current.bottom === bottom
        ? current
        : { top, bottom },
    )
  }, [])

  useEffect(() => {
    const node = listRef.current
    if (!node) return

    syncEdges()
    const observer = new ResizeObserver(syncEdges)
    observer.observe(node)
    return () => observer.disconnect()
  }, [comments, syncEdges])

  return (
    <section className="activity-card">
      <header className="activity-header">
        <div>
          <p className="engagement-kicker">Recent comments</p>
          <h2 className="activity-title">Activity</h2>
        </div>
        <p className="activity-count">
          {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
        </p>
      </header>

      <div
        className="activity-filters"
        role="group"
        aria-label="Filter comments by platform"
      >
        <button
          type="button"
          className={filter === 'all' ? 'is-active' : undefined}
          aria-pressed={filter === 'all'}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        {PLATFORM_NAMES.map((platform) => (
          <button
            key={platform}
            type="button"
            className={filter === platform ? 'is-active' : undefined}
            aria-pressed={filter === platform}
            onClick={() => setFilter(platform)}
          >
            <span
              className="engagement-axis-dot"
              style={{ background: getPlatformAccent(mode, platform) }}
            />
            {platform}
          </button>
        ))}
      </div>

      {comments.length === 0 ? (
        <p className="activity-empty">No recent comments on {filter}.</p>
      ) : (
        <div className="activity-scroller">
          <ul
            ref={listRef}
            className="activity-list"
            onScroll={syncEdges}
          >
            {comments.map((comment) => {
              const accent = getPlatformAccent(mode, comment.platform)
              return (
                <li key={comment.id} className="activity-item">
                  <span
                    className="activity-avatar"
                    style={{ background: accent }}
                    aria-hidden="true"
                  >
                    {initials(comment.author)}
                  </span>
                  <div className="activity-body">
                    <div className="activity-meta">
                      <strong>{comment.author}</strong>
                      <span className="activity-handle">{comment.handle}</span>
                      <span
                        className="activity-platform"
                        style={{ color: accent }}
                      >
                        {comment.platform}
                      </span>
                      <time>{comment.timeLabel}</time>
                    </div>
                    <p>{comment.body}</p>
                    <p className="activity-context">on {comment.context}</p>
                  </div>
                </li>
              )
            })}
          </ul>
          <div
            className={
              edges.top ? 'activity-fade activity-fade-top is-visible' : 'activity-fade activity-fade-top'
            }
            aria-hidden="true"
          />
          <div
            className={
              edges.bottom
                ? 'activity-fade activity-fade-bottom is-visible'
                : 'activity-fade activity-fade-bottom'
            }
            aria-hidden="true"
          />
        </div>
      )}
    </section>
  )
}
