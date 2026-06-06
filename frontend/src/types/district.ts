import type { MapElement } from "@/components/SidebarProvider";
import type { DistrictData } from "@/hooks/useDistricts";

export type District = {
    // id of the polygon in leaflet
    id: string;
    name: string;
    mapElements?: MapElement[];
    data: DistrictData;
}