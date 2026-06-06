export const appRoutes = {
  maps: "/maps",
  statistics: "/statistics",
} as const;

export type AppRoute = (typeof appRoutes)[keyof typeof appRoutes];

const normalizePathname = (pathname: string) => pathname.replace(/\/+$/, "") || "/";

export const isAppRoute = (pathname: string): pathname is AppRoute => {
  const normalizedPathname = normalizePathname(pathname);

  return (
    normalizedPathname === appRoutes.maps ||
    normalizedPathname === appRoutes.statistics
  );
};

export const getInitialRoute = (): AppRoute => {
  if (typeof window === "undefined") {
    return appRoutes.maps;
  }

  return isAppRoute(window.location.pathname)
    ? (normalizePathname(window.location.pathname) as AppRoute)
    : appRoutes.maps;
};
