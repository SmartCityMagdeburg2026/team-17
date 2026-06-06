"use client"

import { useQuery } from "@tanstack/react-query"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"

const BASE = "https://www.pegelonline.wsv.de/webservices/rest-api/v2"

type Measurement = {
  timestamp: string
  value: number
}

type Timeseries = {
  shortname: string
  longname: string
  unit: string
}

type Station = {
  uuid: string
  longname: string
  timeseries?: Timeseries[]
}

type WaterMeasurement = {
  timestamp: string
  level: number | null
  temperature: number | null
  oxygen: number | null
}

async function fetchWaterData(): Promise<{
  stationName: string
  data: WaterMeasurement[]
}> {
  const stations: Station[] = await fetch(
    `${BASE}/stations.json?includeTimeseries=true`
  ).then((response) => {
    if (!response.ok) {
      throw new Error("Failed to load stations")
    }

    return response.json()
  })

  const station = stations.find((entry) =>
    entry.longname.toLowerCase().includes("magdeburg")
  )

  if (!station) {
    throw new Error("Magdeburg station not found")
  }

  const timeseries = station.timeseries ?? []
  const levelSeries = timeseries.find((entry) => entry.shortname === "W")
  const temperatureSeries = timeseries.find(
    (entry) =>
      entry.unit === "deg C" ||
      entry.unit === "°C" ||
      entry.longname.toLowerCase().includes("temperatur") ||
      entry.longname.toLowerCase().includes("temperature")
  )
  const oxygenSeries = timeseries.find(
    (entry) =>
      entry.longname.toLowerCase().includes("sauerstoff") ||
      entry.longname.toLowerCase().includes("oxygen")
  )

  const fetchSeries = async (shortname?: string) => {
    if (!shortname) {
      return []
    }

    return fetch(
      `${BASE}/stations/${station.uuid}/${shortname}/measurements.json?start=P7D`
    ).then((response) => {
      if (!response.ok) {
        return []
      }

      return response.json() as Promise<Measurement[]>
    })
  }

  const [levels, temperatures, oxygen] = await Promise.all([
    fetchSeries(levelSeries?.shortname),
    fetchSeries(temperatureSeries?.shortname),
    fetchSeries(oxygenSeries?.shortname),
  ])

  const measurementsByTimestamp = new Map<string, WaterMeasurement>()

  const getMeasurement = (timestamp: string) => {
    if (!measurementsByTimestamp.has(timestamp)) {
      measurementsByTimestamp.set(timestamp, {
        timestamp,
        level: null,
        temperature: null,
        oxygen: null,
      })
    }

    return measurementsByTimestamp.get(timestamp)!
  }

  levels.forEach((measurement) => {
    getMeasurement(measurement.timestamp).level = measurement.value
  })

  temperatures.forEach((measurement) => {
    getMeasurement(measurement.timestamp).temperature = measurement.value
  })

  oxygen.forEach((measurement) => {
    getMeasurement(measurement.timestamp).oxygen = measurement.value
  })

  return {
    stationName: station.longname,
    data: [...measurementsByTimestamp.values()].sort(
      (left, right) =>
        new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime()
    ),
  }
}

const chartConfig = {
  level: {
    label: "Water level",
    color: "hsl(var(--chart-1))",
  },
  temperature: {
    label: "Temperature",
    color: "hsl(var(--chart-2))",
  },
  oxygen: {
    label: "Oxygen",
    color: "hsl(var(--chart-3))",
  },
}

export default function ElbeWaterDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["elbe-magdeburg-water"],
    queryFn: fetchWaterData,
    staleTime: 1000 * 60 * 15,
    refetchInterval: 1000 * 60 * 15,
  })

  if (isLoading) {
    return <div>Loading measurements...</div>
  }

  if (error || !data) {
    return <div className="text-destructive">Measurements could not be loaded.</div>
  }

  const latestMeasurement = data.data.at(-1)
  const chartData = data.data.map((measurement) => ({
    time: new Date(measurement.timestamp).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
    }),
    level: measurement.level,
    temperature: measurement.temperature,
    oxygen: measurement.oxygen,
  }))

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{data.stationName}</CardTitle>
          <CardDescription>Elbe River | Last 7 days</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Water level</CardDescription>
            <CardTitle className="text-3xl">
              {latestMeasurement?.level ?? "--"} cm
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Water temperature</CardDescription>
            <CardTitle className="text-3xl">
              {latestMeasurement?.temperature ?? "--"} deg C
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Oxygen</CardDescription>
            <CardTitle className="text-3xl">
              {latestMeasurement?.oxygen ?? "--"} mg/L
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Water level trend</CardTitle>
        </CardHeader>

        <CardContent>
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="time" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />

                <Area
                  type="monotone"
                  dataKey="level"
                  stroke="var(--color-level)"
                  fill="var(--color-level)"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Water quality</CardTitle>
        </CardHeader>

        <CardContent>
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="time" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />

                <Line
                  dataKey="temperature"
                  stroke="var(--color-temperature)"
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />

                <Line
                  dataKey="oxygen"
                  stroke="var(--color-oxygen)"
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
