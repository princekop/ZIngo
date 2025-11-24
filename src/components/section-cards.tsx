"use client"

import { useEffect, useState } from "react"
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function SectionCards() {
  const [summary, setSummary] = useState<{ joins24h: number; leaves24h: number; totalMembers: number; activeServers: number; trendJoinsPct: number; trendLeavesPct: number } | null>(null)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const res = await fetch('/api/analytics/members?range=7d', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          if (active) setSummary(data?.summary || null)
        }
      } catch {}
    }
    load()
    return () => { active = false }
  }, [])

  const joins = summary?.joins24h ?? 0
  const leaves = summary?.leaves24h ?? 0
  const total = summary?.totalMembers ?? 0
  const servers = summary?.activeServers ?? 0
  const trendUp = Math.round((summary?.trendJoinsPct ?? 0) * 10) / 10
  const trendDown = Math.round((summary?.trendLeavesPct ?? 0) * 10) / 10

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Joins (last 24h)</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{joins.toLocaleString()}</CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              {trendUp > 0 ? `+${trendUp}%` : `${trendUp}%`}
            </Badge>
          </CardAction>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Leaves (last 24h)</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{leaves.toLocaleString()}</CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingDown />
              {trendDown > 0 ? `+${trendDown}%` : `${trendDown}%`}
            </Badge>
          </CardAction>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Members</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{total.toLocaleString()}</CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Servers</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{servers.toLocaleString()}</CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +4.5%
            </Badge>
          </CardAction>
        </CardHeader>
      </Card>
    </div>
  )
}
