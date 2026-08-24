import { useCallback, useMemo, useRef, useState } from 'react'
import { Chart } from '@tanstack/charts/react/tooltip'
import type { ChartRenderContext } from '@tanstack/charts'
import {
  BAR_INSET,
  BAR_MAX_THICKNESS,
  CHART_HEIGHT,
  CHART_INITIAL_WIDTH,
  TOTAL_ENGAGEMENT,
  directEngagementChart,
  numberFormat,
  platformTotal,
  platforms,
  type EngagementReaction,
  type PlatformName,
} from '#/charts/direct-engagement'

interface BarAnchor {
  platform: PlatformName
  accent: string
  total: number
  centerX: number
  top: number
  bottom: number
  width: number
  segments: readonly SegmentAnchor[]
}

interface SegmentAnchor {
  row: EngagementReaction
  top: number
  height: number
}

const MIN_CHIP_HEIGHT = 26

function paintedBarWidth(bandwidth: number) {
  return Math.min(Math.max(0, bandwidth - BAR_INSET * 2), BAR_MAX_THICKNESS)
}

function readAnchors(
  context: ChartRenderContext<EngagementReaction, string, number>,
): BarAnchor[] | null {
  const x = context.scene.scales.x
  const y = context.scene.scales.y
  if (!x || !y || x.type === 'none' || y.type === 'none') return null

  const width = paintedBarWidth(x.bandwidth)
  const bottom = y.map(0)
  if (!Number.isFinite(bottom)) return null

  return platforms.map((platform) => {
    const centerX = x.map(platform.platform)
    let cumulative = 0
    const segments = platform.reactions.map((row) => {
      const start = cumulative
      cumulative += row.count
      const top = y.map(cumulative)
      const base = y.map(start)
      return {
        row,
        top,
        height: Math.max(0, base - top),
      }
    })

    return {
      platform: platform.platform,
      accent: platform.accent,
      total: platformTotal(platform),
      centerX,
      top: y.map(cumulative),
      bottom,
      width,
      segments,
    }
  })
}

function sameAnchors(left: readonly BarAnchor[], right: readonly BarAnchor[]) {
  if (left.length !== right.length) return false
  return left.every((anchor, index) => {
    const other = right[index]
    return (
      other !== undefined &&
      anchor.platform === other.platform &&
      Math.round(anchor.centerX) === Math.round(other.centerX) &&
      Math.round(anchor.top) === Math.round(other.top) &&
      Math.round(anchor.width) === Math.round(other.width)
    )
  })
}

function EngagementTooltip({
  points,
}: {
  points: readonly { datum: EngagementReaction }[]
}) {
  const focused = points[0]?.datum
  if (!focused) return null

  const platform = platforms.find((row) => row.platform === focused.platform)
  if (!platform) return null

  return (
    <div className="engagement-tooltip-body">
      <p className="engagement-tooltip-kicker">{platform.platform}</p>
      <p className="engagement-tooltip-total">
        {numberFormat.format(platformTotal(platform))} engagement
      </p>
      <ul className="engagement-tooltip-list">
        {platform.reactions.map((row) => (
          <li
            key={row.id}
            className={row.id === focused.id ? 'is-active' : undefined}
          >
            <span className="engagement-tooltip-swatch" style={{ background: row.color }} />
            <span className="engagement-tooltip-icon" aria-hidden="true">
              {row.icon}
            </span>
            <span className="engagement-tooltip-label">{row.label}</span>
            <span className="engagement-tooltip-count">
              {numberFormat.format(row.count)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function DirectEngagementChart() {
  const [anchors, setAnchors] = useState<readonly BarAnchor[]>([])
  const anchorsRef = useRef(anchors)
  anchorsRef.current = anchors

  const onRender = useCallback(
    (context: ChartRenderContext<EngagementReaction, string, number>) => {
      const next = readAnchors(context)
      if (!next) return
      if (sameAnchors(anchorsRef.current, next)) return
      setAnchors(next)
    },
    [],
  )

  const description = useMemo(() => {
    return platforms
      .map(
        (platform) =>
          `${platform.platform} ${numberFormat.format(platformTotal(platform))}`,
      )
      .join(', ')
  }, [])

  return (
    <section className="engagement-card">
      <header className="engagement-header">
        <p className="engagement-kicker">Direct engagement</p>
        <h1 className="engagement-total">
          {numberFormat.format(TOTAL_ENGAGEMENT)}
        </h1>
        <p className="engagement-subtitle">
          Reactions, comments, and shares across Facebook, Instagram, LinkedIn, and X
        </p>
      </header>

      <div className="engagement-chart-frame">
        <Chart
          definition={directEngagementChart}
          height={CHART_HEIGHT}
          initialWidth={CHART_INITIAL_WIDTH}
          className="engagement-chart"
          ariaLabel="Direct engagement by platform and reaction type"
          ariaDescription={description}
          onRender={onRender}
          renderTooltipBody={({ points }) => <EngagementTooltip points={points} />}
        />

        {anchors.map((anchor) => (
          <div
            key={anchor.platform}
            className="engagement-overlay"
            style={{
              left: anchor.centerX,
              top: anchor.top,
              width: anchor.width,
              height: Math.max(0, anchor.bottom - anchor.top),
            }}
          >
            <div className="engagement-badge">
              <strong>{numberFormat.format(anchor.total)}</strong>
              <span>total</span>
            </div>

            <ul className="engagement-chips">
              {anchor.segments.map((segment) =>
                segment.height < MIN_CHIP_HEIGHT ? null : (
                  <li
                    key={segment.row.id}
                    className="engagement-chip"
                    style={{
                      top: segment.top - anchor.top,
                      height: segment.height,
                    }}
                  >
                    <span aria-hidden="true">{segment.row.icon}</span>
                    {numberFormat.format(segment.row.count)}
                  </li>
                ),
              )}
            </ul>
          </div>
        ))}

        <div className="engagement-axis">
          {anchors.map((anchor) => (
            <div
              key={anchor.platform}
              className="engagement-axis-label"
              style={{ left: anchor.centerX, top: anchor.bottom + 14 }}
            >
              <span
                className="engagement-axis-dot"
                style={{ background: anchor.accent }}
              />
              {anchor.platform}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
