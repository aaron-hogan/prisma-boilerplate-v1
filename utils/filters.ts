// utils/filters.ts
export const activeProductFilter = { deletedAt: null };

// Example usage in a Prisma query:
// const products = await prisma.product.findMany({
//   where: {
//     ...activeProductFilter,
//     // other conditions...
//   }
// });