import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Chart } from "@tanstack/charts/react/tooltip";
import type { ChartRenderContext } from "@tanstack/charts";
import {
  BADGE_CLEARANCE,
  BAR_INSET,
  BAR_MAX_THICKNESS,
  CHART_HEIGHT,
  CHART_INITIAL_WIDTH,
  TOTAL_ENGAGEMENT,
  createDirectEngagementChart,
  getPlatforms,
  numberFormat,
  percentFormat,
  platformTotal,
  type EngagementReaction,
  type PlatformName,
} from "#/charts/direct-engagement";
import { useColorMode } from "#/theme";

interface BarAnchor {
  platform: PlatformName;
  accent: string;
  total: number;
  centerX: number;
  top: number;
  bottom: number;
  width: number;
  segments: readonly SegmentAnchor[];
}

interface SegmentAnchor {
  row: EngagementReaction;
  top: number;
  height: number;
}

interface OverlayLayout {
  plotX: number;
  plotY: number;
  plotWidth: number;
  anchors: readonly BarAnchor[];
}

const MIN_CHIP_HEIGHT = 28;
const MIN_ICON_HEIGHT = 16;

function paintedBarWidth(bandwidth: number) {
  return Math.min(Math.max(0, bandwidth - BAR_INSET * 2), BAR_MAX_THICKNESS);
}

function readLayout(
  context: ChartRenderContext<EngagementReaction, string, number>,
  platforms: readonly ReturnType<typeof getPlatforms>[number][],
): OverlayLayout | null {
  const x = context.scene.scales.x;
  const y = context.scene.scales.y;
  if (!x || !y || x.type === "none" || y.type === "none") return null;

  const width = paintedBarWidth(x.bandwidth);
  const bottom = y.map(0);
  if (!Number.isFinite(bottom)) return null;

  const anchors = platforms.map((platform) => {
    const centerX = x.map(platform.platform);
    let cumulative = 0;
    const segments = platform.reactions.map((row) => {
      const start = cumulative;
      cumulative += row.count;
      const top = y.map(cumulative);
      const base = y.map(start);
      return {
        row,
        top,
        height: Math.max(0, base - top),
      };
    });

    return {
      platform: platform.platform,
      accent: platform.accent,
      total: platformTotal(platform),
      centerX,
      top: y.map(cumulative),
      bottom,
      width,
      segments,
    };
  });

  return {
    plotX: context.scene.chart.x,
    plotY: context.scene.chart.y,
    plotWidth: context.scene.chart.width,
    anchors,
  };
}

function sameLayout(left: OverlayLayout | null, right: OverlayLayout) {
  if (!left) return false;
  return (
    Math.round(left.plotX) === Math.round(right.plotX) &&
    Math.round(left.plotY) === Math.round(right.plotY) &&
    Math.round(left.plotWidth) === Math.round(right.plotWidth) &&
    sameAnchors(left.anchors, right.anchors)
  );
}

function sameAnchors(left: readonly BarAnchor[], right: readonly BarAnchor[]) {
  if (left.length !== right.length) return false;
  return left.every((anchor, index) => {
    const other = right[index];
    return (
      other !== undefined &&
      anchor.platform === other.platform &&
      anchor.accent === other.accent &&
      Math.round(anchor.centerX) === Math.round(other.centerX) &&
      Math.round(anchor.top) === Math.round(other.top) &&
      Math.round(anchor.width) === Math.round(other.width)
    );
  });
}

function EngagementTooltip({
  points,
  platforms,
}: {
  points: readonly { datum: EngagementReaction }[];
  platforms: readonly ReturnType<typeof getPlatforms>[number][];
}) {
  const focused = points[0]?.datum;
  if (!focused) return null;

  const platform = platforms.find((row) => row.platform === focused.platform);
  if (!platform) return null;
  const total = platformTotal(platform);

  return (
    <div className="engagement-tooltip-body">
      <p className="engagement-tooltip-kicker">{platform.platform}</p>
      <p className="engagement-tooltip-total">
        {numberFormat.format(total)}
        <span> total</span>
      </p>
      <ul className="engagement-tooltip-list">
        {platform.reactions.map((row) => (
          <li
            key={row.id}
            className={row.id === focused.id ? "is-active" : undefined}
          >
            <span
              className="engagement-tooltip-swatch"
              style={{ background: row.color }}
            />
            <span className="engagement-tooltip-icon" aria-hidden="true">
              {row.icon}
            </span>
            <span className="engagement-tooltip-label">{row.label}</span>
            <span className="engagement-tooltip-count">
              {numberFormat.format(row.count)}
            </span>
            <span className="engagement-tooltip-share">
              {percentFormat.format(row.count / total)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function DirectEngagementChart() {
  const { mode } = useColorMode();
  const platforms = useMemo(() => getPlatforms(mode), [mode]);
  const definition = useMemo(() => createDirectEngagementChart(mode), [mode]);
  const [layout, setLayout] = useState<OverlayLayout | null>(null);
  const [focusedPlatform, setFocusedPlatform] = useState<PlatformName | null>(
    null,
  );
  const layoutRef = useRef(layout);
  layoutRef.current = layout;

  const onRender = useCallback(
    (context: ChartRenderContext<EngagementReaction, string, number>) => {
      const next = readLayout(context, platforms);
      if (!next) return;
      if (sameLayout(layoutRef.current, next)) return;
      setLayout(next);
    },
    [platforms],
  );

  const onFocusGroupChange = useCallback(
    (points: readonly { datum: EngagementReaction }[]) => {
      setFocusedPlatform(points[0]?.datum.platform ?? null);
    },
    [],
  );

  const onFocusChange = useCallback(
    (point: { datum: EngagementReaction } | null) => {
      if (!point) setFocusedPlatform(null);
    },
    [],
  );

  const description = useMemo(() => {
    return platforms
      .map(
        (platform) =>
          `${platform.platform} ${numberFormat.format(platformTotal(platform))}`,
      )
      .join(", ");
  }, [platforms]);

  const frameRef = useRef<HTMLDivElement>(null);
  const [chartHeight, setChartHeight] = useState(CHART_HEIGHT);

  useEffect(() => {
    const node = frameRef.current;
    if (!node) return;

    const syncHeight = () => {
      const next = Math.round(node.clientHeight);
      if (next > 0) setChartHeight(next);
    };

    syncHeight();
    const observer = new ResizeObserver(syncHeight);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const anchors = layout?.anchors ?? [];
  const bubbleX = layout ? layout.plotX + layout.plotWidth / 2 : 0;
  const bubbleTop = 18;
  const bubbleBottom = 108;

  return (
    <section className="engagement-card">
      <div className="engagement-chart-frame" ref={frameRef}>
        <Chart
          definition={definition}
          height={chartHeight}
          initialWidth={CHART_INITIAL_WIDTH}
          className="engagement-chart"
          ariaLabel="Direct engagement by platform and reaction type"
          ariaDescription={description}
          onRender={onRender}
          onFocusChange={onFocusChange}
          onFocusGroupChange={onFocusGroupChange}
          renderTooltipBody={({ points }) => (
            <EngagementTooltip points={points} platforms={platforms} />
          )}
        />

        {layout ? (
          <svg className="engagement-connectors" aria-hidden="true">
            {anchors.map((anchor) => {
              const muted =
                focusedPlatform !== null && focusedPlatform !== anchor.platform;
              const badgeTop = anchor.top - BADGE_CLEARANCE;
              return (
                <path
                  key={anchor.platform}
                  className={muted ? "is-muted" : undefined}
                  d={`M ${bubbleX} ${bubbleBottom} Q ${anchor.centerX} ${bubbleBottom + 28} ${anchor.centerX} ${badgeTop}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.15"
                  strokeLinecap="round"
                />
              );
            })}
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

        {anchors.map((anchor) => {
          const muted =
            focusedPlatform !== null && focusedPlatform !== anchor.platform;
          const active = focusedPlatform === anchor.platform;
          return (
            <div
              key={anchor.platform}
              className={[
                "engagement-overlay",
                muted ? "is-muted" : "",
                active ? "is-active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
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
                {anchor.segments.map((segment) => {
                  const showLabel = segment.height >= MIN_CHIP_HEIGHT;
                  const showIcon =
                    showLabel ||
                    segment.height >= MIN_ICON_HEIGHT ||
                    (active && segment.height >= 14);
                  if (!showIcon) return null;
                  return (
                    <li
                      key={segment.row.id}
                      className={[
                        "engagement-chip",
                        showLabel ? "" : "is-compact",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      style={{
                        top: segment.top - anchor.top,
                        height: segment.height,
                      }}
                    >
                      <span aria-hidden="true">{segment.row.icon}</span>
                      {showLabel
                        ? numberFormat.format(segment.row.count)
                        : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}

        <div className="engagement-axis">
          {anchors.map((anchor) => (
            <div
              key={anchor.platform}
              className={[
                "engagement-axis-label",
                focusedPlatform !== null && focusedPlatform !== anchor.platform
                  ? "is-muted"
                  : "",
                focusedPlatform === anchor.platform ? "is-active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{ left: anchor.centerX, top: anchor.bottom + 16 }}
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
  );
}
