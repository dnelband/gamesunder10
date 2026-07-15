ALTER TABLE "deals" ADD COLUMN "source_release_date" text;--> statement-breakpoint
CREATE INDEX "deals_source_release_date_idx" ON "deals" USING btree ("source_release_date");