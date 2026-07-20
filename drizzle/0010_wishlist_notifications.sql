ALTER TABLE "wishlists" ADD COLUMN "last_notified_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "wishlists" ADD COLUMN "last_notified_price_eur" double precision;
