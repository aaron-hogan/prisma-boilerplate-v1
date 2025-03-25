// utils/filters.ts
/**
 * Common database filters for Prisma queries
 */

// Filter for active (non-deleted) records
export const activeFilter = { deletedAt: null };

// Alias for activeFilter specifically used with products
export const activeProductFilter = activeFilter;

// Example usage in a Prisma query:
// const products = await prisma.product.findMany({
//   where: {
//     ...activeFilter,
//     // other conditions...
//   }
// });