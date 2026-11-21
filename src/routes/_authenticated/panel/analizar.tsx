import { createFileRoute } from "@tanstack/react-router";

import { ComingSoon } from "@/components/panel/ComingSoon";

export const Route = createFileRoute("/_authenticated/panel/analizar")({
  head: () => ({ meta: [{ title: "Analizar merma · Remanente" }] }),
  component: () => <ComingSoon path="/panel/analizar" />,
});
