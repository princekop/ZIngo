-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Channel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'text',
    "categoryId" TEXT NOT NULL,
    "serverId" TEXT NOT NULL,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "topic" TEXT,
    "slowMode" INTEGER NOT NULL DEFAULT 0,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "customBg" TEXT,
    "bgOpacity" INTEGER NOT NULL DEFAULT 100,
    "textColor" TEXT,
    "accentColor" TEXT,
    "gradientFrom" TEXT,
    "gradientTo" TEXT,
    "useGradient" BOOLEAN NOT NULL DEFAULT false,
    "backgroundType" TEXT,
    "backgroundUrl" TEXT,
    "backgroundColor" TEXT,
    "nameColor" TEXT,
    "nameGradient" TEXT,
    "nameAnimation" TEXT,
    "font" TEXT,
    CONSTRAINT "Channel_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Channel_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Channel" ("backgroundColor", "backgroundType", "backgroundUrl", "categoryId", "createdAt", "font", "id", "isPrivate", "name", "nameAnimation", "nameColor", "nameGradient", "position", "serverId", "type", "updatedAt") SELECT "backgroundColor", "backgroundType", "backgroundUrl", "categoryId", "createdAt", "font", "id", "isPrivate", "name", "nameAnimation", "nameColor", "nameGradient", "position", "serverId", "type", "updatedAt" FROM "Channel";
DROP TABLE "Channel";
ALTER TABLE "new_Channel" RENAME TO "Channel";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
