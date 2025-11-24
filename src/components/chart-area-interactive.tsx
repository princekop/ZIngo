"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

export const description = "Members joins vs leaves over time"

const chartData = [
  { date: "2024-04-01", joins: 120, leaves: 30 },
  { date: "2024-04-02", joins: 150, leaves: 45 },
  { date: "2024-04-03", joins: 110, leaves: 40 },
  { date: "2024-04-04", joins: 180, leaves: 50 },
  { date: "2024-04-05", joins: 220, leaves: 60 },
  { date: "2024-04-06", joins: 200, leaves: 55 },
  { date: "2024-04-07", joins: 160, leaves: 52 },
  { date: "2024-04-08", joins: 260, leaves: 70 },
  { date: "2024-04-09", joins: 95, leaves: 28 },
  { date: "2024-04-10", joins: 170, leaves: 45 },
  { date: "2024-04-11", joins: 210, leaves: 66 },
  { date: "2024-04-12", joins: 190, leaves: 58 },
  { date: "2024-04-13", joins: 230, leaves: 74 },
  { date: "2024-04-14", joins: 130, leaves: 35 },
  { date: "2024-04-15", joins: 125, leaves: 33 },
  { date: "2024-04-16", joins: 140, leaves: 39 },
  { date: "2024-04-17", joins: 300, leaves: 90 },
  { date: "2024-04-18", joins: 260, leaves: 80 },
  { date: "2024-04-19", joins: 175, leaves: 50 },
  { date: "2024-04-20", joins: 120, leaves: 34 },
  { date: "2024-04-21", joins: 150, leaves: 40 },
  { date: "2024-04-22", joins: 190, leaves: 46 },
  { date: "2024-04-23", joins: 160, leaves: 42 },
  { date: "2024-04-24", joins: 240, leaves: 70 },
  { date: "2024-04-25", joins: 200, leaves: 60 },
  { date: "2024-04-26", joins: 115, leaves: 32 },
  { date: "2024-04-27", joins: 250, leaves: 76 },
  { date: "2024-04-28", joins: 150, leaves: 44 },
  { date: "2024-04-29", joins: 210, leaves: 63 },
  { date: "2024-04-30", joins: 280, leaves: 85 },
  { date: "2024-05-01", joins: 165, leaves: 48 },
  { date: "2024-05-02", joins: 205, leaves: 60 },
  { date: "2024-05-03", joins: 170, leaves: 50 },
  { date: "2024-05-04", joins: 260, leaves: 78 },
  { date: "2024-05-05", joins: 300, leaves: 90 },
  { date: "2024-05-06", joins: 320, leaves: 95 },
  { date: "2024-05-07", joins: 240, leaves: 70 },
  { date: "2024-05-08", joins: 180, leaves: 55 },
  { date: "2024-05-09", joins: 200, leaves: 60 },
  { date: "2024-05-10", joins: 230, leaves: 68 },
  { date: "2024-05-11", joins: 210, leaves: 62 },
  { date: "2024-05-12", joins: 180, leaves: 54 },
  { date: "2024-05-13", joins: 160, leaves: 50 },
  { date: "2024-05-14", joins: 310, leaves: 92 },
  { date: "2024-05-15", joins: 290, leaves: 88 },
  { date: "2024-05-16", joins: 260, leaves: 80 },
  { date: "2024-05-17", joins: 330, leaves: 96 },
  { date: "2024-05-18", joins: 245, leaves: 72 },
  { date: "2024-05-19", joins: 200, leaves: 60 },
  { date: "2024-05-20", joins: 190, leaves: 56 },
  { date: "2024-05-21", joins: 150, leaves: 45 },
  { date: "2024-05-22", joins: 140, leaves: 42 },
  { date: "2024-05-23", joins: 230, leaves: 70 },
  { date: "2024-05-24", joins: 220, leaves: 66 },
  { date: "2024-05-25", joins: 205, leaves: 60 },
  { date: "2024-05-26", joins: 180, leaves: 54 },
  { date: "2024-05-27", joins: 300, leaves: 90 },
  { date: "2024-05-28", joins: 190, leaves: 58 },
  { date: "2024-05-29", joins: 150, leaves: 45 },
  { date: "2024-05-30", joins: 240, leaves: 73 },
  { date: "2024-05-31", joins: 200, leaves: 60 },
  { date: "2024-06-01", joins: 195, leaves: 58 },
  { date: "2024-06-02", joins: 320, leaves: 95 },
  { date: "2024-06-03", joins: 150, leaves: 46 },
  { date: "2024-06-04", joins: 300, leaves: 88 },
  { date: "2024-06-05", joins: 140, leaves: 42 },
  { date: "2024-06-06", joins: 230, leaves: 70 },
  { date: "2024-06-07", joins: 250, leaves: 75 },
  { date: "2024-06-08", joins: 280, leaves: 84 },
  { date: "2024-06-09", joins: 310, leaves: 90 },
  { date: "2024-06-10", joins: 160, leaves: 48 },
  { date: "2024-06-11", joins: 150, leaves: 45 },
  { date: "2024-06-12", joins: 330, leaves: 98 },
  { date: "2024-06-13", joins: 140, leaves: 42 },
  { date: "2024-06-14", joins: 290, leaves: 86 },
  { date: "2024-06-15", joins: 220, leaves: 66 },
  { date: "2024-06-16", joins: 260, leaves: 78 },
  { date: "2024-06-17", joins: 340, leaves: 100 },
  { date: "2024-06-18", joins: 170, leaves: 52 },
  { date: "2024-06-19", joins: 260, leaves: 78 },
  { date: "2024-06-20", joins: 310, leaves: 92 },
  { date: "2024-06-21", joins: 180, leaves: 52 },
  { date: "2024-06-22", joins: 230, leaves: 70 },
  { date: "2024-06-23", joins: 340, leaves: 100 },
  { date: "2024-06-24", joins: 170, leaves: 50 },
  { date: "2024-06-25", joins: 180, leaves: 54 },
  { date: "2024-06-26", joins: 320, leaves: 95 },
  { date: "2024-06-27", joins: 330, leaves: 96 },
  { date: "2024-06-28", joins: 160, leaves: 48 },
  { date: "2024-06-29", joins: 150, leaves: 45 },
  { date: "2024-06-30", joins: 325, leaves: 98 },
]

const chartConfig = {
  joins: {
    label: "Joins",
    color: "var(--primary)",
  },
  leaves: {
    label: "Leaves",
    color: "hsl(var(--destructive))",
  },
} satisfies ChartConfig

export function ChartAreaInteractive() {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")
  const [series, setSeries] = React.useState<typeof chartData>(chartData)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  // Load series from API when time range changes
  React.useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/analytics/members?range=${timeRange}`, { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          if (active && Array.isArray(data?.series)) setSeries(data.series)
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [timeRange])

  const filteredData = series.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date("2024-06-30")
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Members Activity</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">Joins vs Leaves</span>
          <span className="@[540px]/card:hidden">Last 3 months</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="leaves"
              type="natural"
              fill="url(#fillMobile)"
              stroke="var(--color-mobile)"
              stackId="a"
            />
            <Area
              dataKey="joins"
              type="natural"
              fill="url(#fillDesktop)"
              stroke="var(--color-desktop)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
