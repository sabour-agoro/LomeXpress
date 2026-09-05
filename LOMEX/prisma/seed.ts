import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { slugify } from "../src/lib/utils";

const prisma = new PrismaClient();

const categories = [
  {
    name: "Audio & Son",
    description: "Casques, enceintes et accessoires audio.",
    imageUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Énergie solaire",
    description: "Kits solaires, frigos et éclairage 12V.",
    imageUrl:
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Téléphones",
    description: "Smartphones et accessoires.",
    imageUrl:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Électroménager",
    description: "Petit électroménager pour la maison.",
    imageUrl:
      "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Informatique",
    description: "Ordinateurs, tablettes et périphériques.",
    imageUrl:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Maison",
    description: "Décoration et essentiels du quotidien.",
    imageUrl:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
  },
];

const products = [
  {
    name: "Casque audio premium",
    description: "Réduction de bruit active, 30h d'autonomie.",
    price: 125000,
    stock: 15,
    category: "Audio & Son",
    isPopular: true,
    isNew: true,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Mini frigo solaire",
    description: "Frigo basse consommation 12V pour usage solaire.",
    price: 450000,
    stock: 3,
    category: "Énergie solaire",
    isPopular: true,
    isNew: true,
    images: [
      "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Panneau solaire 200W",
    description: "Panneau monocristallin pour kit autonome.",
    price: 185000,
    stock: 8,
    category: "Énergie solaire",
    isPopular: true,
    isNew: false,
    images: [
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Smartphone 128 Go",
    description: "Écran 6,5\", double SIM, livré à Lomé.",
    price: 165000,
    stock: 12,
    category: "Téléphones",
    isPopular: true,
    isNew: true,
    images: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Ordinateur portable 15\"",
    description: "Idéal bureautique et études, SSD 512 Go.",
    price: 390000,
    stock: 5,
    category: "Informatique",
    isPopular: true,
    isNew: true,
    images: [
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Enceinte Bluetooth",
    description: "Son puissant, autonomie 12h, étanche IPX5.",
    price: 45000,
    stock: 20,
    category: "Audio & Son",
    isPopular: true,
    isNew: false,
    images: [
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80",
    ],
  },
];

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "admin@lomexpress.tg").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";
  const hash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: { password: hash, role: "ADMIN", name: "Admin LomExpress" },
    create: { email, password: hash, role: "ADMIN", name: "Admin LomExpress" },
  });

  const categoryIds = new Map<string, string>();
  for (const category of categories) {
    const slug = slugify(category.name);
    const row = await prisma.category.upsert({
      where: { slug },
      update: {
        name: category.name,
        description: category.description,
        imageUrl: category.imageUrl,
      },
      create: {
        name: category.name,
        slug,
        description: category.description,
        imageUrl: category.imageUrl,
      },
    });
    categoryIds.set(category.name, row.id);
  }

  for (const product of products) {
    const slug = slugify(product.name);
    const categoryId = categoryIds.get(product.category);
    await prisma.product.upsert({
      where: { slug },
      update: {
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        images: JSON.stringify(product.images),
        isPopular: product.isPopular,
        isNew: product.isNew,
        isPublished: true,
        categoryId,
      },
      create: {
        name: product.name,
        slug,
        description: product.description,
        price: product.price,
        stock: product.stock,
        images: JSON.stringify(product.images),
        isPopular: product.isPopular,
        isNew: product.isNew,
        isPublished: true,
        categoryId,
      },
    });
  }

  console.log(`Seed OK — admin ${email}, ${categories.length} catégories, ${products.length} produits.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
