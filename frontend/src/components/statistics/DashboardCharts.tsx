import { useState } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Select } from "../ui/select";
import { TrendChart } from "./TrendChart";
import {
  type StatisticsCard,
  type StatisticsSummary,
} from "../../types/statistics";

const districtColors = {
  selected: "#e84e0e",
  baseline: "#0f766e",
};

function isDefinedNumber(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function formatMetricValue(value: number | null | undefined, digits = 0): string {
  return isDefinedNumber(value) ? value.toFixed(digits) : "Not available";
}

function hasMetricValues(values: Record<string, number | null | undefined>): boolean {
  return Object.values(values).some(isDefinedNumber);
}

function DashboardCard({
  title,
  description,
  children,
  action,
  className = "",
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}): React.JSX.Element {
  return (
    <Card
      className={`border-white/60 bg-white/55 shadow-[0_18px_45px_rgba(28,25,23,0.06)] backdrop-blur-[4px] ${className}`}
    >
      <CardHeader className="border-b border-white/70 pb-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription className="mt-2 max-w-[48ch] text-sm leading-6">
              {description}
            </CardDescription>
          </div>
          {action}
        </div>
      </CardHeader>
      <CardContent className="pt-5">{children}</CardContent>
    </Card>
  );
}

function StatisticsCards({
  cards,
}: {
  cards: StatisticsCard[];
}): React.JSX.Element {
  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <article
          key={card.id}
          className="rounded-[1.75rem] border border-white/70 bg-white/55 p-5 shadow-[0_10px_30px_rgba(28,25,23,0.05)] backdrop-blur-[2px]"
        >
          <p className="text-sm font-medium tracking-tight text-foreground">
            {card.label}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {card.note}
          </p>
          <div className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
            {card.value}
          </div>
          <p className="mt-5 text-[0.68rem] uppercase tracking-[0.08em] text-muted-foreground/85">
            {card.source}
          </p>
        </article>
      ))}
    </section>
  );
}

function DistrictSelect({
  districts,
  selectedDistrict,
  onSelect,
}: {
  districts: string[];
  selectedDistrict: string;
  onSelect: (district: string) => void;
}): React.JSX.Element {
  return (
    <div className="flex items-center gap-3">
      <label
        htmlFor="district-select"
        className="text-[0.72rem] font-medium uppercase tracking-[0.08em] text-stone-500"
      >
        District
      </label>
      <Select
        id="district-select"
        value={selectedDistrict}
        onChange={(event) => onSelect(event.target.value)}
        className="min-w-[220px]"
      >
        {districts.map((district) => (
          <option key={district} value={district}>
            {district}
          </option>
        ))}
      </Select>
    </div>
  );
}

function DemographicsRadar({
  summary,
  selectedDistrict,
}: {
  summary: StatisticsSummary;
  selectedDistrict: string;
}): React.JSX.Element {
  const selected =
    summary.demographicsRadar.districts.find(
      (district) => district.district === selectedDistrict,
    ) ?? summary.demographicsRadar.districts[0];

  if (!selected || summary.demographicsRadar.metrics.length === 0) {
    return (
      <DashboardCard
        title="District demographic profile"
        description="Demographic comparison data is currently unavailable."
        className="lg:col-span-2"
      >
        <div className="rounded-[1.5rem] bg-white/60 p-6 text-sm text-muted-foreground">
          Demographic records for the selected district could not be loaded.
        </div>
      </DashboardCard>
    );
  }

  const data = summary.demographicsRadar.metrics.map((metric) => ({
    metric: metric.label,
    district: selected.values[metric.key] ?? null,
    city: summary.demographicsRadar.cityAverage[metric.key] ?? null,
  }));

  if (!hasMetricValues(selected.values)) {
    return (
      <DashboardCard
        title="District demographic profile"
        description="Demographic comparison data is currently unavailable."
        className="lg:col-span-2"
      >
        <div className="rounded-[1.5rem] bg-white/60 p-6 text-sm text-muted-foreground">
          The selected district does not contain usable demographic values in
          the latest dataset.
        </div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard
      title="District demographic profile"
      description="Comparison of the selected district with the city average across age structure, diversity, and population balance."
      className="lg:col-span-2"
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] xl:items-center">
        <div className="h-full rounded-[1.5rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(248,247,244,0.42))] p-4">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="52%" outerRadius="72%" data={data}>
              <PolarGrid stroke="rgba(120,113,108,0.18)" />
              <PolarAngleAxis
                dataKey="metric"
                tick={{ fill: "#57534e", fontSize: 13 }}
              />
              <PolarRadiusAxis
                domain={[0, 100]}
                tick={false}
                axisLine={false}
              />
              <Radar
                dataKey="city"
                name="City average"
                stroke={districtColors.baseline}
                fill={districtColors.baseline}
                fillOpacity={0.12}
                strokeWidth={2}
              />
              <Radar
                dataKey="district"
                name={selected.district}
                stroke={districtColors.selected}
                fill={districtColors.selected}
                fillOpacity={0.28}
                strokeWidth={2.8}
              />
              <Legend wrapperStyle={{ fontSize: "13px" }} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          {data.map((metric) => (
            <div
              key={metric.metric}
              className="rounded-[1.25rem] border border-white/70 bg-white/70 px-4 py-3 text-left"
            >
              <p className="text-sm font-semibold text-stone-900">
                {metric.metric}
              </p>
              <div className="mt-2 flex items-center justify-between text-sm text-stone-600">
                <span>{selected.district}</span>
                <span className="font-medium text-stone-900">
                  {formatMetricValue(metric.district)}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between text-sm text-stone-500">
                <span>City average</span>
                <span>{formatMetricValue(metric.city)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardCard>
  );
}

function HouseholdDonut({
  summary,
  selectedDistrict,
}: {
  summary: StatisticsSummary;
  selectedDistrict: string;
}): React.JSX.Element {
  const current =
    summary.householdByDistrict.districts.find(
      (district) => district.district === selectedDistrict,
    ) ?? summary.householdByDistrict.districts[0];

  if (!current) {
    return (
      <DashboardCard
        title="Household mix"
        description="Household data is currently unavailable."
      >
        <div className="rounded-[1.5rem] bg-white/60 p-6 text-sm text-muted-foreground">
          Household records for the selected district could not be loaded.
        </div>
      </DashboardCard>
    );
  }

  const averageSize =
    summary.householdByDistrict.averageSizeByDistrict[current.district] ?? 0;

  return (
    <DashboardCard
      title="Household mix"
      description="Distribution of household sizes in the selected district."
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_180px]">
        <div className="h-[300px] rounded-[1.5rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.65),rgba(248,247,244,0.35))] p-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={current.segments}
                dataKey="value"
                nameKey="label"
                innerRadius={68}
                outerRadius={104}
                paddingAngle={3}
              >
                {current.segments.map((segment) => (
                  <Cell key={segment.key} fill={segment.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid content-center gap-4">
          <div className="rounded-[1.4rem] bg-stone-950 px-5 py-4 text-left text-stone-50">
            <p className="text-[0.7rem] uppercase tracking-[0.12em] text-stone-300">
              Average size
            </p>
            <p className="mt-2 text-3xl font-semibold">
              {averageSize.toFixed(2)}
            </p>
          </div>
          <div className="grid gap-2">
            {current.segments.map((segment) => (
              <div
                key={segment.key}
                className="flex items-center justify-between rounded-xl bg-white/70 px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: segment.fill }}
                  />
                  <span>{segment.label}</span>
                </div>
                <span className="font-medium text-stone-900">
                  {segment.value.toLocaleString("de-DE")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}

function RentRadial({
  summary,
  selectedDistrict,
}: {
  summary: StatisticsSummary;
  selectedDistrict: string;
}): React.JSX.Element {
  const current =
    summary.rentBySize.districts.find(
      (district) => district.district === selectedDistrict,
    ) ?? summary.rentBySize.districts[0];

  if (!current) {
    return (
      <DashboardCard
        title="Rent by apartment size"
        description="Rent data by apartment size is currently unavailable."
      >
        <div className="rounded-[1.5rem] bg-white/60 p-6 text-sm text-muted-foreground">
          Rent-band records for the selected district could not be loaded.
        </div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard
      title="Rent by apartment size"
      description={`Average net cold rent per square metre for the selected district in ${summary.rentBySize.year}.`}
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_180px]">
        <div className="h-[300px] rounded-[1.5rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.65),rgba(236,253,245,0.45))] p-4">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              data={current.segments.map((segment) => ({
                ...segment,
                angle: segment.value,
              }))}
              innerRadius="18%"
              outerRadius="95%"
              startAngle={90}
              endAngle={-270}
              barSize={14}
            >
              <PolarAngleAxis type="number" domain={[0, 16]} tick={false} />
              <RadialBar background dataKey="angle" cornerRadius={18} />
              <Tooltip />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid content-center gap-4">
          <div className="rounded-[1.4rem] bg-teal-950 px-5 py-4 text-left text-teal-50">
            <p className="text-[0.7rem] uppercase tracking-[0.12em] text-teal-200">
              Average band rent
            </p>
            <p className="mt-2 text-3xl font-semibold">
              {current.averageRent.toFixed(2)}
              <span className="ml-1 text-base font-medium text-teal-200">
                EUR/m2
              </span>
            </p>
          </div>
          <div className="grid gap-2">
            {current.segments.map((segment) => (
              <div
                key={segment.key}
                className="flex items-center justify-between rounded-xl bg-white/70 px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: segment.fill }}
                  />
                  <span>{segment.label}</span>
                </div>
                <span className="font-medium text-stone-900">
                  {segment.value.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}

function BuildingAgeRadar({
  summary,
  selectedDistrict,
}: {
  summary: StatisticsSummary;
  selectedDistrict: string;
}): React.JSX.Element {
  const selected =
    summary.rentByBuildingAge.districts.find(
      (district) => district.district === selectedDistrict,
    ) ?? summary.rentByBuildingAge.districts[0];

  if (!selected || summary.rentByBuildingAge.categories.length === 0) {
    return (
      <DashboardCard
        title="Rent by building age"
        description="Rent data by building age is currently unavailable."
      >
        <div className="rounded-[1.5rem] bg-white/60 p-6 text-sm text-muted-foreground">
          Building-age rent records for the selected district could not be
          loaded.
        </div>
      </DashboardCard>
    );
  }

  const data = summary.rentByBuildingAge.categories.map((category) => ({
    age: category,
    district: selected.values[category] ?? null,
    city: summary.rentByBuildingAge.cityAverage[category] ?? null,
  }));

  if (!hasMetricValues(selected.values)) {
    return (
      <DashboardCard
        title="Rent by building age"
        description={`Comparison of the selected district with the city average across construction periods in ${summary.rentByBuildingAge.year}.`}
      >
        <div className="rounded-[1.5rem] bg-white/60 p-6 text-sm text-muted-foreground">
          Not enough data is available to show building-age rent values for{" "}
          {selected.district} in {summary.rentByBuildingAge.year}.
        </div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard
      title="Rent by building age"
      description={`Comparison of the selected district with the city average across construction periods in ${summary.rentByBuildingAge.year}.`}
    >
      <div className="h-[340px] rounded-[1.5rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.65),rgba(255,247,237,0.45))] p-4">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="52%" outerRadius="70%" data={data}>
            <PolarGrid stroke="rgba(120,113,108,0.18)" />
            <PolarAngleAxis
              dataKey="age"
              tick={{ fill: "#57534e", fontSize: 11 }}
            />
            <PolarRadiusAxis tick={false} axisLine={false} />
            <Radar
              dataKey="city"
              name="City average"
              stroke={districtColors.baseline}
              fill={districtColors.baseline}
              fillOpacity={0.1}
              strokeWidth={2}
            />
            <Radar
              dataKey="district"
              name={selected.district}
              stroke={districtColors.selected}
              fill={districtColors.selected}
              fillOpacity={0.24}
              strokeWidth={2.5}
            />
            <Legend wrapperStyle={{ fontSize: "13px" }} />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </DashboardCard>
  );
}

function TaxCompositionDonut({
  summary,
}: {
  summary: StatisticsSummary;
}): React.JSX.Element {
  const total = summary.taxComposition.segments.reduce(
    (sum, segment) => sum + segment.value,
    0,
  );

  return (
    <DashboardCard
      title="Tax composition"
      description={`Breakdown of municipal tax revenue for ${summary.taxComposition.year}.`}
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_240px]">
        <div className="h-[320px] rounded-[1.5rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.65),rgba(255,237,213,0.45))] p-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={summary.taxComposition.segments}
                dataKey="value"
                nameKey="label"
                innerRadius={74}
                outerRadius={110}
                paddingAngle={2}
              >
                {summary.taxComposition.segments.map((segment) => (
                  <Cell key={segment.key} fill={segment.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid content-center gap-3">
          <div className="rounded-[1.4rem] bg-amber-500/15 px-5 py-4 text-left text-amber-950 ring-1 ring-amber-200/70">
            <p className="text-[0.7rem] uppercase tracking-[0.12em] text-amber-800">
              Total volume
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {Intl.NumberFormat("de-DE", {
                style: "currency",
                currency: "EUR",
                maximumFractionDigits: 0,
              }).format(total)}
            </p>
          </div>
          <div className="grid gap-2">
            {summary.taxComposition.segments.map((segment) => (
              <div
                key={segment.key}
                className="flex items-center justify-between rounded-xl bg-white/70 px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: segment.fill }}
                  />
                  <span>{segment.label}</span>
                </div>
                <span className="font-medium text-stone-900">
                  {Math.round((segment.value / total) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}

function ClimateRadial({
  summary,
}: {
  summary: StatisticsSummary;
}): React.JSX.Element {
  const maxValue = Math.max(
    ...summary.climateSeasonality.months.map((month) => month.value),
    1,
  );

  return (
    <DashboardCard
      title="Climate seasonality"
      description={`${summary.climateSeasonality.metricLabel} across the latest complete year in the dataset (${summary.climateSeasonality.year}).`}
      className="lg:col-span-2"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="h-full rounded-[1.5rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.65),rgba(224,242,254,0.42))] p-4">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              data={summary.climateSeasonality.months.map((month) => ({
                ...month,
                angle: month.value,
              }))}
              innerRadius="22%"
              outerRadius="98%"
              startAngle={90}
              endAngle={-270}
              barSize={14}
            >
              <PolarAngleAxis
                type="number"
                domain={[0, maxValue + 2]}
                tick={false}
              />
              <RadialBar background dataKey="angle" cornerRadius={14} />
              <Tooltip
                labelFormatter={() => ""}
                formatter={(value, _name, item) => [
                  `${Number(value).toFixed(1)} deg C`,
                  item?.payload?.month ?? "Average temperature",
                ]}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid content-center gap-2">
          {summary.climateSeasonality.months.map((month) => (
            <div
              key={month.month}
              className="flex items-center justify-between rounded-xl bg-white/70 px-3 py-2 text-sm"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: month.fill }}
                />
                <span>{month.month}</span>
              </div>
              <span className="font-medium text-stone-900">
                {month.value.toFixed(1)} deg C
              </span>
            </div>
          ))}
        </div>
      </div>
    </DashboardCard>
  );
}

export function DashboardCharts({
  summary,
}: {
  summary: StatisticsSummary;
}): React.JSX.Element {
  const baseDistricts =
    summary.districtOptions?.length > 0
      ? summary.districtOptions
      : [...new Set([
          ...(summary.demographicsRadar?.districts.map((district) => district.district) ?? []),
          ...(summary.householdByDistrict?.districts.map((district) => district.district) ?? []),
          ...(summary.rentBySize?.districts.map((district) => district.district) ?? []),
          ...(summary.rentByBuildingAge?.districts.map((district) => district.district) ?? []),
        ])];
  const availableDistricts = [...new Set(baseDistricts.filter(Boolean))];
  const [selectedDistrict, setSelectedDistrict] = useState("");

  const activeDistrict = availableDistricts.includes(selectedDistrict)
    ? selectedDistrict
    : (availableDistricts[0] ?? "");

  const selector = (
    <DistrictSelect
      districts={availableDistricts}
      selectedDistrict={activeDistrict}
      onSelect={setSelectedDistrict}
    />
  );

  if (availableDistricts.length === 0) {
    return (
      <div className="grid gap-6">
        <StatisticsCards cards={summary.cards} />
        <DashboardCard
          title="City trends"
          description="Indexed year-over-year movement across the main city indicators. Each series starts at 100 to support cross-metric comparison."
        >
          <TrendChart trends={summary.trends} />
        </DashboardCard>
        <div className="rounded-[2rem] border border-white/70 bg-white/55 p-6 text-sm text-muted-foreground shadow-[0_18px_45px_rgba(28,25,23,0.06)]">
          Statistics data loaded successfully, but no district-level records are
          available for the current charts.
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <StatisticsCards cards={summary.cards} />
      <DashboardCard
        title="City trends"
        description="Indexed year-over-year movement across the main city indicators. Each series starts at 100 to support cross-metric comparison."
      >
        <TrendChart trends={summary.trends} />
      </DashboardCard>
      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardCard
          title="District comparison"
          description="Select a district to update all district-level charts together."
          action={selector}
          className="lg:col-span-2"
        >
          <div className="flex flex-wrap gap-3 text-sm text-stone-600">
            <div className="rounded-full bg-white/70 px-4 py-2">
              All district-level charts use the same district selection.
            </div>
            <div className="rounded-full bg-white/70 px-4 py-2">
              Available districts: {availableDistricts.length}
            </div>
          </div>
        </DashboardCard>
        <DemographicsRadar
          summary={summary}
          selectedDistrict={activeDistrict}
        />
        <HouseholdDonut
          summary={summary}
          selectedDistrict={activeDistrict}
        />
        <RentRadial summary={summary} selectedDistrict={activeDistrict} />
        <BuildingAgeRadar
          summary={summary}
          selectedDistrict={activeDistrict}
        />
        <TaxCompositionDonut summary={summary} />
        <ClimateRadial summary={summary} />
      </div>
    </div>
  );
}
