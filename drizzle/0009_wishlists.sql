CREATE TABLE "wishlists" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"igdb_id" integer NOT NULL,
	"title" text NOT NULL,
	"cover_url" text,
	"release_date" text,
	"steam_app_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "wishlists_user_igdb_uidx" ON "wishlists" USING btree ("user_id","igdb_id");
--> statement-breakpoint
CREATE INDEX "wishlists_user_id_idx" ON "wishlists" USING btree ("user_id");
