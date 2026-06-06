import { Map } from "../components/Map";
import { Sidebar } from "../components/Sidebar";
import { SidebarProvider } from "../components/SidebarProvider";

export const MapPage = (): React.JSX.Element => {
  return (
    <div className="h-full min-h-0">
      <SidebarProvider>
        <Sidebar>
          <Map />
        </Sidebar>
      </SidebarProvider>
    </div>
  );
};
