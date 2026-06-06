import { useMapEvents } from "react-leaflet";
import { point, booleanPointInPolygon } from "@turf/turf";
import type { FeatureCollection, Polygon, MultiPolygon } from "geojson";

type Props = {
  featureCollection?: FeatureCollection;
  onCoordinatesChange: (coordinates: [number, number]) => void;
  onClickOutside: () => void;
};

export function DropPinControl({
  featureCollection,
  onCoordinatesChange,
  onClickOutside,
}: Props) {
  useMapEvents({
    click(e) {
      e.originalEvent.stopPropagation();

      const clickedPoint = point([e.latlng.lng, e.latlng.lat]);

      const isInside = featureCollection?.features.some((feature) => {
        const geometry = feature.geometry;

        return (
          geometry &&
          (geometry.type === "Polygon" || geometry.type === "MultiPolygon") &&
          booleanPointInPolygon(
            clickedPoint,
            feature as GeoJSON.Feature<Polygon | MultiPolygon>,
          )
        );
      });
      onCoordinatesChange([e.latlng.lng, e.latlng.lat]);
      if (!isInside) {
        onClickOutside();
        return;
      }
    },
  });

  return null;
}
