-- CreateTable
CREATE TABLE "UserProfile" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "subdomain" TEXT,
    "pageTitle" TEXT DEFAULT 'My Page',
    "bio" TEXT,
    "bgType" TEXT,
    "bgValue" TEXT,
    "audioUrl" TEXT,
    "customAvatar" TEXT,
    "customBanner" TEXT,
    "youtubeUrl" TEXT,
    "instagramUrl" TEXT,
    "discordUrl" TEXT,
    "theme" TEXT DEFAULT 'default',
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "avatar" TEXT,
    "banner" TEXT,
    "status" TEXT NOT NULL DEFAULT 'online',
    "description" TEXT,
    "theme" TEXT NOT NULL DEFAULT 'default',
    "chatBgUrl" TEXT,
    "chatBgOpacity" INTEGER NOT NULL DEFAULT 30,
    "effectEnabled" BOOLEAN NOT NULL DEFAULT true,
    "effectOpacity" INTEGER NOT NULL DEFAULT 60,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "avatarDecoration" TEXT,
    "badgeServerId" TEXT,
    CONSTRAINT "User_badgeServerId_fkey" FOREIGN KEY ("badgeServerId") REFERENCES "Server" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Server" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "banner" TEXT,
    "tag" TEXT,
    "byteeLevel" INTEGER NOT NULL DEFAULT 0,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "boostLevel" INTEGER NOT NULL DEFAULT 0,
    "ownerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "advertisementEnabled" BOOLEAN NOT NULL DEFAULT false,
    "advertisementText" TEXT,
    CONSTRAINT "Server_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ServerRole" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#99AAB5',
    "gradient" TEXT,
    "animated" BOOLEAN NOT NULL DEFAULT false,
    "font" TEXT,
    "permissions" TEXT NOT NULL,
    "permissionsJson" TEXT,
    "serverId" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ServerRole_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ServerMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "serverId" TEXT NOT NULL,
    "roleId" TEXT,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mutedUntil" DATETIME,
    "timeoutUntil" DATETIME,
    CONSTRAINT "ServerMember_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "ServerRole" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ServerMember_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ServerMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ServerMemberRole" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "memberId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ServerMemberRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "ServerRole" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ServerMemberRole_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "ServerMember" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ServerBan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serverId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bannedBy" TEXT NOT NULL,
    "reason" TEXT,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ServerBan_bannedBy_fkey" FOREIGN KEY ("bannedBy") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ServerBan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ServerBan_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "emoji" TEXT,
    "font" TEXT,
    "serverId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Category_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Channel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'text',
    "categoryId" TEXT NOT NULL,
    "serverId" TEXT NOT NULL,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
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

-- CreateTable
CREATE TABLE "ChannelPermission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "channelId" TEXT NOT NULL,
    "roleId" TEXT,
    "userId" TEXT,
    "permission" TEXT NOT NULL,
    "canView" BOOLEAN NOT NULL DEFAULT true,
    "canRead" BOOLEAN NOT NULL DEFAULT true,
    "canSend" BOOLEAN NOT NULL DEFAULT true,
    "canEdit" BOOLEAN NOT NULL DEFAULT false,
    "canManage" BOOLEAN NOT NULL DEFAULT false,
    "canDeleteOthers" BOOLEAN NOT NULL DEFAULT false,
    "canReact" BOOLEAN NOT NULL DEFAULT true,
    "canSendGifs" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChannelPermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "ServerRole" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ChannelPermission_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "replyToId" TEXT,
    "mentions" TEXT NOT NULL,
    "attachments" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Message_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "Message" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Message_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MessageView" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "viewedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MessageView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MessageView_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MessageReaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "messageId" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MessageReaction_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MessageReactionUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reactionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MessageReactionUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MessageReactionUser_reactionId_fkey" FOREIGN KEY ("reactionId") REFERENCES "MessageReaction" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Invite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "serverId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "expiresAt" DATETIME,
    "maxUses" INTEGER,
    "uses" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Invite_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Invite_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AiConversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'New AI Chat',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AiConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AiMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "codeHtml" TEXT,
    "codeCss" TEXT,
    "codeJs" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AiMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "AiConversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AiAsset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contentType" TEXT,
    "content" TEXT,
    "url" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AiAsset_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "AiConversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChannelAppearance" (
    "channelId" TEXT NOT NULL PRIMARY KEY,
    "backgroundColor" TEXT,
    "backgroundImage" TEXT,
    "backgroundVideo" TEXT,
    "textColor" TEXT,
    "fontFamily" TEXT,
    "fontSize" INTEGER,
    "customCSS" TEXT,
    "isPrivate" BOOLEAN DEFAULT false,
    "slowMode" INTEGER DEFAULT 0,
    "updatedBy" TEXT,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ChannelAppearance_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CategoryOverride" (
    "categoryId" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "updatedBy" TEXT,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CategoryOverride_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Poll" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "channelId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "multiSelect" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Poll_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PollOption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pollId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    CONSTRAINT "PollOption_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PollVote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pollId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PollVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PollVote_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "PollOption" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PollVote_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_subdomain_key" ON "UserProfile"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "ServerMemberRole_memberId_roleId_key" ON "ServerMemberRole"("memberId", "roleId");

-- CreateIndex
CREATE UNIQUE INDEX "ServerBan_serverId_userId_key" ON "ServerBan"("serverId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "ChannelPermission_channelId_roleId_userId_permission_key" ON "ChannelPermission"("channelId", "roleId", "userId", "permission");

-- CreateIndex
CREATE UNIQUE INDEX "MessageView_messageId_userId_key" ON "MessageView"("messageId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "MessageReactionUser_reactionId_userId_key" ON "MessageReactionUser"("reactionId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Invite_code_key" ON "Invite"("code");

-- CreateIndex
CREATE INDEX "AiConversation_userId_createdAt_idx" ON "AiConversation"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AiMessage_conversationId_createdAt_idx" ON "AiMessage"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "AiAsset_conversationId_createdAt_idx" ON "AiAsset"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "Poll_channelId_createdAt_idx" ON "Poll"("channelId", "createdAt");

-- CreateIndex
CREATE INDEX "PollOption_pollId_index_idx" ON "PollOption"("pollId", "index");

-- CreateIndex
CREATE INDEX "PollVote_pollId_userId_idx" ON "PollVote"("pollId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "PollVote_pollId_userId_optionId_key" ON "PollVote"("pollId", "userId", "optionId");
