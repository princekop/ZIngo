-- CreateTable
CREATE TABLE "AvatarDecoration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT NOT NULL,
    "rarity" TEXT NOT NULL DEFAULT 'common',
    "price" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isAnimated" BOOLEAN NOT NULL DEFAULT false,
    "category" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "UserDecoration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "decorationId" TEXT NOT NULL,
    "purchasedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isEquipped" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "UserDecoration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserDecoration_decorationId_fkey" FOREIGN KEY ("decorationId") REFERENCES "AvatarDecoration" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Upload" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "uploadType" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Upload_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "AvatarDecoration_name_key" ON "AvatarDecoration"("name");

-- CreateIndex
CREATE INDEX "UserDecoration_userId_isEquipped_idx" ON "UserDecoration"("userId", "isEquipped");

-- CreateIndex
CREATE UNIQUE INDEX "UserDecoration_userId_decorationId_key" ON "UserDecoration"("userId", "decorationId");

-- CreateIndex
CREATE INDEX "Upload_uploadedBy_uploadType_idx" ON "Upload"("uploadedBy", "uploadType");

-- CreateIndex
CREATE INDEX "Upload_createdAt_idx" ON "Upload"("createdAt");
