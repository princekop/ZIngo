-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "replyToId" TEXT,
    "mentions" TEXT NOT NULL,
    "attachments" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Message_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "Message" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Message_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Message" ("attachments", "channelId", "content", "createdAt", "id", "mentions", "replyToId", "updatedAt", "userId") SELECT "attachments", "channelId", "content", "createdAt", "id", "mentions", "replyToId", "updatedAt", "userId" FROM "Message";
DROP TABLE "Message";
ALTER TABLE "new_Message" RENAME TO "Message";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
