CREATE INDEX "deals_platforms_gin_idx" ON "deals" USING gin ("platforms");--> statement-breakpoint
CREATE INDEX "deals_genres_gin_idx" ON "deals" USING gin ("genres");