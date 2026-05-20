'use client'

import { useEffect, useState } from 'react'
import { KPICard } from '@/components/dashboard/KPICard'
import { MessageSquare, Clock, Users, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  const [kpis, setKpis] = useState({
    totalConversations: 0,
    avgFRT: 0,
    avgQuality: 0,
    avgCompliance: 0,
  })

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then(setKpis)
  }, [])

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Conversations"
          value={kpis.totalConversations}
          icon={MessageSquare}
        />
        <KPICard
          title="Avg First Response"
          value={`${Math.floor(kpis.avgFRT / 60)}m`}
          icon={Clock}
        />
        <KPICard
          title="Avg Quality Score"
          value={`${(kpis.avgQuality * 100).toFixed(0)}%`}
          icon={TrendingUp}
        />
        <KPICard
          title="KB Compliance"
          value={`${(kpis.avgCompliance * 100).toFixed(0)}%`}
          icon={Users}
        />
      </div>
    </div>
  )
}
