/*
  Warnings:

  - The column `upDatedAt` will be renamed to `updatedAt`.
  - Added the required column `passwordHash` to the `users` table.
  - Made the column `name` on table `users` required.
*/

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- Add passwordHash as nullable temporarily
ALTER TABLE "users"
ADD COLUMN "passwordHash" TEXT;

-- Populate passwordHash for existing users
UPDATE "users"
SET "passwordHash" = 'TEMP_PASSWORD_HASH'
WHERE "passwordHash" IS NULL;

-- Rename existing timestamp column instead of deleting its data
ALTER TABLE "users"
RENAME COLUMN "upDatedAt" TO "updatedAt";

-- Make passwordHash required
ALTER TABLE "users"
ALTER COLUMN "passwordHash" SET NOT NULL;

-- Add role and status
ALTER TABLE "users"
ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'USER',
ADD COLUMN "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';

-- Make name required
ALTER TABLE "users"
ALTER COLUMN "name" SET NOT NULL;

-- Create indexes
CREATE INDEX "users_status_idx" ON "users"("status");

CREATE INDEX "users_role_idx" ON "users"("role");