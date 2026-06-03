-- AlterTable: add variableMap and needsMapping to DocTemplate
ALTER TABLE "DocTemplate" ADD COLUMN "variableMap" JSONB;
ALTER TABLE "DocTemplate" ADD COLUMN "needsMapping" BOOLEAN NOT NULL DEFAULT false;
