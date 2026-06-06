import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import * as L from "leaflet";
import { type FeatureCollection } from "geojson";

const boundsToString = (b: L.LatLngBounds) =>
  `${b.getSouthWest().toString()}|${b.getNorthEast().toString()}`;

export const useFitBounds = (geoData?: FeatureCollection) => {
  const map = useMap();
  const lastBoundsRef = useRef<string | null>(null);
  const layerRef = useRef<L.GeoJSON | null>(null);

  useEffect(() => {
    if (!geoData) return;

    if (!layerRef.current) {
      layerRef.current = L.geoJSON(geoData);
    } else {
      layerRef.current.clearLayers();
      layerRef.current.addData(geoData);
    }

    const bounds = layerRef.current.getBounds();

    if (!bounds.isValid()) return;

    const boundsKey = boundsToString(bounds);

    if (lastBoundsRef.current === boundsKey) return;

    lastBoundsRef.current = boundsKey;

    map.flyToBounds(bounds, {
      padding: [60, 60],
      duration: 1.25,
      easeLinearity: 0.15, // lower = smoother easing
      maxZoom: 16,
    });
  }, [geoData, map]);
};
