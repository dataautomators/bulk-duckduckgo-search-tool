-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "Fingerprint" (
    "id" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fingerprint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Search" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "results" JSONB[],
    "status" "Status" NOT NULL DEFAULT 'PENDING',
    "failedAttempts" INTEGER NOT NULL DEFAULT 0,
    "failedMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Search_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_FingerprintToSearch" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_FingerprintToSearch_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Fingerprint_fingerprint_key" ON "Fingerprint"("fingerprint");

-- CreateIndex
CREATE INDEX "_FingerprintToSearch_B_index" ON "_FingerprintToSearch"("B");

-- AddForeignKey
ALTER TABLE "_FingerprintToSearch" ADD CONSTRAINT "_FingerprintToSearch_A_fkey" FOREIGN KEY ("A") REFERENCES "Fingerprint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FingerprintToSearch" ADD CONSTRAINT "_FingerprintToSearch_B_fkey" FOREIGN KEY ("B") REFERENCES "Search"("id") ON DELETE CASCADE ON UPDATE CASCADE;
