/*
  Warnings:

  - The `app_role` column on the `profiles` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "AppRole" AS ENUM ('ADMIN', 'STAFF', 'MEMBER', 'USER');

-- AlterTable
ALTER TABLE "profiles" DROP COLUMN "app_role",
ADD COLUMN     "app_role" "AppRole" NOT NULL DEFAULT 'USER';

-- DropEnum
DROP TYPE "Role";
