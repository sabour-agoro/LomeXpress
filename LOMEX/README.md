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

Le site public (`/`) et l’admin (`/admin`) sont **la même app Next.js**. Un seul déploiement suffit.

**Important :** SQLite et `public/uploads` ne survivent pas sur Vercel (fonctions serverless, pas de disque persistant). En prod : **PostgreSQL + Cloudinary**.

### Option recommandée — Vercel + Neon + Cloudinary (gratuit au départ)

1. Compte [Cloudinary](https://cloudinary.com) → Dashboard → copier Cloud name, API Key, API Secret.
2. Base [Neon](https://neon.tech) (ou [Supabase](https://supabase.com)) → copier `DATABASE_URL` PostgreSQL.
3. Dans `prisma/schema.prisma`, remplacer `provider = "sqlite"` par `provider = "postgresql"`.
4. En local, avec l’URL Neon dans `.env` :
   ```bash
   pnpm exec prisma db push
   pnpm db:seed
   ```
5. Push GitHub, import du repo sur [Vercel](https://vercel.com).
6. Variables d’environnement Vercel (Production + Preview) :
   - `DATABASE_URL` (Neon)
   - `AUTH_SECRET` (ex. `openssl rand -base64 32`)
   - `AUTH_TRUST_HOST=true`
   - `AUTH_URL` / `NEXT_PUBLIC_APP_URL` = `https://ton-domaine.vercel.app`
   - `NEXT_PUBLIC_WHATSAPP_NUMBER`
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD`
   - `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`
   - `CLOUDINARY_FOLDER=lomexpress`
7. Deploy. Login admin : `https://ton-domaine.vercel.app/admin/login`

Les images uploadées dans l’admin partent sur Cloudinary (URLs `https://res.cloudinary.com/...`) et restent en base produit.

### Autres solutions

| Hébergeur | Pour qui | Base | Images | Prix / contrainte |
|-----------|----------|------|--------|-------------------|
| **Vercel + Neon + Cloudinary** | Défaut, simple | Neon Postgres | Cloudinary | Gratuit puis payant |
| **Railway** | Tout-en-un | Postgres Railway | Cloudinary (ou volume) | Plus simple pour un disque, un peu plus cher |
| **Render** | Alternative Vercel | Render Postgres | Cloudinary | Cold start sur le free web |
| **VPS** (Contabo, Hetzner, DigitalOcean) + Coolify/Dokploy | Contrôle total | Postgres sur le VPS | Dossier `/uploads` persistant | Tu gères OS, backups, HTTPS |

Railway / un VPS permettent un disque persistant (moins besoin de Cloudinary), mais Vercel reste le plus simple pour Next.js.

### Backups

- **Données** : backups automatiques Neon/Supabase, ou `pg_dump` hebdo.
- **Images** : Cloudinary Media Library (backup / CDN inclus).

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
