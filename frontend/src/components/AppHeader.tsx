import { MapPinned, ChartColumnBig } from "lucide-react";
import { appRoutes, type AppRoute } from "../lib/routes";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

type AppHeaderProps = {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
};

export const AppHeader = ({
  currentRoute,
  onNavigate,
}: AppHeaderProps): React.JSX.Element => {
  const navigationItems = [
    {
      route: appRoutes.maps,
      label: "Maps",
      icon: MapPinned,
    },
    {
      route: appRoutes.statistics,
      label: "Statistics",
      icon: ChartColumnBig,
    },
  ] as const;

  return (
    <header className="border-b border-border/70 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex w-full max-w-none items-center gap-2 px-3 py-2 sm:px-4">
        <button
          type="button"
          onClick={() => onNavigate(appRoutes.maps)}
          aria-label="Open map explorer"
          className="inline-flex shrink-0 items-center bg-muted/50 px-2 py-1.5 transition-colors hover:bg-muted"
        >
          <img
            src="/ottostadt_magdeburg.png"
            alt="Ottostadt Magdeburg"
            className="h-8 w-auto sm:h-9"
          />
        </button>

        <Tabs
          value={currentRoute}
          onValueChange={(value) => onNavigate(value as AppRoute)}
          className="shrink-0"
        >
          <TabsList aria-label="Primary" className="bg-muted/60">
            {navigationItems.map(({ route, label, icon: Icon }) => (
              <TabsTrigger key={route} value={route} className="gap-2 px-3">
                <Icon className="size-4" aria-hidden="true" />
                <span>{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </header>
  );
};
