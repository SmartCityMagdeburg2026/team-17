import { useQuery } from "@tanstack/react-query";
import { type FeatureCollection } from "geojson";
import { useORS } from "../components/ORSProvider";
import { Profile } from "../openrouteservice-api/common";
import {
  IsochronesAttributes,
  IsochronesLocationType,
  IsochronesRangeType,
} from "../openrouteservice-api/isochrones";

// Unique query key generator for caching
function queryKey(
  transport: Profile,
  coordinates: [number, number],
  range: number,
) {
  return ["maxDistance", transport, coordinates.join(","), range] as const;
}

export const useMaxDistance = (
  transport: Profile,
  coordinates: [number, number] = [11.6419, 52.1326],
  range: number = 900,
): { maxDistance?: FeatureCollection; isLoading: boolean } => {
  const ors = useORS();

  const { data: maxDistance, isLoading } = useQuery<FeatureCollection>({
    queryKey: queryKey(transport, coordinates, range),
    queryFn: async () => {
      const res = await ors.getIsochrones(transport, {
        locations: [coordinates],
        range: [range],
        interval: 300,
        attributes: [IsochronesAttributes.AREA],
        location_type: IsochronesLocationType.START,
        range_type: IsochronesRangeType.TIME,
        intersections: true,
      });
      return res;
    },
    staleTime: 5 * 60 * 1000, // 5 min cache
    refetchOnWindowFocus: false,
  });

  return { maxDistance, isLoading };
};
