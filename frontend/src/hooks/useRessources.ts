import { useQuery } from "@tanstack/react-query";
import { type FeatureCollection } from "geojson";
import { fetchRessources, type RessoureRequest } from "../osm/fetch";
import { Md5 } from "ts-md5";

export function useRessources(req: RessoureRequest) {
  const { data: ressources, isLoading } = useQuery<FeatureCollection | null>({
    queryKey: [
      req.tags.map((t) => t.name),
      Md5.hashStr(JSON.stringify(req.geojson ?? "")),
    ],
    enabled: Boolean(req.geojson),
    queryFn: async () => fetchRessources(req),
    staleTime: 5 * 60 * 1000, // 5 min cache
    refetchOnWindowFocus: false,
  });

  return { ressources, isLoading };
}
