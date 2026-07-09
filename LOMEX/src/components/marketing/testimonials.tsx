import { Quote } from "lucide-react";

const testimonials = [
  {
    name: "Aïcha K.",
    role: "Cliente, Lomé",
    quote:
      "J'ai lance ma demande en chat, puis confirme sur WhatsApp. Livraison nickel et service premium.",
  },
  {
    name: "Komlan A.",
    role: "Entrepreneur, Kara",
    quote:
      "LomExpress a importé mon kit solaire d'Alibaba sans aucun stress. Tout était transparent.",
  },
  {
    name: "Sylvia M.",
    role: "Étudiante, Sokodé",
    quote:
      "Une vraie expérience premium. Belle interface, livraison rapide et excellent suivi.",
  },
];

export function Testimonials() {
  return (
    <section className="container-page py-16">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs uppercase tracking-wider text-brand-400">Témoignages</p>
        <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">
          Ils ont adopté LomExpress
        </h2>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {testimonials.map((testimonial) => (
          <figure
            key={testimonial.name}
            className="rounded-3xl border border-border bg-card p-6 shadow-soft"
          >
            <Quote className="h-6 w-6 text-brand-400" />
            <blockquote className="mt-4 text-sm text-foreground/90">
              “{testimonial.quote}”
            </blockquote>
            <figcaption className="mt-6">
              <p className="font-semibold">{testimonial.name}</p>
              <p className="text-xs text-muted-foreground">{testimonial.role}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
