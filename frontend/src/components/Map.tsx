import { useCallback, useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  Marker,
  Polygon as PolygonComp,
  Tooltip,
} from "react-leaflet";
import { MapControls } from "./MapControls";
import { InfoModal } from "./InfoModal";
import { useMaxDistance } from "../hooks/useMaxDistance";
import { useFitBounds } from "../hooks/useFitBounds";
import { type Feature, type FeatureCollection, type Polygon } from "geojson";
import { DropPinControl } from "./DropPinControl";
import { stadtteile } from "../mocks/stadtteile";
import { useRessources } from "../hooks/useRessources";
import { renderToStaticMarkup } from "react-dom/server";
import L, { type LatLngTuple } from "leaflet";
import { POI_GROUPS, getPOIIcon, type POITag } from "../config/poiGroups";
import { useSidebar, type MapElement } from "./SidebarProvider";
import { IconPin } from "@tabler/icons-react";

const extractPolygon = (
  featureCollection?: FeatureCollection,
): Polygon | null => {
  const l = featureCollection?.features.length;
  const exists = featureCollection?.features[l -1]
  if (exists?.geometry.type !== "Polygon") {
    return null;
  }
  return exists.geometry;
};

function createReactIcon(
  element: React.ReactElement | null,
  isHighlighted = false,
  className?: string,
) {
  return L.divIcon({
    html: renderToStaticMarkup(
      <div
        className={`transition-transform duration-200 ${isHighlighted ? "scale-150 highlighted text-[#e84e0e] " : "scale-100"}`}
      >
        {element}
      </div>,
    ),
    className: className ?? "custom-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
}

const getIcon = (f: Feature): React.JSX.Element | null => {
  if (!f.properties) {
    return null;
  }
  return getPOIIcon(f.properties) as React.JSX.Element;
};

const coordinateToPosition = ([a, b]: number[]) => [b, a] as LatLngTuple;

export const Map = () => {
  const [coordinates, setCoordinates] = useState<[number, number]>([
    11.6419, 52.1326,
  ]);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  const {
    setElements,
    openSidebar,
    selectedPoiGroupIndex,
    setSelectedPoiGroupIndex,
    hoveredElementId,
    setHoveredElementId,
    mode,
    setMode,
    transport,
    selectedDistrict,
    setSelectedDistrict,
  } = useSidebar();

  const { maxDistance } = useMaxDistance(transport, coordinates);

  const geoData = useMemo(
    () => (mode === "osr" ? maxDistance : stadtteile),
    [maxDistance, mode],
  );

  const { ressources } = useRessources({
    geojson: extractPolygon(selectedDistrict ?? geoData),
    tags: POI_GROUPS[mode === "district" ? 3 : selectedPoiGroupIndex].tags,
  });

  useEffect(() => {
    if (mode === "osr") {
      openSidebar();
    }
  }, [mode, openSidebar]);

  useEffect(() => {
    const elements: MapElement[] = [];

    if (ressources) {
      ressources.features.forEach((f) => {
        if (f.geometry.type === "Point") {
          // Define the order of priority for tags
          const tagKeys = ["amenity", "shop", "leisure", "highway"] as const;

          // Find the first key that exists in f.properties
          const tagKey = tagKeys.find((key) => f.properties?.[key]);
          // Create the tag object
          const tag: POITag =
            tagKey && f.properties
              ? { name: tagKey, value: f.properties[tagKey] }
              : { name: "unknown", value: "Point of Interest" };

          elements.push({
            id: String(f.id),
            name: f.properties?.name,
            tag,
            icon: getIcon(f),
          });
        }
      });
    }

    setElements(elements);
  }, [geoData, ressources, mode, setElements]);

  const onModeChange = useCallback(
    (newMode: "district" | "osr") => {
      setMode(newMode);
      if (mode === "osr") {
        setSelectedDistrict(undefined);
      }
    },
    [mode, setMode, setSelectedDistrict],
  );

  const hasData = !!(selectedDistrict ?? geoData);

  return (
    <MapContainer
      center={coordinates}
      zoom={13}
      zoomControl={false}
      style={{ height: "100%", width: "100%" }}
      className="relative"
    >
      <MapControls
        {...{
          onModeChange,
          mode,
          selectedPoiGroupIndex,
          setSelectedPoiGroupIndex,
          onInfoClick: () => setIsInfoModalOpen(true),
        }}
      />
      <InfoModal isOpen={isInfoModalOpen} onOpenChange={setIsInfoModalOpen} />
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <DropPinControl
        onCoordinatesChange={setCoordinates}
        featureCollection={selectedDistrict ?? geoData}
        onClickOutside={() =>
          mode === "district" && setSelectedDistrict(undefined)
        }
      />
      {mode === "osr" && (
        <Marker
          key={`pin-${coordinates[0]}-${coordinates[1]}`}
          position={coordinateToPosition(coordinates)}
          icon={createReactIcon(<IconPin />, false, "standort ")}
        >
          <Tooltip direction="top" offset={[0, -32]} opacity={1}>
            <span className="font-bold">You're here</span>
          </Tooltip>
        </Marker>
      )}
      {hasData && <FitBoundsHandler geoData={selectedDistrict ?? geoData} />}
      {hasData &&
        mode === "district" &&
        geoData?.features
          .filter((f) =>
            selectedDistrict ? f.id === selectedDistrict.id : true,
          )
          .map(
            (f) =>
              f.geometry.type === "Polygon" && (
                <PolygonComp
                  {...{
                    opacity: 1,
                    fill: true,
                    fillColor: "green",
                    color: "black",
                    fillOpacity: 0.2,
                  }}
                  key={`${mode}-${transport}-${f.id}`}
                  positions={f.geometry.coordinates[0].map(
                    coordinateToPosition,
                  )}
                  eventHandlers={{
                    click: () =>
                      !!f.properties &&
                      "name" in f.properties &&
                      setSelectedDistrict({
                        type: "FeatureCollection",
                        features: [f],
                        id: `${f.id}`,
                        name: f.properties["name"],
                      }),
                  }}
                />
              ),
          )}
      {!!geoData && mode === "osr" && (
        <>
          <GeoJSON
            key={`${mode}-${transport}`}
            style={{
              opacity: 1,
              fill: true,
              fillColor: "#228B22FF",
              color: "#228B2280",
              fillOpacity: 0.3,
            }}
            data={geoData}
          />
        </>
      )}
      {mode === "osr" &&
        ressources?.features.map(
          (f) =>
            f.geometry.type === "Point" && (
              <Marker
                key={`${f.id}-${hoveredElementId === String(f.id)}`}
                position={coordinateToPosition(f.geometry.coordinates)}
                icon={createReactIcon(
                  getIcon(f),
                  hoveredElementId === String(f.id),
                )}
                zIndexOffset={hoveredElementId === String(f.id) ? 1000 : 0}
                eventHandlers={{
                  mouseover: () => setHoveredElementId(String(f.id)),
                  mouseout: () => setHoveredElementId(null),
                }}
              >
                <Tooltip direction="top" offset={[0, -32]} opacity={1}>
                  <div className="flex flex-col">
                    <span className="font-bold">
                      {f.properties?.name || "?"}
                    </span>
                    <span className="text-xs text-gray-500 capitalize">
                      {[
                        "amenity",
                        "shop",
                        "leisure",
                        "highway",
                        "tourism",
                        "railway",
                        "public_transport",
                      ]
                        .map((key) => f.properties?.[key])
                        .find((val) => val)
                        ?.replace(/_/g, " ") || "Point of Interest"}
                    </span>
                  </div>
                </Tooltip>
              </Marker>
            ),
        )}
    </MapContainer>
  );
};

const FitBoundsHandler = ({ geoData }: { geoData?: FeatureCollection }) => {
  useFitBounds(geoData);
  return null;
};
