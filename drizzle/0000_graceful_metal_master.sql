CREATE TABLE "source_health" (
	"source" text PRIMARY KEY NOT NULL,
	"status" text NOT NULL,
	"last_run_at" timestamp with time zone NOT NULL,
	"last_success_at" timestamp with time zone,
	"last_failure_at" timestamp with time zone,
	"last_error" text,
	"consecutive_failures" integer DEFAULT 0 NOT NULL,
	"deals_ingested_last_run" integer
);
