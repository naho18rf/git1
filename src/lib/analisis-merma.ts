import { queryOptions } from "@tanstack/react-query";

import { listarAnalisisMerma } from "./analisis-merma.functions";

export const analisisMermaQuery = (userId: string) =>
  queryOptions({
    queryKey: ["analisis-merma", userId],
    queryFn: () => listarAnalisisMerma(),
  });
