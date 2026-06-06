import { useEffect, useMemo, useRef } from "react";
import * as Plot from "@observablehq/plot";
import { type StatisticsTrendPoint } from "../../types/statistics";

type MetricKey = Exclude<keyof StatisticsTrendPoint, "year">;

const metricLabels: Record<MetricKey, string> = {
  population: "Population",
  taxes: "Taxes",
  rent: "Rent",
  climate: "Climate",
  vehicles: "Vehicles",
};

const metricOrder: MetricKey[] = [
  "population",
  "taxes",
  "rent",
  "climate",
  "vehicles",
];

type TrendRecord = {
  year: number;
  metric: string;
  value: number;
};

function buildIndexedSeries(trends: StatisticsTrendPoint[]): TrendRecord[] {
  const series: TrendRecord[] = [];

  for (const metric of metricOrder) {
    const values = trends
      .map((point) => ({
        year: point.year,
        value: point[metric],
      }))
      .filter((entry): entry is { year: number; value: number } =>
        typeof entry.value === "number" && Number.isFinite(entry.value),
      )
      .sort((left, right) => left.year - right.year);

    const baseline = values[0]?.value;

    if (!baseline || baseline === 0) {
      continue;
    }

    for (const entry of values) {
      series.push({
        year: entry.year,
        metric: metricLabels[metric],
        value: (entry.value / baseline) * 100,
      });
    }
  }

  return series;
}

export const TrendChart = ({
  trends,
}: {
  trends: StatisticsTrendPoint[];
}): React.JSX.Element => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const indexedSeries = useMemo(() => buildIndexedSeries(trends), [trends]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container || indexedSeries.length === 0) {
      return;
    }

    const render = () => {
      const width = container.clientWidth || 960;
      const chart = Plot.plot({
        width,
        height: 380,
        marginLeft: 56,
        marginRight: 24,
        marginTop: 18,
        marginBottom: 40,
        style: {
          background: "transparent",
          color: "rgb(28 25 23)",
          fontFamily: "inherit",
          fontSize: "12px",
        },
        color: {
          legend: true,
          scheme: "observable10",
        },
        x: {
          label: "Year",
          tickFormat: (value) => String(value),
        },
        y: {
          label: "Indexed trend (base year = 100)",
          grid: true,
        },
        marks: [
          Plot.ruleY([100], { stroke: "rgb(203 213 225)" }),
          Plot.line(indexedSeries, {
            x: "year",
            y: "value",
            stroke: "metric",
            curve: "monotone-x",
            strokeWidth: 2.5,
          }),
          Plot.dot(indexedSeries, {
            x: "year",
            y: "value",
            stroke: "metric",
            fill: "white",
            r: 3,
            tip: true,
          }),
        ],
      });

      container.replaceChildren(chart);
    };

    render();

    const observer = new ResizeObserver(() => {
      render();
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
      container.replaceChildren();
    };
  }, [indexedSeries]);

  if (indexedSeries.length === 0) {
    return (
      <div className="flex h-[380px] items-center justify-center rounded-[1.5rem] bg-white/45 text-sm text-muted-foreground shadow-[0_10px_30px_rgba(28,25,23,0.04)]">
        Trend data is currently unavailable.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[2rem] bg-white/45 p-4 shadow-[0_16px_40px_rgba(28,25,23,0.05)] backdrop-blur-[2px]">
      <div className="overflow-hidden rounded-[1.35rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.55),rgba(244,244,245,0.35))] px-2 py-3">
        <div ref={containerRef} className="w-full" />
      </div>
    </div>
  );
};
