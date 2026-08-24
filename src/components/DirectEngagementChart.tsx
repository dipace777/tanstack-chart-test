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

interface OverlayLayout {
  plotX: number
  plotY: number
  plotWidth: number
  anchors: readonly BarAnchor[]
}

const MIN_CHIP_HEIGHT = 26

function paintedBarWidth(bandwidth: number) {
  return Math.min(Math.max(0, bandwidth - BAR_INSET * 2), BAR_MAX_THICKNESS)
}

function readLayout(
  context: ChartRenderContext<EngagementReaction, string, number>,
): OverlayLayout | null {
  const x = context.scene.scales.x
  const y = context.scene.scales.y
  if (!x || !y || x.type === 'none' || y.type === 'none') return null

  const width = paintedBarWidth(x.bandwidth)
  const bottom = y.map(0)
  if (!Number.isFinite(bottom)) return null

  const anchors = platforms.map((platform) => {
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

  return {
    plotX: context.scene.chart.x,
    plotY: context.scene.chart.y,
    plotWidth: context.scene.chart.width,
    anchors,
  }
}

function sameLayout(left: OverlayLayout | null, right: OverlayLayout) {
  if (!left) return false
  return (
    Math.round(left.plotX) === Math.round(right.plotX) &&
    Math.round(left.plotY) === Math.round(right.plotY) &&
    Math.round(left.plotWidth) === Math.round(right.plotWidth) &&
    sameAnchors(left.anchors, right.anchors)
  )
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
  const [layout, setLayout] = useState<OverlayLayout | null>(null)
  const layoutRef = useRef(layout)
  layoutRef.current = layout

  const onRender = useCallback(
    (context: ChartRenderContext<EngagementReaction, string, number>) => {
      const next = readLayout(context)
      if (!next) return
      if (sameLayout(layoutRef.current, next)) return
      setLayout(next)
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

  const anchors = layout?.anchors ?? []
  const bubbleX = layout ? layout.plotX + layout.plotWidth / 2 : 0
  const bubbleTop = 18
  const bubbleBottom = 108

  return (
    <section className="engagement-card">
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

        {layout ? (
          <svg className="engagement-connectors" aria-hidden="true">
            {anchors.map((anchor) => (
              <line
                key={anchor.platform}
                x1={bubbleX}
                y1={bubbleBottom}
                x2={anchor.centerX}
                y2={anchor.top - 8}
                stroke="#64748b"
                strokeOpacity="0.45"
                strokeWidth="1.25"
              />
            ))}
          </svg>
        ) : null}

        {layout ? (
          <div
            className="engagement-total-bubble"
            style={{ left: bubbleX, top: bubbleTop }}
          >
            <p className="engagement-kicker">Direct engagement</p>
            <p className="engagement-total">
              {numberFormat.format(TOTAL_ENGAGEMENT)}
            </p>
          </div>
        ) : null}

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
