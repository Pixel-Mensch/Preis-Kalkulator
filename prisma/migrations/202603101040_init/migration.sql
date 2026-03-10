PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS "AdminUser" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "email" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  "lastLoginAt" DATETIME
);

CREATE TABLE IF NOT EXISTS "CompanySettings" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "companyName" TEXT NOT NULL,
  "contactEmail" TEXT NOT NULL,
  "contactPhone" TEXT NOT NULL,
  "website" TEXT,
  "street" TEXT NOT NULL,
  "postalCode" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "serviceAreaNote" TEXT NOT NULL,
  "estimateFootnote" TEXT NOT NULL,
  "supportHours" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "PricingProfile" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT false,
  "minimumOrderValue" INTEGER NOT NULL,
  "baseRatePerEffectiveSqm" INTEGER NOT NULL,
  "minFactor" REAL NOT NULL,
  "maxFactor" REAL NOT NULL,
  "elevatorReductionFactor" REAL NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "ObjectBasePrice" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "profileId" TEXT NOT NULL,
  "objectType" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  CONSTRAINT "ObjectBasePrice_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "PricingProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "FillLevelFactor" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "profileId" TEXT NOT NULL,
  "fillLevel" TEXT NOT NULL,
  "factor" REAL NOT NULL,
  CONSTRAINT "FillLevelFactor_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "PricingProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "FloorSurcharge" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "profileId" TEXT NOT NULL,
  "floorLevel" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  CONSTRAINT "FloorSurcharge_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "PricingProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "WalkDistanceSurcharge" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "profileId" TEXT NOT NULL,
  "walkDistance" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  CONSTRAINT "WalkDistanceSurcharge_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "PricingProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "ExtraOptionPrice" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "profileId" TEXT NOT NULL,
  "extraOption" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  CONSTRAINT "ExtraOptionPrice_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "PricingProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "TravelZone" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "profileId" TEXT NOT NULL,
  "zoneCode" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "postalPrefixes" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  CONSTRAINT "TravelZone_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "PricingProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Inquiry" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "publicId" TEXT NOT NULL,
  "pricingProfileId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'NEW',
  "customerName" TEXT NOT NULL,
  "customerEmail" TEXT NOT NULL,
  "customerPhone" TEXT NOT NULL,
  "postalCode" TEXT NOT NULL,
  "desiredDate" DATETIME,
  "message" TEXT,
  "objectType" TEXT NOT NULL,
  "areaSqm" INTEGER NOT NULL,
  "roomCount" INTEGER,
  "fillLevel" TEXT NOT NULL,
  "floorLevel" TEXT NOT NULL,
  "hasElevator" BOOLEAN NOT NULL,
  "walkDistance" TEXT NOT NULL,
  "travelZoneCode" TEXT NOT NULL,
  "extraOptions" TEXT NOT NULL,
  "problemFlags" TEXT NOT NULL,
  "manualReviewRequired" BOOLEAN NOT NULL,
  "manualReviewReasons" TEXT NOT NULL,
  "estimateMin" INTEGER NOT NULL,
  "estimateMax" INTEGER NOT NULL,
  "inputSnapshot" TEXT NOT NULL,
  "calculationSnapshot" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "Inquiry_pricingProfileId_fkey" FOREIGN KEY ("pricingProfileId") REFERENCES "PricingProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "AdminUser_email_key" ON "AdminUser"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "ObjectBasePrice_profileId_objectType_key" ON "ObjectBasePrice"("profileId", "objectType");
CREATE UNIQUE INDEX IF NOT EXISTS "FillLevelFactor_profileId_fillLevel_key" ON "FillLevelFactor"("profileId", "fillLevel");
CREATE UNIQUE INDEX IF NOT EXISTS "FloorSurcharge_profileId_floorLevel_key" ON "FloorSurcharge"("profileId", "floorLevel");
CREATE UNIQUE INDEX IF NOT EXISTS "WalkDistanceSurcharge_profileId_walkDistance_key" ON "WalkDistanceSurcharge"("profileId", "walkDistance");
CREATE UNIQUE INDEX IF NOT EXISTS "ExtraOptionPrice_profileId_extraOption_key" ON "ExtraOptionPrice"("profileId", "extraOption");
CREATE UNIQUE INDEX IF NOT EXISTS "TravelZone_profileId_zoneCode_key" ON "TravelZone"("profileId", "zoneCode");
CREATE UNIQUE INDEX IF NOT EXISTS "Inquiry_publicId_key" ON "Inquiry"("publicId");
