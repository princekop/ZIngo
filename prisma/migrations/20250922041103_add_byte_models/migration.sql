-- CreateTable
CREATE TABLE "MembershipTier" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "priceInINR" INTEGER NOT NULL,
    "priceInUSD" REAL NOT NULL,
    "description" TEXT,
    "featuresJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "UserMembership" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tierId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME,
    "metadataJson" TEXT,
    CONSTRAINT "UserMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserMembership_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "MembershipTier" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Panel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "serverId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Panel_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Panel_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Panel_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PanelRoleAccess" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "panelId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "canView" BOOLEAN NOT NULL DEFAULT true,
    "canManage" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "PanelRoleAccess_panelId_fkey" FOREIGN KEY ("panelId") REFERENCES "Panel" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PanelRoleAccess_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "ServerRole" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PteroCredential" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "panelId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "adminApiKey" TEXT,
    "clientApiKey" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PteroCredential_panelId_fkey" FOREIGN KEY ("panelId") REFERENCES "Panel" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PteroCredential_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "MembershipTier_name_key" ON "MembershipTier"("name");

-- CreateIndex
CREATE INDEX "UserMembership_userId_status_idx" ON "UserMembership"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Panel_slug_key" ON "Panel"("slug");

-- CreateIndex
CREATE INDEX "Panel_serverId_ownerId_idx" ON "Panel"("serverId", "ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "PanelRoleAccess_panelId_roleId_key" ON "PanelRoleAccess"("panelId", "roleId");

-- CreateIndex
CREATE INDEX "PteroCredential_panelId_ownerId_idx" ON "PteroCredential"("panelId", "ownerId");
