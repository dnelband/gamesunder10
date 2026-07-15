ALTER TABLE "deals" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "deals" ADD COLUMN "cover_url" text;--> statement-breakpoint
ALTER TABLE "deals" ADD COLUMN "screenshot_urls" text[] DEFAULT '{}' NOT NULL;