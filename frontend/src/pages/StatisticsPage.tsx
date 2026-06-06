import * as React from "react";
import Elbe from "@/components/statistics/Elbe";
import { DashboardCharts } from "../components/statistics/DashboardCharts";
import { useStatisticsSummary } from "../hooks/useStatisticsSummary";
import { type StatisticsSummary } from "../types/statistics";

class StatisticsErrorBoundary extends React.Component<
  {
    children: React.ReactNode;
  },
  {
    errorMessage: string | null;
  }
> {
  state = {
    errorMessage: null,
  };

  static getDerivedStateFromError(error: Error) {
    return { errorMessage: error.message };
  }

  componentDidCatch(error: Error) {
    console.error("Statistics page render error", error);
  }

  render(): React.ReactNode {
    const errorMessage = this.state.errorMessage;

    if (errorMessage) {
      return (
        <section className="rounded-3xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive shadow-sm">
          <p className="font-medium">Could not render statistics.</p>
          <p className="mt-2 whitespace-pre-wrap break-words text-xs">
            {errorMessage}
          </p>
        </section>
      );
    }

    return this.props.children;
  }
}

function StatisticsHero({
  generatedAt,
}: {
  generatedAt?: string;
}): React.JSX.Element {
  return (
    <section className="px-2 py-4 sm:px-3">
      <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
        Statistics
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        Magdeburg statistical overview
      </h2>
      <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
        Demographics, housing, tax revenue, mobility, and climate indicators
        presented in a consistent city-level and district-level view.
      </p>
      <p className="mt-3 text-xs uppercase tracking-[0.08em] text-muted-foreground">
        {generatedAt
          ? `Updated ${new Date(generatedAt).toLocaleString("en-GB")}`
          : ""}
      </p>
    </section>
  );
}

function StatisticsStatus({
  tone,
  children,
}: {
  tone: "loading" | "error";
  children: React.ReactNode;
}): React.JSX.Element {
  const toneClassName =
    tone === "error"
      ? "border-destructive/30 bg-destructive/5 text-destructive"
      : "border-border/70 bg-background/90 text-muted-foreground";

  return (
    <section
      className={`rounded-3xl border p-5 text-sm shadow-sm ${toneClassName}`}
    >
      {children}
    </section>
  );
}

function StatisticsSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <section className="grid gap-4">
      <div className="max-w-2xl px-2">
        <h3 className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
      {children}
    </section>
  );
}

function StatisticsContent({
  summary,
}: {
  summary: StatisticsSummary;
}): React.JSX.Element {
  return (
    <>
      <DashboardCharts summary={summary} />
      {/* <StatisticsSection
        title="City snapshot"
        description="A hierarchical view of the main indicators, scaled by relative weight."
      >
        <CityTreemap rootNode={summary.hierarchy} />
      </StatisticsSection> */}
      <StatisticsSection
        title="Elbe water conditions"
        description="Recent water level and quality indicators for the Magdeburg monitoring station. Source: pegelonline.wsv.de."
      >
        <Elbe />
      </StatisticsSection>
    </>
  );
}

export const StatisticsPage = (): React.JSX.Element => {
  const { data, isLoading, isError } = useStatisticsSummary();

  return (
    <div className="h-full overflow-auto bg-[radial-gradient(circle_at_top,rgba(232,78,14,0.12),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,247,248,0.96))] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 text-left">
        <StatisticsHero generatedAt={data?.generatedAt} />

        {isLoading && (
          <StatisticsStatus tone="loading">
            Loading statistics data...
          </StatisticsStatus>
        )}

        {isError && (
          <StatisticsStatus tone="error">
            Statistics data could not be loaded from the backend.
          </StatisticsStatus>
        )}

        {data && (
          <StatisticsErrorBoundary>
            <StatisticsContent summary={data} />
          </StatisticsErrorBoundary>
        )}
      </div>
    </div>
  );
};
