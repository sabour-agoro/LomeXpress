import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  {
    slug: "telephones",
    name: "Téléphones",
    description: "Smartphones premium et accessoires.",
    imageUrl:
      "https://images.unsplash.com/photo-1512499617640-c2f999098c01?auto=format&fit=crop&w=800&q=80",
  },
  {
    slug: "ordinateurs",
    name: "Ordinateurs",
    description: "Laptops, accessoires et périphériques.",
    imageUrl:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
  },
  {
    slug: "energie-solaire",
    name: "Énergie solaire",
    description: "Panneaux solaires, batteries et kits complets.",
    imageUrl:
      "https://images.unsplash.com/photo-1509395176047-4a66953fd231?auto=format&fit=crop&w=800&q=80",
  },
  {
    slug: "maison",
    name: "Maison",
    description: "Électroménager, déco et confort.",
    imageUrl:
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80",
  },
  {
    slug: "mode",
    name: "Mode & Beauté",
    description: "Vêtements, cosmétiques et accessoires.",
    imageUrl:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80",
  },
  {
    slug: "audio",
    name: "Audio & Son",
    description: "Casques, écouteurs et enceintes.",
    imageUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
  },
];

const products = [
  {
    slug: "iphone-15-pro-max",
    name: "iPhone 15 Pro Max 256 Go",
    description:
      "Le summum de la photographie mobile avec puce A17 Pro, châssis titane et appareil 5x téléobjectif.",
    price: 950000,
    stock: 12,
    images: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1592286927505-1de7a3c4c3f8?auto=format&fit=crop&w=900&q=80",
    ],
    isPopular: true,
    isNew: true,
    categorySlug: "telephones",
  },
  {
    slug: "samsung-s24-ultra",
    name: "Samsung Galaxy S24 Ultra",
    description: "Photo IA, S Pen intégré, écran 6,8\" Dynamic AMOLED 2X. Version 512 Go.",
    price: 820000,
    stock: 8,
    images: [
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=80",
    ],
    isPopular: true,
    isNew: true,
    categorySlug: "telephones",
  },
  {
    slug: "macbook-air-m3",
    name: "MacBook Air M3 13\"",
    description: "Puce M3 nouvelle génération, 16 Go RAM, 512 Go SSD. Ultraléger pour pro mobile.",
    price: 880000,
    stock: 5,
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
    ],
    isPopular: true,
    isNew: false,
    categorySlug: "ordinateurs",
  },
  {
    slug: "kit-solaire-1000w",
    name: "Kit solaire complet 1000W",
    description: "Panneaux 4×250W, batterie lithium 200Ah, onduleur hybride. Installation incluse.",
    price: 650000,
    stock: 4,
    images: [
      "https://images.unsplash.com/photo-1509395176047-4a66953fd231?auto=format&fit=crop&w=900&q=80",
    ],
    isPopular: true,
    isNew: true,
    categorySlug: "energie-solaire",
  },
  {
    slug: "casque-sony-wh1000xm5",
    name: "Casque Sony WH-1000XM5",
    description: "Réduction de bruit active de référence, 30h d'autonomie, micro HD.",
    price: 220000,
    stock: 18,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
    ],
    isPopular: false,
    isNew: true,
    categorySlug: "audio",
  },
  {
    slug: "frigo-smart-samsung",
    name: "Frigo Samsung Family Hub",
    description: "Réfrigérateur connecté 530L avec écran tactile et caméra intérieure.",
    price: 980000,
    stock: 2,
    images: [
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=900&q=80",
    ],
    isPopular: false,
    isNew: false,
    categorySlug: "maison",
  },
  {
    slug: "robe-ankara-premium",
    name: "Robe Ankara premium",
    description: "Tissu wax authentique, coupe contemporaine, finitions main.",
    price: 45000,
    stock: 22,
    images: [
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
    ],
    isPopular: true,
    isNew: true,
    categorySlug: "mode",
  },
  {
    slug: "airpods-pro-2",
    name: "AirPods Pro 2",
    description: "Réduction de bruit adaptative, audio spatial personnalisé, USB-C.",
    price: 175000,
    stock: 25,
    images: [
      "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=900&q=80",
    ],
    isPopular: true,
    isNew: false,
    categorySlug: "audio",
  },
];

async function main() {
  console.log("→ Seed LomExpress");

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  for (const product of products) {
    const category = await prisma.category.findUnique({
      where: { slug: product.categorySlug },
    });
    if (!category) continue;

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        images: JSON.stringify(product.images),
        isPopular: product.isPopular,
        isNew: product.isNew,
        categoryId: category.id,
      },
      create: {
        slug: product.slug,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        images: JSON.stringify(product.images),
        isPopular: product.isPopular,
        isNew: product.isNew,
        categoryId: category.id,
      },
    });
  }

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@lomexpress.tg";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: "ADMIN",
      password: passwordHash,
    },
    create: {
      email: adminEmail,
      name: "Administrateur",
      role: "ADMIN",
      password: passwordHash,
    },
  });

  console.log(`✓ ${categories.length} catégories, ${products.length} produits`);
  console.log(`✓ Admin: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
