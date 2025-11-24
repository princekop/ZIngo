-- CreateTable
CREATE TABLE "UserBoost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "membershipId" TEXT NOT NULL,
    "serverId" TEXT,
    "value" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserBoost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserBoost_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "UserMembership" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserBoost_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserMembership" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tierId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME,
    "metadataJson" TEXT,
    "boostsGranted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "UserMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserMembership_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "MembershipTier" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_UserMembership" ("expiresAt", "id", "metadataJson", "startedAt", "status", "tierId", "userId") SELECT "expiresAt", "id", "metadataJson", "startedAt", "status", "tierId", "userId" FROM "UserMembership";
DROP TABLE "UserMembership";
ALTER TABLE "new_UserMembership" RENAME TO "UserMembership";
CREATE INDEX "UserMembership_userId_status_idx" ON "UserMembership"("userId", "status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "UserBoost_userId_isActive_idx" ON "UserBoost"("userId", "isActive");

-- CreateIndex
CREATE INDEX "UserBoost_serverId_isActive_idx" ON "UserBoost"("serverId", "isActive");
