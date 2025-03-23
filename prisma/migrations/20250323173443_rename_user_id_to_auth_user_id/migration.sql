/*
  Warnings:

  - You are about to drop the column `user_id` on the `profiles` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[auth_user_id]` on the table `profiles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `auth_user_id` to the `profiles` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "profiles_user_id_key";

-- AlterTable
ALTER TABLE "profiles" DROP COLUMN "user_id",
ADD COLUMN     "auth_user_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "profiles_auth_user_id_key" ON "profiles"("auth_user_id");
