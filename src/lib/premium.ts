import { queryOptions } from "@tanstack/react-query";

import { listarPlanes, obtenerPremium } from "./premium.functions";

export const premiumQuery = (userId: string) =>
  queryOptions({
    queryKey: ["premium", userId],
    queryFn: () => obtenerPremium(),
    staleTime: 60_000,
    retry: false,
  });
export const planesAdminQuery = queryOptions({
  queryKey: ["planes-admin"],
  queryFn: () => listarPlanes(),
  retry: false,
});
