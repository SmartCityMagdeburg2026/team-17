import {
  IconMinus,
  IconPlus,
  IconHexagons,
  IconPolygon,
  IconInfoCircle,
} from "@tabler/icons-react";
import "leaflet/dist/leaflet.css";
import { useMap } from "react-leaflet";
import {
  useEffect,
  useRef,
} from "react";
import * as L from "leaflet";

import { Button } from "./ui/button";


type Props = {
  mode: "district" | "osr";
  onModeChange: (mode: "district" | "osr") => void;
  selectedPoiGroupIndex: number;
  setSelectedPoiGroupIndex: (index: number) => void;
  onInfoClick?: () => void;
};



export function MapControls({
  mode,
  onModeChange,
  onInfoClick,
}: Props) {
  const map = useMap();

  useEffect(() => {
    if (controlsRef.current) {
      L.DomEvent.disableClickPropagation(controlsRef.current);
      L.DomEvent.disableScrollPropagation(controlsRef.current);
    }
  }, []);

  const controlsRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="absolute top-2 left-2 z-[1000] flex flex-col gap-2"
      ref={controlsRef}
    >
      <Button onClick={() => onModeChange(mode === "osr" ? "district" : "osr")}>
        {mode === "osr" ? (
          <IconHexagons size={20} />
        ) : (
          <IconPolygon size={20} />
        )}
      </Button>

      {/* Zoom In */}
      <Button onClick={() => map.zoomIn()}>
        <IconPlus size={20} />
      </Button>

      {/* Zoom Out */}
      <Button onClick={() => map.zoomOut()}>
        <IconMinus size={20} />
      </Button>

      {/* Info */}
      <Button onClick={onInfoClick}>
        <IconInfoCircle size={20} />
      </Button>
    </div>
  );
}
