export const siteConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME ?? "Lome Xpress",
  description:
    "Service de conciergerie et logistique premium a Lome : livraison locale 24h, import express Europe/USA et securite garantie.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "22871793479",
  slogan: "L'excellence logistique au quotidien.",
  contactEmail: "lomexpress.1@gmail.com",
  city: "Lomé, Togo",
} as const;

export const navigation = {
  main: [
    { label: "Boutique", href: "/boutique" },
    { label: "Catégories", href: "/categories" },
    { label: "Commande spéciale", href: "/commande-speciale" },
    { label: "Contact", href: "/contact" },
  ],
  footer: [
    {
      title: "LomExpress",
      links: [
        { label: "À propos", href: "/a-propos" },
        { label: "Contact", href: "/contact" },
      ],
    },
    {
      title: "Acheter",
      links: [
        { label: "Catalogue", href: "/boutique" },
        { label: "Catégories", href: "/categories" },
        { label: "Commande spéciale", href: "/commande-speciale" },
      ],
    },
    {
      title: "Aide",
      links: [
        { label: "Suivi de commande", href: "/contact" },
      ],
    },
  ],
} as const;
