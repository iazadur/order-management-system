import { PrismaClient, PromotionSlabType } from '@prisma/client';
import argon2 from 'argon2';


const PASSWORD_HASH_CONFIG = {
  MEMORY_COST: 65536, // 64 MB
  TIME_COST: 3,
  PARALLELISM: 4,
} as const;

async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: PASSWORD_HASH_CONFIG.MEMORY_COST,
    timeCost: PASSWORD_HASH_CONFIG.TIME_COST,
    parallelism: PASSWORD_HASH_CONFIG.PARALLELISM,
  });
}

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed process...');

  // Delete all existing data first (in correct order to respect foreign keys)
  console.log('🗑️  Deleting existing data...');

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.promotionSlab.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.product.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ All existing data deleted');

  // Create default user
  console.log('👤 Creating default user...');
  const defaultUser = await prisma.user.create({
    data: {
      email: 'iamazadur0@gmail.com',
      passwordHash: await hashPassword('Asdf@123'),
      isVerified: true,
    },
  });
  console.log(`✅ Default user created: ${defaultUser.email}`);
  console.log(`   Password: Asdf@123`);

  // --- Products -------------------------------------------------------------
  console.log('📦 Creating products...');
  const products = [
    {
      name: 'Everyday Cotton T-Shirt',
      slug: 'everyday-cotton-tshirt',
      sku: 'TSHIRT-CTN-001',
      description: 'Soft 100% cotton crew neck t-shirt, perfect for daily wear.',
      price: 19.99,
      currency: 'BDT',
      weight: 200, // 200g
    },
    {
      name: 'Slim Fit Jeans',
      slug: 'slim-fit-jeans',
      sku: 'JEANS-SLIM-032',
      description: 'Dark wash slim fit jeans with a bit of stretch for comfort.',
      price: 59.99,
      currency: 'BDT',
      weight: 700, // 700g
    },
    {
      name: 'Running Sneakers',
      slug: 'running-sneakers',
      sku: 'SNKR-RUN-110',
      description: 'Lightweight running shoes designed for everyday training.',
      price: 89.99,
      currency: 'BDT',
      weight: 850, // 850g
    },
    {
      name: 'Premium Hoodie',
      slug: 'premium-hoodie',
      sku: 'HOODIE-PRM-021',
      description: 'Fleece-lined hoodie with a relaxed fit and kangaroo pocket.',
      price: 74.99,
      currency: 'BDT',
      weight: 650, // 650g
    },
    {
      name: 'Crew Socks (3-Pack)',
      slug: 'crew-socks-3pack',
      sku: 'SOCK-CRW-003',
      description: 'Pack of three breathable crew socks for all-day comfort.',
      price: 12.99,
      currency: 'BDT',
      weight: 150, // 150g
    },
  ];

  const createdProducts = await Promise.all(
    products.map((p) =>
      prisma.product.create({
        data: {
          name: p.name,
          slug: p.slug,
          sku: p.sku,
          description: p.description,
          price: p.price,
          weight: p.weight,
          currency: p.currency,
          isActive: true,
        },
      }),
    ),
  );

  console.log(`✅ Created ${createdProducts.length} products`);

  // Helper for choosing a product by SKU
  const bySku = (sku: string) => createdProducts.find((p) => p.sku === sku)!;

  // --- Promotions -----------------------------------------------------------
  console.log('🎁 Creating promotions...');

  // 1) PERCENTAGE Promotion (10% off)
  const percentagePromotion = await prisma.promotion.create({
    data: {
      name: 'Welcome 10% Off',
      code: 'WELCOME10',
      description: 'TYPE:PERCENTAGE,PERCENTAGE:10',
      isActive: true,
      isStackable: false,
      priority: 10,
      startsAt: new Date(),
      endsAt: null,
      slabs: {
        create: [
          {
            type: PromotionSlabType.PERCENTAGE_DISCOUNT,
            value: 10, // 10%
            weight: 0,
            minOrderValue: null,
            isActive: true,
          },
        ],
      },
    },
  });
  console.log(`✅ Created percentage promotion: ${percentagePromotion.code}`);

  // 2) FIXED Promotion (৳5 off per unit)
  const fixedPromotion = await prisma.promotion.create({
    data: {
      name: 'Save ৳5 Per Item',
      code: 'SAVE5',
      description: 'TYPE:FIXED,FIXED:5',
      isActive: true,
      isStackable: false,
      priority: 20,
      startsAt: new Date(),
      endsAt: null,
      slabs: {
        create: [
          {
            type: PromotionSlabType.FIXED_AMOUNT_DISCOUNT,
            value: 5, // ৳5.00 per unit
            weight: 0,
            minOrderValue: null,
            isActive: true,
          },
        ],
      },
    },
  });
  console.log(`✅ Created fixed promotion: ${fixedPromotion.code}`);

  // 3) WEIGHTED Promotion (weight-based discounts)
  const weightedPromotion = await prisma.promotion.create({
    data: {
      name: 'Weight-Based Discount',
      code: 'WEIGHTED-DISCOUNT',
      description: 'TYPE:WEIGHTED',
      isActive: true,
      isStackable: false,
      priority: 30,
      startsAt: new Date(),
      endsAt: null,
      slabs: {
        create: [
          {
            // 0g - 500g → ৳2 per unit
            weight: 0, // minWeight
            minOrderValue: 500, // maxWeight
            type: PromotionSlabType.FIXED_AMOUNT_DISCOUNT,
            value: 2, // discountPerUnit
            isActive: true,
          },
          {
            // 500g - 1000g → ৳5 per unit
            weight: 500,
            minOrderValue: 1000,
            type: PromotionSlabType.FIXED_AMOUNT_DISCOUNT,
            value: 5,
            isActive: true,
          },
          {
            // 1000g - 2000g → ৳10 per unit
            weight: 1000,
            minOrderValue: 2000,
            type: PromotionSlabType.FIXED_AMOUNT_DISCOUNT,
            value: 10,
            isActive: true,
          },
          {
            // 2000g+ → ৳15 per unit
            weight: 2000,
            minOrderValue: null, // Infinity
            type: PromotionSlabType.FIXED_AMOUNT_DISCOUNT,
            value: 15,
            isActive: true,
          },
        ],
      },
    },
  });
  console.log(`✅ Created weighted promotion: ${weightedPromotion.code}`);

  console.log('🌱 Seed completed successfully!');
  console.log('\n📋 Summary:');
  console.log(`   - Users: 1 (${defaultUser.email})`);
  console.log(`   - Products: ${createdProducts.length}`);
  console.log(`   - Promotions: 3`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
