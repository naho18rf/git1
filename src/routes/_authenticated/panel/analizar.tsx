import { createFileRoute } from "@tanstack/react-router";

import { AnalizarMerma } from "@/components/analisis/AnalizarMerma";

export const Route = createFileRoute("/_authenticated/panel/analizar")({
  head: () => ({
    meta: [
      { title: "Analizar merma · Panel · Remanente" },
      {
        name: "description",
        content: "Analiza una foto de tu merma y obtén una ficha editable del material.",
      },
      { property: "og:title", content: "Analizar merma · Panel · Remanente" },
      {
        property: "og:description",
        content: "Analiza una foto de tu merma y obtén una ficha editable del material.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AnalizarPage,
});

function AnalizarPage() {
  const { user } = Route.useRouteContext();
  return <AnalizarMerma userId={user.id} />;
}
