import { GiTruck, GiEarthAmerica, GiConversation, GiCheckedShield } from "react-icons/gi";

const values = [
  {
    icon: GiTruck,
    title: "Livraison locale en 24h",
    description:
      "Lome en 24h, puis tout le Togo avec suivi en direct sur le site.",
  },
  {
    icon: GiEarthAmerica,
    title: "Importation Express Europe / USA",
    description:
      "Vous envoyez votre besoin, on gere l'achat, le transport et la livraison finale.",
  },
  {
    icon: GiConversation,
    title: "Assistance WhatsApp",
    description:
      "Une equipe locale disponible sur WhatsApp pour discuter et suivre votre commande.",
  },
  {
    icon: GiCheckedShield,
    title: "Securite garantie",
    description:
      "Processus de validation clair, pieces justificatives et suivi client de bout en bout.",
  },
];

export function ValuePropositions() {
  return (
    <section className="container-page py-16">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs uppercase tracking-wider text-brand-500">Pourquoi Lome Xpress</p>
        <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">
          L&apos;excellence logistique au service de votre quotidien
        </h2>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {values.map((value) => (
          <div
            key={value.title}
            className="rounded-3xl border border-border bg-card p-6 shadow-soft transition hover:-translate-y-1 hover:border-primary/40 flex flex-col items-center text-center"
          >
            <span className="inline-flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-br from-brand-100 to-brand-50 text-brand-600 shadow-sm border border-brand-200/50 mb-4">
              <value.icon className="h-12 w-12 drop-shadow-sm" />
            </span>
            <h3 className="font-display text-xl font-bold text-foreground">{value.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{value.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
