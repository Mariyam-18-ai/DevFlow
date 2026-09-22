ALTER TABLE "Project" ADD COLUMN "workspace" TEXT NOT NULL DEFAULT 'Engineering';

UPDATE "Project" SET "workspace" = 'Design' WHERE "id" = 'p3';
