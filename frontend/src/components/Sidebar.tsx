import React, { type PropsWithChildren } from "react";
import { useSidebar } from "./SidebarProvider";
import { POI_GROUPS } from "../config/poiGroups";
import { cn } from "../lib/utils";
import { Profile } from "../openrouteservice-api/common";
import {
  IconBike,
  IconWalk,
  IconWheelchair,
  IconBus,
  IconCar,
} from "@tabler/icons-react";
import PlaygroundChildren from "./statistics/PlaygroundPerChild";

const transportIcons: Record<Profile, React.FC<{ size?: number }>> = {
  [Profile.CYCLING_REGULAR]: IconBike,
  [Profile.CYCLING_ELECTRIC]: IconBike,
  [Profile.CYCLING_MOUNTAIN]: IconBike,
  [Profile.CYCLING_ROAD]: IconBike,
  [Profile.FOOT_HIKING]: IconWalk,
  [Profile.FOOT_WALKING]: IconWalk,
  [Profile.WHEELCHAIR]: IconWheelchair,
  [Profile.DRIVING_CAR]: IconCar,
  [Profile.DRIVING_HGV]: IconBus,
  [Profile.PUBLIC_TRANSPORT]: IconBus,
};

const transportModes = [
  Profile.FOOT_WALKING,
  Profile.CYCLING_REGULAR,
  Profile.WHEELCHAIR,
  //Profile.DRIVING_CAR,
  Profile.PUBLIC_TRANSPORT,
];

export const Sidebar = ({ children }: PropsWithChildren): React.JSX.Element => {
  const {
    isOpen,
    elements,
    selectedPoiGroupIndex,
    setSelectedPoiGroupIndex,
    hoveredElementId,
    setHoveredElementId,
    mode,
    transport,
    setTransport,
    selectedDistrict,
  } = useSidebar();

  return (
    <div className="flex h-full w-full">
      {/* Main content */}
      <div className="flex-1 min-w-0">{children}</div>

      {/* Sidebar (Right) */}
      <div
        className={`
          bg-gray-900 text-white overflow-hidden
          transition-[width] duration-300 ease-in-out flex-shrink-0
          ${isOpen ? "w-80" : "w-0"}
        `}
      >
        <div
          className={`h-full flex flex-col p-4 ${isOpen ? "opacity-100" : "opacity-0"} transition-opacity duration-200`}
        >
          <div className="flex flex-col gap-4 mb-4">
            <h2 className="text-xl font-bold">
              {mode === "osr" ? "15 Minutes City" : "Districts"}
            </h2>

            {/* Mobility Profile Selection (only for OSR) */}
            {mode === "osr" && (
              <>
                {" "}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Mobility Profile
                  </span>
                  <div className="flex flex-wrap gap-1 bg-gray-800 p-1 rounded-md">
                    {transportModes.map((t) => {
                      const Icon = transportIcons[t];
                      return (
                        <button
                          key={t}
                          onClick={() => setTransport(t)}
                          className={cn(
                            "p-2 rounded-sm transition-colors flex-1 flex items-center justify-center",
                            transport === t
                              ? "bg-blue-600 text-white"
                              : "text-gray-400 hover:bg-gray-700 hover:text-gray-200",
                          )}
                          title={t.replace(/_/g, " ")}
                        >
                          <Icon size={20} />
                        </button>
                      );
                    })}
                  </div>
                </div>
                {/* POI Group Selection */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Categories
                  </span>
                  <div className="flex flex-wrap gap-1 bg-gray-800 p-1 rounded-md">
                    {POI_GROUPS.map((group, index) => (
                      <button
                        key={group.id}
                        onClick={() => setSelectedPoiGroupIndex(index)}
                        className={cn(
                          "px-2 py-1 text-xs rounded-sm transition-colors flex-1 min-w-[fit-content] text-center",
                          selectedPoiGroupIndex === index
                            ? "bg-blue-600 text-white"
                            : "text-gray-400 hover:bg-gray-700 hover:text-gray-200",
                        )}
                      >
                        {group.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {mode === "osr" && (
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar text-left">
              {elements.length === 0 ? (
                <p className="text-gray-400 text-sm">No elements to show.</p>
              ) : (
                elements.map((el) => (
                  <div
                    key={el.id}
                    className="bg-gray-800 p-3 rounded-lg border border-gray-700 hover:border-gray-500 transition-colors cursor-pointer"
                    onMouseEnter={() => setHoveredElementId(el.id)}
                    onMouseLeave={() => setHoveredElementId(null)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "mt-1 bg-gray-700 p-2 rounded transition-colors",
                          hoveredElementId === el.id
                            ? "text-[#e84e0e]"
                            : "text-blue-400",
                        )}
                      >
                        {el.icon || (
                          <div
                            className={cn(
                              "w-5 h-5 rounded-full",
                              hoveredElementId === el.id
                                ? "bg-[#e84e0e]"
                                : "bg-blue-500",
                            )}
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-sm truncate capitalize">
                          {el.tag.value.replace(/_/g, " ")}
                        </div>
                        {el.name && (
                          <div className="text-xs text-gray-400 truncate" title={el.name}>
                            {el.name}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {mode === "district" && selectedDistrict && (
            <div className="flex flex-col gap-2 mb-4">
              <div className="text-lg font-semibold bg-gray-800 p-2 rounded-md">
                {selectedDistrict.name}
              </div>
            </div>
          )}

          {mode === "district" && <PlaygroundChildren />}
        </div>
      </div>
    </div>
  );
};
