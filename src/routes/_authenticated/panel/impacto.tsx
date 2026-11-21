import { createFileRoute } from "@tanstack/react-router";

import { ComingSoon } from "@/components/panel/ComingSoon";

export const Route = createFileRoute("/_authenticated/panel/impacto")({
  head: () => ({ meta: [{ title: "Impacto · Remanente" }] }),
  component: () => <ComingSoon path="/panel/impacto" />,
});
