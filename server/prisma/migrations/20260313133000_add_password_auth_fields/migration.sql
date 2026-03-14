-- Add password-based web auth fields to users
ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT;
ALTER TABLE "User" ADD COLUMN "sessionToken" TEXT;
ALTER TABLE "User" ADD COLUMN "sessionExpiresAt" DATETIME;
ALTER TABLE "User" ADD COLUMN "updatedAt" DATETIME;

-- Backfill updatedAt for existing rows
UPDATE "User"
SET "updatedAt" = CURRENT_TIMESTAMP
WHERE "updatedAt" IS NULL;

-- Rebuild table to enforce defaults and uniqueness consistently on SQLite
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT,
    "sessionToken" TEXT,
    "sessionExpiresAt" DATETIME,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "avatar" TEXT NOT NULL DEFAULT '🎓',
    "level" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "coins" INTEGER NOT NULL DEFAULT 0,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "lastActive" DATETIME,
    "maxCombo" INTEGER NOT NULL DEFAULT 0,
    "totalCorrect" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "targetCategory" TEXT NOT NULL DEFAULT 'GENERAL'
);

INSERT INTO "new_User" (
    "id",
    "username",
    "passwordHash",
    "sessionToken",
    "sessionExpiresAt",
    "role",
    "avatar",
    "level",
    "xp",
    "coins",
    "streak",
    "lastActive",
    "maxCombo",
    "totalCorrect",
    "createdAt",
    "updatedAt",
    "targetCategory"
)
SELECT
    "id",
    "username",
    "passwordHash",
    "sessionToken",
    "sessionExpiresAt",
    "role",
    "avatar",
    "level",
    "xp",
    "coins",
    "streak",
    "lastActive",
    "maxCombo",
    "totalCorrect",
    "createdAt",
    COALESCE("updatedAt", CURRENT_TIMESTAMP),
    "targetCategory"
FROM "User";

DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";

CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_sessionToken_key" ON "User"("sessionToken");

PRAGMA foreign_keys=ON;
