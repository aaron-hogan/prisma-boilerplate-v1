/*
  Warnings:

  - You are about to drop the column `role` on the `profiles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "profiles" DROP COLUMN "role",
ADD COLUMN     "app_role" "Role" NOT NULL DEFAULT 'USER';
