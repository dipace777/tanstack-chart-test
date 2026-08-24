import { barY, defineChart } from '@tanstack/charts'
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { tooltip } from '@tanstack/charts/tooltip'

export const BAR_INSET = 10
export const BAR_MAX_THICKNESS = 92
export const CHART_HEIGHT = 520
export const CHART_INITIAL_WIDTH = 880

export type PlatformName = 'Facebook' | 'Instagram' | 'X'

export interface EngagementReaction {
  id: string
  platform: PlatformName
  kind: string
  label: string
  icon: string
  count: number
  color: string
  ink: string
}

export interface PlatformEngagement {
  platform: PlatformName
  accent: string
  reactions: readonly EngagementReaction[]
}

function reaction(
  platform: PlatformName,
  kind: string,
  label: string,
  icon: string,
  count: number,
  color: string,
  ink = '#ffffff',
): EngagementReaction {
  return {
    id: `${platform}-${kind}`,
    platform,
    kind,
    label,
    icon,
    count,
    color,
    ink,
  }
}

export const platforms: readonly PlatformEngagement[] = [
  {
    platform: 'Facebook',
    accent: '#0866FF',
    reactions: [
      reaction('Facebook', 'like', 'Like', '👍', 100, '#0866FF'),
      reaction('Facebook', 'love', 'Love', '❤️', 200, '#F33E58'),
      reaction('Facebook', 'care', 'Care', '🤗', 38, '#F7B125', '#111827'),
      reaction('Facebook', 'haha', 'Haha', '😂', 52, '#F4C430', '#111827'),
      reaction('Facebook', 'wow', 'Wow', '😮', 34, '#A78BFA'),
      reaction('Facebook', 'sad', 'Sad', '😢', 24, '#60A5FA', '#111827'),
      reaction('Facebook', 'angry', 'Angry', '😡', 32, '#E9710F'),
      reaction('Facebook', 'comment', 'Comments', '💬', 20, '#64748B'),
    ],
  },
  {
    platform: 'Instagram',
    accent: '#E1306C',
    reactions: [
      reaction('Instagram', 'like', 'Likes', '❤️', 74, '#E1306C'),
      reaction('Instagram', 'comment', 'Comments', '💬', 26, '#833AB4'),
      reaction('Instagram', 'share', 'Shares', '📤', 13, '#FCAF45', '#111827'),
      reaction('Instagram', 'save', 'Saves', '🔖', 7, '#405DE6'),
    ],
  },
  {
    platform: 'X',
    accent: '#E7E9EA',
    reactions: [
      reaction('X', 'like', 'Likes', '❤️', 248, '#F91880'),
      reaction('X', 'repost', 'Reposts', '🔁', 156, '#00BA7C'),
      reaction('X', 'reply', 'Replies', '💬', 102, '#1D9BF0'),
      reaction('X', 'quote', 'Quotes', '📝', 64, '#7856FF'),
      reaction('X', 'bookmark', 'Bookmarks', '🔖', 40, '#FFD400', '#111827'),
    ],
  },
]

export const engagementRows: readonly EngagementReaction[] = platforms.flatMap(
  (platform) => platform.reactions,
)

export function platformTotal(platform: PlatformEngagement) {
  return platform.reactions.reduce((sum, row) => sum + row.count, 0)
}

export const TOTAL_ENGAGEMENT = platforms.reduce(
  (sum, platform) => sum + platformTotal(platform),
  0,
)

export const numberFormat = new Intl.NumberFormat('en-US')

export const directEngagementChart = defineChart({
  marks: [
    barY(engagementRows, {
      id: 'engagement-bars',
      x: 'platform',
      y: 'count',
      z: 'id',
      fill: (row) => row.color,
      key: 'id',
      inset: BAR_INSET,
      maxThickness: BAR_MAX_THICKNESS,
      radius: 4,
    }),
  ],
  x: {
    scale: () =>
      scaleBand<string>()
        .domain(platforms.map((row) => row.platform))
        .paddingInner(0.32)
        .paddingOuter(0.16),
    axis: {
      line: false,
      ticks: { size: 0 },
      tickLabels: false,
    },
  },
  y: {
    scale: scaleLinear,
    nice: true,
    grid: true,
    axis: {
      ticks: {
        format: (value) => numberFormat.format(value),
      },
      tickLabels: { fontSize: 12, opacity: 0.7 },
    },
  },
  margin: { top: 52, right: 12, bottom: 40 },
  clip: false,
  focus: 'group-x',
  tooltip: {
    use: tooltip,
    className: 'engagement-tooltip',
  },
  theme: {
    foreground: '#e5e7eb',
    muted: '#94a3b8',
    grid: 'color-mix(in srgb, #e5e7eb 10%, transparent)',
    background: 'transparent',
  },
})
