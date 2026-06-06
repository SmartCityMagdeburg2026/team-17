import { useQuery } from "@tanstack/react-query";
import { BACKEND_ENV } from "../env";

export interface DistrictData {
  district: string;
  years: YearData[];
  stadtrat: StadtratEntry[];
}

export interface YearData {
  year: number;

  // Households
  haushalte: number;
  durchschnittliche_haushaltsgroesse: number;
  haushalt_1_person: number;
  haushalt_2_personen: number;
  haushalt_3_personen: number;
  haushalt_4_personen_und_mehr: number;

  // Population
  auslaendische_bevoelkerung: number;
  maennlich: number;
  weiblich: number;
  gesamt: number;

  // Demographics
  billeter_mass_j: number;
  jugendquote: number;
  altenquote: number;
  altersdurchschnitt: number;

  // Geography
  flaeche: number;
  einwohnerdichte: number;

  // Age groups
  altersgruppe_0_bis_6_jahre: number;
  altersgruppe_7_bis_17_jahre: number;
  altersgruppe_18_bis_44_jahre: number;
  altersgruppe_45_bis_64_jahre: number;
  altersgruppe_ab_65_jahre: number;
}

export const fetchDistrict = async (
  district: string,
): Promise<DistrictData> => {
  const res = await fetch(
    encodeURI(`${BACKEND_ENV.host}/districts?name=${district}`),
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }

  return (await res.json()) as DistrictData;
};

/**
 * Currently empty in the provided JSON.
 * Replace `unknown` with a proper type once the structure is known.
 */
export type StadtratEntry = unknown;

export function useDistricts(district?: string): {
  districtData?: DistrictData | null;
  isLoading: boolean;
} {
  const { data: districtData, isLoading } = useQuery<DistrictData | null>({
    queryKey: [district],
    enabled: Boolean(district),
    queryFn: async () =>
      !district ? Promise.resolve(null) : fetchDistrict(district),
    staleTime: 5 * 60 * 1000, // 5 min cache
    refetchOnWindowFocus: false,
  });

  return { districtData, isLoading };
}
