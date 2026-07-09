# LomExpress

> Marketplace togolaise pensée pour acheter local et commander à l'international.

Stack : **Next.js 15+ App Router · TypeScript · Tailwind + shadcn-style · Prisma · SQLite (dev) / PostgreSQL (prod) · Auth.js · TanStack Query**.

## Démarrage rapide

```bash
pnpm install
pnpm db:push       # crée la base SQLite et applique le schéma
pnpm db:seed       # injecte 6 catégories, 8 produits et un compte admin
pnpm dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

### Espace admin

- URL : `/admin/login`
- Identifiants par défaut (modifiables via `.env`) :
  - email : `admin@lomexpress.tg`
  - mot de passe : `ChangeMe123!`

## Variables d'environnement

Copiez `.env.example` vers `.env.local` et adaptez :

| Variable                        | Rôle                                                                     |
| ------------------------------- | ------------------------------------------------------------------------ |
| `DATABASE_URL`                  | Connexion DB. Par défaut SQLite (`file:./prisma/dev.db`).                |
| `NEXT_PUBLIC_WHATSAPP_NUMBER`   | Numéro WhatsApp Business (format international sans `+`).                |
| `AUTH_SECRET`                   | Secret JWT Auth.js (`openssl rand -base64 32`).                          |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD`| Identifiants créés au seed (et utilisés par les notifications email).    |
| `RESEND_API_KEY` / `RESEND_FROM`| Optionnel — active les notifications email Resend (Phase 2).             |
| `NEXT_PUBLIC_APP_URL`           | URL canonique pour SEO et liens absolus.                                 |

## Structure

```
src/
  app/
    (marketing)/         # accueil, boutique, fiche produit, commande spéciale, contact
    admin/(auth)/login   # connexion admin
    admin/(dashboard)    # zone protégée (middleware Auth.js)
    api/                 # routes API REST
  components/
    ui/                  # composants type shadcn (button, input, dialog…)
    marketing/           # sections homepage et CTA
    admin/               # tables, formulaires admin
  features/cart/         # contexte panier + add-to-cart
  lib/                   # prisma, auth, utils, schemas Zod
prisma/                  # schema + seed
```

## Passer en production

1. Provisionner une base PostgreSQL (Neon, Supabase, Railway…).
2. Dans `prisma/schema.prisma`, remplacer `provider = "sqlite"` par `provider = "postgresql"` puis exécuter :
   ```bash
   pnpm exec prisma migrate dev --name init
   ```
3. Définir les variables d'environnement en production (Vercel, Render…).
4. Activer Resend en renseignant `RESEND_API_KEY` (envoi des notifications admin).

## Roadmap MVP → Phase 2

| Phase   | Livré dans ce repo | Détails                                                                              |
| ------- | ------------------ | ------------------------------------------------------------------------------------ |
| MVP     | ✓                  | Catalogue, panier, commande WhatsApp, demande spéciale, admin (produits, commandes, stocks, demandes spéciales), analytics de base. |
| Phase 2 | Partiel            | Stub email Resend, page analytics avec agrégations Prisma, import CSV produits.      |
| Phase 3 | À venir            | Chat temps réel (Pusher), Mobile Money, app mobile.                                  |

## Commandes utiles

```bash
pnpm dev               # Dev server
pnpm build             # Build production
pnpm lint              # ESLint
pnpm db:studio         # Prisma Studio
pnpm db:push           # Sync schéma → DB sans migration
pnpm db:migrate        # Crée une migration et applique
pnpm db:seed           # Re-seed les données de démo
```
