import { useDistricts, type DistrictData } from "@/hooks/useDistricts";
import type { FeatureCollection } from "geojson";
import {
  createContext,
  useState,
  useContext,
  type PropsWithChildren,
} from "react";

import { Profile } from "../openrouteservice-api/common";
import type { POITag } from "@/config/poiGroups";

export type MapElement = {
  id: string;
  name?: string;
  tag: POITag;
  icon?: React.ReactNode;
};

export type SidebarContextType = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  elements: MapElement[];
  setElements: (elements: MapElement[]) => void;
  selectedPoiGroupIndex: number;
  setSelectedPoiGroupIndex: (index: number) => void;
  hoveredElementId: string | null;
  setHoveredElementId: (id: string | null) => void;
  mode: "district" | "osr";
  setMode: (mode: "district" | "osr") => void;
  transport: Profile;
  setTransport: (transport: Profile) => void;

  selectedDistrict?: FeatureCollection & { id: string; name: string };
  setSelectedDistrict: (
    district?: FeatureCollection & { id: string; name: string },
  ) => void;
  districtData?: DistrictData | null;
};

const defaultSidebarontext = {
  isOpen: true,
  setIsOpen: () => {},
  openSidebar: () => {},
  closeSidebar: () => {},
  elements: [],
  setElements: () => {},
  selectedPoiGroupIndex: 1,
  setSelectedPoiGroupIndex: () => {},
  hoveredElementId: null,
  setHoveredElementId: () => {},
  mode: "district" as const,
  setMode: () => {},
  transport: Profile.FOOT_WALKING,
  setTransport: () => {},
  setSelectedDistrict: () => {},
};

const SidebarContext = createContext<SidebarContextType>(defaultSidebarontext);

export const SidebarProvider = ({ children }: PropsWithChildren) => {
  const [isOpen, setIsOpen] = useState(true);
  const [elements, setElements] = useState<MapElement[]>([]);
  const [selectedPoiGroupIndex, setSelectedPoiGroupIndex] = useState(1);
  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);
  const [mode, setMode] = useState<"district" | "osr">("osr");
  const [transport, setTransport] = useState<Profile>(Profile.FOOT_WALKING);
  const [selectedDistrict, setSelectedDistrict] = useState<
    (FeatureCollection & { id: string; name: string }) | undefined
  >();

  const { districtData } = useDistricts(selectedDistrict?.name);

  const openSidebar = () => setIsOpen(true);
  const closeSidebar = () => setIsOpen(false);

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        setIsOpen,
        openSidebar,
        closeSidebar,
        elements,
        setElements,
        selectedPoiGroupIndex,
        setSelectedPoiGroupIndex,
        hoveredElementId,
        setHoveredElementId,
        mode,
        setMode,
        transport,
        setTransport,
        selectedDistrict,
        setSelectedDistrict,
        districtData,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => useContext<SidebarContextType>(SidebarContext);
