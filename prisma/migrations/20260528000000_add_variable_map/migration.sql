-- AlterTable: add variableMap and needsMapping to DocTemplate
ALTER TABLE "DocTemplate" ADD COLUMN IF NOT EXISTS "variableMap" JSONB;
ALTER TABLE "DocTemplate" ADD COLUMN IF NOT EXISTS "needsMapping" BOOLEAN NOT NULL DEFAULT false;
