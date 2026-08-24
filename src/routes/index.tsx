import { createFileRoute } from '@tanstack/react-router'
import { DirectEngagementChart } from '#/components/DirectEngagementChart'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <main className="engagement-page">
      <DirectEngagementChart />
    </main>
  )
}
