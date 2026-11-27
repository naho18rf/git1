import { createFileRoute, Link } from "@tanstack/react-router";

import { DemoRecorrido } from "@/components/demo/DemoRecorrido";
import { PageShell } from "@/components/site/PageShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Demostración · Remanente" },
      {
        name: "description",
        content: "Recorrido de demostración de Remanente con datos ficticios.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DemoPage,
});

function DemoPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-4xl px-5 py-16 md:px-8 md:py-20">
        <h1 className="text-title text-primary-deep md:text-display">Así funciona Remanente</h1>
        <p className="measure mt-4 text-lead text-muted-foreground">
          Del residuo al recurso en cinco pasos, con datos de demostración.
        </p>
        <div className="mt-10">
          <DemoRecorrido />
        </div>
        <Button className="mt-10" variant="outline" asChild>
          <Link to="/registro">Registrar mi empresa</Link>
        </Button>
      </div>
    </PageShell>
  );
}
