ALTER TABLE "deals" ADD COLUMN "distribution_format" text DEFAULT 'unknown' NOT NULL;--> statement-breakpoint
UPDATE "deals" SET "distribution_format" = 'digital' WHERE "source" IN ('cheapshark', 'psn', 'xbox');
