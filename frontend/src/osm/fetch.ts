import type { FeatureCollection, Polygon } from "geojson";
import { BACKEND_ENV } from "../env";

export type Tag = {
  name: string;
  value: string;
};

export type RessoureRequest = {
  geojson: Polygon | null;
  tags: Tag[];
};

export const fetchRessources = async (
  req: RessoureRequest,
): Promise<FeatureCollection> => {
  const res = await fetch(`${BACKEND_ENV.host}/osm/data`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req),
  });

  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }

  return (await res.json()) as FeatureCollection;
};
