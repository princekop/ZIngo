-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "coverImage" TEXT,
    "authorId" TEXT NOT NULL,
    "categoryId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "readTime" INTEGER,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "customCSS" TEXT,
    "fontFamily" TEXT,
    "textColor" TEXT,
    "backgroundColor" TEXT,
    CONSTRAINT "BlogPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BlogPost_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "BlogCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BlogCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "icon" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BlogTag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "color" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "BlogPostTag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    CONSTRAINT "BlogPostTag_postId_fkey" FOREIGN KEY ("postId") REFERENCES "BlogPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BlogPostTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "BlogTag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BlogMedia" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "size" INTEGER,
    "mimeType" TEXT,
    "alt" TEXT,
    "caption" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "duration" INTEGER,
    "thumbnail" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BlogMedia_postId_fkey" FOREIGN KEY ("postId") REFERENCES "BlogPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BlogComment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "parentId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'APPROVED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BlogComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "BlogPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BlogComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BlogComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "BlogComment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BlogReaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BlogReaction_postId_fkey" FOREIGN KEY ("postId") REFERENCES "BlogPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BlogReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BlogCommentReaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "commentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BlogCommentReaction_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "BlogComment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BlogCommentReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");

-- CreateIndex
CREATE INDEX "BlogPost_status_publishedAt_idx" ON "BlogPost"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "BlogPost_authorId_idx" ON "BlogPost"("authorId");

-- CreateIndex
CREATE INDEX "BlogPost_featured_publishedAt_idx" ON "BlogPost"("featured", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "BlogCategory_name_key" ON "BlogCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BlogCategory_slug_key" ON "BlogCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "BlogTag_name_key" ON "BlogTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BlogTag_slug_key" ON "BlogTag"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPostTag_postId_tagId_key" ON "BlogPostTag"("postId", "tagId");

-- CreateIndex
CREATE INDEX "BlogMedia_postId_position_idx" ON "BlogMedia"("postId", "position");

-- CreateIndex
CREATE INDEX "BlogComment_postId_status_createdAt_idx" ON "BlogComment"("postId", "status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "BlogReaction_postId_userId_type_key" ON "BlogReaction"("postId", "userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "BlogCommentReaction_commentId_userId_type_key" ON "BlogCommentReaction"("commentId", "userId", "type");
