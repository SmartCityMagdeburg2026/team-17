import {
  IconBus,
  IconCar,
  IconShoppingCart,
  IconBread,
  IconCash,
  IconStethoscope,
  IconDental,
  IconMedicineSyrup,
  IconTrees,
  IconSchool,
  IconMoodBoy,
  IconMoodKid,
  IconBuildingMonument,
  IconLibrary,
  IconQuestionMark,
} from "@tabler/icons-react";
import React from "react";

export type POITag = {
  name: string;
  value: string;
};

export type POIGroup = {
  id: string;
  label: string;
  tags: POITag[];
};

export const POI_GROUPS: POIGroup[] = [
  {
    id: "mobility",
    label: "Mobilität",
    tags: [
      { name: "highway", value: "bus_stop" },
      { name: "railway", value: "tram_stop" },
      { name: "public_transport", value: "platform" },
      { name: "amenity", value: "car_sharing" },
    ],
  },
  {
    id: "necessities",
    label: "Täglicher Bedarf",
    tags: [
      { name: "shop", value: "supermarket" },
      { name: "shop", value: "bakery" },
      { name: "amenity", value: "atm" },
    ],
  },
  {
    id: "health",
    label: "Gesundheit",
    tags: [
      { name: "amenity", value: "doctors" },
      { name: "amenity", value: "dentist" },
      { name: "amenity", value: "pharmacy" },
    ],
  },
  {
    id: "leisure",
    label: "Freizeit",
    tags: [
      { name: "leisure", value: "park" },
      { name: "leisure", value: "playground" },
      { name: "tourism", value: "museum" },
    ],
  },
  {
    id: "education",
    label: "Bildung",
    tags: [
      { name: "amenity", value: "school" },
      { name: "amenity", value: "kindergarten" },
      { name: "amenity", value: "library" },
    ],
  },
];

export const getPOIIcon = (properties: Record<string, any>): React.ReactNode => {
  if (properties.highway === "bus_stop" || properties.railway === "tram_stop" || properties.public_transport === "platform") {
    return <IconBus size={20} />;
  }
  if (properties.amenity === "car_sharing") {
    return <IconCar size={20} />;
  }
  if (properties.shop === "supermarket") {
    return <IconShoppingCart size={20} />;
  }
  if (properties.shop === "bakery") {
    return <IconBread size={20} />;
  }
  if (properties.amenity === "atm") {
    return <IconCash size={20} />;
  }
  if (properties.amenity === "doctors") {
    return <IconStethoscope size={20} />;
  }
  if (properties.amenity === "dentist") {
    return <IconDental size={20} />;
  }
  if (properties.amenity === "pharmacy") {
    return <IconMedicineSyrup size={20} />;
  }
  if (properties.leisure === "park") {
    return <IconTrees size={20} />;
  }
  if (properties.leisure === "playground") {
    return <IconMoodKid size={20} />;
  }
  if (properties.tourism === "museum") {
    return <IconBuildingMonument size={20} />;
  }
  if (properties.amenity === "school") {
    return <IconSchool size={20} />;
  }
  if (properties.amenity === "kindergarten") {
    return <IconMoodBoy size={20} />;
  }
  if (properties.amenity === "library") {
    return <IconLibrary size={20} />;
  }

  return <IconQuestionMark size={20} />;
};
