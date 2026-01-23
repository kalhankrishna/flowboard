-- CreateEnum
CREATE TYPE "BoardRole" AS ENUM ('OWNER', 'EDITOR', 'VIEWER');

-- CreateTable
CREATE TABLE "BoardAccess" (
    "id" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "BoardRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BoardAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BoardAccess_boardId_idx" ON "BoardAccess"("boardId");

-- CreateIndex
CREATE INDEX "BoardAccess_userId_idx" ON "BoardAccess"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BoardAccess_boardId_userId_key" ON "BoardAccess"("boardId", "userId");

-- AddForeignKey
ALTER TABLE "BoardAccess" ADD CONSTRAINT "BoardAccess_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardAccess" ADD CONSTRAINT "BoardAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
