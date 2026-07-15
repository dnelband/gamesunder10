ALTER TABLE "deals" ADD COLUMN "genres" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "deals" ADD COLUMN "rating" double precision;--> statement-breakpoint
ALTER TABLE "deals" ADD COLUMN "rating_source" text;--> statement-breakpoint
CREATE INDEX "deals_rating_idx" ON "deals" USING btree ("rating");