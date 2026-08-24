import { barY, defineChart } from '@tanstack/charts'
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { tooltip } from '@tanstack/charts/tooltip'
import { portal } from '@tanstack/charts/tooltip/portal'

export const BAR_INSET = 10
export const BAR_MAX_THICKNESS = 78
export const CHART_HEIGHT = 600
export const CHART_INITIAL_WIDTH = 960

export type PlatformName = 'Facebook' | 'Instagram' | 'LinkedIn' | 'X'

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

const PLATFORM_TONES = {
  Facebook: '#6F8FCE',
  Instagram: '#C47A93',
  LinkedIn: '#5B8AA8',
  X: '#9AA3B2',
} as const

function withAlpha(hex: string, alpha: number) {
  const channel = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0')
  return `${hex}${channel}`
}

function reaction(
  platform: PlatformName,
  kind: string,
  label: string,
  icon: string,
  count: number,
  tone: number,
): EngagementReaction {
  const accent = PLATFORM_TONES[platform]
  return {
    id: `${platform}-${kind}`,
    platform,
    kind,
    label,
    icon,
    count,
    color: withAlpha(accent, tone),
    ink: '#f8fafc',
  }
}

function stackTones(count: number) {
  return Array.from({ length: count }, (_, index) => {
    const t = count === 1 ? 0 : index / (count - 1)
    return 0.92 - t * 0.5
  })
}

function platformStack(
  platform: PlatformName,
  items: readonly (readonly [string, string, string, number])[],
): PlatformEngagement {
  const tones = stackTones(items.length)
  return {
    platform,
    accent: PLATFORM_TONES[platform],
    reactions: items.map(([kind, label, icon, count], index) =>
      reaction(platform, kind, label, icon, count, tones[index] ?? 0.7),
    ),
  }
}

export const platforms: readonly PlatformEngagement[] = [
  platformStack('Facebook', [
    ['like', 'Like', '👍', 100],
    ['love', 'Love', '❤️', 200],
    ['care', 'Care', '🤗', 38],
    ['haha', 'Haha', '😂', 52],
    ['wow', 'Wow', '😮', 34],
    ['sad', 'Sad', '😢', 24],
    ['angry', 'Angry', '😡', 32],
    ['comment', 'Comments', '💬', 20],
  ]),
  platformStack('Instagram', [
    ['like', 'Likes', '❤️', 74],
    ['comment', 'Comments', '💬', 26],
    ['share', 'Shares', '📤', 13],
    ['save', 'Saves', '🔖', 7],
  ]),
  platformStack('LinkedIn', [
    ['like', 'Like', '👍', 110],
    ['celebrate', 'Celebrate', '👏', 48],
    ['insightful', 'Insightful', '💡', 52],
    ['support', 'Support', '🤗', 28],
    ['love', 'Love', '❤️', 22],
    ['funny', 'Funny', '😂', 18],
    ['comment', 'Comments', '💬', 36],
    ['repost', 'Reposts', '🔁', 26],
  ]),
  platformStack('X', [
    ['like', 'Likes', '❤️', 248],
    ['repost', 'Reposts', '🔁', 156],
    ['reply', 'Replies', '💬', 102],
    ['quote', 'Quotes', '📝', 64],
    ['bookmark', 'Bookmarks', '🔖', 40],
  ]),
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
      stroke: '#0b1220',
      strokeWidth: 1,
      key: 'id',
      inset: BAR_INSET,
      maxThickness: BAR_MAX_THICKNESS,
      radius: 6,
    }),
  ],
  x: {
    scale: () =>
      scaleBand<string>()
        .domain(platforms.map((row) => row.platform))
        .paddingInner(0.28)
        .paddingOuter(0.12),
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
  margin: { top: 132, right: 12, bottom: 40 },
  clip: false,
  focus: 'group-x',
  tooltip: {
    use: tooltip,
    portal,
    className: 'engagement-tooltip',
  },
  theme: {
    foreground: '#e5e7eb',
    muted: '#94a3b8',
    grid: 'color-mix(in srgb, #e5e7eb 10%, transparent)',
    background: 'transparent',
  },
})
