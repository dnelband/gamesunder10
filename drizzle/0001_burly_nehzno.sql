CREATE TABLE "deals" (
	"id" text PRIMARY KEY NOT NULL,
	"source" text NOT NULL,
	"title" text NOT NULL,
	"normalized_title" text NOT NULL,
	"steam_app_id" text,
	"store_name" text NOT NULL,
	"price_eur" double precision NOT NULL,
	"original_price_eur" double precision NOT NULL,
	"discount_percent" integer NOT NULL,
	"currency_original" text NOT NULL,
	"url" text NOT NULL,
	"image_url" text,
	"region" text,
	"fetched_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE INDEX "deals_price_eur_idx" ON "deals" USING btree ("price_eur");--> statement-breakpoint
CREATE INDEX "deals_normalized_title_idx" ON "deals" USING btree ("normalized_title");--> statement-breakpoint
CREATE INDEX "deals_steam_app_id_idx" ON "deals" USING btree ("steam_app_id");