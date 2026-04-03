-- CreateTable
CREATE TABLE "Metropolis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Temple" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "metropolisId" TEXT,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "email" TEXT,
    "settings" TEXT DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Temple_metropolisId_fkey" FOREIGN KEY ("metropolisId") REFERENCES "Metropolis" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "UserTemple" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "templeId" TEXT NOT NULL,
    "roleId" TEXT,
    "isHeadPriest" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserTemple_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserTemple_templeId_fkey" FOREIGN KEY ("templeId") REFERENCES "Temple" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserTemple_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "canViewFinances" BOOLEAN NOT NULL DEFAULT false,
    "canEditFinances" BOOLEAN NOT NULL DEFAULT false,
    "canManageRequests" BOOLEAN NOT NULL DEFAULT false,
    "canManageRegistry" BOOLEAN NOT NULL DEFAULT false,
    "canManageSchedule" BOOLEAN NOT NULL DEFAULT false,
    "canManageAssets" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Role_templeId_fkey" FOREIGN KEY ("templeId") REFERENCES "Temple" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Parishioner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templeId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "email" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "fathersName" TEXT,
    "mothersName" TEXT,
    "phone" TEXT,
    "mobile" TEXT,
    "address" TEXT,
    "city" TEXT,
    "birthDate" DATETIME,
    "afm" TEXT,
    "idNumber" TEXT,
    "profession" TEXT,
    "familyStatus" TEXT,
    "roles" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Parishioner_templeId_fkey" FOREIGN KEY ("templeId") REFERENCES "Temple" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Token" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templeId" TEXT NOT NULL,
    "tokenStr" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "customerName" TEXT,
    "customerEmail" TEXT,
    "ceremonyDate" DATETIME,
    "assignedPriest" TEXT,
    "assignedPsaltis" TEXT,
    "assignedNeokomos" TEXT,
    "protocolNumber" TEXT,
    "bookNumber" TEXT,
    "submissionComplete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Token_templeId_fkey" FOREIGN KEY ("templeId") REFERENCES "Temple" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CeremonyPerson" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tokenId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "fathersName" TEXT,
    "mothersName" TEXT,
    "parishionerId" TEXT,
    "idNumber" TEXT,
    "afm" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CeremonyPerson_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "Token" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CeremonyPerson_parishionerId_fkey" FOREIGN KEY ("parishionerId") REFERENCES "Parishioner" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CeremonyMeta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tokenId" TEXT NOT NULL,
    "dataJson" TEXT NOT NULL DEFAULT '{}',
    CONSTRAINT "CeremonyMeta_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "Token" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templeId" TEXT NOT NULL,
    "tokenId" TEXT,
    "docType" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Document_templeId_fkey" FOREIGN KEY ("templeId") REFERENCES "Temple" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Document_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "Token" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DocTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templeId" TEXT,
    "docType" TEXT NOT NULL,
    "nameEl" TEXT NOT NULL,
    "htmlContent" TEXT,
    "fileUrl" TEXT,
    "context" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DocTemplate_templeId_fkey" FOREIGN KEY ("templeId") REFERENCES "Temple" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DocTemplateSetting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templeId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "customHeader" TEXT,
    CONSTRAINT "DocTemplateSetting_templeId_fkey" FOREIGN KEY ("templeId") REFERENCES "Temple" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DocTemplateSetting_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DocTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Donation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templeId" TEXT NOT NULL,
    "parishionerId" TEXT,
    "donorName" TEXT,
    "amount" REAL NOT NULL,
    "purpose" TEXT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receiptNumber" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Donation_templeId_fkey" FOREIGN KEY ("templeId") REFERENCES "Temple" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Donation_parishionerId_fkey" FOREIGN KEY ("parishionerId") REFERENCES "Parishioner" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Sacrament" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templeId" TEXT NOT NULL,
    "parishionerId" TEXT NOT NULL,
    "sacramentType" TEXT NOT NULL,
    "sacramentDate" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Sacrament_templeId_fkey" FOREIGN KEY ("templeId") REFERENCES "Temple" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Sacrament_parishionerId_fkey" FOREIGN KEY ("parishionerId") REFERENCES "Parishioner" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Beneficiary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templeId" TEXT NOT NULL,
    "parishionerId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "familyMembers" INTEGER NOT NULL DEFAULT 1,
    "monthlyIncome" REAL NOT NULL DEFAULT 0,
    "criteriaScore" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "portions" INTEGER NOT NULL DEFAULT 1,
    "medicalNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Beneficiary_templeId_fkey" FOREIGN KEY ("templeId") REFERENCES "Temple" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Beneficiary_parishionerId_fkey" FOREIGN KEY ("parishionerId") REFERENCES "Parishioner" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BeneficiaryDoc" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "beneficiaryId" TEXT NOT NULL,
    "docType" TEXT NOT NULL,
    "storageUrl" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BeneficiaryDoc_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "Beneficiary" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Assistance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "beneficiaryId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "amount" REAL,
    "dateGiven" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Assistance_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "Beneficiary" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SissitioDay" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templeId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "menu" TEXT,
    "totalPortions" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "SissitioDay_templeId_fkey" FOREIGN KEY ("templeId") REFERENCES "Temple" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SissitioAttendance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sissitioDayId" TEXT NOT NULL,
    "beneficiaryId" TEXT NOT NULL,
    "portionsTaken" INTEGER NOT NULL DEFAULT 1,
    "wasAbsent" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "SissitioAttendance_sissitioDayId_fkey" FOREIGN KEY ("sissitioDayId") REFERENCES "SissitioDay" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SissitioAttendance_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "Beneficiary" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "quantity" REAL NOT NULL DEFAULT 0,
    "minStock" REAL NOT NULL DEFAULT 0,
    "expiryDate" DATETIME,
    "lastRestockDate" DATETIME,
    CONSTRAINT "InventoryItem_templeId_fkey" FOREIGN KEY ("templeId") REFERENCES "Temple" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Diptych" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templeId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "submittedBy" TEXT,
    "email" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Diptych_templeId_fkey" FOREIGN KEY ("templeId") REFERENCES "Temple" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Protocol" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templeId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "direction" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "sender" TEXT,
    "receiver" TEXT,
    "tokenId" TEXT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Protocol_templeId_fkey" FOREIGN KEY ("templeId") REFERENCES "Temple" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ServiceSchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templeId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isMajor" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ServiceSchedule_templeId_fkey" FOREIGN KEY ("templeId") REFERENCES "Temple" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "acquisitionDate" DATETIME,
    "estimatedValue" REAL,
    "imageUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Asset_templeId_fkey" FOREIGN KEY ("templeId") REFERENCES "Temple" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templeId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "serviceType" TEXT NOT NULL,
    "tokenId" TEXT,
    "priest" TEXT,
    "psaltis" TEXT,
    "neokomos" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Assignment_templeId_fkey" FOREIGN KEY ("templeId") REFERENCES "Temple" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Assignment_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "Token" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VaultDocument" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templeId" TEXT NOT NULL,
    "tokenId" TEXT,
    "parishionerId" TEXT,
    "docType" TEXT NOT NULL,
    "label" TEXT,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL DEFAULT 0,
    "mimeType" TEXT NOT NULL DEFAULT 'application/octet-stream',
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VaultDocument_templeId_fkey" FOREIGN KEY ("templeId") REFERENCES "Temple" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VaultDocument_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "Token" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "VaultDocument_parishionerId_fkey" FOREIGN KEY ("parishionerId") REFERENCES "Parishioner" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserTemple_userId_templeId_key" ON "UserTemple"("userId", "templeId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_templeId_name_key" ON "Role"("templeId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Parishioner_email_templeId_key" ON "Parishioner"("email", "templeId");

-- CreateIndex
CREATE UNIQUE INDEX "Token_tokenStr_key" ON "Token"("tokenStr");

-- CreateIndex
CREATE UNIQUE INDEX "CeremonyMeta_tokenId_key" ON "CeremonyMeta"("tokenId");

-- CreateIndex
CREATE UNIQUE INDEX "Beneficiary_parishionerId_key" ON "Beneficiary"("parishionerId");

-- CreateIndex
CREATE UNIQUE INDEX "SissitioDay_templeId_date_key" ON "SissitioDay"("templeId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "SissitioAttendance_sissitioDayId_beneficiaryId_key" ON "SissitioAttendance"("sissitioDayId", "beneficiaryId");

-- CreateIndex
CREATE UNIQUE INDEX "Protocol_templeId_year_number_key" ON "Protocol"("templeId", "year", "number");
