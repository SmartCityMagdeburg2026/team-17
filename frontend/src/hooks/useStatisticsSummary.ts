import { useQuery } from "@tanstack/react-query";
import { BACKEND_ENV } from "../env";
import { type StatisticsSummary } from "../types/statistics";

const statisticsSummaryUrl = new URL("/statistics/summary", BACKEND_ENV.host).toString();

export function useStatisticsSummary() {
  return useQuery<StatisticsSummary>({
    queryKey: ["statistics-summary"],
    queryFn: async () => {
      const response = await fetch(statisticsSummaryUrl);

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      return (await response.json()) as StatisticsSummary;
    },
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
