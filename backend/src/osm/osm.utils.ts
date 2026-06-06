export interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: Record<string, string>;
}

export interface OverpassResponse {
  elements: OverpassElement[];
}

export interface GeoJsonFeature {
  type: 'Feature';
  id?: string | number;
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: {
    [key: string]: any;
    osm_id: number;
    osm_type: 'node' | 'way' | 'relation';
  };
}

export interface GeoJsonFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJsonFeature[];
}

export function overpassToGeoJson(
  overpassJson: OverpassResponse,
): GeoJsonFeatureCollection {
  const features: GeoJsonFeature[] = (overpassJson.elements || [])
    .map((element: OverpassElement): GeoJsonFeature | null => {
      let geometry: GeoJsonFeature['geometry'] | null = null;
      if (
        element.type === 'node' &&
        element.lon !== undefined &&
        element.lat !== undefined
      ) {
        geometry = {
          type: 'Point',
          coordinates: [element.lon, element.lat],
        };
      } else if (
        (element.type === 'way' || element.type === 'relation') &&
        element.center
      ) {
        geometry = {
          type: 'Point',
          coordinates: [element.center.lon, element.center.lat],
        };
      }

      if (!geometry) return null;

      return {
        type: 'Feature',
        id: `${element.type}/${element.id}`,
        geometry: geometry,
        properties: {
          ...(element.tags || {}),
          osm_id: element.id,
          osm_type: element.type,
        },
      };
    })
    .filter((f): f is GeoJsonFeature => f !== null);

  return {
    type: 'FeatureCollection',
    features,
  };
}
