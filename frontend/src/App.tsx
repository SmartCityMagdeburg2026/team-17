import { ORSProvider } from "./components/ORSProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { AppHeader } from "./components/AppHeader";
import { appRoutes, isAppRoute, type AppRoute } from "./lib/routes";
import { MapPage } from "./pages/MapPage";
import { StatisticsPage } from "./pages/StatisticsPage";

const queryClient = new QueryClient();

function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const currentRoute: AppRoute = isAppRoute(location.pathname)
    ? location.pathname
    : appRoutes.maps;

  const handleNavigate = (nextRoute: AppRoute) => {
    if (nextRoute !== currentRoute) {
      navigate(nextRoute);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <AppHeader currentRoute={currentRoute} onNavigate={handleNavigate} />
      <main className="min-h-0 flex-1">
        <Routes>
          <Route path={appRoutes.maps} element={<MapPage />} />
          <Route path={appRoutes.statistics} element={<StatisticsPage />} />
          <Route path="*" element={<Navigate to={appRoutes.maps} replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ORSProvider>
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </ORSProvider>
    </QueryClientProvider>
  );
}

export default App;