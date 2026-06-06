// utils/playground.ts

import type { MapElement } from "@/components/SidebarProvider";
import type { DistrictData } from "@/hooks/useDistricts";

export const getChildrenPerPlayground = (
  elements: MapElement[],
  districtData?: DistrictData | null,
  year: number = 2025,
): { playgrounds?: MapElement[]; childrenPerPlayground?: number } => {
  const playgrounds = elements?.filter((el) => el.tag?.value === "playground");

  const yearData = districtData?.years?.find((y) => y.year === year);

  if (!yearData || playgrounds?.length === 0) {
    return {};
  }

  const totalChildren =
    yearData.altersgruppe_0_bis_6_jahre + yearData.altersgruppe_7_bis_17_jahre;

  return {
    childrenPerPlayground: Math.round(totalChildren / playgrounds?.length),
    playgrounds,
  };
};
