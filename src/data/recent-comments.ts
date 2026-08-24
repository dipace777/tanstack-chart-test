import type { PlatformName } from '#/charts/direct-engagement'

export interface RecentComment {
  id: string
  platform: PlatformName
  author: string
  handle: string
  body: string
  context: string
  timeLabel: string
}

export const RECENT_COMMENTS: readonly RecentComment[] = [
  {
    id: 'c1',
    platform: 'TikTok',
    author: 'Maya Chen',
    handle: '@maya.makes',
    body: 'The cut at 0:07 is doing too much. I rewatched it four times.',
    context: 'Summer drop — cut 04',
    timeLabel: '8m ago',
  },
  {
    id: 'c2',
    platform: 'Instagram',
    author: 'Jordan Lee',
    handle: '@jordan.lee',
    body: 'Slide 3 is the whole carousel. Everything after it is extra.',
    context: 'Carousel: studio walkthrough',
    timeLabel: '14m ago',
  },
  {
    id: 'c3',
    platform: 'X',
    author: 'Nina Kapoor',
    handle: '@nina.k',
    body: 'The quote-tweet of this is going to travel farther than the original.',
    context: 'Launch-day thread',
    timeLabel: '26m ago',
  },
  {
    id: 'c4',
    platform: 'Facebook',
    author: 'Priya Menon',
    handle: 'Priya Menon',
    body: 'This is the framing we needed on the recap. Sharing with the regional team.',
    context: 'Q3 launch recap',
    timeLabel: '41m ago',
  },
  {
    id: 'c5',
    platform: 'LinkedIn',
    author: 'Sam Okonkwo',
    handle: 'Sam Okonkwo',
    body: 'Same drop after the ranking change. The save-rate recovery in week two is the useful part.',
    context: 'Distribution notes',
    timeLabel: '1h ago',
  },
  {
    id: 'c6',
    platform: 'Threads',
    author: 'Alex Ruiz',
    handle: '@alex_r',
    body: 'Shipping in public still hits. The unfinished bits are the point.',
    context: 'Build log 19',
    timeLabel: '1h ago',
  },
  {
    id: 'c7',
    platform: 'TikTok',
    author: 'Chris Adeyemi',
    handle: '@ade.frames',
    body: 'Please post the extended audio. The last 3 seconds carry the whole joke.',
    context: 'Summer drop — cut 04',
    timeLabel: '2h ago',
  },
  {
    id: 'c8',
    platform: 'X',
    author: 'Elena Voss',
    handle: '@elenavoss',
    body: 'Bookmarked for the team standup. The reply chain under this is better than the blog.',
    context: 'Launch-day thread',
    timeLabel: '3h ago',
  },
  {
    id: 'c9',
    platform: 'Instagram',
    author: 'Hana Park',
    handle: '@hana.park',
    body: 'Saved. The color grade on the second still is the one I keep coming back to.',
    context: 'Carousel: studio walkthrough',
    timeLabel: '4h ago',
  },
  {
    id: 'c10',
    platform: 'LinkedIn',
    author: 'Mei Lin',
    handle: 'Mei Lin',
    body: 'Would love a follow-up on what you cut. The “what we stopped doing” section is the insight.',
    context: 'Distribution notes',
    timeLabel: '5h ago',
  },
  {
    id: 'c11',
    platform: 'Facebook',
    author: 'Daniel Ortega',
    handle: 'Daniel Ortega',
    body: 'Can you pin the regional numbers? People keep asking in the replies.',
    context: 'Q3 launch recap',
    timeLabel: '6h ago',
  },
  {
    id: 'c12',
    platform: 'Threads',
    author: 'Riley Shaw',
    handle: '@riley.shaw',
    body: 'This is the post I wanted yesterday. Quiet, specific, no performance.',
    context: 'Build log 19',
    timeLabel: '8h ago',
  },
  {
    id: 'c13',
    platform: 'TikTok',
    author: 'Sofia Marin',
    handle: '@sofia.m',
    body: 'The stitch with the original audio is going to eat. Already sent it to three people.',
    context: 'Behind the seam',
    timeLabel: 'Yesterday',
  },
  {
    id: 'c14',
    platform: 'X',
    author: 'Theo Barnes',
    handle: '@tbarnes',
    body: 'Not sure the screenshot is fair without the quote. Context dies in the crop.',
    context: 'Screenshot discourse',
    timeLabel: 'Yesterday',
  },
]
