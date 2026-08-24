import { createFileRoute } from '@tanstack/react-router'
import { DirectEngagementChart } from '#/components/DirectEngagementChart'
import { RecentComments } from '#/components/RecentComments'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <main className="analytics-page">
      <DirectEngagementChart />
      <RecentComments />
    </main>
  )
}
