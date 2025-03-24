import prisma from "../lib/prisma";

async function main() {
  // Create a system admin profile
  const adminProfile = await prisma.profile.upsert({
    where: { authUserId: 'system_admin' },
    update: {},
    create: {
      id: 'system_admin_profile',
      authUserId: 'system_admin',
      appRole: 'ADMIN',
    },
  });

  console.log(`Created admin profile: ${adminProfile.id}`);

  // Create some demo products
  // Orange products (visible to all)
  await prisma.product.upsert({
    where: { id: 'orange_small' },
    update: {},
    create: {
      id: 'orange_small',
      name: 'Small Orange',
      type: 'ORANGE',
      price: 1.99,
      createdBy: adminProfile.id,
    },
  });

  await prisma.product.upsert({
    where: { id: 'orange_large' },
    update: {},
    create: {
      id: 'orange_large',
      name: 'Large Orange',
      type: 'ORANGE',
      price: 2.99,
      createdBy: adminProfile.id,
    },
  });

  console.log('Created orange products');

  // Apple products (members only)
  await prisma.product.upsert({
    where: { id: 'apple_small' },
    update: {},
    create: {
      id: 'apple_small',
      name: 'Small Apple',
      type: 'APPLE',
      price: 1.49,
      createdBy: adminProfile.id,
    },
  });

  await prisma.product.upsert({
    where: { id: 'apple_large' },
    update: {},
    create: {
      id: 'apple_large',
      name: 'Large Apple',
      type: 'APPLE',
      price: 2.49,
      createdBy: adminProfile.id,
    },
  });

  console.log('Created apple products');

  // Create membership product
  await prisma.product.upsert({
    where: { id: 'annual_membership' },
    update: {},
    create: {
      id: 'annual_membership',
      name: 'Annual Membership',
      type: 'MEMBERSHIP',
      price: 99.99,
      createdBy: adminProfile.id,
    },
  });

  console.log('Created membership product');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });